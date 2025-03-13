import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Tenant } from './tenant.fixture';

export class Tag extends SpicedbDefinition {
  public readonly type = 'tag';
  public readonly id = randomUUID();

  public writeTenant(tenant: Tenant): this {
    return this.write('tenant', tenant.asSubjectRef());
  }
}
