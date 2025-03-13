import { t } from '../../../pkg/tap';
import { Asset, Comment, Gallery } from '../_fixtures';
import { Tenant } from '../_fixtures/tenant.fixture';
import { User } from '../_fixtures/user.fixture';

t.test('Comment', (t) => {
  const tenantMember = t.relationship(new User());

  const publicUser = t.relationship(new User());

  const tenant = t.relationship(
    new Tenant().write('member', tenantMember.asSubjectRef()),
  );

  t.test('Gallery with tenant access', (t) => {
    t.test('view_only', (t) => {
      const gallery = t.relationship(
        new Gallery().setTenantAccess(tenant, 'view_only'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));
      const comment = t.relationship(
        new Comment().writeAsset(asset).writePublic(asset),
      );

      t.assert(tenantMember).has('retrieve').on(comment);
      t.assert(tenantMember).not.has('update').on(comment);
      t.assert(tenantMember).not.has('update_text').on(comment);
      t.assert(tenantMember).not.has('update_position').on(comment);
      t.assert(tenantMember).not.has('update_private').on(comment);
      t.assert(tenantMember).not.has('update_annotation').on(comment);
      t.assert(tenantMember).not.has('delete').on(comment);

      t.end();
    });

    t.test('reviewer', (t) => {
      const gallery = t.relationship(
        new Gallery().setTenantAccess(tenant, 'review'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));
      const comment = t.relationship(
        new Comment().writeAsset(asset).writePublic(asset),
      );

      t.assert(tenantMember).has('retrieve').on(comment);
      t.assert(tenantMember).has('update').on(comment);
      t.assert(tenantMember).not.has('update_text').on(comment);
      t.assert(tenantMember).not.has('update_position').on(comment);
      t.assert(tenantMember).not.has('update_private').on(comment);
      t.assert(tenantMember).not.has('update_annotation').on(comment);
      t.assert(tenantMember).not.has('delete').on(comment);

      t.end();
    });

    t.test('editor', (t) => {
      const gallery = t.relationship(
        new Gallery().setTenantAccess(tenant, 'edit'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));
      const comment = t.relationship(new Comment().writeAsset(asset));

      t.assert(tenantMember).has('retrieve').on(comment);
      t.assert(tenantMember).has('update').on(comment);
      t.assert(tenantMember).has('update_text').on(comment);
      t.assert(tenantMember).has('update_position').on(comment);
      t.assert(tenantMember).has('update_private').on(comment);
      t.assert(tenantMember).has('update_annotation').on(comment);
      t.assert(tenantMember).has('delete').on(comment);

      t.end();
    });
    t.end();
  });

  t.test('public access', (t) => {
    t.test('view_only', (t) => {
      const gallery = t.relationship(
        new Gallery().setPublicAccess('view_only'),
      );
      const asset = t.relationship(new Asset().writeGallery(gallery));

      t.test('public comment should be accessible', (t) => {
        const comment = t.relationship(
          new Comment().writeAsset(asset).writePublic(asset),
        );

        t.assert(publicUser).has('retrieve').on(comment);
        t.assert(publicUser).not.has('update').on(comment);
        t.assert(publicUser).not.has('update_text').on(comment);
        t.assert(publicUser).not.has('update_position').on(comment);
        t.assert(publicUser).not.has('update_private').on(comment);
        t.assert(publicUser).not.has('update_annotation').on(comment);
        t.assert(publicUser).not.has('delete').on(comment);

        t.end();
      });

      t.test('private comment should not be accessible', (t) => {
        const comment = t.relationship(new Comment().writeAsset(asset));

        t.assert(publicUser).not.has('retrieve').on(comment);
        t.assert(publicUser).not.has('update').on(comment);
        t.assert(publicUser).not.has('update_text').on(comment);
        t.assert(publicUser).not.has('update_position').on(comment);
        t.assert(publicUser).not.has('update_private').on(comment);
        t.assert(publicUser).not.has('update_annotation').on(comment);
        t.assert(publicUser).not.has('delete').on(comment);

        t.end();
      });

      t.end();
    });

    t.end();
  });

  t.end();
});
