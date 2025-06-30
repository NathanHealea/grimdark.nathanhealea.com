
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