import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Gallery } from './gallery.fixture';
import { User } from './user.fixture';

export class GalleryInvitation extends SpicedbDefinition {
  public readonly type = 'gallery_invitation';
  public readonly id = randomUUID();

  public writeOwner(owner: User) {
    return this.write('owner', owner.asSubjectRef());
  }

  public writeGallery(gallery: Gallery) {
    return this.write('gallery', gallery.asSubjectRef());
  }
}
