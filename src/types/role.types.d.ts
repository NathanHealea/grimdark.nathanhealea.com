

/**
 * RoleType defines the different types of roles a user can have in the system.
 */
export type RoleType = NonNullable<'user' | 'member' | 'admin' | 'superadmin'>;


/**
 * Role represents a user's role in the system.
 */
export type Role = {
  id: number;
  user_id: string;
  role: RoleType;
  
};