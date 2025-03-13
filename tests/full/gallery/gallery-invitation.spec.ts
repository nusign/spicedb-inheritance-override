import { t } from '../../../pkg/tap';
import {
  Anonymous,
  Gallery,
  GalleryInvitation,
  Guest,
  Tenant,
  User,
} from '../../_fixtures';

t.test('GalleryInvitation', (t) => {
  t.test('owner should have all permissions', (t) => {
    const galleryInvitationOwner = t.relationship(new User());
    const galleryInvitation = t.relationship(
      new GalleryInvitation().writeOwner(galleryInvitationOwner),
    );

    t.assert(galleryInvitationOwner).has('retrieve').on(galleryInvitation);
    t.assert(galleryInvitationOwner).has('delete').on(galleryInvitation);

    t.end();
  });

  t.test('tenant', (t) => {
    const tenantOwner = t.relationship(new User());
    const tenantAdmin = t.relationship(new User());
    const tenantMember = t.relationship(new User());

    const tenant = t.relationship(
      new Tenant()
        .write('owner', tenantOwner.asSubjectRef())
        .write('admin', tenantAdmin.asSubjectRef())
        .write('member', tenantMember.asSubjectRef()),
    );

    t.test('owner should have create and list permissions', (t) => {
      const gallery = t.relationship(new Gallery().writeTenant(tenant));

      t.assert(tenantOwner).has('create_gallery_invitation').on(gallery);
      t.assert(tenantOwner).has('list_gallery_invitations').on(gallery);

      t.end();
    });

    t.test('admin should have create and list permissions', (t) => {
      const gallery = t.relationship(new Gallery().writeTenant(tenant));

      t.assert(tenantAdmin).has('create_gallery_invitation').on(gallery);
      t.assert(tenantAdmin).has('list_gallery_invitations').on(gallery);

      t.end();
    });

    t.test('member should not have create and list permissions', (t) => {
      const gallery = t.relationship(new Gallery().writeTenant(tenant));

      t.assert(tenantMember).not.has('create_gallery_invitation').on(gallery);
      t.assert(tenantMember).not.has('list_gallery_invitations').on(gallery);

      t.end();
    });

    t.test(
      'member should have list permission if tenant access editor is enabled',
      (t) => {
        const gallery = t.relationship(
          new Gallery().writeTenant(tenant).setTenantAccess(tenant, 'edit'),
        );

        t.assert(tenantMember).has('list_gallery_invitations').on(gallery);
        t.assert(tenantMember).has('create_gallery_invitation').on(gallery);
        t.end();
      },
    );

    t.end();
  });

  t.test('public access', (t) => {
    const publicUser = t.relationship(new User());
    const guest = t.relationship(new Guest());
    const anonymous = t.relationship(new Anonymous());

    t.test('reviewer should provide any access to folde invitations', (t) => {
      const gallery = t.relationship(new Gallery().setPublicAccess('review'));

      t.assert(publicUser).not.has('list_gallery_invitations').on(gallery);
      t.assert(publicUser).not.has('create_gallery_invitation').on(gallery);

      t.assert(guest).not.has('list_gallery_invitations').on(gallery);
      t.assert(guest).not.has('create_gallery_invitation').on(gallery);

      t.assert(anonymous).not.has('list_gallery_invitations').on(gallery);
      t.assert(anonymous).not.has('create_gallery_invitation').on(gallery);

      t.end();
    });

    t.end();
  });

  t.test('folder membership', (t) => {
    const galleryViewer = t.relationship(new User());
    const galleryReviewer = t.relationship(new User());
    const galleryEditor = t.relationship(new User());

    const gallery = t.relationship(
      new Gallery()
        .addGalleryMember(galleryViewer, 'view_only')
        .addGalleryMember(galleryReviewer, 'review')
        .addGalleryMember(galleryEditor, 'edit'),
    );

    t.assert(galleryViewer).not.has('list_gallery_invitations').on(gallery);
    t.assert(galleryViewer).not.has('create_gallery_invitation').on(gallery);

    t.assert(galleryReviewer).not.has('list_gallery_invitations').on(gallery);
    t.assert(galleryReviewer).not.has('create_gallery_invitation').on(gallery);

    t.assert(galleryEditor).has('list_gallery_invitations').on(gallery);
    t.assert(galleryEditor).has('create_gallery_invitation').on(gallery);

    t.end();
  });

  t.end();
});
