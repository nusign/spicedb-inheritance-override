import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';

export class Guest extends SpicedbDefinition {
  public readonly type = 'guest';
  public readonly id = randomUUID();
}
