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

  t.test('Top level document', (t) => {
    t.test('Document with organization access no access', (t) => {
      const documentFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'no_access'),
      );

      t.assert(organizationOwner).has('retrieve').on(documentFixture);
      t.assert(organizationMember).not.has('retrieve').on(documentFixture);
      t.end();
    });

    t.test('Document with organization access view only', (t) => {
      const documentFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'view_only'),
      );

      t.assert(organizationOwner).has('update').on(documentFixture);
      t.assert(organizationMember).has('retrieve').on(documentFixture);
      t.assert(organizationMember).not.has('update').on(documentFixture);
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
      t.test('if document organization and public access both view_only', (t) => {
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

      t.test('if document organization access view_only', (t) => {
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

      t.test('if document public access no_access', (t) => {
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

      t.test('if document organization and public access edit', (t) => {
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

  t.test('Child document with parent document in the folder', (t) => {
    const parentdocumentViewer = t.relationship(new User());
    const folderGroupViewerMember = t.relationship(new User());
    const parentdocumentGroupViewerMember = t.relationship(new User());

    const folderGroupViewer = t.relationship(
      new Group().writeUser(folderGroupViewerMember),
    );
    const parentdocumentGroupViewer = t.relationship(
      new Group().writeUser(parentdocumentGroupViewerMember),
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
        .addDirectMember(parentdocumentViewer, 'view_only')
        .addGroup(parentdocumentGroupViewer, 'view_only'),
    );

    t.test(
      'child document should inherit permissions of parent document and its parent folder',
      (t) => {
        const childdocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addParent(parentDocument),
        );

        t.assert(organizationMember).has('retrieve').on(childdocument);
        t.assert(organizationMember).not.has('create_comment').on(childdocument);
        t.assert(organizationMember).not.has('update').on(childdocument);

        t.assert(publicUser).has('retrieve').on(childdocument);
        t.assert(publicUser).not.has('create_comment').on(childdocument);
        t.assert(guest).has('retrieve').on(childdocument);
        t.assert(anonymous).has('retrieve').on(childdocument);

        t.assert(folderViewer).has('retrieve').on(childdocument);
        t.assert(folderViewer).not.has('update').on(childdocument);

        t.assert(folderEditor).has('update').on(childdocument);

        t.assert(folderGroupViewerMember).has('retrieve').on(childdocument);
        t.assert(folderGroupViewerMember).not.has('update').on(childdocument);

        t.assert(parentdocumentViewer).has('retrieve').on(childdocument);
        t.assert(parentdocumentViewer).not.has('update').on(childdocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childdocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childdocument);

        t.end();
      },
    );

    t.test('child document should expand organization access to editor', (t) => {
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

      t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
      t.assert(parentdocumentViewer).not.has('update').on(childDocument);

      t.assert(parentdocumentGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(parentdocumentGroupViewerMember)
        .not.has('update')
        .on(childDocument);

      t.end();
    });

    t.test(
      'child document should not remove organization access if public access is view_only remains on the folder level',
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should remove organization access if public access is also no_access',
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test('child document should expand public access to reviewer', (t) => {
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

      t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
      t.assert(parentdocumentViewer).not.has('update').on(childDocument);

      t.assert(parentdocumentGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(parentdocumentGroupViewerMember)
        .not.has('update')
        .on(childDocument);

      t.end();
    });

    t.test('child document should remove public access', (t) => {
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

      t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
      t.assert(parentdocumentViewer).not.has('update').on(childDocument);

      t.assert(parentdocumentGroupViewerMember).has('retrieve').on(childDocument);
      t.assert(parentdocumentGroupViewerMember)
        .not.has('update')
        .on(childDocument);

      t.end();
    });

    t.test(
      'child document should expand access for folder member viewer',
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should remove access for folder member viewer',
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should expand access for folder group member viewer',
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should remove access for folder group member viewer',
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should expand access for document member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addDirectMember(parentdocumentViewer, 'edit')
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should remove access for document member viewer',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addDirectMember(parentdocumentViewer, 'no_access')
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

        t.assert(parentdocumentViewer).not.has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should expand access for parent document group member',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addGroup(parentdocumentGroupViewer, 'edit')
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember).has('update').on(childDocument);

        t.end();
      },
    );

    t.test(
      'child document should remove access for parent document group member',
      (t) => {
        const childDocument = t.relationship(
          new Document()
            .writeOrganization(organization)
            .addGroup(parentdocumentGroupViewer, 'no_access')
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

        t.assert(parentdocumentViewer).has('retrieve').on(childDocument);
        t.assert(parentdocumentViewer).not.has('update').on(childDocument);

        t.assert(parentdocumentGroupViewerMember)
          .not.has('retrieve')
          .on(childDocument);
        t.assert(parentdocumentGroupViewerMember)
          .not.has('update')
          .on(childDocument);

        t.end();
      },
    );

    t.end();
  });

  t.test('Document with public access', (t) => {
    const documentFixture = t.relationship(
      new Document().writeOrganization(organization).setPublicAccess('review'),
    );

    t.assert(publicUser).has('retrieve').on(documentFixture);
    t.assert(publicUser).not.has('update').on(documentFixture);

    t.end();
  });

  t.test('Document in public access folder', (t) => {
    const folderFixture = t.relationship(
      new Folder().writeOrganization(organization).setPublicAccess('view_only'),
    );

    t.test('Document should inherit folder public access', (t) => {
      const documentFixture = t.relationship(
        new Document().writeOrganization(organization).writeFolder(folderFixture),
      );
      t.assert(publicUser).has('retrieve').on(documentFixture);
      t.assert(publicUser).not.has('update').on(documentFixture);
      t.assert(organizationMember).has('retrieve').on(documentFixture);
      t.assert(organizationMember).not.has('update').on(documentFixture);
      t.end();
    });

    t.test('Document should expand folder public access', (t) => {
      const documentFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setPublicAccess('review')
          .writeFolder(folderFixture),
      );
      t.assert(publicUser).has('create_comment').on(documentFixture);
      t.assert(publicUser).not.has('update').on(documentFixture);
      t.assert(organizationMember).has('create_comment').on(documentFixture);
      t.assert(organizationMember).not.has('update').on(documentFixture);
      t.end();
    });

    t.test('Document should remove folder public access', (t) => {
      const documentFixture = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setPublicAccess('no_access')
          .writeFolder(folderFixture),
      );
      t.assert(publicUser).not.has('create_comment').on(documentFixture);
      t.assert(organizationMember).not.has('create_comment').on(documentFixture);
      t.end();
    });

    t.end();
  });

  t.test('Document with combined public and organization access', (t) => {
    t.test(
      'Document with public access view_only and organization access edit',
      (t) => {
        const documentFixture = t.relationship(
          new Document()
            .writeOrganization(organization)
            .setPublicAccess('view_only')
            .setOrganizationAccess(organization, 'edit'),
        );

        t.assert(publicUser).has('retrieve').on(documentFixture);
        t.assert(publicUser).not.has('update').on(documentFixture);
        t.assert(organizationMember).has('retrieve').on(documentFixture);
        t.assert(organizationMember).has('update').on(documentFixture);
        t.end();
      },
    );

    t.test(
      'Document with public access view only and organization access no_access',
      (t) => {
        const documentFixture = t.relationship(
          new Document()
            .writeOrganization(organization)
            .setPublicAccess('view_only')
            .setOrganizationAccess(organization, 'no_access'),
        );

        t.assert(publicUser).has('retrieve').on(documentFixture);
        t.assert(publicUser).not.has('update').on(documentFixture);
        t.assert(organizationMember).has('retrieve').on(documentFixture);
        t.assert(organizationMember).not.has('update').on(documentFixture);
        t.end();
      },
    );

    t.end();
  });

  t.test('Document with organization member as document member', (t) => {
    t.test('organization as document member access is not restricted', (t) => {
      const document = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'edit')
          .addDirectMember(organizationMember, 'no_access'),
      );

      t.assert(organizationMember).has('retrieve').on(document);
      t.end();
    });

    t.test('organization as document member access is expanded', (t) => {
      const document = t.relationship(
        new Document()
          .writeOrganization(organization)
          .setOrganizationAccess(organization, 'view_only')
          .addDirectMember(organizationMember, 'edit'),
      );

      t.assert(organizationMember).has('update').on(document);
      t.end();
    });

    t.end();
  });

  t.test('Document in folder with organization member as document member', (t) => {
    const folderFixture = t.relationship(
      new Folder()
        .writeOrganization(organization)
        .addDirectMember(organizationMember, 'edit'),
    );

    t.test(
      'remove organization and public acces while folder member still has access',
      (t) => {
        const document = t.relationship(
          new Document()
            .writeOrganization(organization)
            .writeFolder(folderFixture)
            .setOrganizationAccess(organization, 'no_access')
            .setPublicAccess('no_access'),
        );

        t.assert(organizationMember).has('update').on(document);
        t.end();
      },
    );
    t.end();
  });

  t.test('Deep nesting with overrides', (t) => {
    const topLeveldocumentGroupMember = t.relationship(new User());
    const topLeveldocumentGroup = t.relationship(
      new Group().writeUser(topLeveldocumentGroupMember),
    );
    const topLevelFolderMember = t.relationship(new User());
    const topLevelFolderFixture = t.relationship(
      new Folder()
        .writeOrganization(organization)
        .setOrganizationAccess(organization, 'edit')
        .setPublicAccess('view_only')
        .addDirectMember(topLevelFolderMember, 'edit')
        .addGroup(topLeveldocumentGroup, 'edit'),
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
      t.assert(topLeveldocumentGroupMember).has('update').on(subDocument);
      t.end();
    });

    t.test('overriding public and organization access on folder', (t) => {
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
        t.assert(topLeveldocumentGroupMember).has('update').on(subDocument);
        t.end();
      });

      t.test('organization member and public user lose access', (t) => {
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
          .addGroup(topLeveldocumentGroup, 'no_access'),
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
        t.assert(topLeveldocumentGroupMember).not.has('retrieve').on(subDocument);
        t.end();
      });

      t.end();
    });
    t.end();
  });

  t.test('organization access must be downgraded to view_only', (t) => {
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
