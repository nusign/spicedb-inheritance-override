import { SpicedbObjectRef } from './interfaces';
import { SpicedbDefinition } from './spicedb-definition';
import { SpicedbRelationship } from './spicedb-relationship';

interface TestSuite {
  name: string;
  fn: (t: TestBuilder) => void;
}

interface IAssertion {
  build(): string;
}

class AssetionOn implements IAssertion {
  private objectRef: SpicedbObjectRef;

  constructor(definition: SpicedbDefinition);
  constructor(objectType: string, objectId: string);
  constructor(
    definitionOrObjectType: SpicedbDefinition | string,
    objectId?: string,
  ) {
    if (definitionOrObjectType instanceof SpicedbDefinition) {
      this.objectRef = definitionOrObjectType.asObjectRef();
    } else {
      if (!objectId) {
        throw new Error('objectId is required');
      }
      this.objectRef = { type: definitionOrObjectType, id: objectId };
    }
  }

  public build(): string {
    return `${this.objectRef.type}:${this.objectRef.id}`;
  }
}

class AssertionHas implements IAssertion {
  private assertionOn: AssetionOn;

  constructor(private readonly permission: string) {}

  public on(definition: SpicedbDefinition) {
    this.assertionOn = new AssetionOn(definition);
    return this.assertionOn;
  }

  public build(): string {
    return `${this.assertionOn.build()}#${this.permission}`;
  }
}

interface AssertionOptions {
  subjectRelation?: string;
  caveat?: Record<string, unknown>;
}

class Assertion implements IAssertion {
  public negated = false;

  private assertionHas: AssertionHas;
  private subjectRelation?: string;
  private caveat?: Record<string, unknown>;

  constructor(private definition: SpicedbDefinition) {}

  public get not(): this {
    this.negated = true;
    return this;
  }

  public has(permission: string): AssertionHas {
    this.assertionHas = new AssertionHas(permission);
    return this.assertionHas;
  }

  public withSubjectRelation(subjectRelation: string): this {
    this.subjectRelation = subjectRelation;
    return this;
  }

  public withCaveat(caveat: Record<string, unknown>): this {
    this.caveat = caveat;
    return this;
  }

  public build(): string {
    let assertion = `${this.assertionHas.build()}@${this.definition.type}:${this.definition.id}`;
    if (this.subjectRelation) {
      assertion += `#${this.subjectRelation}`;
    }
    if (this.caveat) {
      assertion += ` with ${JSON.stringify(this.caveat)}`;
    }
    return assertion;
  }
}

export class TestBuilder {
  public assertions: Assertion[] = [];
  public relationships: SpicedbRelationship[] = [];
  public modules: {
    module: string;
    assertions: Assertion[];
    relationships: SpicedbRelationship[];
  }[] = [];

  private testSuites: TestSuite[] = [];
  private level = 0;
  private completed = false;

  constructor(public readonly name: string) {}

  get root(): boolean {
    return this.level === 0;
  }

  public test(name: string, fn: (t: TestBuilder) => void) {
    this.testSuites.push({ name, fn });
  }

  public assert(definition: SpicedbDefinition): Assertion {
    if (this.root) {
      throw new Error('assertions can only be made on test suites');
    }

    const assertion = new Assertion(definition);
    this.assertions.push(assertion);
    return assertion;
  }

  public relationship<T extends SpicedbDefinition>(definition: T): T {
    if (this.root) {
      throw new Error('relationships can only be made on test suites');
    }

    this.relationships.push(...definition.relationships);
    return definition;
  }

  public end() {
    this.completed = true;

    for (const testSuite of this.testSuites) {
      const margin = '\t'.repeat(this.level);
      console.log(`${margin}${testSuite.name}...`);
      const t = new TestBuilder(testSuite.name);
      t.level = this.level + 1;
      testSuite.fn(t);

      if (!t.completed) {
        throw new Error(
          `Test suite "${testSuite.name}" not completed. Please call "t.end()" at the end of the test suite.g`,
        );
      }

      if (this.root) {
        this.modules.push({
          module: t.name,
          assertions: t.assertions,
          relationships: t.relationships,
        });
      } else {
        this.assertions.push(...t.assertions);
        this.relationships.push(...t.relationships);
      }
    }
  }
}
