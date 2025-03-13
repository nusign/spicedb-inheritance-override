import { t } from '../../pkg/tap';
import { Anonymous, Folder, Document, Guest, Organization, User, Group } from './_fixtures';

t.test('Document', (t) => {
  const organizationOwner = t.relationship(new User());
  const organizationAdmin = t.relationship(new User());
  const organizationMember = t.relationship(new User());
  const folderViewer = t.relationship(new User());
  const folderEditor = t.relationship(new User());
  const publicUser = t.relationship(new User());
  const guest = t.relationship(new Guest());
  const anonymous = t.relationship(new Anonymous());

  const organization = t.relationship(
    new Organization()
      .write('owner', organizationOwner.asSubjectRef())
      .write('admin', organizationAdmin.asSubjectRef())
      .write('member', organizationMember.asSubjectRef()),
  );

  t.test('Top level gallery', (t) => {
    t.test('Document with tenant access no access', (t) => {
      const galleryFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'no_access'),
      );

      t.assert(organizationOwner).has('retrieve').on(galleryFixture);
      t.assert(organizationMember).not.has('retrieve').on(galleryFixture);
      t.end();
    });

    t.test('Document with tenant access view only', (t) => {
      const galleryFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'view_only'),
      );

      t.assert(organizationOwner).has('update').on(galleryFixture);
      t.assert(organizationMember).has('retrieve').on(galleryFixture);
      t.assert(organizationMember).not.has('update').on(galleryFixture);
      t.end();
    });

    t.test('Document with member', (t) => {
      const documentMember = t.relationship(new User());
      const document = t.relationship(
        new Document()
          .writeOrganization(organization)
          .addDirectMember(documentMember, 'edit'),
      );

      t.assert(documentMember).has('update').on(document);
      t.end();
    });

    t.test('Document with group', (t) => {
      const groupMember = t.relationship(new User());
      const group = t.relationship(new Group().writeUser(groupMember));
      const document = t.relationship(
        new Document().writeOrganization(organization).addGroup(group, 'edit'),
      );

      t.assert(groupMember).has('update').on(document);
      t.end();
    });

    t.end();
  });

  t.test('Document in folder', (t) => {
    t.test('should select the higher permission possible', (t) => {
      t.test('if gallery tenant and public access both view_only', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeOrganization(organization)
            .setOrganizationAccess(organization, 'view_only')
            .setPublicAccess('view_only'),
        );
        const document = t.relationship(new Document().writeFolder(folder));

        t.assert(organizationMember).has('retrieve').on(document);
        t.assert(publicUser).has('retrieve').on(document);

        t.end();
      });

      t.test('if gallery tenant access view_only', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeOrganization(organization)
            .setOrganizationAccess(organization, 'view_only')
            .setPublicAccess('view_only'),
        );
        const document = t.relationship(
          new Document()
            .writeFolder(folder)
            .setOrganizationAccess(organization, 'no_access'),
        );

        t.assert(organizationMember).has('retrieve').on(document);
        t.assert(publicUser).has('retrieve').on(document);
        t.end();
      });

      t.test('if gallery public access no_access', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeOrganization(organization)
            .setOrganizationAccess(organization, 'view_only')
            .setPublicAccess('view_only'),
        );
        const document = t.relationship(
          new Document().writeFolder(folder).setPublicAccess('no_access'),
        );

        t.assert(organizationMember).has('retrieve').on(document);
        t.assert(publicUser).not.has('retrieve').on(document);
        t.end();
      });

      t.test('if gallery tenant and public access edit', (t) => {
        const folder = t.relationship(
          new Folder()
            .writeOrganization(organization)
            .setOrganizationAccess(organization, 'view_only')
            .setPublicAccess('view_only'),
        );
        const document = t.relationship(
          new Document()
            .writeFolder(folder)
            .setOrganizationAccess(organization, 'no_access')
            .setPublicAccess('no_access'),
        );

        t.assert(organizationMember).not.has('retrieve').on(document);
        t.assert(publicUser).not.has('retrieve').on(document);

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
        .writeOrganization(organization)
        .setOrganizationAccess(organization, 'view_only')
        .setPublicAccess('view_only')
        .addDirectMember(folderViewer, 'view_only')
        .addDirectMember(folderEditor, 'edit')
        .addGroup(folderGroupViewer, 'view_only'),
    );

    const parentDocument = t.relationship(
      new Document()
        .writeOrganization(organization)
        .writeFolder(folderFixture)
        .addDirectMember(parentGalleryViewer, 'view_only')
        .addGroup(parentGalleryGroupViewer, 'view_only'),
    );

    t.test(
      'child gallery should inherit permissions of parent gallery and its parent folder',
      (t) => {
        const childGallery = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childGallery);
        t.assert(organizationMember).not.has('create_comment').on(childGallery);
        t.assert(organizationMember).not.has('update').on(childGallery);

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
      const childDocument = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'edit')
          .addParent(parentDocument),
      );

      t.assert(organizationMember).has('retrieve').on(childDocument);
      t.assert(organizationMember).has('create_comment').on(childDocument);
      t.assert(organizationMember).has('update').on(childDocument);

      t.assert(publicUser).has('retrieve').on(childDocument);
      t.assert(publicUser).not.has('create_comment').on(childDocument);
      t.assert(guest).has('retrieve').on(childDocument);
      t.assert(anonymous).has('retrieve').on(childDocument);

      t.assert(folderViewer).has('retrieve').on(childDocument);
      t.assert(folderViewer).not.has('update').on(childDocument);

      t.assert(folderEditor).has('update').on(childDocument);

      t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

      t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
      t.assert(parentGalleryViewer).not.has('update').on(childDocument);

      t.assert(parentGalleryGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(parentGalleryGroupViewerMember)
        .not.has('update')
        .on(childDocument);

      t.end();
    });

    t.test(
      'child gallery should not remove tenant access if public access is view_only remains on the folder level',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .setOrganizationAccess(organization, 'no_access')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('create_comment').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).has('retrieve').on(childDocument);
        t.assert(anonymous).has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should remove tenant access if public access is also no_access',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .setOrganizationAccess(organization, 'no_access')
            .setPublicAccess('no_access')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).not.has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).not.has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).not.has('retrieve').on(childDocument);
        t.assert(anonymous).not.has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test('child gallery should expand public access to reviewer', (t) => {
      const childDocument = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setPublicAccess('review')
          .addParent(parentDocument),
      );

      t.assert(organizationMember).has('retrieve').on(childDocument);
      t.assert(organizationMember).has('create_comment').on(childDocument);
      t.assert(organizationMember).not.has('update').on(childDocument);

      t.assert(publicUser).has('retrieve').on(childDocument);
      t.assert(publicUser).has('create_comment').on(childDocument);
      t.assert(guest).has('retrieve').on(childDocument);
      t.assert(anonymous).has('retrieve').on(childDocument);

      t.assert(folderViewer).has('retrieve').on(childDocument);
      t.assert(folderViewer).not.has('update').on(childDocument);

      t.assert(folderEditor).has('update').on(childDocument);

      t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

      t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
      t.assert(parentGalleryViewer).not.has('update').on(childDocument);

      t.assert(parentGalleryGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(parentGalleryGroupViewerMember)
        .not.has('update')
        .on(childDocument);

      t.end();
    });

    t.test('child gallery should remove public access', (t) => {
      const childDocument = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setPublicAccess('no_access')
          .addParent(parentDocument),
      );

      t.assert(organizationMember).has('retrieve').on(childDocument);
      t.assert(organizationMember).not.has('create_comment').on(childDocument);
      t.assert(organizationMember).not.has('update').on(childDocument);

      t.assert(publicUser).not.has('retrieve').on(childDocument);
      t.assert(publicUser).not.has('create_comment').on(childDocument);
      t.assert(guest).not.has('retrieve').on(childDocument);
      t.assert(anonymous).not.has('retrieve').on(childDocument);

      t.assert(folderViewer).has('retrieve').on(childDocument);
      t.assert(folderViewer).not.has('update').on(childDocument);

      t.assert(folderEditor).has('update').on(childDocument);

      t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

      t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
      t.assert(parentGalleryViewer).not.has('update').on(childDocument);

      t.assert(parentGalleryGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(parentGalleryGroupViewerMember)
        .not.has('update')
        .on(childDocument);

      t.end();
    });

    t.test(
      'child gallery should expand access for folder member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addDirectMember(folderViewer, 'edit')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).has('retrieve').on(childDocument);
        t.assert(anonymous).has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for folder member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addDirectMember(folderViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).not.has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).not.has('retrieve').on(childDocument);
        t.assert(anonymous).not.has('retrieve').on(childDocument);

        t.assert(folderViewer).not.has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should expand access for folder group member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addGroup(folderGroupViewer, 'edit')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).has('retrieve').on(childDocument);
        t.assert(anonymous).has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for folder group member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addGroup(folderGroupViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).not.has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).not.has('retrieve').on(childDocument);
        t.assert(anonymous).not.has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).not.has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should expand access for gallery member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addDirectMember(parentGalleryViewer, 'edit')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).has('retrieve').on(childDocument);
        t.assert(anonymous).has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for gallery member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addDirectMember(parentGalleryViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).not.has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).not.has('retrieve').on(childDocument);
        t.assert(anonymous).not.has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).not.has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should expand access for parent gallery group member',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addGroup(parentGalleryGroupViewer, 'edit')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).has('retrieve').on(childDocument);
        t.assert(anonymous).has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember).has('update').on(childDocument);

        t.end();
      },
    );

    t.test(
      'child gallery should remove access for parent gallery group member',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addGroup(parentGalleryGroupViewer, 'no_access')
            .setPublicAccess('no_access')
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childDocument);
        t.assert(organizationMember).not.has('update').on(childDocument);

        t.assert(publicUser).not.has('retrieve').on(childDocument);
        t.assert(publicUser).not.has('create_comment').on(childDocument);
        t.assert(guest).not.has('retrieve').on(childDocument);
        t.assert(anonymous).not.has('retrieve').on(childDocument);

        t.assert(folderViewer).has('retrieve').on(childDocument);
        t.assert(folderViewer).not.has('update').on(childDocument);

        t.assert(folderEditor).has('update').on(childDocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childDocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childDocument);

        t.assert(parentGalleryViewer).has('retrieve').on(childDocument);
        t.assert(parentGalleryViewer).not.has('update').on(childDocument);

        t.assert(parentGalleryGroupViewerMember)
          .not.has('retrieve')
          .on(childDocument);
        t.assert(parentGalleryGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.end();
  });

  t.test('Document with public access', (t) => {
    const galleryFixture = t.relationship(
      new Document().writeOrganization(organization).setPublicAccess('review'),
    );

    t.assert(publicUser).has('retrieve').on(galleryFixture);
    t.assert(publicUser).not.has('update').on(galleryFixture);

    t.end();
  });

  t.test('Document in public access folder', (t) => {
    const folderFixture = t.relationship(
      new Folder().writeOrganization(organization).setPublicAccess('view_only'),
    );

    t.test('Document should inherit folder public access', (t) => {
      const galleryFixture = t.relationship(
        new Document().writeOrganization(organization).writeFolder(folderFixture),
      );
      t.assert(publicUser).has('retrieve').on(galleryFixture);
      t.assert(publicUser).not.has('update').on(galleryFixture);
      t.assert(organizationMember).has('retrieve').on(galleryFixture);
      t.assert(organizationMember).not.has('update').on(galleryFixture);
      t.end();
    });

    t.test('Document should expand folder public access', (t) => {
      const galleryFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setPublicAccess('review')
          .writeFolder(folderFixture),
      );
      t.assert(publicUser).has('create_comment').on(galleryFixture);
      t.assert(publicUser).not.has('update').on(galleryFixture);
      t.assert(organizationMember).has('create_comment').on(galleryFixture);
      t.assert(organizationMember).not.has('update').on(galleryFixture);
      t.end();
    });

    t.test('Document should remove folder public access', (t) => {
      const galleryFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setPublicAccess('no_access')
          .writeFolder(folderFixture),
      );
      t.assert(publicUser).not.has('create_comment').on(galleryFixture);
      t.assert(organizationMember).not.has('create_comment').on(galleryFixture);
      t.end();
    });

    t.end();
  });

  t.test('Document with combined public and tenant access', (t) => {
    t.test(
      'Document with public access view_only and tenant access edit',
      (t) => {
        const galleryFixture = t.relationship(
          new Document()
            .writeOrganization(organization)
            .setPublicAccess('view_only')
            .setOrganizationAccess(organization, 'edit'),
        );

        t.assert(publicUser).has('retrieve').on(galleryFixture);
        t.assert(publicUser).not.has('update').on(galleryFixture);
        t.assert(organizationMember).has('retrieve').on(galleryFixture);
        t.assert(organizationMember).has('update').on(galleryFixture);
        t.end();
      },
    );

    t.test(
      'Document with public access view only and tenant access no_access',
      (t) => {
        const galleryFixture = t.relationship(
          new Document()
            .writeOrganization(organization)
            .setPublicAccess('view_only')
            .setOrganizationAccess(organization, 'no_access'),
        );

        t.assert(publicUser).has('retrieve').on(galleryFixture);
        t.assert(publicUser).not.has('update').on(galleryFixture);
        t.assert(organizationMember).has('retrieve').on(galleryFixture);
        t.assert(organizationMember).not.has('update').on(galleryFixture);
        t.end();
      },
    );

    t.end();
  });

  t.test('Document with tenant member as gallery member', (t) => {
    t.test('Tenant as gallery member access is not restricted', (t) => {
      const gallery = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'edit')
          .addDirectMember(organizationMember, 'no_access'),
      );

      t.assert(organizationMember).has('retrieve').on(gallery);
      t.end();
    });

    t.test('Tenant as gallery member access is expanded', (t) => {
      const gallery = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'view_only')
          .addDirectMember(organizationMember, 'edit'),
      );

      t.assert(organizationMember).has('update').on(gallery);
      t.end();
    });

    t.end();
  });

  t.test('Document in folder with tenant member as gallery member', (t) => {
    const folderFixture = t.relationship(
      new Folder()
        .writeOrganization(organization)
        .addDirectMember(organizationMember, 'edit'),
    );

    t.test(
      'remove tenant and public acces while folder member still has access',
      (t) => {
        const gallery = t.relationship(
          new Document()
            .writeOrganization(organization)
            .writeFolder(folderFixture)
            .setOrganizationAccess(organization, 'no_access')
            .setPublicAccess('no_access'),
        );

        t.assert(organizationMember).has('update').on(gallery);
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
        .writeOrganization(organization)
        .setOrganizationAccess(organization, 'edit')
        .setPublicAccess('view_only')
        .addDirectMember(topLevelFolderMember, 'edit')
        .addGroup(topLevelGalleryGroup, 'edit'),
    );
    const midLevelFolderFixture = t.relationship(
      new Folder()
        .writeOrganization(organization)
        .writeParent(topLevelFolderFixture),
    );

    t.test('basic access checks', (t) => {
      const folderFixture = t.relationship(
        new Folder()
          .writeOrganization(organization)
          .writeParent(midLevelFolderFixture),
      );
      const mainDocument = t.relationship(
        new Document().writeOrganization(organization).writeFolder(folderFixture),
      );
      const subDocument = t.relationship(
        new Document()
          .writeOrganization(organization)
          .addParent(mainDocument),
      );

      t.assert(topLevelFolderMember).has('update').on(subDocument);
      t.assert(organizationMember).has('update').on(subDocument);
      t.assert(publicUser).has('retrieve').on(subDocument);
      t.assert(publicUser).not.has('update').on(subDocument);
      t.assert(topLevelGalleryGroupMember).has('update').on(subDocument);
      t.end();
    });

    t.test('overriding public and tenant access on folder', (t) => {
      const folderFixture = t.relationship(
        new Folder()
          .writeOrganization(organization)
          .writeParent(midLevelFolderFixture)
          .setOrganizationAccess(organization, 'no_access')
          .setPublicAccess('no_access'),
      );
      const mainDocument = t.relationship(
        new Document().writeOrganization(organization).writeFolder(folderFixture),
      );
      const subDocument = t.relationship(
        new Document()
          .writeOrganization(organization)
          .addParent(mainDocument),
      );

      t.test('top level folder member, and group member keep access', (t) => {
        t.assert(topLevelFolderMember).has('update').on(subDocument);
        t.assert(topLevelGalleryGroupMember).has('update').on(subDocument);
        t.end();
      });

      t.test('tenant member and public user lose access', (t) => {
        t.assert(organizationMember).not.has('retrieve').on(subDocument);
        t.assert(publicUser).not.has('retrieve').on(subDocument);
        t.end();
      });

      t.end();
    });

    t.test('overriding all access on folder', (t) => {
      const folderFixture = t.relationship(
        new Folder()
          .writeOrganization(organization)
          .writeParent(midLevelFolderFixture)
          .setOrganizationAccess(organization, 'no_access')
          .setPublicAccess('no_access')
          .addDirectMember(topLevelFolderMember, 'no_access')
          .addGroup(topLevelGalleryGroup, 'no_access'),
      );
      const mainDocument = t.relationship(
        new Document().writeOrganization(organization).writeFolder(folderFixture),
      );
      const subDocument = t.relationship(
        new Document()
          .writeOrganization(organization)
          .addParent(mainDocument),
      );

      t.test('everyone loses access', (t) => {
        t.assert(organizationMember).not.has('retrieve').on(subDocument);
        t.assert(publicUser).not.has('retrieve').on(subDocument);
        t.assert(topLevelFolderMember).not.has('retrieve').on(subDocument);
        t.assert(topLevelGalleryGroupMember).not.has('retrieve').on(subDocument);
        t.end();
      });

      t.end();
    });
    t.end();
  });

  t.test('Tenant access must be downgraded to view_only', (t) => {
    const document = t.relationship(
      new Document()
        .writeOrganization(organization)
        .setOrganizationAccess(organization, 'edit'),
    );
    const childDocument = t.relationship(
      new Document()
        .writeOrganization(organization)
        .addParent(document)
        .setOrganizationAccess(organization, 'view_only'),
    );

    t.assert(organizationMember).has('retrieve').on(childDocument);
    t.assert(organizationMember).not.has('update').on(childDocument);

    t.end();
  });

  t.end();
});
