import { supabase } from '../supabase';
import type { UserRole } from '../../types';

/**
 * Connects exclusively to:
 * - public.profiles
 * - public.user_roles
 * - public.roles
 * - public.permissions
 * - public.role_permissions
 */

export interface ProfileRecord {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  roles: UserRole[];
}

export async function fetchUsersWithRoles(): Promise<ProfileRecord[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, is_active, created_at, user_roles(role_id, roles(name))')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  return data.map((profile: any) => {
    const roles = (profile.user_roles ?? [])
      .map((ur: any) => ur.roles?.name)
      .filter((role: any): role is UserRole =>
        Boolean(role) && ['guest', 'student', 'frontdesk', 'proctor', 'manager', 'admin'].includes(role)
      );

    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      avatar_url: profile.avatar_url,
      is_active: Boolean(profile.is_active),
      created_at: profile.created_at,
      roles: roles.length > 0 ? roles : ['student'],
    };
  });
}

export async function updateUserRoles(profileId: string, roleNames: UserRole[]): Promise<boolean> {
  if (!supabase) return false;

  const { data: roleRows, error: roleError } = await supabase
    .from('roles')
    .select('id, name')
    .in('name', roleNames);

  if (roleError || !roleRows) throw roleError || new Error('Roles lookup failed.');

  await supabase.from('user_roles').delete().eq('profile_id', profileId);

  const mapped = roleRows.map((r) => ({ profile_id: profileId, role_id: r.id }));
  if (mapped.length > 0) {
    const { error: insertError } = await supabase.from('user_roles').insert(mapped);
    if (insertError) throw insertError;
  }

  return true;
}

export async function setUserActiveStatus(profileId: string, isActive: boolean): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', profileId);

  if (error) throw error;
  return true;
}

export async function fetchRolesAndPermissions() {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('roles')
    .select('id, name, description, role_permissions(permission_id, permissions(name, description))');

  if (error || !data) return [];
  return data;
}
