import { t } from '../../../pkg/tap';
import {
  Anonymous,
  Folder,
  FolderInvitation,
  Guest,
  Tenant,
  User,
} from '../../_fixtures';

t.test('FolderInvitation', (t) => {
  t.test('owner should have all permissions', (t) => {
    const folderInvitationOwner = t.relationship(new User());
    const folderInvitation = t.relationship(
      new FolderInvitation().writeOwner(folderInvitationOwner),
    );

    t.assert(folderInvitationOwner).has('retrieve').on(folderInvitation);
    t.assert(folderInvitationOwner).has('delete').on(folderInvitation);

    t.end();
  });

  t.test('tenant', (t) => {
    const tenantOwner = t.relationship(new User());
    const tenantAdmin = t.relationship(new User());
    const tenantMember = t.relationship(new User());

    const tenant = t.relationship(
      new Tenant()
        .write('owner', tenantOwner.asSubjectRef())
        .write('admin', tenantAdmin.asSubjectRef())
        .write('member', tenantMember.asSubjectRef()),
    );

    t.test('owner should have create and list permissions', (t) => {
      const folder = t.relationship(new Folder().writeTenant(tenant));

      t.assert(tenantOwner).has('create_folder_invitation').on(folder);
      t.assert(tenantOwner).has('list_folder_invitations').on(folder);

      t.end();
    });

    t.test('admin should have create and list permissions', (t) => {
      const folder = t.relationship(new Folder().writeTenant(tenant));

      t.assert(tenantAdmin).has('create_folder_invitation').on(folder);
      t.assert(tenantAdmin).has('list_folder_invitations').on(folder);

      t.end();
    });

    t.test('member should not have create and list permissions', (t) => {
      const folder = t.relationship(new Folder().writeTenant(tenant));

      t.assert(tenantMember).not.has('create_folder_invitation').on(folder);
      t.assert(tenantMember).not.has('list_folder_invitations').on(folder);

      t.end();
    });

    t.test(
      'member should have list permission if tenant access editor is enabled',
      (t) => {
        const folder = t.relationship(
          new Folder().writeTenant(tenant).setTenantAccess(tenant, 'edit'),
        );

        t.assert(tenantMember).has('list_folder_invitations').on(folder);
        t.assert(tenantMember).has('create_folder_invitation').on(folder);
        t.end();
      },
    );

    t.end();
  });

  t.test('public access', (t) => {
    const publicUser = t.relationship(new User());
    const guest = t.relationship(new Guest());
    const anonymous = t.relationship(new Anonymous());

    t.test('reviewer should provide any access to folde invitations', (t) => {
      const folder = t.relationship(new Folder().setPublicAccess('review'));

      t.assert(publicUser).not.has('list_folder_invitations').on(folder);
      t.assert(publicUser).not.has('create_folder_invitation').on(folder);

      t.assert(guest).not.has('list_folder_invitations').on(folder);
      t.assert(guest).not.has('create_folder_invitation').on(folder);

      t.assert(anonymous).not.has('list_folder_invitations').on(folder);
      t.assert(anonymous).not.has('create_folder_invitation').on(folder);

      t.end();
    });

    t.end();
  });

  t.test('folder membership', (t) => {
    const folderViewer = t.relationship(new User());
    const folderReviewer = t.relationship(new User());
    const folderEditor = t.relationship(new User());

    const folder = t.relationship(
      new Folder()
        .addFolderMember(folderViewer, 'view_only')
        .addFolderMember(folderReviewer, 'review')
        .addFolderMember(folderEditor, 'edit'),
    );

    t.assert(folderViewer).not.has('list_folder_invitations').on(folder);
    t.assert(folderViewer).not.has('create_folder_invitation').on(folder);

    t.assert(folderReviewer).not.has('list_folder_invitations').on(folder);
    t.assert(folderReviewer).not.has('create_folder_invitation').on(folder);

    t.assert(folderEditor).has('list_folder_invitations').on(folder);
    t.assert(folderEditor).has('create_folder_invitation').on(folder);

    t.end();
  });

  t.end();
});
