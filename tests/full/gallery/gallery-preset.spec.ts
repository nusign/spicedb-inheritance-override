import { t } from '../../../pkg/tap';
import { User, Tenant, GalleryPreset } from '../_fixtures';

t.test('GalleryPreset', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());
  const publicUser = t.relationship(new User());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  const galleryPreset = t.relationship(new GalleryPreset().writeTenant(tenant));

  t.assert(tenantOwner).has('list_gallery_presets').on(tenant);
  t.assert(tenantOwner).has('create_gallery_preset').on(tenant);
  t.assert(tenantOwner).has('retrieve').on(galleryPreset);
  t.assert(tenantOwner).has('update').on(galleryPreset);
  t.assert(tenantOwner).has('delete').on(galleryPreset);

  t.assert(tenantAdmin).has('list_gallery_presets').on(tenant);
  t.assert(tenantAdmin).has('create_gallery_preset').on(tenant);
  t.assert(tenantAdmin).has('retrieve').on(galleryPreset);
  t.assert(tenantAdmin).has('update').on(galleryPreset);
  t.assert(tenantAdmin).has('delete').on(galleryPreset);

  t.assert(tenantMember).has('list_gallery_presets').on(tenant);
  t.assert(tenantMember).not.has('create_gallery_preset').on(tenant);
  t.assert(tenantMember).has('retrieve').on(galleryPreset);
  t.assert(tenantMember).not.has('update').on(galleryPreset);
  t.assert(tenantMember).not.has('delete').on(galleryPreset);

  t.assert(publicUser).not.has('list_gallery_presets').on(tenant);
  t.assert(publicUser).not.has('create_gallery_preset').on(tenant);
  t.assert(publicUser).not.has('retrieve').on(galleryPreset);
  t.assert(publicUser).not.has('update').on(galleryPreset);
  t.assert(publicUser).not.has('delete').on(galleryPreset);

  t.end();
});
