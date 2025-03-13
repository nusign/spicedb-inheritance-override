import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { User } from './user.fixture';
import { Guest } from './guest.fixture';
import { Asset } from './asset.fixture';

export class Comment extends SpicedbDefinition {
  public readonly type = 'comment';
  public readonly id = randomUUID();

  public writeOwner(commenter: User | Guest) {
    return this.write('owner', commenter.asSubjectRef());
  }

  public writeAsset(asset: Asset) {
    return this.write('asset', asset.asSubjectRef());
  }

  public writePublic(asset: Asset) {
    return this.write('public', {
      object: asset.asObjectRef(),
      relation: 'retrieve_comment',
    });
  }
}
