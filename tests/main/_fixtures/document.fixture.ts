import { randomUUID } from 'crypto';
import { SpicedbDefinition } from '../../../pkg/tap';
import { AccessLevel, PublicAccessLevel, accessLevelToRelation } from './utils';
import { Organization } from './organization.fixture';
import { Folder } from './folder.fixture';
import { User } from './user.fixture';
import { Group } from './group.fixture';

export class Document extends SpicedbDefinition {
  public readonly type = 'document';
  public readonly id = randomUUID();

  public writeOrganization(organization: Organization): this {
    return this.write('organization', organization.asSubjectRef());
  }

  public writeFolder(folder: Folder): this {
    return this.write('folder', folder.asSubjectRef());
  }

  public addParent(document: Document): this {
    return this.write('parent', document.asSubjectRef());
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
}
