import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Gallery } from './gallery.fixture';

export class Asset extends SpicedbDefinition {
  public readonly type = 'asset';
  public readonly id = randomUUID();

  public writeGallery(gallery: Gallery) {
    return this.write('gallery', gallery.asSubjectRef());
  }
}
