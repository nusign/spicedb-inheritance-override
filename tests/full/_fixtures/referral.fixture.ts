import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { Tenant } from './tenant.fixture';

export class Referral extends SpicedbDefinition {
  public readonly type = 'referral';
  public readonly id = randomUUID();

  public writeTenant(tenant: Tenant): this {
    return this.write('tenant', tenant.asSubjectRef());
  }
}
