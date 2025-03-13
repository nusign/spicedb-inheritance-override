import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../pkg/tap';
import { Tenant } from './tenant.fixture';
import { User } from './user.fixture';
import { AccessLevel, PublicAccessLevel, accessLevelToRelation } from './utils';
import { Group } from './group.fixture';

export class Folder extends SpicedbDefinition {
  public readonly type = 'folder';
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

  public writeParent(parent: Folder): this {
    return this.write('parent', parent.asSubjectRef());
  }

  public writeOwner(owner: User): this {
    return this.write('owner', owner.asSubjectRef());
  }

  public addFolderMember(member: User, access: AccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`folder_${relation}`, member.asSubjectRef());
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

  public setPublicAccess(access: PublicAccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`public_${relation}`, {
        object: {
          type: 'user',
          id: '*',
        },
      });
      this.write(`public_${relation}`, {
        object: {
          type: 'guest',
          id: '*',
        },
      });
      this.write(`public_viewer`, {
        object: {
          type: 'anonymous',
          id: '*',
        },
      });
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
}
