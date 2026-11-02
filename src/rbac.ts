/**
 * ReviewHub — Permission-Based RBAC Engine
 *
 * Architecture:
 *   Users  ──(many-to-many)──  Roles  ──(many-to-many)──  Permissions
 *
 * On login: effectivePermissions = UNION of all permissions from all roles.
 * Route/action guards check: hasPermission(user, 'some_permission').
 * Only manager role can assign/remove roles from users.
 */

import { UserRole } from './types';
import { supabase } from './lib/supabase';

// ─────────────────────────────────────────────────────────────
// 1. PERMISSION STRINGS (exhaustive list for the whole system)
// ─────────────────────────────────────────────────────────────
export type Permission =
  // Generic CRUD
  | 'read'
  | 'write'
  | 'delete'

  // Student self-service
  | 'view_own_profile'
  | 'edit_own_profile'
  | 'view_packages'
  | 'enroll'
  | 'view_own_enrollment'
  | 'view_own_payments'
  | 'view_lessons'
  | 'take_quiz'
  | 'take_mock_exam'
  | 'use_ai_reviewer'
  | 'view_certificates'
  | 'view_announcements'

  // Front Desk / Staff
  | 'manage_students'
  | 'manage_enrollment'
  | 'manage_payments'
  | 'manage_schedule'
  | 'view_reports'

  // Proctor
  | 'manage_lessons'
  | 'manage_quiz'
  | 'manage_mock_exam'
  | 'view_student_performance'

  // Manager
  | 'manage_users'
  | 'assign_roles'       // only manager can grant/revoke roles
  | 'manage_packages'
  | 'monitor_enrollment'
  | 'monitor_payments'
  | 'monitor_schedule'
  | 'view_analytics'
  | 'manage_settings'
  | 'manage_backup';

// ─────────────────────────────────────────────────────────────
// 2. ROLE → PERMISSIONS MAP  (fixed, not editable at runtime)
// ─────────────────────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: [],

  student: [
    'read',
    'view_own_profile', 'edit_own_profile',
    'view_packages',
    'enroll', 'view_own_enrollment',
    'view_own_payments',
    'view_lessons',
    'take_quiz', 'take_mock_exam',
    'use_ai_reviewer',
    'view_certificates',
    'view_announcements',
  ],

  frontdesk: [
    'read', 'write',
    'view_own_profile', 'edit_own_profile',
    'manage_students',
    'manage_enrollment',
    'manage_payments',
    'manage_schedule',
    'view_reports',
    'view_announcements',
  ],

  proctor: [
    'read', 'write',
    'view_own_profile', 'edit_own_profile',
    'manage_lessons',
    'manage_quiz',
    'manage_mock_exam',
    'view_student_performance',
    'view_announcements',
  ],

  manager: [
    'read', 'write', 'delete',
    'view_own_profile', 'edit_own_profile',
    'manage_users',
    'assign_roles',
    'manage_students',
    'manage_packages',
    'monitor_enrollment',
    'monitor_payments',
    'monitor_schedule',
    'view_reports',
    'view_analytics',
    'manage_settings',
    'manage_backup',
    'view_announcements',
    'manage_enrollment',
    'manage_payments',
    'manage_schedule',
    'manage_lessons',
    'manage_quiz',
    'manage_mock_exam',
    'view_student_performance',
  ],

  admin: [
    'read', 'write', 'delete',
    'view_own_profile', 'edit_own_profile',
    'manage_users',
    'assign_roles',
    'manage_students',
    'manage_packages',
    'monitor_enrollment',
    'monitor_payments',
    'monitor_schedule',
    'view_reports',
    'view_analytics',
    'manage_settings',
    'manage_backup',
    'view_announcements',
    'manage_enrollment',
    'manage_payments',
    'manage_schedule',
    'manage_lessons',
    'manage_quiz',
    'manage_mock_exam',
    'view_student_performance',
  ],
};

// ─────────────────────────────────────────────────────────────
// 3. AUTHENTICATED USER MODEL
// ─────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  /** A user can hold multiple roles simultaneously */
  roles: UserRole[];
  /** Effective permissions = union of all role permissions (computed on login) */
  effectivePermissions: Set<Permission>;
  /** Primary role used for UI decisions (sidebar, dashboard redirect) */
  primaryRole: UserRole;
}

/**
 * Build an AuthUser from a set of roles.
 * effectivePermissions = union of all permissions from all roles.
 */
export function buildAuthUser(
  id: string,
  name: string,
  email: string,
  roles: UserRole[]
): AuthUser {
  const normalizedRoles = normalizeRoles(roles);
  const perms = new Set<Permission>();

  normalizedRoles.forEach((role) => {
    (ROLE_PERMISSIONS[role] ?? []).forEach((permission) => perms.add(permission));
  });

  const primaryRole = getPrimaryRole(normalizedRoles);

  return {
    id,
    name,
    email,
    roles: normalizedRoles,
    effectivePermissions: perms,
    primaryRole,
  };
}

/**
 * Check whether a user holds a specific permission.
 */
export function hasPermission(user: AuthUser | null, permission: Permission): boolean {
  if (!user) return false;
  return user.effectivePermissions.has(permission);
}

/**
 * Check whether a user holds ALL of the listed permissions.
 */
export function hasAllPermissions(user: AuthUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.every((p) => user.effectivePermissions.has(p));
}

/**
 * Check whether a user holds ANY of the listed permissions.
 */
export function hasAnyPermission(user: AuthUser | null, permissions: Permission[]): boolean {
  if (!user) return false;
  return permissions.some((p) => user.effectivePermissions.has(p));
}

// ─────────────────────────────────────────────────────────────
// 4. PAGE → REQUIRED PERMISSION MAP
//    Used by the router to enforce 403 on unauthorised navigation.
// ─────────────────────────────────────────────────────────────
import { ActivePage } from './types';

export const PAGE_PERMISSIONS: Partial<Record<ActivePage, Permission>> = {
  // Student area
  'student-dashboard':    'read',
  'student-profile':      'view_own_profile',
  'student-packages':     'view_packages',
  'student-enrollment':   'view_own_enrollment',
  'student-payment':      'view_own_enrollment',   // merged — same page as enrollment
  'student-lessons':      'view_lessons',
  'quiz':                 'take_quiz',
  'student-mock-exam':    'take_mock_exam',
  'ai-reviewer':          'use_ai_reviewer',
  'student-certificates': 'view_certificates',
  'student-announcements':'view_announcements',

  // Front Desk area
  'frontdesk-dashboard':   'read',
  'frontdesk-students':    'manage_students',
  'frontdesk-enrollment':  'manage_enrollment',
  'frontdesk-payments':    'manage_payments',
  'frontdesk-schedule':    'manage_schedule',
  'frontdesk-reports':     'view_reports',
  'frontdesk-announcements':'view_announcements',
  'frontdesk-profile':     'view_own_profile',

  // Proctor area
  'proctor-dashboard':     'read',
  'proctor-lessons':       'manage_lessons',
  'proctor-quiz':          'manage_quiz',
  'proctor-mock-exam':     'manage_mock_exam',
  'proctor-performance':   'view_student_performance',
  'proctor-announcements': 'view_announcements',
  'proctor-profile':       'view_own_profile',

  // Manager area
  'manager-dashboard':     'read',
  'manager-users':         'manage_students',
  'manager-students':      'manage_students',
  'manager-packages':      'manage_packages',
  'manager-enrollment':    'monitor_enrollment',
  'manager-payments':      'monitor_payments',
  'manager-schedule':      'monitor_schedule',
  'manager-reports':       'view_reports',
  'manager-analytics':     'view_analytics',
  'manager-settings':      'manage_settings',
  'manager-backup':        'manage_backup',
  'manager-announcements': 'view_announcements',
  'manager-profile':       'view_own_profile',

  // Legacy admin (map to manager permissions)
  'admin-dashboard':  'read',
  'admin-students':   'manage_students',
  'admin-enrollment': 'manage_enrollment',
  'admin-payments':   'manage_payments',
  'admin-packages':   'manage_packages',
  'admin-lessons':    'manage_lessons',
  'admin-schedule':   'manage_schedule',
  'admin-reports':    'view_reports',
  'admin-settings':   'manage_settings',
};

// ─────────────────────────────────────────────────────────────
// 5. AUTHENTICATION POLICY
//    Supabase Auth is the only authentication source of truth.
//    Browser logic must never grant admin access through a hard-coded
//    credential or a legacy password/hash fallback.
// ─────────────────────────────────────────────────────────────

/**
 * Authenticate against Supabase Auth only.
 *
 * Security requirements:
 * - no hard-coded emergency admin credential
 * - no email-based profile fallback
 * - no legacy password_hash or SHA-256 browser-side checking
 * - profile lookup must happen by auth user id only
 */
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    return null;
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (authError || !authData?.user) {
    return null;
  }

  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, is_active')
    .eq('id', userId)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  if (profile.is_active === false) {
    return null;
  }

  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('profile_id', profile.id);

  const roleIds = (roleRows ?? []).map((row) => row.role_id).filter(Boolean);
  if (roleIds.length === 0) {
    return null;
  }

  const { data: roleData } = await supabase
    .from('roles')
    .select('name')
    .in('id', roleIds);

  const roles = (roleData ?? [])
    .map((row) => row.name)
    .filter((name): name is UserRole => !!name && ['guest', 'student', 'frontdesk', 'proctor', 'manager', 'admin'].includes(name));

  if (roles.length === 0) {
    return null;
  }

  return buildAuthUser(profile.id, profile.full_name, profile.email, roles);
}

export const ROLE_HIERARCHY: UserRole[] = ['admin', 'manager', 'proctor', 'frontdesk', 'student', 'guest'];

export const ROLE_ALIASES: Record<UserRole, UserRole[]> = {
  guest: ['guest'],
  student: ['student'],
  frontdesk: ['frontdesk'],
  proctor: ['proctor'],
  manager: ['manager', 'admin'],
  admin: ['admin', 'manager'],
};

export function normalizeRoles(roles: UserRole[]): UserRole[] {
  const normalized = new Set<UserRole>();

  roles.forEach((role) => {
    const aliases = ROLE_ALIASES[role] ?? [role];
    aliases.forEach((alias) => normalized.add(alias));
  });

  return [...normalized].sort(
    (a, b) => ROLE_HIERARCHY.indexOf(a) - ROLE_HIERARCHY.indexOf(b)
  );
}

export function getPrimaryRole(roles: UserRole[]): UserRole {
  const normalized = normalizeRoles(roles);
  return ROLE_HIERARCHY.find((role) => normalized.includes(role)) ?? 'guest';
}

export function canAccessPage(user: AuthUser | null, page: ActivePage): boolean {
  if (page === 'landing' || page === 'login') return true;
  if (!user) return false;

  const requiredPermission = PAGE_PERMISSIONS[page];
  if (!requiredPermission) return false;

  return hasPermission(user, requiredPermission);
}

// ─────────────────────────────────────────────────────────────
// 6. HOME PAGE per primary role
// ─────────────────────────────────────────────────────────────
export const ROLE_HOME: Record<UserRole, ActivePage> = {
  guest:     'landing',
  student:   'student-dashboard',
  frontdesk: 'frontdesk-dashboard',
  proctor:   'proctor-dashboard',
  manager:   'manager-dashboard',
  admin:     'manager-dashboard',
};
