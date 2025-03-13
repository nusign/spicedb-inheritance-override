export interface SpicedbObjectRef {
  type: string;
  id: string;
}

export interface SpicedbSubjectRef {
  object: SpicedbObjectRef;
  relation?: string;
}

export interface SpicedbCaveat {
  name: string;
  value: Record<string, unknown>;
}
