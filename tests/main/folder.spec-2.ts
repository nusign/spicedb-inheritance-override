import { t } from '../../pkg/tap';
import { Folder, Group, Organization, User } from './_fixtures';

t.test('Folder', (t) => {
  const organizationOwner = t.relationship(new User());
  const organizationAdmin = t.relationship(new User());
  const organizationMember = t.relationship(new User());

  const groupViewerMember = t.relationship(new User());
  const groupReviewerMember = t.relationship(new User());
  const groupEditorMember = t.relationship(new User());

  const groupViewer = t.relationship(new Group().writeUser(groupViewerMember));
  const groupReviewer = t.relationship(
    new Group().writeUser(groupReviewerMember),
  );
  const groupEditor = t.relationship(new Group().writeUser(groupEditorMember));

  const organization = t.relationship(
    new Organization()
      .write('owner', organizationOwner.asSubjectRef())
      .write('admin', organizationAdmin.asSubjectRef())
      .write('member', organizationMember.asSubjectRef()),
  );

  t.test('Folder', (t) => {
    const folderViewer = t.relationship(new User());
    const folderReviewer = t.relationship(new User());
    const folderEditor = t.relationship(new User());

    const folder = t.relationship(
      new Folder()
        .writeOrganization(organization)
        .addDirectMember(folderViewer, 'view_only')
        .addDirectMember(folderReviewer, 'review')
        .addDirectMember(folderEditor, 'edit')
        .addGroup(groupViewer, 'view_only')
        .addGroup(groupReviewer, 'review')
        .addGroup(groupEditor, 'edit'),
    );

    t.assert(organizationOwner).has('retrieve').on(folder);
    t.assert(organizationOwner).has('update').on(folder);
    t.assert(organizationOwner).has('delete').on(folder);
    t.assert(organizationOwner).has('list_folders').on(folder);
    t.assert(organizationOwner).has('create_folder').on(folder);
    t.assert(organizationOwner).has('list_documents').on(folder);
    t.assert(organizationOwner).has('create_document').on(folder);
 
    t.assert(organizationAdmin).has('retrieve').on(folder);
    t.assert(organizationAdmin).has('update').on(folder);
    t.assert(organizationAdmin).has('delete').on(folder);
    t.assert(organizationAdmin).has('list_folders').on(folder);
    t.assert(organizationAdmin).has('create_folder').on(folder);
    t.assert(organizationAdmin).has('list_documents').on(folder);
    t.assert(organizationAdmin).has('create_document').on(folder);

    t.assert(organizationMember).not.has('retrieve').on(folder);
    t.assert(organizationMember).not.has('update').on(folder);
    t.assert(organizationMember).not.has('delete').on(folder);
    t.assert(organizationMember).not.has('list_folders').on(folder);
    t.assert(organizationMember).not.has('create_folder').on(folder);
    t.assert(organizationMember).not.has('list_documents').on(folder);
    t.assert(organizationMember).not.has('create_document').on(folder);

    t.assert(folderViewer).has('retrieve').on(folder);
    t.assert(folderViewer).not.has('update').on(folder);
    t.assert(folderViewer).not.has('delete').on(folder);
    t.assert(folderViewer).has('list_folders').on(folder);
    t.assert(folderViewer).not.has('create_folder').on(folder);
    t.assert(folderViewer).has('list_documents').on(folder);
    t.assert(folderViewer).not.has('create_document').on(folder);

    t.assert(folderReviewer).has('retrieve').on(folder);
    t.assert(folderReviewer).not.has('update').on(folder);
    t.assert(folderReviewer).not.has('delete').on(folder);
    t.assert(folderReviewer).has('list_folders').on(folder);
    t.assert(folderReviewer).not.has('create_folder').on(folder);
    t.assert(folderReviewer).has('list_documents').on(folder);
    t.assert(folderReviewer).not.has('create_document').on(folder);

    t.assert(folderEditor).has('retrieve').on(folder);
    t.assert(folderEditor).has('update').on(folder);
    t.assert(folderEditor).has('delete').on(folder);
    t.assert(folderEditor).has('list_folders').on(folder);
    t.assert(folderEditor).has('create_folder').on(folder);
    t.assert(folderEditor).has('list_documents').on(folder);
    t.assert(folderEditor).has('create_document').on(folder);

    t.assert(groupViewerMember).has('retrieve').on(folder);
    t.assert(groupViewerMember).not.has('update').on(folder);
    t.assert(groupViewerMember).not.has('delete').on(folder);
    t.assert(groupViewerMember).has('list_folders').on(folder);
    t.assert(groupViewerMember).not.has('create_folder').on(folder);
    t.assert(groupViewerMember).has('list_documents').on(folder);
    t.assert(groupViewerMember).not.has('create_document').on(folder);

    t.assert(groupReviewerMember).has('retrieve').on(folder);
    t.assert(groupReviewerMember).not.has('update').on(folder);
    t.assert(groupReviewerMember).not.has('delete').on(folder);
    t.assert(groupReviewerMember).has('list_folders').on(folder);
    t.assert(groupReviewerMember).not.has('create_folder').on(folder);
    t.assert(groupReviewerMember).has('list_documents').on(folder);
    t.assert(groupReviewerMember).not.has('create_document').on(folder);

    t.assert(groupEditorMember).has('retrieve').on(folder);
    t.assert(groupEditorMember).has('update').on(folder);
    t.assert(groupEditorMember).has('delete').on(folder);
    t.assert(groupEditorMember).has('list_folders').on(folder);
    t.assert(groupEditorMember).has('create_folder').on(folder);
    t.assert(groupEditorMember).has('list_documents').on(folder);
    t.assert(groupEditorMember).has('create_document').on(folder);

    t.test(
      'Child folder should inherit permissions from parent folder',
      (t) => {
        const childFolder = t.relationship(new Folder().writeParent(folder));

        t.assert(organizationOwner).has('retrieve').on(childFolder);
        t.assert(organizationOwner).has('update').on(childFolder);
        t.assert(organizationOwner).has('delete').on(childFolder);
        t.assert(organizationOwner).has('list_folders').on(childFolder);
        t.assert(organizationOwner).has('create_folder').on(childFolder);
        t.assert(organizationOwner).has("list_documents").on(childFolder);
        t.assert(organizationOwner).has('create_document').on(childFolder);

        t.assert(organizationAdmin).has('retrieve').on(childFolder);
        t.assert(organizationAdmin).has('update').on(childFolder);
        t.assert(organizationAdmin).has('delete').on(childFolder);
        t.assert(organizationAdmin).has('list_folders').on(childFolder);
        t.assert(organizationAdmin).has('create_folder').on(childFolder);
        t.assert(organizationAdmin).has('list_documents').on(childFolder);
        t.assert(organizationAdmin).has('create_document').on(childFolder);

        t.assert(organizationMember).not.has('retrieve').on(childFolder);
        t.assert(organizationMember).not.has('update').on(childFolder);
        t.assert(organizationMember).not.has('delete').on(childFolder);
        t.assert(organizationMember).not.has('list_folders').on(childFolder);
        t.assert(organizationMember).not.has('create_folder').on(childFolder);
        t.assert(organizationMember).not.has('list_documents').on(childFolder);
        t.assert(organizationMember).not.has('create_document').on(childFolder);

        t.assert(folderViewer).has('retrieve').on(childFolder);
        t.assert(folderViewer).not.has('update').on(childFolder);
        t.assert(folderViewer).not.has('delete').on(childFolder);
        t.assert(folderViewer).has('list_folders').on(childFolder);
        t.assert(folderViewer).not.has('create_folder').on(childFolder);
        t.assert(folderViewer).has('list_documents').on(childFolder);
        t.assert(folderViewer).not.has('create_document').on(childFolder);

        t.assert(folderReviewer).has('retrieve').on(childFolder);
        t.assert(folderReviewer).not.has('update').on(childFolder);
        t.assert(folderReviewer).not.has('delete').on(childFolder);
        t.assert(folderReviewer).has('list_folders').on(childFolder);
        t.assert(folderReviewer).not.has('create_folder').on(childFolder);
        t.assert(folderReviewer).has('list_documents').on(childFolder);
        t.assert(folderReviewer).not.has('create_document').on(childFolder);

        t.assert(folderEditor).has('retrieve').on(childFolder);
        t.assert(folderEditor).has('update').on(childFolder);
        t.assert(folderEditor).has('delete').on(childFolder);
        t.assert(folderEditor).has('list_folders').on(childFolder);
        t.assert(folderEditor).has('create_folder').on(childFolder);
        t.assert(folderEditor).has('list_documents').on(childFolder);
        t.assert(folderEditor).has('create_document').on(childFolder);

        t.assert(groupViewerMember).has('retrieve').on(childFolder);
        t.assert(groupViewerMember).not.has('update').on(childFolder);
        t.assert(groupViewerMember).not.has('delete').on(childFolder);
        t.assert(groupViewerMember).has('list_folders').on(childFolder);
        t.assert(groupViewerMember).not.has('create_folder').on(childFolder);
        t.assert(groupViewerMember).has('list_documents').on(childFolder);
        t.assert(groupViewerMember).not.has('create_document').on(childFolder);

        t.assert(groupReviewerMember).has('retrieve').on(childFolder);
        t.assert(groupReviewerMember).not.has('update').on(childFolder);
        t.assert(groupReviewerMember).not.has('delete').on(childFolder);
        t.assert(groupReviewerMember).has('list_folders').on(childFolder);
        t.assert(groupReviewerMember).not.has('create_folder').on(childFolder);
        t.assert(groupReviewerMember).has('list_documents').on(childFolder);
        t.assert(groupReviewerMember).not.has('create_document').on(childFolder);

        t.assert(groupEditorMember).has('retrieve').on(childFolder);
        t.assert(groupEditorMember).has('update').on(childFolder);
        t.assert(groupEditorMember).has('delete').on(childFolder);
        t.assert(groupEditorMember).has('list_folders').on(childFolder);
        t.assert(groupEditorMember).has('create_folder').on(childFolder);
        t.assert(groupEditorMember).has('list_documents').on(childFolder);
        t.assert(groupEditorMember).has('create_document').on(childFolder);

        t.end();
      },
    );

    t.end();
  });

  t.test('Folder organization access', (t) => {
    t.test('viewer', (t) => {
      const folder = t.relationship(
        new Folder().writeOrganization(organization).setOrganizationAccess(organization, 'view_only'),
      );

      t.assert(organizationMember).has('retrieve').on(folder);
      t.assert(organizationMember).not.has('update').on(folder);
      t.assert(organizationMember).not.has('delete').on(folder);
      t.assert(organizationMember).has('list_folders').on(folder);
      t.assert(organizationMember).not.has('create_folder').on(folder);
      t.assert(organizationMember).has('list_documents').on(folder);
      t.assert(organizationMember).not.has('create_document').on(folder);

      t.end();
    });

    t.test('reviewer', (t) => {
      const folder = t.relationship(
        new Folder().writeOrganization(organization).setOrganizationAccess(organization, 'review'),
      );

      t.assert(organizationMember).has('retrieve').on(folder);
      t.assert(organizationMember).not.has('update').on(folder);
      t.assert(organizationMember).not.has('delete').on(folder);
      t.assert(organizationMember).has('list_folders').on(folder);
      t.assert(organizationMember).not.has('create_folder').on(folder);
      t.assert(organizationMember).has('list_documents').on(folder);
      t.assert(organizationMember).not.has('create_document').on(folder);

      t.end();
    });

    t.test('editor', (t) => {
      const folder = t.relationship(
        new Folder().writeOrganization(organization).setOrganizationAccess(organization, 'edit'),
      );

      t.assert(organizationMember).has('retrieve').on(folder);
      t.assert(organizationMember).has('update').on(folder);
      t.assert(organizationMember).has('delete').on(folder);
      t.assert(organizationMember).has('list_folders').on(folder);
      t.assert(organizationMember).has('create_folder').on(folder);
      t.assert(organizationMember).has('list_documents').on(folder);
      t.assert(organizationMember).has('create_document').on(folder);

      t.end();
    });

    t.end();
  });

  t.test('Folder public access', (t) => {
    t.test('viewer', (t) => {
      const folder = t.relationship(
        new Folder().writeOrganization(organization).setPublicAccess('view_only'),
      );

      t.assert(organizationMember).has('retrieve').on(folder);
      t.assert(organizationMember).not.has('update').on(folder);
      t.assert(organizationMember).not.has('delete').on(folder);
      t.assert(organizationMember).has('list_folders').on(folder);
      t.assert(organizationMember).not.has('create_folder').on(folder);
      t.assert(organizationMember).has('list_documents').on(folder);
      t.assert(organizationMember).not.has('create_document').on(folder);

      t.end();
    });

    t.test('reviewer', (t) => {
      const folder = t.relationship(
        new Folder().writeOrganization(organization).setPublicAccess('review'),
      );

      t.assert(organizationMember).has('retrieve').on(folder);
      t.assert(organizationMember).not.has('update').on(folder);
      t.assert(organizationMember).not.has('delete').on(folder);
      t.assert(organizationMember).has('list_folders').on(folder);
      t.assert(organizationMember).not.has('create_folder').on(folder);
      t.assert(organizationMember).has('list_documents').on(folder);
      t.assert(organizationMember).not.has('create_document').on(folder);

      t.end();
    });

    t.end();
  });

  t.end();
});
