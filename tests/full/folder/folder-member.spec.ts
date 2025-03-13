import { t } from '../../../pkg/tap';
import { Folder, FolderMember, Tenant, User } from '../../_fixtures';

t.test('FolderMember', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());
  const folderOwner = t.relationship(new User());
  const folderViewer = t.relationship(new User());
  const folderMemberUser = t.relationship(new User());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  const folder = t.relationship(
    new Folder()
      .writeTenant(tenant)
      .setTenantAccess(tenant, 'view_only')
      .writeOwner(folderOwner)
      .addFolderMember(folderViewer, 'view_only'),
  );

  const folderMember = t.relationship(
    new FolderMember().writeFolder(folder).writeUser(folderMemberUser),
  );

  t.assert(folderMemberUser).has('retrieve').on(folderMember);
  t.assert(folderMemberUser).has('delete').on(folderMember);

  t.assert(tenantOwner).has('list_folder_members').on(folder);
  t.assert(tenantOwner).has('retrieve').on(folderMember);
  t.assert(tenantOwner).has('update').on(folderMember);
  t.assert(tenantOwner).has('delete').on(folderMember);

  t.assert(tenantAdmin).has('list_folder_members').on(folder);
  t.assert(tenantAdmin).has('retrieve').on(folderMember);
  t.assert(tenantAdmin).has('update').on(folderMember);
  t.assert(tenantAdmin).has('delete').on(folderMember);

  t.assert(tenantMember).has('list_folder_members').on(folder);
  t.assert(tenantMember).has('retrieve').on(folderMember);
  t.assert(tenantMember).not.has('update').on(folderMember);
  t.assert(tenantMember).not.has('delete').on(folderMember);

  t.assert(folderOwner).has('list_folder_members').on(folder);
  t.assert(folderOwner).has('retrieve').on(folderMember);
  t.assert(folderOwner).has('update').on(folderMember);
  t.assert(folderOwner).has('delete').on(folderMember);

  t.assert(folderViewer).has('list_folder_members').on(folder);
  t.assert(folderViewer).has('retrieve').on(folderMember);
  t.assert(folderViewer).not.has('update').on(folderMember);
  t.assert(folderViewer).not.has('delete').on(folderMember);

  t.end();
});
