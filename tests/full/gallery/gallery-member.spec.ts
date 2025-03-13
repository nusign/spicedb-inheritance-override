import { t } from '../../../pkg/tap';
import { Gallery, GalleryMember, Tenant, User } from '../_fixtures';

t.test('GalleryMember', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());
  const galleryOwner = t.relationship(new User());
  const galleryViewer = t.relationship(new User());
  const galleryMemberUser = t.relationship(new User());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  const gallery = t.relationship(
    new Gallery()
      .writeTenant(tenant)
      .setTenantAccess(tenant, 'view_only')
      .writeOwner(galleryOwner)
      .addGalleryMember(galleryViewer, 'view_only'),
  );

  const galleryMember = t.relationship(
    new GalleryMember().writeGallery(gallery).writeUser(galleryMemberUser),
  );

  t.assert(galleryMemberUser).has('retrieve').on(galleryMember);
  t.assert(galleryMemberUser).has('delete').on(galleryMember);

  t.assert(tenantOwner).has('list_gallery_members').on(gallery);
  t.assert(tenantOwner).has('retrieve').on(galleryMember);
  t.assert(tenantOwner).has('update').on(galleryMember);
  t.assert(tenantOwner).has('delete').on(galleryMember);

  t.assert(tenantAdmin).has('list_gallery_members').on(gallery);
  t.assert(tenantAdmin).has('retrieve').on(galleryMember);
  t.assert(tenantAdmin).has('update').on(galleryMember);
  t.assert(tenantAdmin).has('delete').on(galleryMember);

  t.assert(tenantMember).has('list_gallery_members').on(gallery);
  t.assert(tenantMember).has('retrieve').on(galleryMember);
  t.assert(tenantMember).not.has('update').on(galleryMember);
  t.assert(tenantMember).not.has('delete').on(galleryMember);

  t.assert(galleryOwner).has('list_gallery_members').on(gallery);
  t.assert(galleryOwner).has('retrieve').on(galleryMember);
  t.assert(galleryOwner).has('update').on(galleryMember);
  t.assert(galleryOwner).has('delete').on(galleryMember);

  t.assert(galleryViewer).has('list_gallery_members').on(gallery);
  t.assert(galleryViewer).has('retrieve').on(galleryMember);
  t.assert(galleryViewer).not.has('update').on(galleryMember);
  t.assert(galleryViewer).not.has('delete').on(galleryMember);

  t.end();
});
