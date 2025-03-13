import { t } from '../../../pkg/tap';
import { Anonymous, Guest, Tenant, User, Watermark } from '../../_fixtures';

t.test('Watermark', (t) => {
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
  const watermark = t.relationship(new Watermark().writeTenant(tenant));

  t.assert(tenantOwner).has('list_watermarks').on(tenant);
  t.assert(tenantOwner).has('create_watermark').on(tenant);
  t.assert(tenantOwner).has('retrieve').on(watermark);
  t.assert(tenantOwner).has('update').on(watermark);
  t.assert(tenantOwner).has('delete').on(watermark);

  t.assert(tenantAdmin).has('list_watermarks').on(tenant);
  t.assert(tenantAdmin).has('create_watermark').on(tenant);
  t.assert(tenantAdmin).has('retrieve').on(watermark);
  t.assert(tenantAdmin).has('update').on(watermark);
  t.assert(tenantAdmin).has('delete').on(watermark);

  t.assert(tenantMember).has('list_watermarks').on(tenant);
  t.assert(tenantMember).has('create_watermark').on(tenant);
  t.assert(tenantMember).has('retrieve').on(watermark);
  t.assert(tenantMember).has('update').on(watermark);
  t.assert(tenantMember).has('delete').on(watermark);

  t.assert(publicUser).not.has('list_watermarks').on(tenant);
  t.assert(publicUser).not.has('create_watermark').on(tenant);
  t.assert(publicUser).not.has('retrieve').on(watermark);
  t.assert(publicUser).not.has('update').on(watermark);
  t.assert(publicUser).not.has('delete').on(watermark);

  t.assert(guest).not.has('list_watermarks').on(tenant);
  t.assert(guest).not.has('create_watermark').on(tenant);
  t.assert(guest).not.has('retrieve').on(watermark);
  t.assert(guest).not.has('update').on(watermark);
  t.assert(guest).not.has('delete').on(watermark);

  t.assert(anonymous).not.has('list_watermarks').on(tenant);
  t.assert(anonymous).not.has('create_watermark').on(tenant);
  t.assert(anonymous).not.has('retrieve').on(watermark);
  t.assert(anonymous).not.has('update').on(watermark);
  t.assert(anonymous).not.has('delete').on(watermark);

  t.end();
});
