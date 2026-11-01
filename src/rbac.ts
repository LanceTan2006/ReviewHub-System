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
    'assign_roles',        // ONLY manager can do this
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
    // Manager also inherits proctor + frontdesk capabilities for oversight
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
  const perms = new Set<Permission>();
  roles.forEach((r) => {
    (ROLE_PERMISSIONS[r] ?? []).forEach((p) => perms.add(p));
  });

  // Primary role = highest-privilege role in the set
  const hierarchy: UserRole[] = ['manager', 'proctor', 'frontdesk', 'student', 'guest'];
  const primaryRole = hierarchy.find((r) => roles.includes(r)) ?? 'guest';

  return { id, name, email, roles, effectivePermissions: perms, primaryRole };
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
  'manager-users':         'manage_users',
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
// 5. MOCK USER DATABASE  (simulates a backend users table)
//    In a real app this would come from an API.
// ─────────────────────────────────────────────────────────────
export interface MockUserRecord {
  id: string;
  name: string;
  email: string;
  password: string;   // plain-text only for demo — never do this in production
  roles: UserRole[];
}

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'usr-001',
    name: 'Alyssa Reyes',
    email: 'alyssa.reyes@univ.edu.ph',
    password: 'Student@123',
    roles: ['student'],
  },
  {
    id: 'usr-002',
    name: 'Maria Santos',
    email: 'maria.santos@meliorahub.edu.ph',
    password: 'FrontDesk@123',
    roles: ['frontdesk'],
  },
  {
    id: 'usr-003',
    name: 'Dr. Ramon Delgado',
    email: 'r.delgado@meliorahub.edu.ph',
    password: 'Proctor@123',
    roles: ['proctor'],
  },
  {
    id: 'usr-004',
    name: 'Catherine Lim',
    email: 'c.lim@meliorahub.edu.ph',
    password: 'Manager@123',
    roles: ['manager'],
  },
  {
    id: 'usr-005',
    name: 'Joshua Bautista',
    email: 'j.bautista@meliorahub.edu.ph',
    password: 'MultiRole@123',
    // A user with BOTH frontdesk and proctor — their effective permissions are the union
    roles: ['frontdesk', 'proctor'],
  },
];

/**
 * Simulate authentication against the mock user DB.
 * Returns an AuthUser on success, null on failure.
 */
export function authenticateUser(email: string, password: string): AuthUser | null {
  const record = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!record) return null;
  return buildAuthUser(record.id, record.name, record.email, record.roles);
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
};
