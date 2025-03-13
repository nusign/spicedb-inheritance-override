import { t } from '../../../pkg/tap';
import {
  User,
  Visitor,
  Tenant,
  Folder,
  Guest,
  Anonymous,
  Gallery,
} from '../../_fixtures';

t.test('Visitor', (t) => {
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

  const visitor = t.relationship(new Visitor().writeTenant(tenant));

  t.assert(tenantOwner).has('list_visitors').on(tenant);
  t.assert(tenantOwner).has('delete').on(visitor);

  t.assert(tenantAdmin).has('list_visitors').on(tenant);
  t.assert(tenantAdmin).has('delete').on(visitor);

  t.assert(tenantMember).has('list_visitors').on(tenant);
  t.assert(tenantMember).not.has('delete').on(visitor);

  t.test('Folder', (t) => {
    const folder = t.relationship(
      new Folder()
        .writeTenant(tenant)
        .writeAuthenticated()
        .setPublicAccess('view_only'),
    );

    t.assert(publicUser).has('list_visitors').on(folder);
    t.assert(publicUser).has('create_visitor').on(folder);

    t.assert(guest).has('list_visitors').on(folder);
    t.assert(guest).has('create_visitor').on(folder);

    t.assert(anonymous).has('list_visitors').on(folder);
    t.assert(anonymous).not.has('create_visitor').on(folder);

    t.end();
  });

  t.test('Gallery', (t) => {
    const gallery = t.relationship(
      new Gallery()
        .writeTenant(tenant)
        .writeAuthenticated()
        .setPublicAccess('view_only'),
    );

    t.assert(publicUser).has('list_visitors').on(gallery);
    t.assert(publicUser).has('create_visitor').on(gallery);

    t.assert(guest).has('list_visitors').on(gallery);
    t.assert(guest).has('create_visitor').on(gallery);

    t.assert(anonymous).has('list_visitors').on(gallery);
    t.assert(anonymous).not.has('create_visitor').on(gallery);

    t.end();
  });

  t.end();
});
