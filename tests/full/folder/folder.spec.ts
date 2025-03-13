import { t } from '../../../pkg/tap';
import { Folder, Group, Tenant, User } from '../../_fixtures';

t.test('Folder', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());

  const groupViewerMember = t.relationship(new User());
  const groupReviewerMember = t.relationship(new User());
  const groupEditorMember = t.relationship(new User());

  const groupViewer = t.relationship(new Group().writeUser(groupViewerMember));
  const groupReviewer = t.relationship(
    new Group().writeUser(groupReviewerMember),
  );
  const groupEditor = t.relationship(new Group().writeUser(groupEditorMember));

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  t.test('Folder', (t) => {
    const folderOwner = t.relationship(new User());
    const folderViewer = t.relationship(new User());
    const folderReviewer = t.relationship(new User());
    const folderEditor = t.relationship(new User());

    const folder = t.relationship(
      new Folder()
        .writeTenant(tenant)
        .writeOwner(folderOwner)
        .addFolderMember(folderViewer, 'view_only')
        .addFolderMember(folderReviewer, 'review')
        .addFolderMember(folderEditor, 'edit')
        .addGroup(groupViewer, 'view_only')
        .addGroup(groupReviewer, 'review')
        .addGroup(groupEditor, 'edit'),
    );

    t.assert(tenantOwner).has('retrieve').on(folder);
    t.assert(tenantOwner).has('update').on(folder);
    t.assert(tenantOwner).has('delete').on(folder);
    t.assert(tenantOwner).has('list_folders').on(folder);
    t.assert(tenantOwner).has('create_folder').on(folder);
    t.assert(tenantOwner).has('list_galleries').on(folder);
    t.assert(tenantOwner).has('create_gallery').on(folder);
    t.assert(tenantOwner).has('list_assets').on(folder);
    t.assert(tenantOwner).has('create_asset').on(folder);

    t.assert(tenantAdmin).has('retrieve').on(folder);
    t.assert(tenantAdmin).has('update').on(folder);
    t.assert(tenantAdmin).has('delete').on(folder);
    t.assert(tenantAdmin).has('list_folders').on(folder);
    t.assert(tenantAdmin).has('create_folder').on(folder);
    t.assert(tenantAdmin).has('list_galleries').on(folder);
    t.assert(tenantAdmin).has('create_gallery').on(folder);
    t.assert(tenantAdmin).has('list_assets').on(folder);
    t.assert(tenantAdmin).has('create_asset').on(folder);

    t.assert(tenantMember).not.has('retrieve').on(folder);
    t.assert(tenantMember).not.has('update').on(folder);
    t.assert(tenantMember).not.has('delete').on(folder);
    t.assert(tenantMember).not.has('list_folders').on(folder);
    t.assert(tenantMember).not.has('create_folder').on(folder);
    t.assert(tenantMember).not.has('list_galleries').on(folder);
    t.assert(tenantMember).not.has('create_gallery').on(folder);
    t.assert(tenantMember).not.has('list_assets').on(folder);
    t.assert(tenantMember).not.has('create_asset').on(folder);

    t.assert(folderOwner).has('retrieve').on(folder);
    t.assert(folderOwner).has('update').on(folder);
    t.assert(folderOwner).has('delete').on(folder);
    t.assert(folderOwner).has('list_folders').on(folder);
    t.assert(folderOwner).has('create_folder').on(folder);
    t.assert(folderOwner).has('list_galleries').on(folder);
    t.assert(folderOwner).has('create_gallery').on(folder);
    t.assert(folderOwner).has('list_assets').on(folder);
    t.assert(folderOwner).has('create_asset').on(folder);

    t.assert(folderViewer).has('retrieve').on(folder);
    t.assert(folderViewer).not.has('update').on(folder);
    t.assert(folderViewer).not.has('delete').on(folder);
    t.assert(folderViewer).has('list_folders').on(folder);
    t.assert(folderViewer).not.has('create_folder').on(folder);
    t.assert(folderViewer).has('list_galleries').on(folder);
    t.assert(folderViewer).not.has('create_gallery').on(folder);
    t.assert(folderViewer).has('list_assets').on(folder);
    t.assert(folderViewer).not.has('create_asset').on(folder);

    t.assert(folderReviewer).has('retrieve').on(folder);
    t.assert(folderReviewer).not.has('update').on(folder);
    t.assert(folderReviewer).not.has('delete').on(folder);
    t.assert(folderReviewer).has('list_folders').on(folder);
    t.assert(folderReviewer).not.has('create_folder').on(folder);
    t.assert(folderReviewer).has('list_galleries').on(folder);
    t.assert(folderReviewer).not.has('create_gallery').on(folder);
    t.assert(folderReviewer).has('list_assets').on(folder);
    t.assert(folderReviewer).not.has('create_asset').on(folder);

    t.assert(folderEditor).has('retrieve').on(folder);
    t.assert(folderEditor).has('update').on(folder);
    t.assert(folderEditor).has('delete').on(folder);
    t.assert(folderEditor).has('list_folders').on(folder);
    t.assert(folderEditor).has('create_folder').on(folder);
    t.assert(folderEditor).has('list_galleries').on(folder);
    t.assert(folderEditor).has('create_gallery').on(folder);
    t.assert(folderEditor).has('list_assets').on(folder);
    t.assert(folderEditor).has('create_asset').on(folder);

    t.assert(groupViewerMember).has('retrieve').on(folder);
    t.assert(groupViewerMember).not.has('update').on(folder);
    t.assert(groupViewerMember).not.has('delete').on(folder);
    t.assert(groupViewerMember).has('list_folders').on(folder);
    t.assert(groupViewerMember).not.has('create_folder').on(folder);
    t.assert(groupViewerMember).has('list_galleries').on(folder);
    t.assert(groupViewerMember).not.has('create_gallery').on(folder);
    t.assert(groupViewerMember).has('list_assets').on(folder);
    t.assert(groupViewerMember).not.has('create_asset').on(folder);

    t.assert(groupReviewerMember).has('retrieve').on(folder);
    t.assert(groupReviewerMember).not.has('update').on(folder);
    t.assert(groupReviewerMember).not.has('delete').on(folder);
    t.assert(groupReviewerMember).has('list_folders').on(folder);
    t.assert(groupReviewerMember).not.has('create_folder').on(folder);
    t.assert(groupReviewerMember).has('list_galleries').on(folder);
    t.assert(groupReviewerMember).not.has('create_gallery').on(folder);
    t.assert(groupReviewerMember).has('list_assets').on(folder);
    t.assert(groupReviewerMember).not.has('create_asset').on(folder);

    t.assert(groupEditorMember).has('retrieve').on(folder);
    t.assert(groupEditorMember).has('update').on(folder);
    t.assert(groupEditorMember).has('delete').on(folder);
    t.assert(groupEditorMember).has('list_folders').on(folder);
    t.assert(groupEditorMember).has('create_folder').on(folder);
    t.assert(groupEditorMember).has('list_galleries').on(folder);
    t.assert(groupEditorMember).has('create_gallery').on(folder);
    t.assert(groupEditorMember).has('list_assets').on(folder);
    t.assert(groupEditorMember).has('create_asset').on(folder);

    t.test(
      'Child folder should inherit permissions from parent folder',
      (t) => {
        const childFolder = t.relationship(new Folder().writeParent(folder));

        t.assert(tenantOwner).has('retrieve').on(childFolder);
        t.assert(tenantOwner).has('update').on(childFolder);
        t.assert(tenantOwner).has('delete').on(childFolder);
        t.assert(tenantOwner).has('list_folders').on(childFolder);
        t.assert(tenantOwner).has('create_folder').on(childFolder);
        t.assert(tenantOwner).has('list_galleries').on(childFolder);
        t.assert(tenantOwner).has('create_gallery').on(childFolder);
        t.assert(tenantOwner).has('list_assets').on(childFolder);
        t.assert(tenantOwner).has('create_asset').on(childFolder);

        t.assert(tenantAdmin).has('retrieve').on(childFolder);
        t.assert(tenantAdmin).has('update').on(childFolder);
        t.assert(tenantAdmin).has('delete').on(childFolder);
        t.assert(tenantAdmin).has('list_folders').on(childFolder);
        t.assert(tenantAdmin).has('create_folder').on(childFolder);
        t.assert(tenantAdmin).has('list_galleries').on(childFolder);
        t.assert(tenantAdmin).has('create_gallery').on(childFolder);
        t.assert(tenantAdmin).has('list_assets').on(childFolder);
        t.assert(tenantAdmin).has('create_asset').on(childFolder);

        t.assert(tenantMember).not.has('retrieve').on(childFolder);
        t.assert(tenantMember).not.has('update').on(childFolder);
        t.assert(tenantMember).not.has('delete').on(childFolder);
        t.assert(tenantMember).not.has('list_folders').on(childFolder);
        t.assert(tenantMember).not.has('create_folder').on(childFolder);
        t.assert(tenantMember).not.has('list_galleries').on(childFolder);
        t.assert(tenantMember).not.has('create_gallery').on(childFolder);
        t.assert(tenantMember).not.has('list_assets').on(childFolder);
        t.assert(tenantMember).not.has('create_asset').on(childFolder);

        t.assert(folderOwner).has('retrieve').on(childFolder);
        t.assert(folderOwner).has('update').on(childFolder);
        t.assert(folderOwner).has('delete').on(childFolder);
        t.assert(folderOwner).has('list_folders').on(childFolder);
        t.assert(folderOwner).has('create_folder').on(childFolder);
        t.assert(folderOwner).has('list_galleries').on(childFolder);
        t.assert(folderOwner).has('create_gallery').on(childFolder);
        t.assert(folderOwner).has('list_assets').on(childFolder);
        t.assert(folderOwner).has('create_asset').on(childFolder);

        t.assert(folderViewer).has('retrieve').on(childFolder);
        t.assert(folderViewer).not.has('update').on(childFolder);
        t.assert(folderViewer).not.has('delete').on(childFolder);
        t.assert(folderViewer).has('list_folders').on(childFolder);
        t.assert(folderViewer).not.has('create_folder').on(childFolder);
        t.assert(folderViewer).has('list_galleries').on(childFolder);
        t.assert(folderViewer).not.has('create_gallery').on(childFolder);
        t.assert(folderViewer).has('list_assets').on(childFolder);
        t.assert(folderViewer).not.has('create_asset').on(childFolder);

        t.assert(folderReviewer).has('retrieve').on(childFolder);
        t.assert(folderReviewer).not.has('update').on(childFolder);
        t.assert(folderReviewer).not.has('delete').on(childFolder);
        t.assert(folderReviewer).has('list_folders').on(childFolder);
        t.assert(folderReviewer).not.has('create_folder').on(childFolder);
        t.assert(folderReviewer).has('list_galleries').on(childFolder);
        t.assert(folderReviewer).not.has('create_gallery').on(childFolder);
        t.assert(folderReviewer).has('list_assets').on(childFolder);
        t.assert(folderReviewer).not.has('create_asset').on(childFolder);

        t.assert(folderEditor).has('retrieve').on(childFolder);
        t.assert(folderEditor).has('update').on(childFolder);
        t.assert(folderEditor).has('delete').on(childFolder);
        t.assert(folderEditor).has('list_folders').on(childFolder);
        t.assert(folderEditor).has('create_folder').on(childFolder);
        t.assert(folderEditor).has('list_galleries').on(childFolder);
        t.assert(folderEditor).has('create_gallery').on(childFolder);
        t.assert(folderEditor).has('list_assets').on(childFolder);
        t.assert(folderEditor).has('create_asset').on(childFolder);

        t.assert(groupViewerMember).has('retrieve').on(childFolder);
        t.assert(groupViewerMember).not.has('update').on(childFolder);
        t.assert(groupViewerMember).not.has('delete').on(childFolder);
        t.assert(groupViewerMember).has('list_folders').on(childFolder);
        t.assert(groupViewerMember).not.has('create_folder').on(childFolder);
        t.assert(groupViewerMember).has('list_galleries').on(childFolder);
        t.assert(groupViewerMember).not.has('create_gallery').on(childFolder);
        t.assert(groupViewerMember).has('list_assets').on(childFolder);
        t.assert(groupViewerMember).not.has('create_asset').on(childFolder);

        t.assert(groupReviewerMember).has('retrieve').on(childFolder);
        t.assert(groupReviewerMember).not.has('update').on(childFolder);
        t.assert(groupReviewerMember).not.has('delete').on(childFolder);
        t.assert(groupReviewerMember).has('list_folders').on(childFolder);
        t.assert(groupReviewerMember).not.has('create_folder').on(childFolder);
        t.assert(groupReviewerMember).has('list_galleries').on(childFolder);
        t.assert(groupReviewerMember).not.has('create_gallery').on(childFolder);
        t.assert(groupReviewerMember).has('list_assets').on(childFolder);
        t.assert(groupReviewerMember).not.has('create_asset').on(childFolder);

        t.assert(groupEditorMember).has('retrieve').on(childFolder);
        t.assert(groupEditorMember).has('update').on(childFolder);
        t.assert(groupEditorMember).has('delete').on(childFolder);
        t.assert(groupEditorMember).has('list_folders').on(childFolder);
        t.assert(groupEditorMember).has('create_folder').on(childFolder);
        t.assert(groupEditorMember).has('list_galleries').on(childFolder);
        t.assert(groupEditorMember).has('create_gallery').on(childFolder);
        t.assert(groupEditorMember).has('list_assets').on(childFolder);
        t.assert(groupEditorMember).has('create_asset').on(childFolder);

        t.end();
      },
    );

    t.end();
  });

  t.test('Folder tenant access', (t) => {
    t.test('viewer', (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setTenantAccess(tenant, 'view_only'),
      );

      t.assert(tenantMember).has('retrieve').on(folder);
      t.assert(tenantMember).not.has('update').on(folder);
      t.assert(tenantMember).not.has('delete').on(folder);
      t.assert(tenantMember).has('list_folders').on(folder);
      t.assert(tenantMember).not.has('create_folder').on(folder);
      t.assert(tenantMember).has('list_galleries').on(folder);
      t.assert(tenantMember).not.has('create_gallery').on(folder);
      t.assert(tenantMember).has('list_assets').on(folder);
      t.assert(tenantMember).not.has('create_asset').on(folder);

      t.end();
    });

    t.test('reviewer', (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setTenantAccess(tenant, 'review'),
      );

      t.assert(tenantMember).has('retrieve').on(folder);
      t.assert(tenantMember).not.has('update').on(folder);
      t.assert(tenantMember).not.has('delete').on(folder);
      t.assert(tenantMember).has('list_folders').on(folder);
      t.assert(tenantMember).not.has('create_folder').on(folder);
      t.assert(tenantMember).has('list_galleries').on(folder);
      t.assert(tenantMember).not.has('create_gallery').on(folder);

      t.end();
    });

    t.test('editor', (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setTenantAccess(tenant, 'edit'),
      );

      t.assert(tenantMember).has('retrieve').on(folder);
      t.assert(tenantMember).has('update').on(folder);
      t.assert(tenantMember).has('delete').on(folder);
      t.assert(tenantMember).has('list_folders').on(folder);
      t.assert(tenantMember).has('create_folder').on(folder);
      t.assert(tenantMember).has('list_galleries').on(folder);
      t.assert(tenantMember).has('create_gallery').on(folder);

      t.end();
    });

    t.end();
  });

  t.test('Folder public access', (t) => {
    t.test('viewer', (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setPublicAccess('view_only'),
      );

      t.assert(tenantMember).has('retrieve').on(folder);
      t.assert(tenantMember).not.has('update').on(folder);
      t.assert(tenantMember).not.has('delete').on(folder);
      t.assert(tenantMember).has('list_folders').on(folder);
      t.assert(tenantMember).not.has('create_folder').on(folder);
      t.assert(tenantMember).has('list_galleries').on(folder);
      t.assert(tenantMember).not.has('create_gallery').on(folder);
      t.assert(tenantMember).has('list_assets').on(folder);
      t.assert(tenantMember).not.has('create_asset').on(folder);

      t.end();
    });

    t.test('reviewer', (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setPublicAccess('review'),
      );

      t.assert(tenantMember).has('retrieve').on(folder);
      t.assert(tenantMember).not.has('update').on(folder);
      t.assert(tenantMember).not.has('delete').on(folder);
      t.assert(tenantMember).has('list_folders').on(folder);
      t.assert(tenantMember).not.has('create_folder').on(folder);
      t.assert(tenantMember).has('list_galleries').on(folder);
      t.assert(tenantMember).not.has('create_gallery').on(folder);
      t.assert(tenantMember).has('list_assets').on(folder);
      t.assert(tenantMember).not.has('create_asset').on(folder);

      t.end();
    });

    t.end();
  });

  t.test(
    'Folder should be hidden from dashboard listing for tenant members',
    (t) => {
      const groupMember = t.relationship(new User());
      const group = t.relationship(new Group().writeUser(groupMember));
      const folderViewer = t.relationship(new User());
      const folder = t.relationship(
        new Folder()
          .writeTenant(tenant)
          .addFolderMember(folderViewer, 'view_only')
          .addGroup(group, 'view_only')
          .setTenantAccess(tenant, 'no_access')
          .setPublicAccess('view_only'),
      );

      t.assert(tenantOwner).has('access_tenant_dashboard_listing').on(folder);
      t.assert(tenantAdmin).has('access_tenant_dashboard_listing').on(folder);
      t.assert(tenantMember)
        .not.has('access_tenant_dashboard_listing')
        .on(folder);

      t.assert(folderViewer).has('access_tenant_dashboard_listing').on(folder);
      t.assert(groupMember).has('access_tenant_dashboard_listing').on(folder);

      t.end();
    },
  );

  t.test(
    'Folder should not be visible for dashboard listing for tenant members if public access is view_only',
    (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setPublicAccess('view_only'),
      );

      t.assert(tenantMember)
        .not.has('access_tenant_dashboard_listing')
        .on(folder);
      t.end();
    },
  );

  t.test(
    'Folder should be visible for dashboard listing for tenant members if tenant access is view_only',
    (t) => {
      const folder = t.relationship(
        new Folder().writeTenant(tenant).setTenantAccess(tenant, 'view_only'),
      );

      t.assert(tenantMember).has('access_tenant_dashboard_listing').on(folder);
      t.end();
    },
  );

  t.end();
});
