export type AccessLevel = 'no_access' | 'view_only' | 'review' | 'edit';
export type PublicAccessLevel = 'no_access' | 'view_only' | 'review';

export const accessLevelToRelation = (
  accessLevel: AccessLevel,
): string | null => {
  switch (accessLevel) {
    case 'view_only':
      return 'viewer';
    case 'review':
      return 'reviewer';
    case 'edit':
      return 'editor';
    case 'no_access':
      return null;
    default:
      throw new Error(`Invalid access level: ${accessLevel}`);
  }
};
