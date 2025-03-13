import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { Folder } from './folder.fixture';
import { User } from './user.fixture';

export class FolderMember extends SpicedbDefinition {
  public readonly type = 'folder_member';
  public readonly id = randomUUID();

  public writeFolder(folder: Folder): this {
    return this.write('folder', folder.asSubjectRef());
  }

  public writeUser(user: User): this {
    return this.write('user', user.asSubjectRef());
  }
}
