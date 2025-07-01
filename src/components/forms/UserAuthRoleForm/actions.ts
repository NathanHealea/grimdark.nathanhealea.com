'use server';
import { createClient } from '@/lib/supabase/server';
import { UserAuthRoleState } from './types';
import { error } from 'console';
import { RoleType } from '@/types/role.types';

export default async function roleFormAction(initialState: UserAuthRoleState, formData: FormData): Promise<UserAuthRoleState> {
  const state: UserAuthRoleState = {
    state: initialState.state,
    errors: {} as Record<string, string[]>,
    success: false,
  };

  // Return the inital state if no formData is provided.
  if (!formData) {
    return state;
  }

  const userId = formData.get('userId')?.toString() || '';
  const role = formData.get('role')?.toString() || '';
  const action = formData.get('action')?.toString() as 'add' | 'remove';

  const supabase = await createClient();

  // Validate that the current user is authenticated and has the necessary roles.
  try {

    // Validate that the current user is authenticated.
    const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();

    if (userError) {
      throw new Error(`Failed to get current user: ${userError.message}`);
    }

    if (!currentUser) {
      throw new Error('You must be logged in to perform this action.');
    }
    else if (!currentUser.id) {
      throw new Error('Current user does not have an authenticated user ID.');
    }


    // Validate that the current user has the necessary roles to add or remove roles.
    const { data: currentUserAuthRoles, error: currentUserAuthRolesErrors } = await supabase.from('user_auth_roles').select('role').eq('user_id', currentUser.id);

    if (currentUserAuthRolesErrors) {
      throw error;
    }
    else if (!currentUserAuthRoles || currentUserAuthRoles.length === 0) {
      throw new Error('You do not have any roles assigned.');
    }
    else if (!currentUserAuthRoles.some(role => role.role === 'admin' || role.role === 'superadmin')) {
      throw new Error('You do not have permission to add or remove roles.');
    }


    if ((role === 'superadmin') && !(currentUserAuthRoles.some(role => role.role === 'superadmin'))) {
      throw new Error(`You do not have permission to add or remove the role ${role}.`);
    }
    // Only Superadmins and Admins can add roles.
    else if ((role !== 'superadmin') && !(currentUserAuthRoles.some(role => role.role === 'admin' || role.role === 'superadmin'))) {
      throw new Error(`You do not have permission to add or remove the role ${role}.`);
    }


  }
  catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message];
    } else if (typeof error === 'string') {
      state.errors.form = [error];
    } else {
      state.errors.form = ['An unknown error occurred'];
    }
    return state;
  }


  // Process action: Add or Remove Role
  // This is where the main logic for adding or removing roles
  try {

    // Validate form data.
    if (!userId) {
      throw new Error('User ID is required.');
    }
    if (!role) {
      throw new Error('Role is required.');
    }
    if (!action || (action !== 'add' && action !== 'remove')) {
      throw new Error('Action must be either "add" or "remove".');
    }

    // Handle logic for adding a role.
    if (action === 'add') {

      const { data: existingRoles, error: existingRolesError } = await supabase
        .from('user_auth_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', role as RoleType).maybeSingle();

      if (existingRolesError) {
        throw new Error(`Failed to check existing roles: ${existingRolesError.message}`);
      }

      if (existingRoles) {
        throw new Error(`User already has the role: ${role}`);
      }

      const { error: addError } = await supabase
        .from('user_auth_roles')
        .insert({ user_id: userId, role: role as RoleType });


      // validate no errors occure while adding the role.
      if (addError) {
        console.error('Error adding role:', addError.message);
        throw new Error(`Failed to add role`);
      }

    }

    // Handle logic for removing a role
    if (action === 'remove') {
      const { data: existingRoles, error: existingRolesError } = await supabase
        .from('user_auth_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', role as RoleType).maybeSingle();

      if (existingRolesError) {
        throw new Error(`Failed to check existing roles: ${existingRolesError.message}`);
      }

      if (!existingRoles) {
        throw new Error(`User does not has the role: ${role}`);
      }

      const { error: addError } = await supabase
        .from('user_auth_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role as RoleType);

      // validate no errors occure while removing the role.
      if (addError) {
        console.error('Error removing role:', addError.message);
        throw new Error(`Failed to remove role`);
      }
    }

    // Simulate success for now
    state.success = true;

  }
  catch (error) {
    if (error instanceof Error) {
      state.errors.form = [error.message];
    } else if (typeof error === 'string') {
      state.errors.form = [error];
    } else {
      state.errors.form = ['An unknown error occurred'];
    }
  }

  // Return the updated state
  console.log('Role Form Action Result', state);
  return state;
}


