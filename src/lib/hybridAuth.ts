import { UserRole } from '../types';
import { buildAuthUser, type AuthUser } from '../rbac';
import { supabase } from './supabase';

const LOCAL_DEMO_USERS: Record<string, { name: string; password: string; roles: UserRole[] }> = {
  'admin@demo.local': { name: 'Local Admin', password: 'Admin123!', roles: ['admin'] },
  'manager@demo.local': { name: 'Local Manager', password: 'Manager123!', roles: ['manager'] },
  'frontdesk@demo.local': { name: 'Local Front Desk', password: 'Frontdesk123!', roles: ['frontdesk'] },
  'proctor@demo.local': { name: 'Local Proctor', password: 'Proctor123!', roles: ['proctor'] },
  'student@demo.local': { name: 'Local Student', password: 'Student123!', roles: ['student'] },
};

function buildLocalPreviewAuthUser(email: string, name: string, roles: UserRole[]): AuthUser {
  const safeEmail = email.trim().toLowerCase();
  const finalRoles: UserRole[] = roles.length ? roles : ['student'];
  return buildAuthUser(`local-${safeEmail.replace(/[^a-z0-9]/gi, '-')}`, name, safeEmail, finalRoles);
}

function getOAuthRedirectUrl(): string {
  // Local development — redirect back to the Vite dev server
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return `${window.location.origin}/auth/callback`;
    }
  }

  // Production
  const defaultProductionUrl = 'https://review-hub-system.vercel.app';
  const configuredUrl =
    (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) ??
    (import.meta.env.VITE_APP_URL as string | undefined) ??
    (import.meta.env.APP_URL as string | undefined) ??
    defaultProductionUrl;

  return configuredUrl.replace(/\/$/, '') + '/auth/callback';
}

export async function hydrateSupabaseSession(): Promise<AuthUser | null> {
  if (!supabase) {
    return null;
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    return null;
  }

  const user = session.user;
  const normalizedEmail = user.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_active')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    const { data: createdProfile, error: insertError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: normalizedEmail,
          is_active: true,
        },
      ], { onConflict: 'id' })
      .select('id, full_name, email, is_active')
      .single();

    if (insertError || !createdProfile) {
      throw insertError ?? new Error('Profile creation failed.');
    }

    const { data: studentRole, error: studentRoleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .maybeSingle();

    if (!studentRoleError && studentRole) {
      await supabase
        .from('user_roles')
        .upsert([{ profile_id: createdProfile.id, role_id: studentRole.id }], { onConflict: 'profile_id,role_id' });
    }

    return buildAuthUser(createdProfile.id, createdProfile.full_name || 'User', normalizedEmail, ['student']);
  }

  if (profile.is_active === false) {
    return null;
  }

  const { data: roleRows, error: roleRowsError } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('profile_id', profile.id);

  if (roleRowsError) {
    throw roleRowsError;
  }

  const roleIds = (roleRows ?? []).map((row) => row.role_id).filter(Boolean);

  if (!roleIds.length) {
    const { data: studentRole, error: studentRoleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .maybeSingle();

    if (studentRoleError) {
      throw studentRoleError;
    }

    if (studentRole) {
      await supabase
        .from('user_roles')
        .upsert([{ profile_id: profile.id, role_id: studentRole.id }], { onConflict: 'profile_id,role_id' });
    }
  }

  let finalRoleIds = roleIds;

  if (!finalRoleIds.length) {
    const { data: fallbackStudentRole, error: fallbackStudentRoleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'student')
      .maybeSingle();

    if (fallbackStudentRoleError) {
      throw fallbackStudentRoleError;
    }

    if (fallbackStudentRole) {
      finalRoleIds = [fallbackStudentRole.id];
    }
  }

  const { data: roleData, error: roleDataError } = await supabase
    .from('roles')
    .select('name')
    .in('id', finalRoleIds);

  if (roleDataError) {
    throw roleDataError;
  }

  const roles = (roleData ?? [])
    .map((row) => row.name)
    .filter((name): name is UserRole => Boolean(name) && ['guest', 'student', 'frontdesk', 'proctor', 'manager', 'admin'].includes(name));

  if (!roles.length) {
    throw new Error('No valid role was found for this user.');
  }

  return buildAuthUser(profile.id, profile.full_name || 'User', normalizedEmail, roles);
}

export async function registerHybrid(email: string, password: string, fullName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim() || normalizedEmail;

  if (!supabase) {
    const localKey = normalizedEmail;
    const existing = LOCAL_DEMO_USERS[localKey];
    if (existing) {
      throw new Error('This demo account already exists in local preview mode. Please use a different email or sign in with the existing demo credentials.');
    }

    Object.assign(LOCAL_DEMO_USERS, {
      [localKey]: { name: cleanName, password, roles: ['student'] as UserRole[] },
    });

    return {
      uid: `local-${Date.now()}`,
      email: normalizedEmail,
      displayName: cleanName,
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: cleanName,
      },
    },
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error('Supabase sign-up did not return a user.');
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([
      {
        id: data.user.id,
        full_name: cleanName,
        email: normalizedEmail,
        is_active: true,
      },
    ], { onConflict: 'id' });

  if (profileError) {
    throw profileError;
  }

  const { data: studentRole, error: roleLookupError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'student')
    .maybeSingle();

  if (!roleLookupError && studentRole) {
    await supabase
      .from('user_roles')
      .upsert([{ profile_id: data.user.id, role_id: studentRole.id }], { onConflict: 'profile_id,role_id' });
  }

  return data.user;
}

export async function loginHybrid(email: string, password: string): Promise<AuthUser> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    const demoUser = LOCAL_DEMO_USERS[normalizedEmail];

    if (!demoUser) {
      throw new Error('Supabase is not configured yet. Use a local preview account or add your Supabase credentials.');
    }

    if (demoUser.password !== password) {
      throw new Error('Invalid local preview password.');
    }

    return buildLocalPreviewAuthUser(normalizedEmail, demoUser.name, demoUser.roles);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user) {
    throw error ?? new Error('Supabase sign-in failed.');
  }

  const sessionUser = await hydrateSupabaseSession();
  if (sessionUser) {
    return sessionUser;
  }

  throw new Error('Your Supabase profile could not be loaded.');
}

export async function loginGoogleHybrid(): Promise<AuthUser> {
  if (!supabase) {
    return buildLocalPreviewAuthUser('admin@demo.local', 'Local Admin', ['admin']);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getOAuthRedirectUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    throw error;
  }

  const sessionUser = await hydrateSupabaseSession();
  if (sessionUser) {
    return sessionUser;
  }

  throw new Error('Google sign-in was initiated. Please complete the redirect and try again.');
}
