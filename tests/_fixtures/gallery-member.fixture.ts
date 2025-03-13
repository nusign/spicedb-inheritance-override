import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Gallery } from './gallery.fixture';
import { User } from './user.fixture';

export class GalleryMember extends SpicedbDefinition {
  public readonly type = 'gallery_member';
  public readonly id = randomUUID();

  public writeGallery(gallery: Gallery): this {
    return this.write('gallery', gallery.asSubjectRef());
  }

  public writeUser(user: User): this {
    return this.write('user', user.asSubjectRef());
  }
}
