grant select on table "auth"."audit_log_entries" to "service_role";

grant select on table "auth"."flow_state" to "service_role";

grant select on table "auth"."identities" to "service_role";

grant select on table "auth"."instances" to "service_role";

grant select on table "auth"."mfa_amr_claims" to "service_role";

grant select on table "auth"."mfa_challenges" to "service_role";

grant select on table "auth"."mfa_factors" to "service_role";

grant select on table "auth"."one_time_tokens" to "service_role";

grant select on table "auth"."refresh_tokens" to "service_role";

grant select on table "auth"."saml_providers" to "service_role";

grant select on table "auth"."saml_relay_states" to "service_role";

grant select on table "auth"."schema_migrations" to "service_role";

grant select on table "auth"."sessions" to "service_role";

grant select on table "auth"."sso_domains" to "service_role";

grant select on table "auth"."sso_providers" to "service_role";

grant select on table "auth"."users" to "service_role";

CREATE TRIGGER on_auth_user_created AFTER INSERT OR UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_or_update_user();


