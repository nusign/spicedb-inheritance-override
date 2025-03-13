import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { Folder } from './folder.fixture';
import { User } from './user.fixture';

export class FolderInvitation extends SpicedbDefinition {
  public readonly type = 'folder_invitation';
  public readonly id = randomUUID();

  public writeOwner(owner: User) {
    return this.write('owner', owner.asSubjectRef());
  }

  public writeFolder(folder: Folder) {
    return this.write('folder', folder.asSubjectRef());
  }
}
