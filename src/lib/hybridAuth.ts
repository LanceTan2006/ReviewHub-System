import { UserRole } from '../types';
import { buildAuthUser, type AuthUser } from '../rbac';
import { getSupabaseClientForFirebaseUser, supabase } from './supabase';
import { auth, hasFirebaseConfig, loginWithEmail, registerWithEmail, signInWithGoogleProvider } from './firebase';

const LOCAL_DEMO_USERS: Record<string, { name: string; password: string; roles: UserRole[] }> = {
  'admin@demo.local': { name: 'Local Admin', password: 'Admin123!', roles: ['admin'] },
  'manager@demo.local': { name: 'Local Manager', password: 'Manager123!', roles: ['manager'] },
  'frontdesk@demo.local': { name: 'Local Front Desk', password: 'Frontdesk123!', roles: ['frontdesk'] },
  'proctor@demo.local': { name: 'Local Proctor', password: 'Proctor123!', roles: ['proctor'] },
  'student@demo.local': { name: 'Local Student', password: 'Student123!', roles: ['student'] },
};

function buildLocalPreviewAuthUser(email: string, name: string, roles: UserRole[]): AuthUser {
  const safeEmail = email.trim().toLowerCase();
  const finalRoles = roles.length ? roles : ['student'];
  return buildAuthUser(`local-${safeEmail.replace(/[^a-z0-9]/gi, '-')}`, name, safeEmail, finalRoles);
}

async function resolveAuthUserFromFirebaseProfile(firebaseUser: { uid: string; email?: string | null; displayName?: string | null }): Promise<AuthUser> {
  const normalizedEmail = firebaseUser.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('This account has no email address.');
  }

  if (!hasFirebaseConfig) {
    const localUser = LOCAL_DEMO_USERS[normalizedEmail] ?? { name: firebaseUser.displayName || normalizedEmail.split('@')[0], password: 'Student123!', roles: ['student'] as UserRole[] };
    return buildLocalPreviewAuthUser(normalizedEmail, localUser.name, localUser.roles);
  }

  const client = await getSupabaseClientForFirebaseUser(firebaseUser);

  if (!client) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const displayName = firebaseUser.displayName?.trim() || normalizedEmail.split('@')[0] || 'User';

  let existingProfile: { id: string; full_name: string; email: string; is_active: boolean; firebase_uid?: string | null } | null = null;

  const { data: firebaseProfile, error: profileLookupError } = await client
    .from('profiles')
    .select('id, full_name, email, is_active, firebase_uid')
    .eq('firebase_uid', firebaseUser.uid)
    .maybeSingle();

  if (profileLookupError) {
    throw profileLookupError;
  }

  if (firebaseProfile) {
    existingProfile = firebaseProfile;
  } else {
    const { data: emailProfile, error: emailLookupError } = await client
      .from('profiles')
      .select('id, full_name, email, is_active, firebase_uid')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (emailLookupError) {
      throw emailLookupError;
    }

    if (emailProfile) {
      existingProfile = emailProfile;
    }
  }

  if (!existingProfile) {
    const { data: createdProfile, error: profileInsertError } = await client
      .from('profiles')
      .upsert([
        {
          firebase_uid: firebaseUser.uid,
          full_name: displayName,
          email: normalizedEmail,
          is_active: true,
        },
      ], { onConflict: 'firebase_uid' })
      .select('id, full_name, email, is_active, firebase_uid')
      .single();

    if (profileInsertError || !createdProfile) {
      throw profileInsertError ?? new Error('Profile insert failed.');
    }

    existingProfile = createdProfile;
  }

  if (existingProfile.is_active === false) {
    throw new Error('This account is inactive.');
  }

  if (existingProfile.firebase_uid !== firebaseUser.uid) {
    const { error: syncError } = await client
      .from('profiles')
      .update({ firebase_uid: firebaseUser.uid })
      .eq('id', existingProfile.id);

    if (syncError) {
      throw syncError;
    }
  }

  const { data: roleRows, error: roleRowsError } = await client
    .from('user_roles')
    .select('role_id')
    .eq('profile_id', existingProfile.id);

  if (roleRowsError) {
    throw roleRowsError;
  }

  let roleIds = (roleRows ?? []).map((row) => row.role_id).filter(Boolean);

  if (!roleIds.length) {
    const { data: studentRole, error: studentRoleError } = await client
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .maybeSingle();

    if (studentRoleError) {
      throw studentRoleError;
    }

    if (studentRole) {
      const { error: roleInsertError } = await client
        .from('user_roles')
        .upsert([
          { profile_id: existingProfile.id, role_id: studentRole.id },
        ], { onConflict: 'profile_id,role_id' });

      if (roleInsertError) {
        throw roleInsertError;
      }

      roleIds = [studentRole.id];
    }
  }

  if (!roleIds.length) {
    throw new Error('This account has no role assigned in Supabase.');
  }

  const { data: rolesData, error: rolesError } = await client
    .from('roles')
    .select('name')
    .in('id', roleIds);

  if (rolesError) {
    throw rolesError;
  }

  const roles = (rolesData ?? [])
    .map((row) => row.name)
    .filter((name): name is UserRole => Boolean(name) && ['guest', 'student', 'frontdesk', 'proctor', 'manager', 'admin'].includes(name));

  if (!roles.length) {
    throw new Error('No valid role was found for this user.');
  }

  return buildAuthUser(existingProfile.id, existingProfile.full_name || displayName, normalizedEmail, roles);
}

export async function registerHybrid(email: string, password: string, fullName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim() || normalizedEmail;

  if (!hasFirebaseConfig) {
    const localKey = normalizedEmail;
    const existing = LOCAL_DEMO_USERS[localKey];
    if (existing) {
      throw new Error('This demo account already exists in local preview mode. Please use a different email or sign in with the existing demo credentials.');
    }

    const localProfile: Record<string, string> = {
      email: normalizedEmail,
      password,
      name: cleanName,
      role: 'student',
    };
    Object.assign(LOCAL_DEMO_USERS, { [localKey]: { name: cleanName, password, roles: ['student'] as UserRole[] } });
    return {
      uid: `local-${Date.now()}`,
      email: localProfile.email,
      displayName: localProfile.name,
    };
  }

  const firebaseUser = await registerWithEmail(normalizedEmail, password);
  const client = await getSupabaseClientForFirebaseUser(firebaseUser);

  if (!client) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: existingProfile, error: profileLookupError } = await client
    .from('profiles')
    .select('id, firebase_uid')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (profileLookupError) {
    throw profileLookupError;
  }

  if (existingProfile && existingProfile.firebase_uid && existingProfile.firebase_uid !== firebaseUser.uid) {
    throw new Error('An account with that email already exists.');
  }

  const { data: profile, error: profileUpsertError } = await client
    .from('profiles')
    .upsert([
      {
        firebase_uid: firebaseUser.uid,
        full_name: cleanName,
        email: normalizedEmail,
        is_active: true,
      },
    ], { onConflict: 'firebase_uid' })
    .select('id')
    .single();

  if (profileUpsertError || !profile) {
    throw profileUpsertError ?? new Error('Profile insert failed.');
  }

  const { data: studentRole, error: roleLookupError } = await client
    .from('roles')
    .select('id')
    .eq('name', 'student')
    .maybeSingle();

  if (roleLookupError) {
    throw roleLookupError;
  }

  if (studentRole) {
    const { error: roleInsertError } = await client
      .from('user_roles')
      .upsert([
        { profile_id: profile.id, role_id: studentRole.id },
      ], { onConflict: 'profile_id,role_id' });

    if (roleInsertError) {
      throw roleInsertError;
    }
  }

  return firebaseUser;
}

export async function loginHybrid(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!hasFirebaseConfig) {
    const demoUser = LOCAL_DEMO_USERS[normalizedEmail];

    if (!demoUser) {
      throw new Error('No Firebase project is configured yet. Use one of the local preview accounts or add your Firebase variables in .env.local.');
    }

    if (demoUser.password !== password) {
      throw new Error('Invalid local preview password.');
    }

    return buildLocalPreviewAuthUser(normalizedEmail, demoUser.name, demoUser.roles);
  }

  const firebaseUser = await loginWithEmail(normalizedEmail, password);
  return resolveAuthUserFromFirebaseProfile(firebaseUser);
}

export async function loginGoogleHybrid(): Promise<AuthUser> {
  if (!hasFirebaseConfig) {
    return buildLocalPreviewAuthUser('admin@demo.local', 'Local Admin', ['admin']);
  }

  const firebaseUser = await signInWithGoogleProvider();
  return resolveAuthUserFromFirebaseProfile(firebaseUser);
}

export { auth };
