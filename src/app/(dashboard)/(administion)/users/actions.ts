
import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@/lib/supabase/admin';

export type DeleteUserParams = {
  userId: number;
};

export type DeleteUserResponseData = {
  success: boolean;
  message: string;
};

export type DeleteUserResponse = Promise<DeleteUserResponseData>;

export async function deleteUserAction(params: DeleteUserParams): DeleteUserResponse {


  const response: DeleteUserResponseData = {
    success: true,
    message: ''
  };

  const supabase = await createServerClient();

  // Ensure the user is authenticated and has the right permissions
  try {

    const { data: { user } } = await supabase.auth.getUser();
    // Check if the user is authenticated
    if (!user) {
      throw new Error('User not authenticated.');
    }

    // Check if the user has the required role 
    const { data: roles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);


    // Check for any errors in fetching roles
    if (rolesError) {
      throw rolesError;
    }

    // Check users roles
    if (!roles || roles.length === 0) {
      throw new Error('User does not have the required permissions to delete users.');
    }
    else if (!roles.some(role => role.role === 'admin' || role.role === 'superadmin')) {
      throw new Error('User does not have the required permissions to delete users.');
    }

  }
  catch (error) {
    if (error instanceof Error) {
      response.message = error.message;
    } else if (typeof error === 'string') {
      response.message = error;
    } else {
      response.message = 'An unknown error occurred while authenticating the user.';
    }

    // set the response to indicate failure
    response.success = false;

    // Return the response early if there was an authentication error
    return response;
  }

  // Proceed with the user deletion logic
  try {

    const { userId } = params;

    // Validate the userId parameter
    if (!userId) {
      throw new Error('No User ID provided.');
    }

    if (userId === 1) {
      throw new Error('Cannot delete the primary user with ID 1.');
    }

    // Fetch the user to ensure they exist before attempting to delete
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      throw new Error(`User with ID ${userId} not found.`);
    }

    // validate that the user has a user_id
    if (user.user_id) {

      // Attempt to delete the user from the database
      const { error: deleteUserError } = await supabase.from('users').delete().eq('user_id', user.user_id);


      if (deleteUserError) {
        console.error('Error deleting user:', deleteUserError);
        throw new Error(`Could not delete user with ID ${userId}.`);
      }

      // Attempt to delete the user roles associated with the user
      const { error: deleteUserRolesError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      if (deleteUserRolesError) {
        console.error('Error deleting user roles:', deleteUserRolesError);
        throw new Error(`Could not delete roles for user with ID ${userId}.`);
      }

      // Attempt to delete the user from the auth system
      const supabaseAdmin = await createAdminClient();
      const { error: deletedUserError } = await supabaseAdmin.auth.admin.deleteUser(user.user_id);

      if (deletedUserError) {
        console.error('Error deleting user from auth:', deletedUserError);
        throw new Error(`Could not delete user with ID ${userId} account.`);
      }
    }

    if (!user.user_id) {

      // Attempt to delete the user from the database
      const { error: deleteUserError } = await supabase.from('users').delete().eq('id', userId);

      if (deleteUserError) {
        console.error('Error deleting user:', deleteUserError);
        throw new Error(`Could not delete user with ID ${userId}.`);
      }
    }

    response.message = `User with ID ${userId} has been successfully deleted.`;

  } catch (error) {

    if (error instanceof Error) {
      response.message = error.message;
    }
    else if (typeof error === 'string') {
      response.message = error;
    } else {
      response.message = 'An unknown error occurred while deleting the user.';
    }

    response.success = false;
  }

  // Return the response
  return response;
}