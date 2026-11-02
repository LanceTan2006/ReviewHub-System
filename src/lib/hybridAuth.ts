import { UserRole } from '../types';
import { buildAuthUser, type AuthUser } from '../rbac';
import { supabase } from './supabase';
import { auth, loginWithEmail, registerWithEmail } from './firebase';

export async function registerHybrid(email: string, password: string, fullName: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim() || normalizedEmail;

  const firebaseUser = await registerWithEmail(normalizedEmail, password);

  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (profileLookupError) {
    throw profileLookupError;
  }

  if (existingProfile && existingProfile.id !== firebaseUser.uid) {
    throw new Error('An account with that email already exists.');
  }

  const { error: profileUpsertError } = await supabase
    .from('profiles')
    .upsert([
      {
        id: firebaseUser.uid,
        full_name: cleanName,
        email: normalizedEmail,
        is_active: true,
      },
    ], { onConflict: 'id' });

  if (profileUpsertError) {
    throw profileUpsertError;
  }

  const { data: studentRole, error: roleLookupError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'student')
    .maybeSingle();

  if (roleLookupError) {
    throw roleLookupError;
  }

  if (studentRole) {
    const { error: roleInsertError } = await supabase
      .from('user_roles')
      .upsert([
        { profile_id: firebaseUser.uid, role_id: studentRole.id },
      ], { onConflict: 'profile_id,role_id' });

    if (roleInsertError) {
      throw roleInsertError;
    }
  }

  return firebaseUser;
}

export async function loginHybrid(email: string, password: string): Promise<AuthUser> {
  const firebaseUser = await loginWithEmail(email.trim().toLowerCase(), password);
  const normalizedEmail = firebaseUser.email?.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error('Firebase user has no email address.');
  }

  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_active')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    throw new Error('No matching profile exists in Supabase for this Firebase account.');
  }

  if (profile.is_active === false) {
    throw new Error('This account is inactive.');
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
    throw new Error('This account has no role assigned in Supabase.');
  }

  const { data: rolesData, error: rolesError } = await supabase
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

  return buildAuthUser(profile.id, profile.full_name, profile.email, roles);
}

export { auth };
