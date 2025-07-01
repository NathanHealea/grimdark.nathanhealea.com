

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."auth_role" AS ENUM (
    'user',
    'admin',
    'superadmin'
);


ALTER TYPE "public"."auth_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE
    AS $$
  declare
    claims jsonb;
    user_auth_role public.auth_role;
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


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_username_on_insert"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Check if the new row's username is NULL or an empty string.
    IF NEW.username IS NULL OR TRIM(NEW.username) = '' THEN
        -- Attempt to generate a username using the user's UUID (from the 'id' column, which references auth.users).
        -- This ensures a unique and consistent default username generation.
        -- We take the last part of the UUID after the last hyphen to keep it concise.
        IF NEW.id IS NOT NULL THEN
            NEW.username := 'user-' || SPLIT_PART(NEW.id::TEXT, '-', 5);
        -- As a fallback, if for some reason the ID is not available (though it should be for valid inserts),
        -- try to use a part of the email address.
        ELSIF NEW.email IS NOT NULL THEN
            NEW.username := LOWER(SUBSTRING(NEW.email FROM 1 FOR POSITION('@' IN NEW.email) - 1));
        ELSE
            -- If neither ID nor email is available, generate a generic placeholder.
            NEW.username := 'user-' || SPLIT_PART(NEW.id::TEXT, '-', 5);
        END IF;
    END IF;

    -- Return the modified NEW row, which will then be inserted into the table.
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_username_on_insert"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_or_update_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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


ALTER FUNCTION "public"."handle_new_or_update_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."armies" (
    "id" bigint NOT NULL,
    "name" "text",
    "description" "text",
    "parent_army_id" bigint,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."armies" OWNER TO "postgres";


COMMENT ON TABLE "public"."armies" IS 'Application armies';



ALTER TABLE "public"."armies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."armies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_armies" (
    "id" bigint NOT NULL,
    "user_id" bigint NOT NULL,
    "army_id" bigint NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_armies" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_armies" IS 'Application user armies';



ALTER TABLE "public"."user_armies" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_armies_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."user_auth_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."auth_role" DEFAULT 'user'::"public"."auth_role" NOT NULL
);


ALTER TABLE "public"."user_auth_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_auth_roles" IS 'Application roles for each user.';



ALTER TABLE "public"."user_auth_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_auth_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "email" "text" NOT NULL,
    "username" "text",
    "first_name" "text",
    "last_name" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_picture_url" "text"
);


ALTER TABLE "public"."users" OWNER TO "postgres";


COMMENT ON TABLE "public"."users" IS 'Application users.';



ALTER TABLE "public"."users" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."users_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."armies"
    ADD CONSTRAINT "armies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_armies"
    ADD CONSTRAINT "user_armies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_auth_roles"
    ADD CONSTRAINT "user_auth_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_auth_roles"
    ADD CONSTRAINT "user_auth_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "on_users_insert_generate_username" BEFORE INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."generate_username_on_insert"();



ALTER TABLE ONLY "public"."armies"
    ADD CONSTRAINT "armies_parent_army_id_fkey" FOREIGN KEY ("parent_army_id") REFERENCES "public"."armies"("id");



ALTER TABLE ONLY "public"."user_armies"
    ADD CONSTRAINT "user_armies_army_id_fkey" FOREIGN KEY ("army_id") REFERENCES "public"."armies"("id");



ALTER TABLE ONLY "public"."user_armies"
    ADD CONSTRAINT "user_armies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."user_auth_roles"
    ADD CONSTRAINT "user_auth_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admins/Superadmins can delete armies" ON "public"."armies" FOR DELETE USING (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can delete user armies" ON "public"."user_armies" FOR DELETE USING (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can delete user roles" ON "public"."user_auth_roles" FOR DELETE USING (("auth"."uid"() IN ( SELECT "user_auth_roles_1"."user_id"
   FROM "public"."user_auth_roles" "user_auth_roles_1"
  WHERE ("user_auth_roles_1"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can delete users" ON "public"."users" FOR DELETE USING (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can insert armies" ON "public"."armies" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can insert user armies" ON "public"."user_armies" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can insert users" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Admins/Superadmins can update any user data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() IN ( SELECT "user_auth_roles"."user_id"
   FROM "public"."user_auth_roles"
  WHERE ("user_auth_roles"."role" = ANY (ARRAY['admin'::"public"."auth_role", 'superadmin'::"public"."auth_role"])))));



CREATE POLICY "Allow all for Serice Role" ON "public"."users" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow auth admin to read user roles" ON "public"."user_auth_roles" FOR SELECT TO "supabase_auth_admin" USING (true);



CREATE POLICY "Allow public read access to armies" ON "public"."armies" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to user_auth_roles" ON "public"."user_auth_roles" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to users" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Allow public read access to users armies" ON "public"."user_armies" FOR SELECT USING (true);



CREATE POLICY "Authenticated users can update their own user data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Superadmins can insert user roles" ON "public"."user_auth_roles" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "user_auth_roles_1"."user_id"
   FROM "public"."user_auth_roles" "user_auth_roles_1"
  WHERE ("user_auth_roles_1"."role" = 'superadmin'::"public"."auth_role"))));



CREATE POLICY "Users can delete their own armies" ON "public"."user_armies" FOR DELETE USING (("user_id" = ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."armies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_armies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_auth_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";
GRANT USAGE ON SCHEMA "public" TO "service_role";








































































































































































GRANT ALL ON TABLE "public"."armies" TO "authenticated";
GRANT ALL ON TABLE "public"."armies" TO "anon";
GRANT ALL ON TABLE "public"."armies" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_armies" TO "authenticated";
GRANT ALL ON TABLE "public"."user_armies" TO "anon";
GRANT ALL ON TABLE "public"."user_armies" TO PUBLIC;



GRANT ALL ON TABLE "public"."user_auth_roles" TO "supabase_auth_admin";
GRANT ALL ON TABLE "public"."user_auth_roles" TO "authenticated";



GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";

































RESET ALL;
