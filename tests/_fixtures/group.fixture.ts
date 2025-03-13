import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { SpicedbSubjectRef } from '../../pkg/tap/interfaces';
import { Tenant } from './tenant.fixture';
import { User } from './user.fixture';

export class Group extends SpicedbDefinition {
  public readonly type = 'group';
  public readonly id = randomUUID();

  public writeTenant(tenant: Tenant): this {
    return this.write('tenant', tenant.asSubjectRef());
  }

  public writeUser(user: User): this {
    return this.write('user', user.asSubjectRef());
  }

  public asMembershipSubjectRef(): SpicedbSubjectRef {
    return this.asSubjectRef('membership');
  }
}
