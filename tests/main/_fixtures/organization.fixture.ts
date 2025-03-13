import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { SpicedbSubjectRef } from '../../../pkg/tap/interfaces';

export class Organization extends SpicedbDefinition {
  public readonly type = 'organization';
  public readonly id = randomUUID();

  public asMemberSubjectRef(): SpicedbSubjectRef {
    return this.asSubjectRef('member');
  }
}
