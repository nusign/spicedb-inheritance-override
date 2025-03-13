import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { User } from './user.fixture';
import { Gallery } from './gallery.fixture';
import { Asset } from './asset.fixture';
import { Guest } from './guest.fixture';

export class Watcher extends SpicedbDefinition {
  public readonly type = 'watcher';
  public readonly id = randomUUID();

  public writeOwner(owner: User | Guest): this {
    return this.write('owner', owner.asSubjectRef());
  }

  public writeTarget(target: Gallery | Asset): this {
    return this.write('target', target.asSubjectRef());
  }
}
