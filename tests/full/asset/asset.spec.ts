import { t } from '../../../pkg/tap';
import { Guest, Anonymous, Tenant } from '../_fixtures';
import { Asset } from '../_fixtures/asset.fixture';
import { Folder } from '../_fixtures/folder.fixture';
import { Gallery } from '../_fixtures/gallery.fixture';
import { User } from '../_fixtures/user.fixture';

t.test('Asset', (t) => {
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

  const galleryViewer = t.relationship(new User());
  const galleryReviewer = t.relationship(new User());
  const galleryEditor = t.relationship(new User());

  t.test('Gallery in folder', (t) => {
    const folderViewer = t.relationship(new User());
    const folderReviewer = t.relationship(new User());
    const folderEditor = t.relationship(new User());

    const folder = t.relationship(
      new Folder()
        .addFolderMember(folderViewer, 'view_only')
        .addFolderMember(folderReviewer, 'review')
        .addFolderMember(folderEditor, 'edit'),
    );

    const gallery = t.relationship(
      new Gallery()
        .writeTenant(tenant)
        .writeFolder(folder)
        .addGalleryMember(galleryViewer, 'view_only')
        .addGalleryMember(galleryReviewer, 'review')
        .addGalleryMember(galleryEditor, 'edit'),
    );

    const asset = t.relationship(new Asset().writeGallery(gallery));

    t.assert(tenantOwner).has('list_asset_versions').on(asset);
    t.assert(tenantOwner).has('update_review_asset_fields').on(asset);
    t.assert(tenantOwner).has('create_asset_version').on(asset);

    t.assert(tenantAdmin).has('list_asset_versions').on(asset);
    t.assert(tenantAdmin).has('update_review_asset_fields').on(asset);
    t.assert(tenantAdmin).has('create_asset_version').on(asset);

    t.assert(tenantMember).not.has('list_asset_versions').on(asset);
    t.assert(tenantMember).not.has('update_review_asset_fields').on(asset);
    t.assert(tenantMember).not.has('create_asset_version').on(asset);

    t.assert(folderViewer).has('list_asset_versions').on(asset);
    t.assert(folderViewer).not.has('update_review_asset_fields').on(asset);
    t.assert(folderViewer).not.has('create_asset_version').on(asset);

    t.assert(folderReviewer).has('list_asset_versions').on(asset);
    t.assert(folderReviewer).has('update_review_asset_fields').on(asset);
    t.assert(folderReviewer).not.has('create_asset_version').on(asset);

    t.assert(folderEditor).has('list_asset_versions').on(asset);
    t.assert(folderEditor).has('update_review_asset_fields').on(asset);
    t.assert(folderEditor).has('create_asset_version').on(asset);

    t.assert(galleryViewer).has('list_asset_versions').on(asset);
    t.assert(galleryViewer).not.has('update_review_asset_fields').on(asset);
    t.assert(galleryViewer).not.has('create_asset_version').on(asset);

    t.assert(galleryReviewer).has('list_asset_versions').on(asset);
    t.assert(galleryReviewer).has('update_review_asset_fields').on(asset);
    t.assert(galleryReviewer).not.has('create_asset_version').on(asset);

    t.assert(galleryEditor).has('list_asset_versions').on(asset);
    t.assert(galleryEditor).has('update_review_asset_fields').on(asset);
    t.assert(galleryEditor).has('create_asset_version').on(asset);

    t.end();
  });

  t.test('Gallery tenant access', (t) => {
    t.test('viewer', (t) => {
      const gallery = t.relationship(
        new Gallery().writeTenant(tenant).setTenantAccess(tenant, 'view_only'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));

      t.assert(tenantMember).has('list_asset_versions').on(asset);
      t.assert(tenantMember).not.has('update_review_asset_fields').on(asset);
      t.assert(tenantMember).not.has('create_asset_version').on(asset);

      t.end();
    });

    t.test('reviewer', (t) => {
      const gallery = t.relationship(
        new Gallery().writeTenant(tenant).setTenantAccess(tenant, 'review'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));

      t.assert(tenantMember).has('list_asset_versions').on(asset);
      t.assert(tenantMember).has('update_review_asset_fields').on(asset);
      t.assert(tenantMember).not.has('create_asset_version').on(asset);

      t.end();
    });

    t.test('editor', (t) => {
      const gallery = t.relationship(
        new Gallery().writeTenant(tenant).setTenantAccess(tenant, 'edit'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));

      t.assert(tenantMember).has('list_asset_versions').on(asset);
      t.assert(tenantMember).has('update_review_asset_fields').on(asset);
      t.assert(tenantMember).has('create_asset_version').on(asset);

      t.end();
    });

    t.end();
  });

  t.test('Gallery public access', (t) => {
    t.test('viewer', (t) => {
      const gallery = t.relationship(
        new Gallery().writeTenant(tenant).setPublicAccess('view_only'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));

      t.assert(publicUser).has('list_asset_versions').on(asset);
      t.assert(publicUser).not.has('update_review_asset_fields').on(asset);
      t.assert(publicUser).not.has('create_asset_version').on(asset);

      t.end();
    });

    t.test('reviewer', (t) => {
      const gallery = t.relationship(
        new Gallery().writeTenant(tenant).setPublicAccess('review'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));

      t.assert(publicUser).has('list_asset_versions').on(asset);
      t.assert(publicUser).has('update_review_asset_fields').on(asset);
      t.assert(publicUser).not.has('create_asset_version').on(asset);

      t.end();
    });

    t.end();
  });

  t.end();
});
