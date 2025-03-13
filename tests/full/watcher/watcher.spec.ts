import { t } from '../../../pkg/tap';
import { Anonymous, Gallery, Guest, Tenant, User, Watcher } from '../_fixtures';

t.test('Watcher', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());
  const publicUser = t.relationship(new User());
  const guest = t.relationship(new Guest());
  const anonymous = t.relationship(new Anonymous());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  t.test('tenant access', (t) => {
    const gallery = t.relationship(
      new Gallery()
        .writeTenant(tenant)
        .setTenantAccess(tenant, 'view_only')
        .writeAuthenticated(),
    );
    const watcher = t.relationship(new Watcher().writeTarget(gallery));

    t.assert(tenantOwner).has('delete').on(watcher);
    t.assert(tenantOwner).has('retrieve_watcher').on(gallery);
    t.assert(tenantOwner).has('create_watcher').on(gallery);

    t.assert(tenantAdmin).has('delete').on(watcher);
    t.assert(tenantAdmin).has('retrieve_watcher').on(gallery);
    t.assert(tenantAdmin).has('create_watcher').on(gallery);

    t.assert(tenantMember).not.has('delete').on(watcher);
    t.assert(tenantMember).has('retrieve_watcher').on(gallery);
    t.assert(tenantMember).has('create_watcher').on(gallery);
    t.end();
  });

  t.test('public access', (t) => {
    const gallery = t.relationship(
      new Gallery()
        .writeTenant(tenant)
        .setPublicAccess('view_only')
        .writeAuthenticated(),
    );
    const watcher = t.relationship(new Watcher().writeTarget(gallery));

    t.assert(publicUser).has('list_watchers').on(gallery);
    t.assert(publicUser).has('retrieve_watcher').on(gallery);
    t.assert(publicUser).has('create_watcher').on(gallery);
    t.assert(publicUser).not.has('delete_watcher').on(gallery);
    t.assert(publicUser).not.has('delete').on(watcher);

    t.assert(guest).has('list_watchers').on(gallery);
    t.assert(guest).has('retrieve_watcher').on(gallery);
    t.assert(guest).has('create_watcher').on(gallery);
    t.assert(guest).not.has('delete_watcher').on(gallery);
    t.assert(guest).not.has('delete').on(watcher);

    t.assert(anonymous).not.has('list_watchers').on(gallery);
    t.assert(anonymous).not.has('retrieve_watcher').on(gallery);
    t.assert(anonymous).not.has('create_watcher').on(gallery);
    t.assert(anonymous).not.has('delete_watcher').on(gallery);
    t.assert(anonymous).not.has('delete').on(watcher);

    t.end();
  });

  t.test('watcher owner can delete own watcher', (t) => {
    const watcherOwner = t.relationship(new User());
    const watcher = t.relationship(new Watcher().writeOwner(watcherOwner));

    t.assert(watcherOwner).has('delete').on(watcher);

    t.end();
  });

  t.end();
});
