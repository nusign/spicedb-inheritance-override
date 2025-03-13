import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';

export class User extends SpicedbDefinition {
  public readonly type = 'user';
  public readonly id = randomUUID();
}
