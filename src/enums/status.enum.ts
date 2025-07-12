import { Status } from '@/types/status.types';

/**
 * Status represents a user's status in the system.
 */
export const StatusEnum: Record<string, Status> = {
  Active: 'active',
  Inactive: 'inactive',
  Banned: 'banned',
  Deleted: 'deleted',
}
