import { t } from '../../../pkg/tap';
import { Referral, Tenant, User } from '../../_fixtures';

t.test('Referral', (t) => {
  const tenantOwner = t.relationship(new User());
  const tenantAdmin = t.relationship(new User());
  const tenantMember = t.relationship(new User());

  const tenant = t.relationship(
    new Tenant()
      .write('owner', tenantOwner.asSubjectRef())
      .write('admin', tenantAdmin.asSubjectRef())
      .write('member', tenantMember.asSubjectRef()),
  );

  const referral = t.relationship(new Referral().writeTenant(tenant));

  t.assert(tenantOwner).has('list_referrals').on(tenant);
  t.assert(tenantOwner).has('delete').on(referral);

  t.assert(tenantAdmin).has('list_referrals').on(tenant);
  t.assert(tenantAdmin).has('delete').on(referral);

  t.assert(tenantMember).not.has('list_referrals').on(tenant);
  t.assert(tenantMember).not.has('delete').on(referral);

  t.end();
});
