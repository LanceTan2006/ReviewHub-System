import test from 'node:test';
import assert from 'node:assert/strict';

import { hashPassword, passwordsMatch, resolveLegacyProfileLogin } from './rbac';

test('passwordsMatch accepts legacy plain-text values and hashed values', async () => {
  const plain = 'Admin@123';
  const hashed = await hashPassword(plain);

  assert.equal(await passwordsMatch(plain, plain), true);
  assert.equal(await passwordsMatch(plain, hashed), true);
  assert.equal(await passwordsMatch('wrong-password', hashed), false);
});

test('resolveLegacyProfileLogin accepts seeded profile hashes for premade accounts', async () => {
  const profile = {
    id: 'legacy-admin-id',
    full_name: 'System Admin',
    email: 'admin@meliorahub.edu.ph',
    password_hash: await hashPassword('Admin@123'),
    is_active: true,
  };

  const user = await resolveLegacyProfileLogin(profile, 'Admin@123', ['admin']);

  assert.ok(user);
  assert.equal(user?.email, 'admin@meliorahub.edu.ph');
  assert.equal(user?.primaryRole, 'admin');
});
