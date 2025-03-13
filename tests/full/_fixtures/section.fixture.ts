import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { Gallery } from './gallery.fixture';

export class Section extends SpicedbDefinition {
  public readonly type = 'section';
  public readonly id = randomUUID();

  public writeGallery(gallery: Gallery): this {
    return this.write('gallery', gallery.asSubjectRef());
  }
}
