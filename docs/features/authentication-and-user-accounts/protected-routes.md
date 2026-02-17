# Protected Routes for Authenticated Features

**Epic:** Authentication & User Accounts

## Summary

Restrict access to authenticated-only pages so that unauthenticated users are redirected to sign in.

## Acceptance Criteria

- [ ] Unauthenticated users are redirected to the sign-in page when accessing protected routes
- [ ] Authenticated users can access all protected routes
- [ ] Middleware or layout-level auth check handles protection consistently
- [ ] Public pages (league info, landing) remain accessible without login
