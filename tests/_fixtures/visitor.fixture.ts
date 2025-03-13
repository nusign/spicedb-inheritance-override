import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Tenant } from './tenant.fixture';

export class Visitor extends SpicedbDefinition {
  public readonly type = 'visitor';
  public readonly id = randomUUID();

  public writeTenant(tenant: Tenant): this {
    return this.write('tenant', tenant.asSubjectRef());
  }
}
