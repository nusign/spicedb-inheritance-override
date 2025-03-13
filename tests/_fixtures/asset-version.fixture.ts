import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Asset } from './asset.fixture';
import { User } from './user.fixture';

export class AssetVersion extends SpicedbDefinition {
  public readonly type = 'asset_version';
  public readonly id = randomUUID();

  public writeAsset(asset: Asset) {
    return this.write('asset', asset.asSubjectRef());
  }

  public writeOwner(user: User) {
    return this.write('owner', user.asSubjectRef());
  }
}
