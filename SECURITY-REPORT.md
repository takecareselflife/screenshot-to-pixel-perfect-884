# Care+ — Professional security and privacy review

Date: 28 October 2026 (UTC). Scope: existing authentication, professional panel, private profiles, roles, database policies/functions, session lifecycle, audit records, password recovery and adolescent-data separation. This report does not certify legal compliance, clinical safety or production readiness.

## Architecture examined

- TanStack Start/React application on Lovable Cloud; PostgreSQL database and Cloud Auth.
- Existing email/password authentication, protected-route layout, browser bearer attachment, server session middleware, professional/manager roles, anonymous impact indicators and their database function.
- Assistant/speech/transcription endpoints, in-memory support requests and questionnaires, professional demo, privacy policy, database migrations and storage configuration.
- Initial live check: zero auth accounts and zero role assignments. No existing professional personal records were changed. No storage buckets existed.

## Implemented

- Private profiles contain only professional name and registration identifier; email/credentials remain in the account service. Signup creates an empty private profile and pending access without assigning roles or administrative privileges.
- Owner-only profile read/update policies; edits are restricted to name/registration. Suspended/revoked users cannot update the profile. A change to an approved identity returns access to pending, requiring renewed review.
- Access states: pending, approved, suspended and revoked. Professional and manager resource roles remain separate from operator-designated administrators. No UI, signup or ordinary RPC can designate an administrator or approve oneself.
- Checked administrator approval/suspension/revocation function and corresponding screen. Administrators can inspect registration details for approval but are not automatically granted intake or indicators access.
- Every professional server function checks the authenticated identity, current database session, email confirmation and account ban/expiration state. Protected data functions and RLS independently recheck current approval/role. Revocation and sign-out deny old-token access.
- Professional functions use no-store responses, safe errors and server-side input validation. Profile/admin mutations have request limits; direct database RPC calls remain a rate-limiting consideration noted below.
- Persistent audit includes actor identifier, subject identifier, timestamp, action and changed access metadata. It excludes names, registration values, credentials and health messages. Authenticated denied professional/admin attempts can also be audited. Reads are administrator-only; clients cannot insert/edit/delete audit records.
- Global sign-out cancels requests and clears protected query caches before ending sessions. Errors do not falsely claim sign-out succeeded. Root session-change handling keeps the interface synchronized.
- Password-reset request and public recovery page use Cloud Auth, validate the recovery state, erase credential fragments from the address bar and set a new password without demanding the old password. Recovery ends with global sign-out. Email confirmation remains enabled; leaked-password checks and current-password requirements for ordinary signed-in changes were enabled.
- The intake panel remains demonstrative. It reads only seeded synthetic examples local to that panel, never public support-form memory, AI conversations or questionnaire answers. Existing demo data was not deleted. Privacy/support text now reflects this separation.
- Database grants were tightened for new private tables, all new tables have RLS, and anonymous execution of privileged professional functions is revoked.

## Observed tests

### Passed

- 98 existing/new ordinary automated tests and 6 opt-in live database integration tests: 104 total in the final run.
- 44 additional live assertions in the browser/database test scripts, using disposable synthetic accounts only. These covered visitor redirects, pending denial, cross-account profile privacy, identifier-change denial, direct role/admin/state/audit writes, unauthorized approval, self-approval denial, real profile save through the server, approval and suspension through the administrative UI, old-session suspension denial, safe sign-out, manager least privilege, reapproval after identity changes, administrator revocation, persistent actor/date auditing and audit privacy.
- Direct replay of an actual browser server-function request without its bearer token returned an authorization denial.
- Generated synthetic recovery token: accepted; password reset completed in the UI; old password stopped working; new password worked; reused token was rejected. Missing recovery link could not expose the reset form.
- Live hosted auth settings were read: email login enabled, automatic email confirmation off, public signup enabled without roles.
- Signup trigger was exercised. An initial implementation error in the audit trigger blocked synthetic signup; database logs identified the cause, it was corrected, and subsequent signup/lifecycle checks passed.
- Basic security recheck reported no findings. Database linter still flags intentionally authenticated callable security-definer routines and the intentionally locked rate-counter table. These flags are not a blanket security certification.
- New screens were checked in the browser; exercised flows reported no browser runtime errors. Preview build/type checks were clean after fixing test typing issues.
- Disposable auth accounts and private profiles were removed; live cleanup checks returned zero accounts, profiles and administrators. No real administrator was created.

### Failed and corrected

- Audit-trigger access to a nonexistent record field: corrected and signup successfully retested.
- Initial assertions expected an HTTP error for anonymous profile reads; actual behavior returned an empty list with no private records. Anonymous privileges were subsequently explicitly revoked and live policy tests rerun.
- New integration-test TypeScript issues: corrected; final checks clean.

### Not executed / not applicable

- Delivery of a real password-reset email and clicking it from a mailbox; tests consumed a generated recovery token for a synthetic account instead. Mail delivery, real deployed-origin redirects and all browser/email combinations remain unverified.
- Expired recovery token timing, deliberate network failure during sign-out, complete concurrent/race/load testing, penetration testing and exhaustive CSRF tests.
- Access to private storage files: no buckets or professional files exist; no upload feature was introduced.
- Existing real professional records: none existed; no real records were edited and no real-user test sessions were used.
- Production publication was not requested and was not performed. The deep security scan examined the pre-change saved application, not this completed patch.

## Remaining risks and required decisions

1. First administrator requires a real account, verified identity and explicit owner authorization through a controlled operator process. No automatic bootstrap is allowed. Operator-side grants must document the human authorizer; database auth.uid is null for out-of-app operator actions.
2. A human must validate professional registration and legitimately approve each resource role; typing a registration identifier does not validate a license.
3. Define retention/deletion for professional profiles and security audit, incident-response procedures, legal basis and applicable-country privacy rules. Technical hosting/auth/provider logs and their retention were not exhaustively audited.
4. The deep scan found that the public AI assistant accepts caller-provided assistant-role history, enabling fabricated prior responses. This separate AI-content integrity risk remains open; professional-access changes do not resolve it.
5. Protect administrators further with an MFA policy, review session lifetimes and independently test deployed recovery redirects, mail delivery and sign-out under failures.
6. Direct authenticated database RPCs have session/permission checks but do not share the new application mutation rate limits. Add infrastructure/database abuse controls before exposing the pilot at scale. Anonymous impact counts remain susceptible to artificial inflation.
7. Approval listings and audit currently show the latest 100 records/events; a large pilot will need controlled pagination, retention and investigation workflows.
8. Suspension prevents new protected operations after the change; previously displayed information cannot be erased from a person's memory or screenshots. The interface refreshes permission state, but server checks are the enforcement boundary.
9. Do not connect identifiable support requests, adolescent health information, conversations or questionnaires without a separate purpose/authorization/privacy design and targeted controls.

## Re-running repository tests

Ordinary tests: `bunx vitest run`. Live security suite is explicitly opt-in via `RUN_SECURITY_INTEGRATION=1` with server-side Cloud test environment variables. It creates, signs in, tests and removes only disposable synthetic accounts. Never put privileged credentials in source or browser code.