-- Custom Access Token Hook Function
-- This function is called by Supabase Auth to inject custom claims into a user's
-- JWT access token. Here, it adds the 'user_auth_role' claim.
create or replace function public.custom_access_token_hook (event jsonb)
returns jsonb
language plpgsql
stable as $$
  declare
    claims jsonb;
    user_auth_role public.role;
  begin
    -- Extract current claims from the event payload
    claims := event->'claims';

    -- Fetch the user role from the public.user_auth_roles table
    -- based on the user_id provided in the event.
    select role into user_auth_role
    from public.user_auth_roles
    where user_id = (event->>'user_id')::uuid;

    -- If a role is found, set it as a 'user_auth_role' claim.
    if user_auth_role is not null then
      claims := jsonb_set(claims, '{user_auth_role}', to_jsonb(user_auth_role));
    else
      -- If no role is found, set 'user_auth_role' claim to null.
      claims := jsonb_set(claims, '{user_auth_role}', 'null');
    end if;

    -- Update the 'claims' object in the original event payload
    -- before returning it.
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified event, which Supabase Auth will use to create the token.
    return event;
  end;
$$;

-- Function to handle new user creation
-- This function is triggered after a new user is inserted into `auth.users`.
-- It either updates an existing `public.users` entry (if matched by email)
-- or creates a new one, and assigns a default role.
create or replace function public.handle_new_or_update_user ()
returns trigger
language plpgsql
security definer -- Runs with the privileges of the function's owner (typically postgres)
as $$
DECLARE
    existing_user_id BIGINT; -- Variable to hold the ID of an existing user profile
BEGIN
    -- Check if a user profile with the new user's email already exists in `public.users`.
    SELECT id INTO existing_user_id
    FROM public.users
    WHERE email = NEW.email; -- NEW refers to the newly inserted row in auth.users

    IF existing_user_id IS NOT NULL THEN
        -- If an existing user profile is found (e.g., pre-created by an admin),
        -- update its ID to match the new `auth.users.id` and refresh `updated_at`.
        UPDATE public.users
        SET
          email = COALESCE(NEW.email, public.users.email), 
          username = COALESCE(NEW.raw_user_meta_data->>'user_name', NEW.raw_user_meta_data->>'username', public.users.username),
          first_name = COALESCE(NEW.raw_user_meta_data->>'name',NEW.raw_user_meta_data->>'first_name', public.users.first_name), 
          last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', public.users.last_name),
          profile_picture_url = COALESCE(NEW.raw_user_meta_data->>'picture', NEW.raw_user_meta_data->>'avatar_url', public.users.profile_picture_url),
          updated_at = NOW() -- Assuming you have an updated_at column in public.users
        WHERE id = existing_user_id;
    ELSE
        -- If no existing user profile, create a new one in `public.users`.
        INSERT INTO public.users (user_id, email, username, first_name, last_name, profile_picture_url)
        VALUES (
          NEW.id, -- Use the auth.users ID as the primary key for public.users
          NEW.email,
          -- Attempt to get a username from user metadata, otherwise generate one.
          coalesce(NEW.raw_user_meta_data->>'username', 'user-' ||SPLIT_PART(NEW.id::TEXT, '-', 5) ),
          first_name = COALESCE(NEW.raw_user_meta_data->>'name',NEW.raw_user_meta_data->>'first_name', public.users.first_name), 
          last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', public.users.last_name),
          profile_picture_url = COALESCE(NEW.raw_user_meta_data->>'picture', NEW.raw_user_meta_data->>'avatar_url', public.users.profile_url)
        );

        -- Assign a default 'user' role to the newly created user.
        INSERT INTO public.user_auth_roles(user_id, role) -- Note: Corrected to user_id instead of id.
        VALUES (NEW.id, 'user'::public.auth_role);
    END IF;

    RETURN NEW; -- Return the new row from auth.users (required for AFTER triggers)
END;
$$;

-- Function to validate the current password of the authenticated user
-- This function checks if the provided current password matches the user's stored password.
-- It raises an exception if the user is not authenticated or if the password does not match.
-- Returns a JSON response indicating success or failure.
-- SOURCE: https://github.com/orgs/supabase/discussions/4042
create or replace function validate_current_password(current_plain_password varchar)
RETURNS BOOLEAN SECURITY DEFINER AS
$$
BEGIN
  RETURN EXISTS (
    SELECT id 
    FROM auth.users 
    WHERE id = auth.uid() AND encrypted_password = crypt(current_plain_password, auth.users.encrypted_password)
  );
END;
$$ LANGUAGE plpgsql;



-- 1. Create or Replace the Trigger Function
-- This function will be executed by the trigger.
-- It no longer takes arguments, as it accesses the new row data via the 'NEW' record.
CREATE OR REPLACE FUNCTION public.handle_create_user_profile_directory()
RETURNS TRIGGER -- A trigger function must return TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- This allows the function to run with the privileges of the user who defined it (e.g., supabase_admin)
AS $$
DECLARE
    v_url text := 'http://supabase_edge_runtime_grimdark.nathanhealea.com:8081/create-profile-directory'; -- !! IMPORTANT: Replace with your actual API URL !!
    v_body jsonb;
    v_headers jsonb := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"}'; -- Headers for the request
    v_response_json jsonb;
    v_request_result http_response;
BEGIN
    -- Get the ID of the newly inserted row from the 'NEW' record.
    -- 'NEW.id' refers to the 'id' column of the row just inserted into 'public.users'.
    -- The 'userId' key in the JSON body will contain this ID.
    v_body := jsonb_build_object('userId', NEW.id)::jsonb;


    -- Make the POST request using the http_post function from the http extension
    -- The arguments are: URL, body, headers
    PERFORM  (
    net.http_post(
        -- url for the request
        v_url,
        -- body of the POST request
        v_body,
        -- key/value pairs to be url encoded and appended to the `url`
        null,
        -- key/values to be included in request headers
        v_headers,
        -- the maximum number of milliseconds the request may take before being cancelled
        1000
    ) );

    RETURN NEW; -- For AFTER triggers, always return NEW
END;
$$;
