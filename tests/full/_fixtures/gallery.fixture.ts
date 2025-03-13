import { randomUUID } from 'crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { AccessLevel, PublicAccessLevel, accessLevelToRelation } from './utils';
import { Tenant } from './tenant.fixture';
import { Folder } from './folder.fixture';
import { Section } from './section.fixture';
import { User } from './user.fixture';
import { Group } from './group.fixture';
import { TestBuilder } from '../../../pkg/tap/test-builder';

export class Gallery extends SpicedbDefinition {
  public readonly type = 'gallery';
  public readonly id = randomUUID();

  public writeAuthenticated(): this {
    this.write('authenticated', {
      object: {
        type: 'user',
        id: '*',
      },
    });
    this.write('authenticated', {
      object: {
        type: 'guest',
        id: '*',
      },
    });
    return this;
  }

  public writeTenant(tenant: Tenant): this {
    return this.write('tenant', tenant.asSubjectRef());
  }

  public writeFolder(folder: Folder): this {
    return this.write('folder', folder.asSubjectRef());
  }

  public writeSection(section: Section): this {
    return this.write('section', section.asSubjectRef());
  }

  public writeOwner(owner: User): this {
    return this.write('owner', owner.asSubjectRef());
  }

  /*
   * Since gallery doesn't have a direct connection to parent gallery, we have to create section first and connect with parent gallery
   */
  public addParentGallery(t: TestBuilder, parent: Gallery): this {
    const section = t.relationship(new Section().writeGallery(parent));
    return this.write('section', section.asSubjectRef());
  }

  public addGalleryMember(member: User, access: AccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`gallery_${relation}`, member.asSubjectRef());
    }

    return this.write(
      'direct_member_inheritance_disabled',
      member.asSubjectRef(),
    );
  }

  public addGroup(group: Group, access: AccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`group_${relation}`, group.asMembershipSubjectRef());
    }

    return this.write(
      'group_inheritance_disabled',
      group.asMembershipSubjectRef(),
    );
  }

  public setTenantAccess(tenant: Tenant, access: AccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`tenant_${relation}`, tenant.asMemberSubjectRef());
    }

    return this.write(
      'tenant_inheritance_disabled',
      tenant.asMemberSubjectRef(),
    );
  }

  public setPublicAccess(access: PublicAccessLevel, password?: string): this {
    const caveat = password
      ? { name: 'password_protected', value: { current_password: password } }
      : undefined;
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(
        `public_${relation}`,
        {
          object: {
            type: 'user',
            id: '*',
          },
        },
        caveat,
      );
      this.write(
        `public_${relation}`,
        {
          object: {
            type: 'guest',
            id: '*',
          },
        },
        caveat,
      );
      this.write(
        'public_viewer',
        {
          object: {
            type: 'anonymous',
            id: '*',
          },
        },
        caveat,
      );
    }

    this.write('public_inheritance_disabled', {
      object: {
        type: 'user',
        id: '*',
      },
    });
    this.write('public_inheritance_disabled', {
      object: {
        type: 'guest',
        id: '*',
      },
    });
    this.write('public_inheritance_disabled', {
      object: {
        type: 'anonymous',
        id: '*',
      },
    });

    return this;
  }

  public writeGalleryDownloadEnabled(): this {
    this.write('gallery_download_enabled', {
      object: {
        type: 'user',
        id: '*',
      },
    });
    this.write('gallery_download_enabled', {
      object: {
        type: 'guest',
        id: '*',
      },
    });
    this.write('gallery_download_enabled', {
      object: {
        type: 'anonymous',
        id: '*',
      },
    });

    return this;
  }

  public writeAssetDownloadEnabled(): this {
    this.write('asset_download_enabled', {
      object: {
        type: 'user',
        id: '*',
      },
    });
    this.write('asset_download_enabled', {
      object: {
        type: 'guest',
        id: '*',
      },
    });
    this.write('asset_download_enabled', {
      object: {
        type: 'anonymous',
        id: '*',
      },
    });

    return this;
  }
}
