import { t } from '../../../pkg/tap';
import { Anonymous } from '../_fixtures/anonymous.fixture';
import { Guest } from '../_fixtures/guest.fixture';
import { Tenant } from '../_fixtures/tenant.fixture';
import { User } from '../_fixtures/user.fixture';

t.test('Tenant', (t) => {
  const userFixture = t.relationship(new User());
  const guestFixture = t.relationship(new Guest());
  const anonymousFixture = t.relationship(new Anonymous());

  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());

  const tenantFixture = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef())
      .writePublic()
      .writeAuthenticated(),
  );

  t.assert(userFixture).has('list_profile_folders').on(tenantFixture);
  t.assert(userFixture).has('list_profile_galleries').on(tenantFixture);
  t.assert(userFixture).not.has('retrieve').on(tenantFixture);
  t.assert(userFixture).not.has('update').on(tenantFixture);

  t.assert(guestFixture).has('list_profile_folders').on(tenantFixture);
  t.assert(guestFixture).has('list_profile_galleries').on(tenantFixture);
  t.assert(guestFixture).not.has('retrieve').on(tenantFixture);
  t.assert(guestFixture).not.has('update').on(tenantFixture);

  t.assert(anonymousFixture).has('list_profile_folders').on(tenantFixture);
  t.assert(anonymousFixture).has('list_profile_galleries').on(tenantFixture);
  t.assert(anonymousFixture).not.has('retrieve').on(tenantFixture);
  t.assert(anonymousFixture).not.has('update').on(tenantFixture);

  t.assert(tenantOwner).has('retrieve').on(tenantFixture);
  t.assert(tenantOwner).has('update').on(tenantFixture);
  t.assert(tenantOwner).has('update_all_tenant_fields').on(tenantFixture);
  t.assert(tenantOwner).has('overview').on(tenantFixture);
  t.assert(tenantOwner).has('list_folders').on(tenantFixture);
  t.assert(tenantOwner).has('create_folder').on(tenantFixture);
  t.assert(tenantOwner).has('list_galleries').on(tenantFixture);
  t.assert(tenantOwner).has('create_gallery').on(tenantFixture);
  t.assert(tenantOwner)
    .has('delete_non_default_asset_versions')
    .on(tenantFixture);
  t.assert(tenantOwner).has('administratorship').on(tenantFixture);

  t.assert(tenantAdmin).has('retrieve').on(tenantFixture);
  t.assert(tenantAdmin).has('update').on(tenantFixture);
  t.assert(tenantAdmin).has('update_all_tenant_fields').on(tenantFixture);
  t.assert(tenantAdmin).has('overview').on(tenantFixture);
  t.assert(tenantAdmin).has('list_folders').on(tenantFixture);
  t.assert(tenantAdmin).has('create_folder').on(tenantFixture);
  t.assert(tenantAdmin).has('list_galleries').on(tenantFixture);
  t.assert(tenantAdmin).has('create_gallery').on(tenantFixture);
  t.assert(tenantAdmin)
    .has('delete_non_default_asset_versions')
    .on(tenantFixture);
  t.assert(tenantAdmin).has('administratorship').on(tenantFixture);

  t.assert(tenantMember).has('retrieve').on(tenantFixture);
  t.assert(tenantMember).has('update').on(tenantFixture);
  t.assert(tenantMember).has('overview').on(tenantFixture);
  t.assert(tenantMember).has('list_folders').on(tenantFixture);
  t.assert(tenantMember).has('create_folder').on(tenantFixture);
  t.assert(tenantMember).has('list_galleries').on(tenantFixture);
  t.assert(tenantMember).has('create_gallery').on(tenantFixture);
  t.assert(tenantMember).not.has('update_all_tenant_fields').on(tenantFixture);
  t.assert(tenantMember)
    .not.has('delete_non_default_asset_versions')
    .on(tenantFixture);
  t.assert(tenantMember).not.has('administratorship').on(tenantFixture);

  t.test('Billing', (t) => {
    t.assert(tenantOwner).has('list_cards').on(tenantFixture);
    t.assert(tenantOwner).has('create_card').on(tenantFixture);
    t.assert(tenantOwner).has('delete_card').on(tenantFixture);
    t.assert(tenantOwner).has('retrieve_customer').on(tenantFixture);
    t.assert(tenantOwner).has('update_customer').on(tenantFixture);
    t.assert(tenantOwner).has('list_invoices').on(tenantFixture);
    t.assert(tenantOwner).has('retrieve_subscription').on(tenantFixture);
    t.assert(tenantOwner).has('create_subscription').on(tenantFixture);
    t.assert(tenantOwner).has('update_subscription').on(tenantFixture);
    t.assert(tenantOwner).has('delete_subscription').on(tenantFixture);

    t.assert(tenantAdmin).has('list_cards').on(tenantFixture);
    t.assert(tenantAdmin).has('create_card').on(tenantFixture);
    t.assert(tenantAdmin).has('delete_card').on(tenantFixture);
    t.assert(tenantAdmin).has('retrieve_customer').on(tenantFixture);
    t.assert(tenantAdmin).has('update_customer').on(tenantFixture);
    t.assert(tenantAdmin).has('list_invoices').on(tenantFixture);
    t.assert(tenantAdmin).has('retrieve_subscription').on(tenantFixture);
    t.assert(tenantAdmin).has('create_subscription').on(tenantFixture);
    t.assert(tenantAdmin).has('update_subscription').on(tenantFixture);
    t.assert(tenantAdmin).has('delete_subscription').on(tenantFixture);

    t.assert(tenantMember).not.has('list_cards').on(tenantFixture);
    t.assert(tenantMember).not.has('create_card').on(tenantFixture);
    t.assert(tenantMember).not.has('delete_card').on(tenantFixture);
    t.assert(tenantMember).has('retrieve_customer').on(tenantFixture);
    t.assert(tenantMember).not.has('update_customer').on(tenantFixture);
    t.assert(tenantMember).not.has('list_invoices').on(tenantFixture);
    t.assert(tenantMember).has('retrieve_subscription').on(tenantFixture);
    t.assert(tenantMember).not.has('create_subscription').on(tenantFixture);
    t.assert(tenantMember).not.has('update_subscription').on(tenantFixture);
    t.assert(tenantMember).not.has('delete_subscription').on(tenantFixture);

    t.end();
  });

  t.end();
});
