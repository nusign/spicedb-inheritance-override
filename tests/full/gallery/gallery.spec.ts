import { t } from '../../../pkg/tap';
import { Anonymous, Folder, Gallery, Guest, Tenant, User } from '../_fixtures';
import { Group } from '../_fixtures/group.fixture';

t.test('Gallery', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());
  const folderViewer = t.relationship(new User());
  const folderEditor = t.relationship(new User());
  const publicUser = t.relationship(new User());
  const guest = t.relationship(new Guest());
  const anonymous = t.relationship(new Anonymous());

  const tenantFixture = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  t.test('Top level gallery', (t) => {
    t.test('Gallery with tenant access no access', (t) => {
      const galleryFixture = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'no_access'),
      );

      t.assert(tenantOwner).has('retrieve').on(galleryFixture);
      t.assert(tenantMember).not.has('retrieve').on(galleryFixture);
      t.end();
    });

    t.test('Gallery with tenant access view only', (t) => {
      const galleryFixture = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'view_only'),
      );

      t.assert(tenantOwner).has('update').on(galleryFixture);
      t.assert(tenantMember).has('retrieve').on(galleryFixture);
      t.assert(tenantMember).not.has('update').on(galleryFixture);
      t.end();
    });

    t.test('Gallery with member', (t) => {
      const galleryMember = t.relationship(new User());
      const galleryFixture = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .addGalleryMember(galleryMember, 'edit'),
      );

      t.assert(galleryMember).has('update').on(galleryFixture);
      t.end();
    });

    t.test('Gallery with group', (t) => {
      const groupMember = t.relationship(new User());
      const group = t.relationship(new Group().writeUser(groupMember));
      const galleryFixture = t.relationship(
        new Gallery().writeTenant(tenantFixture).addGroup(group, 'edit'),
      );

      t.assert(groupMember).has('update').on(galleryFixture);
      t.end();
    });

    t.end();
  });

  t.test('Gallery in folder', (t) => {
    t.test('should select the higher permission possible', (t) => {
      t.test('if gallery tenant and public access both view_only', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'view_only')
            .setPublicAccess('view_only'),
        );
        const gallery = t.relationship(new Gallery().writeFolder(folder));

        t.assert(tenantMember).has('retrieve').on(gallery);
        t.assert(publicUser).has('retrieve').on(gallery);

        t.end();
      });

      t.test('if gallery tenant access view_only', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'view_only')
            .setPublicAccess('view_only'),
        );
        const gallery = t.relationship(
          new Gallery()
            .writeFolder(folder)
            .setTenantAccess(tenantFixture, 'no_access'),
        );

        t.assert(tenantMember).has('retrieve').on(gallery);
        t.assert(publicUser).has('retrieve').on(gallery);
        t.end();
      });

      t.test('if gallery public access no_access', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'view_only')
            .setPublicAccess('view_only'),
        );
        const gallery = t.relationship(
          new Gallery().writeFolder(folder).setPublicAccess('no_access'),
        );

        t.assert(tenantMember).has('retrieve').on(gallery);
        t.assert(publicUser).not.has('retrieve').on(gallery);
        t.end();
      });

      t.test('if gallery tenant and public access edit', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'view_only')
            .setPublicAccess('view_only'),
        );
        const gallery = t.relationship(
          new Gallery()
            .writeFolder(folder)
            .setTenantAccess(tenantFixture, 'no_access')
            .setPublicAccess('no_access'),
        );

        t.assert(tenantMember).not.has('retrieve').on(gallery);
        t.assert(publicUser).not.has('retrieve').on(gallery);

        t.end();
      });

      t.end();
    });

    t.end();
  });

  t.test('Child gallery with parent gallery in the folder', (t) => {
    const parentGalleryViewer = t.relationship(new User());
    const folderGroupViewerMember = t.relationship(new User());
    const parentGalleryGroupViewerMember = t.relationship(new User());

    const folderGroupViewer = t.relationship(
      new Group().writeUser(folderGroupViewerMember),
    );
    const parentGalleryGroupViewer = t.relationship(
      new Group().writeUser(parentGalleryGroupViewerMember),
    );

    const folderFixture = t.relationship(
      new Folder()
        .writeTenant(tenantFixture)
        .setTenantAccess(tenantFixture, 'view_only')
        .setPublicAccess('view_only')
        .addFolderMember(folderViewer, 'view_only')
        .addFolderMember(folderEditor, 'edit')
        .addGroup(folderGroupViewer, 'view_only'),
    );

    const parentGallery = t.relationship(
      new Gallery()
        .writeTenant(tenantFixture)
        .writeFolder(folderFixture)
        .addGalleryMember(parentGalleryViewer, 'view_only')
        .addGroup(parentGalleryGroupViewer, 'view_only'),
    );

    t.test(
      'child gallery should inherit permissions of parent gallery and its parent folder',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('create_comment').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).has('retrieve').on(childGallery);
        t.assert(anonymous).has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test('child gallery should expand tenant access to editor', (t) => {
      const childGallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'edit')
          .addParentGallery(t, parentGallery),
      );

      t.assert(tenantMember).has('retrieve').on(childGallery);
      t.assert(tenantMember).has('create_comment').on(childGallery);
      t.assert(tenantMember).has('update').on(childGallery);

      t.assert(publicUser).has('retrieve').on(childGallery);
      t.assert(publicUser).not.has('create_comment').on(childGallery);
      t.assert(guest).has('retrieve').on(childGallery);
      t.assert(anonymous).has('retrieve').on(childGallery);

      t.assert(folderViewer).has('retrieve').on(childGallery);
      t.assert(folderViewer).not.has('update').on(childGallery);

      t.assert(folderEditor).has('update').on(childGallery);

      t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
      t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

      t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
      t.assert(parentGalleryViewer).not.has('update').on(childGallery);

      t.assert(parentGalleryGroupViewerMember).has('retrieve').on(childGallery);
      t.assert(parentGalleryGroupViewerMember)
        .not.has('update')
        .on(childGallery);

      t.end();
    });

    t.test(
      'child gallery should not remove tenant access if public access is view_only remains on the folder level',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'no_access')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('create_comment').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).has('retrieve').on(childGallery);
        t.assert(anonymous).has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should remove tenant access if public access is also no_access',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'no_access')
            .setPublicAccess('no_access')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).not.has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).not.has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).not.has('retrieve').on(childGallery);
        t.assert(anonymous).not.has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test('child gallery should expand public access to reviewer', (t) => {
      const childGallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setPublicAccess('review')
          .addParentGallery(t, parentGallery),
      );

      t.assert(tenantMember).has('retrieve').on(childGallery);
      t.assert(tenantMember).has('create_comment').on(childGallery);
      t.assert(tenantMember).not.has('update').on(childGallery);

      t.assert(publicUser).has('retrieve').on(childGallery);
      t.assert(publicUser).has('create_comment').on(childGallery);
      t.assert(guest).has('retrieve').on(childGallery);
      t.assert(anonymous).has('retrieve').on(childGallery);

      t.assert(folderViewer).has('retrieve').on(childGallery);
      t.assert(folderViewer).not.has('update').on(childGallery);

      t.assert(folderEditor).has('update').on(childGallery);

      t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
      t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

      t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
      t.assert(parentGalleryViewer).not.has('update').on(childGallery);

      t.assert(parentGalleryGroupViewerMember).has('retrieve').on(childGallery);
      t.assert(parentGalleryGroupViewerMember)
        .not.has('update')
        .on(childGallery);

      t.end();
    });

    t.test('child gallery should remove public access', (t) => {
      const childGallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setPublicAccess('no_access')
          .addParentGallery(t, parentGallery),
      );

      t.assert(tenantMember).has('retrieve').on(childGallery);
      t.assert(tenantMember).not.has('create_comment').on(childGallery);
      t.assert(tenantMember).not.has('update').on(childGallery);

      t.assert(publicUser).not.has('retrieve').on(childGallery);
      t.assert(publicUser).not.has('create_comment').on(childGallery);
      t.assert(guest).not.has('retrieve').on(childGallery);
      t.assert(anonymous).not.has('retrieve').on(childGallery);

      t.assert(folderViewer).has('retrieve').on(childGallery);
      t.assert(folderViewer).not.has('update').on(childGallery);

      t.assert(folderEditor).has('update').on(childGallery);

      t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
      t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

      t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
      t.assert(parentGalleryViewer).not.has('update').on(childGallery);

      t.assert(parentGalleryGroupViewerMember).has('retrieve').on(childGallery);
      t.assert(parentGalleryGroupViewerMember)
        .not.has('update')
        .on(childGallery);

      t.end();
    });

    t.test(
      'child gallery should expand access for folder member viewer',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGalleryMember(folderViewer, 'edit')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).has('retrieve').on(childGallery);
        t.assert(anonymous).has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for folder member viewer',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGalleryMember(folderViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).not.has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).not.has('retrieve').on(childGallery);
        t.assert(anonymous).not.has('retrieve').on(childGallery);

        t.assert(folderViewer).not.has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should expand access for folder group member viewer',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGroup(folderGroupViewer, 'edit')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).has('retrieve').on(childGallery);
        t.assert(anonymous).has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for folder group member viewer',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGroup(folderGroupViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).not.has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).not.has('retrieve').on(childGallery);
        t.assert(anonymous).not.has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).not.has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should expand access for gallery member viewer',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGalleryMember(parentGalleryViewer, 'edit')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).has('retrieve').on(childGallery);
        t.assert(anonymous).has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for gallery member viewer',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGalleryMember(parentGalleryViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).not.has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).not.has('retrieve').on(childGallery);
        t.assert(anonymous).not.has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).not.has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should expand access for parent gallery group member',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGroup(parentGalleryGroupViewer, 'edit')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).has('retrieve').on(childGallery);
        t.assert(anonymous).has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember).has('update').on(childGallery);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for parent gallery group member',
      (t) => {
        const childGallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .addGroup(parentGalleryGroupViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParentGallery(t, parentGallery),
        );

        t.assert(tenantMember).has('retrieve').on(childGallery);
        t.assert(tenantMember).not.has('update').on(childGallery);

        t.assert(publicUser).not.has('retrieve').on(childGallery);
        t.assert(publicUser).not.has('create_comment').on(childGallery);
        t.assert(guest).not.has('retrieve').on(childGallery);
        t.assert(anonymous).not.has('retrieve').on(childGallery);

        t.assert(folderViewer).has('retrieve').on(childGallery);
        t.assert(folderViewer).not.has('update').on(childGallery);

        t.assert(folderEditor).has('update').on(childGallery);

        t.assert(folderGroupViewerMember).has('retrieve').on(childGallery);
        t.assert(folderGroupViewerMember).not.has('update').on(childGallery);

        t.assert(parentGalleryViewer).has('retrieve').on(childGallery);
        t.assert(parentGalleryViewer).not.has('update').on(childGallery);

        t.assert(parentGalleryGroupViewerMember)
          .not.has('retrieve')
          .on(childGallery);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childGallery);

        t.end();
      },
    );

    t.end();
  });

  t.test('Gallery with public access', (t) => {
    const galleryFixture = t.relationship(
      new Gallery().writeTenant(tenantFixture).setPublicAccess('review'),
    );

    t.assert(publicUser).has('retrieve').on(galleryFixture);
    t.assert(publicUser).not.has('update').on(galleryFixture);

    t.end();
  });

  t.test('Gallery in public access folder', (t) => {
    const folderFixture = t.relationship(
      new Folder().writeTenant(tenantFixture).setPublicAccess('view_only'),
    );

    t.test('Gallery should inherit folder public access', (t) => {
      const galleryFixture = t.relationship(
        new Gallery().writeTenant(tenantFixture).writeFolder(folderFixture),
      );
      t.assert(publicUser).has('retrieve').on(galleryFixture);
      t.assert(publicUser).not.has('update').on(galleryFixture);
      t.assert(tenantMember).has('retrieve').on(galleryFixture);
      t.assert(tenantMember).not.has('update').on(galleryFixture);
      t.end();
    });

    t.test('Gallery should expand folder public access', (t) => {
      const galleryFixture = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setPublicAccess('review')
          .writeFolder(folderFixture),
      );
      t.assert(publicUser).has('create_comment').on(galleryFixture);
      t.assert(publicUser).not.has('update').on(galleryFixture);
      t.assert(tenantMember).has('create_comment').on(galleryFixture);
      t.assert(tenantMember).not.has('update').on(galleryFixture);
      t.end();
    });

    t.test('Gallery should remove folder public access', (t) => {
      const galleryFixture = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setPublicAccess('no_access')
          .writeFolder(folderFixture),
      );
      t.assert(publicUser).not.has('create_comment').on(galleryFixture);
      t.assert(tenantMember).not.has('create_comment').on(galleryFixture);
      t.end();
    });

    t.end();
  });

  t.test('Gallery with combined public and tenant access', (t) => {
    t.test(
      'Gallery with public access view_only and tenant access edit',
      (t) => {
        const galleryFixture = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .setPublicAccess('view_only')
            .setTenantAccess(tenantFixture, 'edit'),
        );

        t.assert(publicUser).has('retrieve').on(galleryFixture);
        t.assert(publicUser).not.has('update').on(galleryFixture);
        t.assert(tenantMember).has('retrieve').on(galleryFixture);
        t.assert(tenantMember).has('update').on(galleryFixture);
        t.end();
      },
    );

    t.test(
      'Gallery with public access view only and tenant access no_access',
      (t) => {
        const galleryFixture = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .setPublicAccess('view_only')
            .setTenantAccess(tenantFixture, 'no_access'),
        );

        t.assert(publicUser).has('retrieve').on(galleryFixture);
        t.assert(publicUser).not.has('update').on(galleryFixture);
        t.assert(tenantMember).has('retrieve').on(galleryFixture);
        t.assert(tenantMember).not.has('update').on(galleryFixture);
        t.end();
      },
    );

    t.end();
  });

  t.test('Gallery with tenant member as gallery member', (t) => {
    t.test('Tenant as gallery member access is not restricted', (t) => {
      const gallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'edit')
          .addGalleryMember(tenantMember, 'no_access'),
      );

      t.assert(tenantMember).has('retrieve').on(gallery);
      t.end();
    });

    t.test('Tenant as gallery member access is expanded', (t) => {
      const gallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'view_only')
          .addGalleryMember(tenantMember, 'edit'),
      );

      t.assert(tenantMember).has('update').on(gallery);
      t.end();
    });

    t.end();
  });

  t.test('Gallery in folder with tenant member as gallery member', (t) => {
    const folderFixture = t.relationship(
      new Folder()
        .writeTenant(tenantFixture)
        .addFolderMember(tenantMember, 'edit'),
    );

    t.test(
      'remove tenant and public acces while folder member still has access',
      (t) => {
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .writeFolder(folderFixture)
            .setTenantAccess(tenantFixture, 'no_access')
            .setPublicAccess('no_access'),
        );

        t.assert(tenantMember).has('update').on(gallery);
        t.end();
      },
    );
    t.end();
  });

  t.test('Deep nesting with overrides', (t) => {
    const topLevelGalleryGroupMember = t.relationship(new User());
    const topLevelGalleryGroup = t.relationship(
      new Group().writeUser(topLevelGalleryGroupMember),
    );
    const topLevelFolderMember = t.relationship(new User());
    const topLevelFolderFixture = t.relationship(
      new Folder()
        .writeTenant(tenantFixture)
        .setTenantAccess(tenantFixture, 'edit')
        .setPublicAccess('view_only')
        .addFolderMember(topLevelFolderMember, 'edit')
        .addGroup(topLevelGalleryGroup, 'edit'),
    );
    const midLevelFolderFixture = t.relationship(
      new Folder()
        .writeTenant(tenantFixture)
        .writeParent(topLevelFolderFixture),
    );

    t.test('basic access checks', (t) => {
      const folderFixture = t.relationship(
        new Folder()
          .writeTenant(tenantFixture)
          .writeParent(midLevelFolderFixture),
      );
      const mainGallery = t.relationship(
        new Gallery().writeTenant(tenantFixture).writeFolder(folderFixture),
      );
      const subGallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .addParentGallery(t, mainGallery),
      );

      t.assert(topLevelFolderMember).has('update').on(subGallery);
      t.assert(tenantMember).has('update').on(subGallery);
      t.assert(publicUser).has('retrieve').on(subGallery);
      t.assert(publicUser).not.has('update').on(subGallery);
      t.assert(topLevelGalleryGroupMember).has('update').on(subGallery);
      t.end();
    });

    t.test('overriding public and tenant access on folder', (t) => {
      const folderFixture = t.relationship(
        new Folder()
          .writeTenant(tenantFixture)
          .writeParent(midLevelFolderFixture)
          .setTenantAccess(tenantFixture, 'no_access')
          .setPublicAccess('no_access'),
      );
      const mainGallery = t.relationship(
        new Gallery().writeTenant(tenantFixture).writeFolder(folderFixture),
      );
      const subGallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .addParentGallery(t, mainGallery),
      );

      t.test('top level folder member, and group member keep access', (t) => {
        t.assert(topLevelFolderMember).has('update').on(subGallery);
        t.assert(topLevelGalleryGroupMember).has('update').on(subGallery);
        t.end();
      });

      t.test('tenant member and public user lose access', (t) => {
        t.assert(tenantMember).not.has('retrieve').on(subGallery);
        t.assert(publicUser).not.has('retrieve').on(subGallery);
        t.end();
      });

      t.end();
    });

    t.test('overriding all access on folder', (t) => {
      const folderFixture = t.relationship(
        new Folder()
          .writeTenant(tenantFixture)
          .writeParent(midLevelFolderFixture)
          .setTenantAccess(tenantFixture, 'no_access')
          .setPublicAccess('no_access')
          .addFolderMember(topLevelFolderMember, 'no_access')
          .addGroup(topLevelGalleryGroup, 'no_access'),
      );
      const mainGallery = t.relationship(
        new Gallery().writeTenant(tenantFixture).writeFolder(folderFixture),
      );
      const subGallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .addParentGallery(t, mainGallery),
      );

      t.test('everyone loses access', (t) => {
        t.assert(tenantMember).not.has('retrieve').on(subGallery);
        t.assert(publicUser).not.has('retrieve').on(subGallery);
        t.assert(topLevelFolderMember).not.has('retrieve').on(subGallery);
        t.assert(topLevelGalleryGroupMember).not.has('retrieve').on(subGallery);
        t.end();
      });

      t.end();
    });
    t.end();
  });

  t.test('Tenant access must be downgraded to view_only', (t) => {
    const gallery = t.relationship(
      new Gallery()
        .writeTenant(tenantFixture)
        .setTenantAccess(tenantFixture, 'edit'),
    );
    const childGallery = t.relationship(
      new Gallery()
        .writeTenant(tenantFixture)
        .addParentGallery(t, gallery)
        .setTenantAccess(tenantFixture, 'view_only'),
    );

    t.assert(tenantMember).has('retrieve').on(childGallery);
    t.assert(tenantMember).not.has('update').on(childGallery);

    t.end();
  });

  t.test(
    'Gallery should be hidden from dashboard listing for tenant members',
    (t) => {
      const galleryViewer = t.relationship(new User());
      const groupMember = t.relationship(new User());
      const group = t.relationship(new Group().writeUser(groupMember));
      const folderMember = t.relationship(new User());
      const folder = t.relationship(
        new Folder()
          .writeTenant(tenantFixture)
          .addFolderMember(folderMember, 'view_only'),
      );

      const gallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .writeFolder(folder)
          .addGalleryMember(galleryViewer, 'view_only')
          .addGroup(group, 'view_only')
          .setTenantAccess(tenantFixture, 'no_access')
          .setPublicAccess('view_only'),
      );

      t.assert(tenantOwner).has('access_tenant_dashboard_listing').on(gallery);
      t.assert(tenantAdmin).has('access_tenant_dashboard_listing').on(gallery);
      t.assert(tenantMember)
        .not.has('access_tenant_dashboard_listing')
        .on(gallery);

      t.assert(galleryViewer)
        .has('access_tenant_dashboard_listing')
        .on(gallery);
      t.assert(groupMember).has('access_tenant_dashboard_listing').on(gallery);
      t.assert(folderMember).has('access_tenant_dashboard_listing').on(gallery);

      t.end();
    },
  );

  t.test(
    'Gallery should not be visible for dashboard listing for tenant members if public access is view_only',
    (t) => {
      const gallery = t.relationship(
        new Gallery().writeTenant(tenantFixture).setPublicAccess('view_only'),
      );

      t.assert(tenantMember)
        .not.has('access_tenant_dashboard_listing')
        .on(gallery);
      t.end();
    },
  );

  t.test(
    'Gallery should be visible for dashboard listing for tenant members if tenant access is view_only',
    (t) => {
      const gallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'view_only'),
      );

      t.assert(tenantMember).has('access_tenant_dashboard_listing').on(gallery);
      t.end();
    },
  );

  t.test(
    'Gallery should be visible for dashboard listing for team members who are also gallery members if tenant access is no_access',
    (t) => {
      const gallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'no_access')
          .addGalleryMember(tenantMember, 'view_only'),
      );

      t.assert(tenantMember).has('access_tenant_dashboard_listing').on(gallery);
      t.end();
    },
  );

  t.test(
    'Gallery in folder should be visible for dashboard listing for team members who are also gallery members if tenant access is no_access',
    (t) => {
      t.test('gallery member on folder level', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .addFolderMember(tenantMember, 'view_only')
            .setTenantAccess(tenantFixture, 'no_access'),
        );
        const gallery = t.relationship(
          new Gallery().writeTenant(tenantFixture).writeFolder(folder),
        );

        t.assert(tenantMember)
          .has('access_tenant_dashboard_listing')
          .on(gallery);
        t.end();
      });

      t.test('gallery member on gallery level', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'no_access'),
        );
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .writeFolder(folder)
            .addGalleryMember(tenantMember, 'view_only'),
        );

        t.assert(tenantMember)
          .has('access_tenant_dashboard_listing')
          .on(gallery);
        t.end();
      });
      t.end();
    },
  );

  t.test(
    'Gallery should be visible for dashboard listing for group members if tenant access is no_access',
    (t) => {
      const group = t.relationship(new Group().writeUser(tenantMember));
      const gallery = t.relationship(
        new Gallery()
          .writeTenant(tenantFixture)
          .setTenantAccess(tenantFixture, 'no_access')
          .addGroup(group, 'view_only'),
      );

      t.assert(tenantMember).has('access_tenant_dashboard_listing').on(gallery);
      t.end();
    },
  );

  t.test(
    'Gallery in folder should be visible for dashboard listing for group members if tenant access is no_access',
    (t) => {
      t.test('group on folder level', (t) => {
        const group = t.relationship(new Group().writeUser(tenantMember));
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'no_access')
            .addGroup(group, 'view_only'),
        );
        const gallery = t.relationship(
          new Gallery().writeTenant(tenantFixture).writeFolder(folder),
        );

        t.assert(tenantMember)
          .has('access_tenant_dashboard_listing')
          .on(gallery);
        t.end();
      });

      t.test('group on gallery level', (t) => {
        const group = t.relationship(new Group().writeUser(tenantMember));
        const folder = t.relationship(
          new Folder()
            .writeTenant(tenantFixture)
            .setTenantAccess(tenantFixture, 'no_access'),
        );
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenantFixture)
            .writeFolder(folder)
            .addGroup(group, 'view_only'),
        );

        t.assert(tenantMember)
          .has('access_tenant_dashboard_listing')
          .on(gallery);
        t.end();
      });

      t.end();
    },
  );

  t.end();
});
