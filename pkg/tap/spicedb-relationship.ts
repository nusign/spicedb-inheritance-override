import {
  SpicedbCaveat,
  SpicedbObjectRef,
  SpicedbSubjectRef,
} from './interfaces';

export class SpicedbRelationship {
  constructor(
    public resource: SpicedbObjectRef,
    public subject: SpicedbSubjectRef,
    public relation: string,
    public caveat?: SpicedbCaveat,
  ) {}

  public build(): string {
    let relationship = `${this.resource.type}:${this.resource.id}#${this.relation}@${this.subject.object.type}:${this.subject.object.id}`;
    if (this.subject.relation) {
      relationship += `#${this.subject.relation}`;
    }
    if (this.caveat) {
      relationship += `[${this.caveat.name}:${JSON.stringify(this.caveat.value)}]`;
    }
    return relationship;
  }
}
