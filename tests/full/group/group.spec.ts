import { t } from '../../../pkg/tap';
import { Group, Tenant, User } from '../_fixtures';

t.test('Group', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  const group = t.relationship(new Group().writeTenant(tenant));

  t.assert(tenantOwner).has('list_groups').on(tenant);
  t.assert(tenantOwner).has('create_group').on(tenant);
  t.assert(tenantOwner).has('retrieve').on(group);
  t.assert(tenantOwner).has('update').on(group);
  t.assert(tenantOwner).has('delete').on(group);
  t.assert(tenantOwner).has('list_users').on(group);
  t.assert(tenantOwner).has('add_user').on(group);
  t.assert(tenantOwner).has('remove_user').on(group);
  t.assert(tenantOwner).has('list_galleries').on(group);
  t.assert(tenantOwner).has('add_gallery').on(group);
  t.assert(tenantOwner).has('update_gallery_access').on(group);
  t.assert(tenantOwner).has('remove_gallery').on(group);
  t.assert(tenantOwner).has('list_folders').on(group);
  t.assert(tenantOwner).has('add_folder').on(group);
  t.assert(tenantOwner).has('update_folder_access').on(group);
  t.assert(tenantOwner).has('remove_folder').on(group);

  t.assert(tenantAdmin).has('list_groups').on(tenant);
  t.assert(tenantAdmin).has('create_group').on(tenant);
  t.assert(tenantAdmin).has('retrieve').on(group);
  t.assert(tenantAdmin).has('update').on(group);
  t.assert(tenantAdmin).has('delete').on(group);
  t.assert(tenantAdmin).has('list_users').on(group);
  t.assert(tenantAdmin).has('add_user').on(group);
  t.assert(tenantAdmin).has('remove_user').on(group);
  t.assert(tenantAdmin).has('list_galleries').on(group);
  t.assert(tenantAdmin).has('add_gallery').on(group);
  t.assert(tenantAdmin).has('update_gallery_access').on(group);
  t.assert(tenantAdmin).has('remove_gallery').on(group);
  t.assert(tenantAdmin).has('list_folders').on(group);
  t.assert(tenantAdmin).has('add_folder').on(group);
  t.assert(tenantAdmin).has('update_folder_access').on(group);
  t.assert(tenantAdmin).has('remove_folder').on(group);

  t.assert(tenantMember).has('list_groups').on(tenant);
  t.assert(tenantMember).not.has('create_group').on(tenant);
  t.assert(tenantMember).has('retrieve').on(group);
  t.assert(tenantMember).not.has('update').on(group);
  t.assert(tenantMember).not.has('delete').on(group);
  t.assert(tenantMember).has('list_users').on(group);
  t.assert(tenantMember).not.has('add_user').on(group);
  t.assert(tenantMember).not.has('remove_user').on(group);
  t.assert(tenantMember).has('list_galleries').on(group);
  t.assert(tenantMember).has('add_gallery').on(group);
  t.assert(tenantMember).has('update_gallery_access').on(group);
  t.assert(tenantMember).has('remove_gallery').on(group);
  t.assert(tenantMember).has('list_folders').on(group);
  t.assert(tenantMember).has('add_folder').on(group);
  t.assert(tenantMember).has('update_folder_access').on(group);
  t.assert(tenantMember).has('remove_folder').on(group);

  t.end();
});
