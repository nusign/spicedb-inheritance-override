import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { SpicedbSubjectRef } from '../../../pkg/tap/interfaces';
import { Organization } from './organization.fixture';
import { User } from './user.fixture';

export class Group extends SpicedbDefinition {
  public readonly type = 'group';
  public readonly id = randomUUID();

  public writeOrganization(organization: Organization): this {
    return this.write('organization', organization.asSubjectRef());
  }

  public writeUser(user: User): this {
    return this.write('user', user.asSubjectRef());
  }

  public asMembershipSubjectRef(): SpicedbSubjectRef {
    return this.asSubjectRef('membership');
  }
}
