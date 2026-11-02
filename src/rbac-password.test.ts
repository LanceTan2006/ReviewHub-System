import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAuthUser, canAccessPage } from './rbac';

test('canAccessPage fails closed for unknown protected pages', () => {
  const user = buildAuthUser('u-1', 'Admin User', 'admin@example.com', ['admin']);

  assert.equal(canAccessPage(null, 'admin-dashboard'), false);
  assert.equal(canAccessPage(user, 'landing'), true);
  assert.equal(canAccessPage(user, 'login'), true);
  assert.equal(canAccessPage(user, 'student-dashboard'), true);
  assert.equal(canAccessPage(user, 'unknown-page' as any), false);
});

test('buildAuthUser computes an effective admin permission set', () => {
  const user = buildAuthUser('u-1', 'Admin User', 'admin@example.com', ['admin']);

  assert.equal(user.primaryRole, 'admin');
  assert.equal(user.roles.includes('admin'), true);
  assert.equal(user.effectivePermissions.has('manage_users'), true);
  assert.equal(user.effectivePermissions.has('assign_roles'), true);
});
