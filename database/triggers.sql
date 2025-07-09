
-- This trigger will automatically call the handle_new_user_or_update function
-- whenever a new row is inserted into auth.users (new user signup)
-- or an existing row is updated in auth.users (e.g., last_sign_in_at changes).
CREATE OR REPLACE TRIGGER on_auth_user_created
AFTER INSERT OR UPDATE ON auth.users -- Fires after an INSERT operation on auth.users
FOR EACH ROW -- For each row inserted
EXECUTE FUNCTION public.handle_new_or_update_user(); -- Execute the defined function

-- This trigger will automatically call the handle_new_user_or_update function
-- whenever a new row is inserted into auth.users (new user signup)
-- or an existing row is updated in auth.users (e.g., last_sign_in_at changes).
CREATE OR REPLACE TRIGGER on_auth_user_change
AFTER UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_or_update();


-- This trigger will automatically call the handle_create_user_profile_directory function
-- whenever a new row is inserted into public.users (new user profile creation).
-- It will create a profile directory for the user in the storage bucket.
CREATE OR REPLACE TRIGGER on_user_insert_create_profile_directory
AFTER INSERT ON public.users
FOR EACH ROW EXECUTE FUNCTION public.handle_create_user_profile_directory();