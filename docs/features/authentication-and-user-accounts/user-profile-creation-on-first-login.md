# User Profile Creation on First Login

**Epic:** Authentication & User Accounts

## Summary

Automatically prompt new users to create their profile after their first successful login.

## Acceptance Criteria

- [ ] After first login, user is redirected to a profile setup flow
- [ ] User must provide required profile fields before accessing authenticated features
- [ ] Profile record is created in the database linked to the Supabase auth user
- [ ] Returning users skip the setup flow and go directly to the app
