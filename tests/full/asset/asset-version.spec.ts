import { faker } from '@faker-js/faker';
import { t } from '../../../pkg/tap';
import {
  Anonymous,
  Asset,
  AssetVersion,
  Folder,
  Gallery,
  Group,
  Guest,
  Tenant,
  User,
} from '../../_fixtures';

t.test('AssetVersion', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());

  const folderViewer = t.relationship(new User());
  const folderGroupViewerMember = t.relationship(new User());
  const galleryViewer = t.relationship(new User());
  const galleryGroupViewerMember = t.relationship(new User());

  const folderGroupViewer = t.relationship(
    new Group().writeUser(folderGroupViewerMember),
  );
  const galleryGroupViewer = t.relationship(
    new Group().writeUser(galleryGroupViewerMember),
  );

  const publicUser = t.relationship(new User());
  const guest = t.relationship(new Guest());
  const anonymous = t.relationship(new Anonymous());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  t.test('Parent foler', (t) => {
    const parentFolder = t.relationship(new Folder().writeTenant(tenant));
    const folder = t.relationship(new Folder().writeParent(parentFolder));
    const gallery = t.relationship(new Gallery().writeFolder(folder));
    const asset = t.relationship(new Asset().writeGallery(gallery));
    const assetVersion = t.relationship(new AssetVersion().writeAsset(asset));

    t.assert(tenantOwner).has('retrieve').on(assetVersion);
    t.assert(tenantOwner).has('update').on(assetVersion);
    t.assert(tenantOwner).has('delete').on(assetVersion);
    t.assert(tenantOwner).has('access_non_watermarked').on(assetVersion);

    t.assert(tenantAdmin).has('retrieve').on(assetVersion);
    t.assert(tenantAdmin).has('update').on(assetVersion);
    t.assert(tenantAdmin).has('delete').on(assetVersion);
    t.assert(tenantAdmin).has('access_non_watermarked').on(assetVersion);

    t.assert(tenantMember).not.has('retrieve').on(assetVersion);
    t.assert(tenantMember).not.has('update').on(assetVersion);
    t.assert(tenantMember).not.has('delete').on(assetVersion);
    t.assert(tenantMember).not.has('access_non_watermarked').on(assetVersion);

    t.end();
  });

  t.test('Folder', (t) => {
    const folder = t.relationship(new Folder().writeTenant(tenant));
    const gallery = t.relationship(new Gallery().writeFolder(folder));
    const asset = t.relationship(new Asset().writeGallery(gallery));
    const assetVersion = t.relationship(new AssetVersion().writeAsset(asset));

    t.assert(tenantOwner).has('retrieve').on(assetVersion);
    t.assert(tenantOwner).has('update').on(assetVersion);
    t.assert(tenantOwner).has('delete').on(assetVersion);
    t.assert(tenantOwner).has('access_non_watermarked').on(assetVersion);

    t.assert(tenantAdmin).has('retrieve').on(assetVersion);
    t.assert(tenantAdmin).has('update').on(assetVersion);
    t.assert(tenantAdmin).has('delete').on(assetVersion);
    t.assert(tenantAdmin).has('access_non_watermarked').on(assetVersion);

    t.assert(tenantMember).not.has('retrieve').on(assetVersion);
    t.assert(tenantMember).not.has('update').on(assetVersion);
    t.assert(tenantMember).not.has('delete').on(assetVersion);
    t.assert(tenantMember).not.has('access_non_watermarked').on(assetVersion);

    t.end();
  });

  t.test('Parent Gallery', (t) => {
    const parentGallery = t.relationship(new Gallery().writeTenant(tenant));
    const gallery = t.relationship(
      new Gallery().addParentGallery(t, parentGallery),
    );
    const asset = t.relationship(new Asset().writeGallery(gallery));
    const assetVersion = t.relationship(new AssetVersion().writeAsset(asset));

    t.assert(tenantOwner).has('retrieve').on(assetVersion);
    t.assert(tenantOwner).has('update').on(assetVersion);
    t.assert(tenantOwner).has('delete').on(assetVersion);
    t.assert(tenantOwner).has('access_non_watermarked').on(assetVersion);

    t.assert(tenantAdmin).has('retrieve').on(assetVersion);
    t.assert(tenantAdmin).has('update').on(assetVersion);
    t.assert(tenantAdmin).has('delete').on(assetVersion);
    t.assert(tenantAdmin).has('access_non_watermarked').on(assetVersion);

    t.assert(tenantMember).not.has('retrieve').on(assetVersion);
    t.assert(tenantMember).not.has('update').on(assetVersion);
    t.assert(tenantMember).not.has('delete').on(assetVersion);
    t.assert(tenantMember).not.has('access_non_watermarked').on(assetVersion);

    t.end();
  });

  t.test('Gallery', (t) => {
    t.test('tenant access', (t) => {
      t.test('viewer', (t) => {
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenant)
            .setTenantAccess(tenant, 'view_only'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(tenantOwner).has('retrieve').on(assetVersion);
        t.assert(tenantOwner).has('update').on(assetVersion);
        t.assert(tenantOwner).has('delete').on(assetVersion);
        t.assert(tenantOwner).has('access_non_watermarked').on(assetVersion);

        t.assert(tenantAdmin).has('retrieve').on(assetVersion);
        t.assert(tenantAdmin).has('update').on(assetVersion);
        t.assert(tenantAdmin).has('delete').on(assetVersion);
        t.assert(tenantAdmin).has('access_non_watermarked').on(assetVersion);

        t.assert(tenantMember).has('retrieve').on(assetVersion);
        t.assert(tenantMember).not.has('create_comment').on(asset);
        t.assert(tenantMember).not.has('update').on(assetVersion);
        t.assert(tenantMember).not.has('delete').on(assetVersion);
        t.assert(tenantMember)
          .not.has('access_non_watermarked')
          .on(assetVersion);

        t.test('public user should not have access', (t) => {
          t.assert(publicUser).not.has('retrieve').on(assetVersion);
          t.assert(guest).not.has('retrieve').on(assetVersion);
          t.assert(anonymous).not.has('retrieve').on(assetVersion);

          t.end();
        });
        t.end();
      });

      t.test('reviewer', (t) => {
        const gallery = t.relationship(
          new Gallery().writeTenant(tenant).setTenantAccess(tenant, 'review'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(tenantOwner).has('retrieve').on(assetVersion);
        t.assert(tenantOwner).has('update').on(assetVersion);
        t.assert(tenantOwner).has('delete').on(assetVersion);
        t.assert(tenantOwner).has('access_non_watermarked').on(assetVersion);

        t.assert(tenantAdmin).has('retrieve').on(assetVersion);
        t.assert(tenantAdmin).has('update').on(assetVersion);
        t.assert(tenantAdmin).has('delete').on(assetVersion);
        t.assert(tenantAdmin).has('access_non_watermarked').on(assetVersion);

        t.assert(tenantMember).has('retrieve').on(assetVersion);
        t.assert(tenantMember).has('create_comment').on(asset);
        t.assert(tenantMember).not.has('update').on(assetVersion);
        t.assert(tenantMember).not.has('delete').on(assetVersion);
        t.assert(tenantMember)
          .not.has('access_non_watermarked')
          .on(assetVersion);

        t.end();
      });

      t.test('editor', (t) => {
        const gallery = t.relationship(
          new Gallery().writeTenant(tenant).setTenantAccess(tenant, 'edit'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(tenantOwner).has('retrieve').on(assetVersion);
        t.assert(tenantOwner).has('update').on(assetVersion);
        t.assert(tenantOwner).has('delete').on(assetVersion);
        t.assert(tenantOwner).has('access_non_watermarked').on(assetVersion);

        t.assert(tenantAdmin).has('retrieve').on(assetVersion);
        t.assert(tenantAdmin).has('update').on(assetVersion);
        t.assert(tenantAdmin).has('delete').on(assetVersion);
        t.assert(tenantAdmin).has('access_non_watermarked').on(assetVersion);

        t.assert(tenantMember).has('retrieve').on(assetVersion);
        t.assert(tenantMember).has('create_comment').on(asset);
        t.assert(tenantMember).has('update').on(assetVersion);
        t.assert(tenantMember).has('delete').on(assetVersion);
        t.assert(tenantMember).has('access_non_watermarked').on(assetVersion);

        t.end();
      });

      t.end();
    });

    t.test('public access', (t) => {
      t.test('viewer', (t) => {
        const gallery = t.relationship(
          new Gallery().writeTenant(tenant).setPublicAccess('view_only'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(publicUser).has('retrieve').on(assetVersion);
        t.assert(publicUser).not.has('create_comment').on(asset);
        t.assert(publicUser).not.has('update').on(assetVersion);

        t.assert(guest).has('retrieve').on(assetVersion);
        t.assert(guest).not.has('create_comment').on(asset);
        t.assert(guest).not.has('update').on(assetVersion);

        t.assert(anonymous).has('retrieve').on(assetVersion);
        t.assert(anonymous).not.has('create_comment').on(asset);
        t.assert(anonymous).not.has('update').on(assetVersion);

        t.end();
      });

      t.test('reviewer', (t) => {
        const gallery = t.relationship(
          new Gallery().writeTenant(tenant).setPublicAccess('review'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(publicUser).has('retrieve').on(assetVersion);
        t.assert(publicUser).has('create_comment').on(asset);
        t.assert(publicUser).not.has('update').on(assetVersion);

        t.assert(guest).has('retrieve').on(assetVersion);
        t.assert(guest).has('create_comment').on(asset);
        t.assert(guest).not.has('update').on(assetVersion);

        t.assert(anonymous).has('retrieve').on(assetVersion);
        t.assert(anonymous).not.has('create_comment').on(asset);
        t.assert(anonymous).not.has('update').on(assetVersion);

        t.end();
      });

      t.end();
    });

    t.test('public password protected', (t) => {
      t.test('should not have access if password is incorrect', (t) => {
        const password = faker.internet.password();
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenant)
            .setPublicAccess('view_only', password),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(publicUser)
          .withCaveat({ password: faker.internet.password() })
          .not.has('retrieve')
          .on(assetVersion);

        t.assert(guest)
          .withCaveat({ password: faker.internet.password() })
          .not.has('retrieve')
          .on(assetVersion);

        t.assert(anonymous)
          .withCaveat({ password: faker.internet.password() })
          .not.has('retrieve')
          .on(assetVersion);

        t.end();
      });

      t.test('viewer', (t) => {
        const password = faker.internet.password();
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenant)
            .setPublicAccess('view_only', password),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(publicUser)
          .withCaveat({ password })
          .has('retrieve')
          .on(assetVersion);
        t.assert(publicUser)
          .withCaveat({ password })
          .not.has('create_comment')
          .on(asset);
        t.assert(publicUser)
          .withCaveat({ password })
          .not.has('update')
          .on(assetVersion);

        t.assert(guest)
          .withCaveat({ password })
          .has('retrieve')
          .on(assetVersion);
        t.assert(guest)
          .withCaveat({ password })
          .not.has('create_comment')
          .on(asset);
        t.assert(guest)
          .withCaveat({ password })
          .not.has('update')
          .on(assetVersion);

        t.assert(anonymous)
          .withCaveat({ password })
          .has('retrieve')
          .on(assetVersion);

        t.end();
      });

      t.test('reviewer', (t) => {
        const password = faker.internet.password();
        const gallery = t.relationship(
          new Gallery().writeTenant(tenant).setPublicAccess('review', password),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(publicUser)
          .withCaveat({ password })
          .has('retrieve')
          .on(assetVersion);
        t.assert(publicUser)
          .withCaveat({ password })
          .has('create_comment')
          .on(asset);
        t.assert(publicUser)
          .withCaveat({ password })
          .not.has('update')
          .on(assetVersion);

        t.assert(guest)
          .withCaveat({ password })
          .has('retrieve')
          .on(assetVersion);
        t.assert(guest)
          .withCaveat({ password })
          .has('create_comment')
          .on(asset);
        t.assert(guest)
          .withCaveat({ password })
          .not.has('update')
          .on(assetVersion);

        t.assert(anonymous)
          .withCaveat({ password })
          .has('retrieve')
          .on(assetVersion);
        t.assert(anonymous)
          .withCaveat({ password })
          .not.has('create_comment')
          .on(asset);
        t.assert(anonymous)
          .withCaveat({ password })
          .not.has('update')
          .on(assetVersion);

        t.end();
      });

      t.test(
        'tenant administratorship should have an access without password',
        (t) => {
          const password = faker.internet.password();
          const gallery = t.relationship(
            new Gallery()
              .writeTenant(tenant)
              .setPublicAccess('view_only', password),
          );
          const asset = t.relationship(new Asset().writeGallery(gallery));
          const assetVersion = t.relationship(
            new AssetVersion().writeAsset(asset),
          );

          t.assert(tenantOwner).has('retrieve').on(assetVersion);
          t.assert(tenantAdmin).has('retrieve').on(assetVersion);

          t.end();
        },
      );

      t.test('tenant member should have an access without password', (t) => {
        const password = faker.internet.password();
        const gallery = t.relationship(
          new Gallery()
            .writeTenant(tenant)
            .setTenantAccess(tenant, 'view_only')
            .setPublicAccess('view_only', password),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(tenantMember).has('retrieve').on(assetVersion);

        t.end();
      });

      t.test('gallery viewer should have an access without password', (t) => {
        const password = faker.internet.password();
        const gallery = t.relationship(
          new Gallery()
            .setPublicAccess('view_only', password)
            .addGalleryMember(galleryViewer, 'view_only'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(galleryViewer).has('retrieve').on(assetVersion);

        t.end();
      });

      t.test(
        'gallery group viewer should have an access without password',
        (t) => {
          const password = faker.internet.password();
          const gallery = t.relationship(
            new Gallery()
              .setPublicAccess('view_only', password)
              .addGroup(galleryGroupViewer, 'view_only'),
          );
          const asset = t.relationship(new Asset().writeGallery(gallery));
          const assetVersion = t.relationship(
            new AssetVersion().writeAsset(asset),
          );

          t.assert(galleryGroupViewerMember).has('retrieve').on(assetVersion);

          t.end();
        },
      );

      t.test('folder viewer should have an access without password', (t) => {
        const password = faker.internet.password();
        const folder = t.relationship(
          new Folder().addFolderMember(folderViewer, 'view_only'),
        );
        const gallery = t.relationship(
          new Gallery()
            .writeFolder(folder)
            .setPublicAccess('view_only', password),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(folderViewer).has('retrieve').on(assetVersion);

        t.end();
      });

      t.test(
        'folder group viewer should have an access without password',
        (t) => {
          const password = faker.internet.password();
          const folder = t.relationship(
            new Folder().addGroup(folderGroupViewer, 'view_only'),
          );
          const gallery = t.relationship(
            new Gallery()
              .writeFolder(folder)
              .setPublicAccess('view_only', password),
          );
          const asset = t.relationship(new Asset().writeGallery(gallery));
          const assetVersion = t.relationship(
            new AssetVersion().writeAsset(asset),
          );

          t.assert(folderGroupViewerMember).has('retrieve').on(assetVersion);

          t.end();
        },
      );

      t.end();
    });

    t.test('gallery member', (t) => {
      t.test('viewer', (t) => {
        const gallery = t.relationship(
          new Gallery().addGalleryMember(galleryViewer, 'view_only'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(galleryViewer).has('retrieve').on(assetVersion);
        t.assert(galleryViewer).not.has('create_comment').on(asset);
        t.assert(galleryViewer).not.has('update').on(assetVersion);
        t.assert(galleryViewer).not.has('delete').on(assetVersion);
        t.assert(galleryViewer)
          .not.has('access_non_watermarked')
          .on(assetVersion);

        t.end();
      });

      t.test('reviewer', (t) => {
        const gallery = t.relationship(
          new Gallery().addGalleryMember(galleryViewer, 'review'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(galleryViewer).has('retrieve').on(assetVersion);
        t.assert(galleryViewer).has('create_comment').on(asset);
        t.assert(galleryViewer).not.has('update').on(assetVersion);
        t.assert(galleryViewer).not.has('delete').on(assetVersion);
        t.assert(galleryViewer)
          .not.has('access_non_watermarked')
          .on(assetVersion);

        t.end();
      });

      t.test('editor', (t) => {
        const gallery = t.relationship(
          new Gallery().addGalleryMember(galleryViewer, 'edit'),
        );
        const asset = t.relationship(new Asset().writeGallery(gallery));
        const assetVersion = t.relationship(
          new AssetVersion().writeAsset(asset),
        );

        t.assert(galleryViewer).has('retrieve').on(assetVersion);
        t.assert(galleryViewer).has('create_comment').on(asset);
        t.assert(galleryViewer).has('update').on(assetVersion);
        t.assert(galleryViewer).has('delete').on(assetVersion);
        t.assert(galleryViewer).has('access_non_watermarked').on(assetVersion);

        t.end();
      });

      t.end();
    });

    t.end();
  });

  t.end();
});
