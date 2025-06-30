import { Army } from './army.types';
import { Role } from './role.types';


export type User = {
  id: number;
  user_id: string;
  username: string | null;
  email: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  profile_picture_url: string | null; // Optional property for profile image URL
  roles?: Role[]; // Optional property to hold user roles
  armies?: Army[]; // Optional property to hold associated army IDs
  created_at: Date; 
  updated_at: Date; 
};