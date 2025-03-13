import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { Tenant } from './tenant.fixture';

export class GalleryPreset extends SpicedbDefinition {
  public readonly type = 'gallery_preset';
  public readonly id = randomUUID();

  public writeTenant(tenant: Tenant) {
    return this.write('tenant', tenant.asSubjectRef());
  }
}
