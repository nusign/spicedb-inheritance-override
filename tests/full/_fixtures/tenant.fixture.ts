import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { SpicedbSubjectRef } from '../../../pkg/tap/interfaces';

export class Tenant extends SpicedbDefinition {
  public readonly type = 'tenant';
  public readonly id = randomUUID();

  public writePublic() {
    this.write('public', {
      object: {
        type: 'user',
        id: '*',
      },
    });
    this.write('public', {
      object: {
        type: 'guest',
        id: '*',
      },
    });
    this.write('public', {
      object: {
        type: 'anonymous',
        id: '*',
      },
    });

    return this;
  }

  public writeAuthenticated() {
    this.write('authenticated', {
      object: {
        type: 'user',
        id: '*',
      },
    });
    this.write('authenticated', {
      object: {
        type: 'guest',
        id: '*',
      },
    });

    return this;
  }

  public asMemberSubjectRef(): SpicedbSubjectRef {
    return this.asSubjectRef('member');
  }
}
