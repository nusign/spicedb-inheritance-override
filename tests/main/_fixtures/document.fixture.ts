import { randomUUID } from "crypto";
import { SpicedbDefinition } from "../../../pkg/tap";
import { AccessLevel, PublicAccessLevel, accessLevelToRelation } from "./utils";
import { Organization } from "./organization.fixture";
import { Folder } from "./folder.fixture";
import { User } from "./user.fixture";
import { Group } from "./group.fixture";

export class Document extends SpicedbDefinition {
  public readonly type = "document";
  public readonly id = randomUUID();

  public writeOrganization(organization: Organization): this {
    return this.write("organization", organization.asSubjectRef());
  }

  public writeFolder(folder: Folder): this {
    return this.write("parent", folder.asSubjectRef());
  }

  public addParent(document: Document): this {
    return this.write("parent", document.asSubjectRef());
  }

  public addDirectMember(member: User, access: AccessLevel): this {
    return this.write(`direct_${accessLevelToRelation(access)}`, member.asSubjectRef());
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

  public setPublicAccess(access: PublicAccessLevel, password?: string): this {
    const caveat = password
      ? { name: "password_protected", value: { current_password: password } }
      : undefined;
    const relation = accessLevelToRelation(access);

    this.write(
      `public_${relation}`,
      {
        object: {
          type: "user",
          id: "*",
        },
      },
      caveat
    );
    this.write(
      `public_${relation}`,
      {
        object: {
          type: "guest",
          id: "*",
        },
      },
      caveat
    );

    if (relation !== "no_access") {
      this.write(
        "public_viewer",
        {
          object: {
            type: "anonymous",
            id: "*",
          },
        },
        caveat
      );
    } else {
      this.write(
        "public_no_access",
        {
          object: {
            type: "anonymous",
            id: "*",
          },
        },
        caveat
      );
    }

    return this;
  }
}
