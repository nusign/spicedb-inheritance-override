import { randomUUID } from 'node:crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { Organization } from './organization.fixture';
import { User } from './user.fixture';
import { AccessLevel, PublicAccessLevel, accessLevelToRelation } from './utils';
import { Group } from './group.fixture';

export class Folder extends SpicedbDefinition {
  public readonly type = 'folder';
  public readonly id = randomUUID();

  public writeOrganization(organization: Organization): this {
    return this.write('organization', organization.asSubjectRef());
  }

  public writeParent(parent: Folder): this {
    return this.write('parent', parent.asSubjectRef());
  }

  public addDirectMember(member: User, access: AccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`direct_${relation}`, member.asSubjectRef());
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

  public setOrganizationAccess(organization: Organization, access: AccessLevel): this {
    const relation = accessLevelToRelation(access);

    if (relation) {
      this.write(`organization_${relation}`, organization.asMemberSubjectRef());
    }

    return this.write(
      'organization_inheritance_disabled',
      organization.asMemberSubjectRef(),
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
