import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';

export class Anonymous extends SpicedbDefinition {
  public readonly type = 'anonymous';
  public readonly id = randomUUID();
}
