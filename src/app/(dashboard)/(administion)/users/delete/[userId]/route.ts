
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/admin';

export async function GET(
  request: Request,
  context: { params: { userId: string; }; }
): Promise<NextResponse> {

  let status = 'success';
  let message = '';
  try {

    const { userId } = context.params;


    // Validate the userId parameter
    if (!userId || userId.length === 0) {
      throw new Error('No User ID provided.');
    }

    if (userId === '1') {
      throw new Error('Cannot delete the primary user with ID 1.');
    }


    const supabase = await createClient();

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
      const { error: deletedUserError } = await supabase.auth.admin.deleteUser(user.user_id);

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

    message = `User with ID ${userId} has been successfully deleted.`;

  } catch (error) {
    status = 'error';

    if (error instanceof Error) {
      message = error.message;
    }
    else if (typeof error === 'string') {
      message = error;
    } else {
      message = 'An unknown error occurred while deleting the user.';
    }
  }

  const queryString = new URLSearchParams({
    message,
    status
  }).toString();

  return NextResponse.redirect(
    new URL(`/users?${queryString}`, request.url)
  );


}