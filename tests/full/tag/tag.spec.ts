import { t } from '../../../pkg/tap';
import { Anonymous, Guest, Tag, Tenant, User } from '../../_fixtures';

t.test('Tag', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());
  const publicUser = t.relationship(new User());
  const guest = t.relationship(new Guest());
  const anonymous = t.relationship(new Anonymous());

  const tenant = t.relationship(
    new Tenant()
      .writeAuthenticated()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  const tag = t.relationship(new Tag().writeTenant(tenant));

  t.assert(tenantOwner).has('list_tags').on(tenant);
  t.assert(tenantOwner).has('create_tag').on(tenant);
  t.assert(tenantOwner).has('retrieve').on(tag);
  t.assert(tenantOwner).has('update').on(tag);
  t.assert(tenantOwner).has('delete').on(tag);

  t.assert(tenantAdmin).has('list_tags').on(tenant);
  t.assert(tenantAdmin).has('create_tag').on(tenant);
  t.assert(tenantAdmin).has('retrieve').on(tag);
  t.assert(tenantAdmin).has('update').on(tag);
  t.assert(tenantAdmin).has('delete').on(tag);

  t.assert(tenantMember).has('list_tags').on(tenant);
  t.assert(tenantMember).has('create_tag').on(tenant);
  t.assert(tenantMember).has('retrieve').on(tag);
  t.assert(tenantMember).has('update').on(tag);
  t.assert(tenantMember).has('delete').on(tag);

  t.assert(publicUser).has('list_tags').on(tenant);
  t.assert(publicUser).not.has('create_tag').on(tenant);
  t.assert(publicUser).has('retrieve').on(tag);
  t.assert(publicUser).not.has('update').on(tag);
  t.assert(publicUser).not.has('delete').on(tag);

  t.assert(guest).has('list_tags').on(tenant);
  t.assert(guest).not.has('create_tag').on(tenant);
  t.assert(guest).has('retrieve').on(tag);
  t.assert(guest).not.has('update').on(tag);
  t.assert(guest).not.has('delete').on(tag);

  t.assert(anonymous).not.has('list_tags').on(tenant);
  t.assert(anonymous).not.has('create_tag').on(tenant);
  t.assert(anonymous).not.has('retrieve').on(tag);
  t.assert(anonymous).not.has('update').on(tag);
  t.assert(anonymous).not.has('delete').on(tag);

  t.end();
});
