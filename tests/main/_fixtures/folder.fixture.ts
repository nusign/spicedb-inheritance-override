import { randomUUID } from "node:crypto";
import { SpicedbDefinition } from "../../../pkg/tap";
import { Organization } from "./organization.fixture";
import { User } from "./user.fixture";
import { AccessLevel, PublicAccessLevel, accessLevelToRelation } from "./utils";
import { Group } from "./group.fixture";

export class Folder extends SpicedbDefinition {
  public readonly type = "folder";
  public readonly id = randomUUID();

  public writeOrganization(organization: Organization): this {
    return this.write("organization", organization.asSubjectRef());
  }

  public writeParent(parent: Folder): this {
    return this.write("parent", parent.asSubjectRef());
  }

  public addDirectMember(member: User, access: AccessLevel): this {
    return this.write(accessLevelToRelation(access), member.asSubjectRef());
  }

  public addGroup(group: Group, access: AccessLevel): this {
    return this.write(`group_${accessLevelToRelation(access)}`, group.asMembershipSubjectRef());
  }

  public setOrganizationAccess(
    organization: Organization,
    access: AccessLevel
  ): this {
    return this.write(`organization_${accessLevelToRelation(access)}`, organization.asMemberSubjectRef());
  }

  public setPublicAccess(access: PublicAccessLevel): this {
    const relation = accessLevelToRelation(access);

    this.write(`public_${relation}`, {
      object: {
        type: "user",
        id: "*",
      },
    });
    this.write(`public_${relation}`, {
      object: {
        type: "guest",
        id: "*",
      },
    });

    if (relation !== "no_access") {
      this.write("public_viewer", {
        object: {
          type: "anonymous",
          id: "*",
        },
      });
    } else {
      this.write("public_no_access", {
        object: {
          type: "anonymous",
          id: "*",
        },
      });
    }

    return this;
  }
}
