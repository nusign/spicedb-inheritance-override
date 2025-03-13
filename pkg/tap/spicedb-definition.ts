import {
  SpicedbCaveat,
  SpicedbObjectRef,
  SpicedbSubjectRef,
} from './interfaces';
import { SpicedbRelationship } from './spicedb-relationship';

export abstract class SpicedbDefinition {
  abstract readonly type: string;
  abstract readonly id: string;

  public readonly relationships: SpicedbRelationship[] = [];

  public asObjectRef(): SpicedbObjectRef {
    return {
      type: this.type,
      id: this.id,
    };
  }

  public asSubjectRef(relation?: string): SpicedbSubjectRef {
    return {
      object: this.asObjectRef(),
      relation,
    };
  }

  public write(
    relation: string,
    subject: SpicedbSubjectRef,
    caveat?: SpicedbCaveat,
  ): this {
    this.relationships.push(
      new SpicedbRelationship(this.asObjectRef(), subject, relation, caveat),
    );
    return this;
  }
}
