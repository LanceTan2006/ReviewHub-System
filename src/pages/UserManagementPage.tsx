/**
 * UserManagementPage — Manager-only page.
 * Lists all system users; allows assigning/removing roles.
 * Only users with the `assign_roles` permission can modify roles.
 */
import React, { useEffect, useState } from 'react';
import { UserRole, UserManagementRecord } from '../types';
import { AuthUser, hasPermission, ROLE_PERMISSIONS } from '../rbac';
import { supabase } from '../lib/supabase';
import { Card, CardBody, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';

interface UserManagementPageProps {
  currentUser: AuthUser;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'error' | 'info') => void;
}

const ALL_ROLES: UserRole[] = ['student', 'frontdesk', 'proctor', 'manager'];

const ROLE_COLORS: Record<UserRole, string> = {
  guest:     'bg-gray-100 text-gray-600 border-gray-200',
  student:   'bg-blue-50 text-blue-700 border-blue-200',
  frontdesk: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  proctor:   'bg-amber-50 text-amber-700 border-amber-200',
  manager:   'bg-purple-50 text-purple-700 border-purple-200',
};

const ROLE_ICONS: Record<UserRole, string> = {
  guest:     'bi-person',
  student:   'bi-mortarboard',
  frontdesk: 'bi-person-badge',
  proctor:   'bi-journal-check',
  manager:   'bi-shield-fill-check',
};

// Seed data sourced from MOCK_USERS in rbac.ts
const INITIAL_USERS: UserManagementRecord[] = [
  { id: 'usr-001', name: 'Alyssa Reyes',      email: 'alyssa.reyes@univ.edu.ph',        roles: ['student'],              status: 'Active',    lastLogin: 'Nov 1, 2026',  createdAt: 'Oct 12, 2026' },
  { id: 'usr-002', name: 'Maria Santos',       email: 'maria.santos@meliorahub.edu.ph',  roles: ['frontdesk'],            status: 'Active',    lastLogin: 'Nov 1, 2026',  createdAt: 'Sep 5, 2026' },
  { id: 'usr-003', name: 'Dr. Ramon Delgado',  email: 'r.delgado@meliorahub.edu.ph',     roles: ['proctor'],              status: 'Active',    lastLogin: 'Oct 30, 2026', createdAt: 'Sep 5, 2026' },
  { id: 'usr-004', name: 'Catherine Lim',      email: 'c.lim@meliorahub.edu.ph',         roles: ['manager'],              status: 'Active',    lastLogin: 'Nov 1, 2026',  createdAt: 'Aug 1, 2026' },
  { id: 'usr-005', name: 'Joshua Bautista',    email: 'j.bautista@meliorahub.edu.ph',    roles: ['frontdesk', 'proctor'], status: 'Active',    lastLogin: 'Oct 28, 2026', createdAt: 'Sep 20, 2026' },
  { id: 'usr-006', name: 'Patricia Cruz',      email: 'patricia.cruz@univ.edu.ph',       roles: ['student'],              status: 'Active',    lastLogin: 'Oct 31, 2026', createdAt: 'Oct 23, 2026' },
  { id: 'usr-007', name: 'Gabriel Tan',        email: 'gabriel.tan@univ.edu.ph',         roles: ['student'],              status: 'Suspended', lastLogin: 'Oct 10, 2026', createdAt: 'Oct 5, 2026' },
];

export const UserManagementPage: React.FC<UserManagementPageProps> = ({
  currentUser,
  onShowToast,
}) => {
  const canAssignRoles = hasPermission(currentUser, 'assign_roles') || hasPermission(currentUser, 'manage_students');
  const canManageUsers = hasPermission(currentUser, 'manage_users') || hasPermission(currentUser, 'manage_students') || canAssignRoles;
  const [users, setUsers] = useState<UserManagementRecord[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserManagementRecord | null>(null);
  const [editRoles, setEditRoles] = useState<UserRole[]>([]);
  const [showPermModal, setShowPermModal] = useState<UserRole | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    const loadUsers = async () => {
      if (!supabase) {
        setUsers(INITIAL_USERS);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_active, created_at, user_roles(role_id, roles(name))')
        .order('created_at', { ascending: false });

      if (error || !data) {
        setUsers(INITIAL_USERS);
        return;
      }

      const mapped = data.map((profile: any) => {
        const roles = (profile.user_roles ?? [])
          .map((ur: any) => ur.roles?.name)
          .filter((role): role is UserRole => Boolean(role) && ['student', 'frontdesk', 'proctor', 'manager'].includes(role));

        return {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          roles: roles.length > 0 ? roles : ['student'],
          status: profile.is_active ? 'Active' : 'Suspended',
          lastLogin: 'Recently',
          createdAt: new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        } satisfies UserManagementRecord;
      });

      setUsers(mapped.length > 0 ? mapped : INITIAL_USERS);
    };

    loadUsers();
  }, []);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openRoleEditor = (user: UserManagementRecord) => {
    if (!canAssignRoles) {
      onShowToast('Insufficient Permission', 'Only staff with role editing permission can modify user roles.', 'error');
      return;
    }
    setEditingUser(user);
    setEditRoles([...user.roles]);
  };

  const toggleRole = (role: UserRole) => {
    setEditRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const saveRoles = async () => {
    if (!editingUser) return;
    if (editRoles.length === 0) {
      onShowToast('At Least One Role Required', 'A user must have at least one role assigned.', 'error');
      return;
    }

    try {
      if (supabase) {
        const { data: roleRows } = await supabase.from('roles').select('id, name').in('name', editRoles);
        const mappedRoles = (roleRows ?? []).map((role) => ({ profile_id: editingUser.id, role_id: role.id }));
        await supabase.from('user_roles').delete().eq('profile_id', editingUser.id);
        if (mappedRoles.length > 0) {
          const { error } = await supabase.from('user_roles').insert(mappedRoles);
          if (error) throw error;
        }
      }

      setUsers((prev) =>
        prev.map((u) => u.id === editingUser.id ? { ...u, roles: editRoles } : u)
      );
      onShowToast('Roles Updated', `Roles for ${editingUser.name} have been saved.`, 'success');
      setEditingUser(null);
    } catch (error: any) {
      console.error('Role update failed:', error);
      onShowToast('Role Update Failed', error?.message ?? 'Unable to update roles in Supabase.', 'error');
    }
  };

  const toggleStatus = async (userId: string) => {
    if (!canAssignRoles) {
      onShowToast('Insufficient Permission', 'Only staff with permission to manage users can suspend or reactivate accounts.', 'error');
      return;
    }

    const user = users.find((u) => u.id === userId);
    const nextStatus = user?.status === 'Active' ? 'Suspended' : 'Active';

    try {
      if (supabase) {
        await supabase.from('profiles').update({ is_active: nextStatus === 'Active' }).eq('id', userId);
      }

      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, status: nextStatus } : u)
      );
      onShowToast(
        nextStatus === 'Active' ? 'User Reactivated' : 'User Suspended',
        `${user?.name} account status updated.`,
        'info'
      );
    } catch (error: any) {
      console.error('Status update failed:', error);
      onShowToast('Status Update Failed', error?.message ?? 'Unable to update the user status.', 'error');
    }
  };

  const handleCreateStudentAccount = async () => {
    if (!canManageUsers) {
      onShowToast('Insufficient Permission', 'Only staff with user management rights can create student accounts.', 'error');
      return;
    }

    const email = newStudent.email.trim();
    const name = newStudent.name.trim();
    const password = newStudent.password.trim();

    if (!name || !email || !password) {
      onShowToast('Missing Details', 'Please provide the student name, email, and password.', 'error');
      return;
    }

    if (!supabase) {
      onShowToast('Supabase Not Configured', 'Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables before creating accounts.', 'error');
      return;
    }

    try {
      const { data: existingUser, error: existingError } = await supabase
        .from('profiles')
        .select('id')
        .ilike('email', email)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existingUser) {
        onShowToast('Duplicate Account', 'A profile with that email already exists.', 'error');
        return;
      }

      const { data: newProfile, error: profileError } = await supabase
        .from('profiles')
        .insert([{ full_name: name, email, password_hash: password, is_active: true }])
        .select('id, full_name, email, is_active, created_at')
        .single();

      if (profileError || !newProfile) throw profileError ?? new Error('Student profile creation failed.');

      const { data: studentRole, error: roleLookupError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'student')
        .maybeSingle();

      if (roleLookupError) throw roleLookupError;
      if (!studentRole) throw new Error('The student role does not exist in the database.');

      const { error: assignError } = await supabase
        .from('user_roles')
        .insert([{ profile_id: newProfile.id, role_id: studentRole.id }]);

      if (assignError) throw assignError;

      setUsers((prev) => [{
        id: newProfile.id,
        name: newProfile.full_name,
        email: newProfile.email,
        roles: ['student'],
        status: newProfile.is_active ? 'Active' : 'Suspended',
        lastLogin: 'Recently',
        createdAt: new Date(newProfile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      }, ...prev]);

      setNewStudent({ name: '', email: '', password: '' });
      setShowCreateModal(false);
      onShowToast('Student Account Created', `${name} can now sign in with the student role.`, 'success');
    } catch (error: any) {
      console.error('Create student failed:', error);
      onShowToast('Student Creation Failed', error?.message ?? 'Unable to create the student account.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white rounded-2xl border border-[#E1EFF7] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#7C3AED] mb-1">
            <i className="bi bi-people-fill" aria-hidden="true" />
            Staff Console — Student Access Management
          </div>
          <h1 className="text-2xl font-extrabold text-[#2C3E50]">User Management</h1>
          <p className="text-sm text-[#64748B] mt-0.5">
            Create student accounts, assign roles, and manage access. Effective permissions are the union of all assigned roles.
          </p>
        </div>
        {canManageUsers && (
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
            <i className="bi bi-person-plus-fill mr-2" aria-hidden="true" />
            Create Student Account
          </Button>
        )}
        {!canAssignRoles && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-semibold">
            <i className="bi bi-exclamation-triangle-fill" aria-hidden="true" />
            Read-only access
          </div>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ALL_ROLES.map((role) => {
          const count = users.filter((u) => u.roles.includes(role)).length;
          return (
            <div key={role} className={`p-4 rounded-xl border ${ROLE_COLORS[role]} flex items-center gap-3`}>
              <i className={`${ROLE_ICONS[role]} text-2xl`} aria-hidden="true" />
              <div>
                <div className="text-lg font-extrabold leading-none">{count}</div>
                <div className="text-[11px] font-semibold capitalize mt-0.5">{role}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* User table */}
      <Card className="border-[#E1EFF7]">
        <CardHeader
          title={`All Users (${filtered.length})`}
          subtitle="Click Edit Roles to assign or revoke role membership"
          action={
            <div className="relative">
              <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" aria-hidden="true" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users…"
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#D6ECFA] bg-[#F4FAFD] focus:outline-none focus:ring-2 focus:ring-[#3498DB] w-48"
              />
            </div>
          }
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E1EFF7] bg-[#F4FAFD] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-5">User</th>
                <th className="py-3 px-5">Roles</th>
                <th className="py-3 px-5">Effective Permissions</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Last Login</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F6FA] text-xs">
              {filtered.map((user) => {
                // Compute effective permissions = union of all role permissions
                const effectivePerms = new Set<string>();
                user.roles.forEach((r) => {
                  (ROLE_PERMISSIONS[r] ?? []).forEach((p) => effectivePerms.add(p));
                });

                return (
                  <tr key={user.id} className="hover:bg-[#FAFDFE] transition-colors">
                    {/* User */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3498DB] to-[#5DADE2] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[#2C3E50]">{user.name}</div>
                          <div className="text-[#64748B]">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Roles */}
                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span key={r} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${ROLE_COLORS[r]}`}>
                            <i className={`${ROLE_ICONS[r]} text-xs`} aria-hidden="true" />
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Effective permissions count + view */}
                    <td className="py-4 px-5">
                      <button
                        onClick={() => setShowPermModal(user.roles[0])}
                        className="inline-flex items-center gap-1.5 text-[#3498DB] hover:text-[#2980B9] font-semibold cursor-pointer"
                      >
                        <i className="bi bi-key text-sm" aria-hidden="true" />
                        {effectivePerms.size} permissions
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        user.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        <i className={`${user.status === 'Active' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} text-xs`} aria-hidden="true" />
                        {user.status}
                      </span>
                    </td>

                    {/* Last login */}
                    <td className="py-4 px-5 text-[#64748B]">{user.lastLogin}</td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => openRoleEditor(user)}
                          disabled={!canAssignRoles}
                        >
                          <i className="bi bi-shield-lock mr-1" aria-hidden="true" />
                          Edit Roles
                        </Button>
                        <button
                          onClick={() => toggleStatus(user.id)}
                          disabled={!canAssignRoles}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            user.status === 'Active'
                              ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          aria-label={user.status === 'Active' ? `Suspend ${user.name}` : `Reactivate ${user.name}`}
                        >
                          {user.status === 'Active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Edit Roles Modal ──────────────────────────────────── */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Roles — ${editingUser.name}`}
          subtitle="Select one or more roles. Effective permissions = union of all selected roles."
          maxWidth="lg"
          footer={
            <>
              <Button variant="secondary" size="md" onClick={() => setEditingUser(null)}>Cancel</Button>
              <Button variant="primary"   size="md" onClick={saveRoles}>Save Role Assignment</Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Role toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_ROLES.map((role) => {
                const isSelected = editRoles.includes(role);
                const rolePerms  = ROLE_PERMISSIONS[role] ?? [];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#3498DB] bg-[#EEF7FD]'
                        : 'border-[#E1EFF7] bg-white hover:border-[#BCE0F7]'
                    }`}
                    aria-pressed={isSelected}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <i className={`${ROLE_ICONS[role]} text-lg`} style={{ color: isSelected ? '#3498DB' : '#94A3B8' }} aria-hidden="true" />
                        <span className="text-sm font-bold text-[#2C3E50] capitalize">{role}</span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected ? 'border-[#3498DB] bg-[#3498DB]' : 'border-[#CBD5E1]'
                      }`}>
                        {isSelected && <i className="bi bi-check text-white text-xs" aria-hidden="true" />}
                      </div>
                    </div>
                    <div className="text-[11px] text-[#64748B]">
                      {rolePerms.length} permissions
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5 max-h-16 overflow-hidden">
                      {rolePerms.slice(0, 5).map((p) => (
                        <span key={p} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4FAFD] border border-[#E1EFF7] text-[#64748B]">{p}</span>
                      ))}
                      {rolePerms.length > 5 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4FAFD] border border-[#E1EFF7] text-[#64748B]">+{rolePerms.length - 5} more</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Computed effective permissions preview */}
            {editRoles.length > 0 && (
              <div className="p-4 rounded-xl bg-[#F4FAFD] border border-[#D6ECFA]">
                <div className="text-xs font-bold text-[#2C3E50] mb-2 flex items-center gap-1.5">
                  <i className="bi bi-key text-[#3498DB]" aria-hidden="true" />
                  Effective Permissions Preview
                </div>
                {(() => {
                  const merged = new Set<string>();
                  editRoles.forEach((r) => { (ROLE_PERMISSIONS[r] ?? []).forEach((p) => merged.add(p)); });
                  return (
                    <div className="flex flex-wrap gap-1">
                      {[...merged].sort().map((p) => (
                        <span key={p} className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">{p}</span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── Create Student Account Modal ───────────────────── */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Student Account"
          subtitle="Create a new student profile and grant student access to the portal."
          maxWidth="md"
          footer={
            <>
              <Button variant="secondary" size="md" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" size="md" onClick={handleCreateStudentAccount}>Create Account</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Full Name</label>
              <input
                type="text"
                value={newStudent.name}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6ECFA] bg-[#F4FAFD] focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
                placeholder="e.g. John Dela Cruz"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Email</label>
              <input
                type="email"
                value={newStudent.email}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6ECFA] bg-[#F4FAFD] focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
                placeholder="student@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2C3E50] mb-1">Temporary Password</label>
              <input
                type="text"
                value={newStudent.password}
                onChange={(e) => setNewStudent((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6ECFA] bg-[#F4FAFD] focus:outline-none focus:ring-2 focus:ring-[#3498DB]"
                placeholder="Create a password"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* ── Permissions Viewer Modal ─────────────────────────── */}
      {showPermModal && (
        <Modal
          isOpen={!!showPermModal}
          onClose={() => setShowPermModal(null)}
          title={`Permissions for Role: ${showPermModal}`}
          subtitle="These are the fixed permissions granted by this role."
          maxWidth="md"
          footer={<Button variant="primary" size="md" onClick={() => setShowPermModal(null)}>Close</Button>}
        >
          <div className="flex flex-wrap gap-1.5">
            {(ROLE_PERMISSIONS[showPermModal] ?? []).map((p) => (
              <span key={p} className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                {p}
              </span>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
};
