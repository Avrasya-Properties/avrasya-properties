# Admin sign-in, recovery and content audit

## Implemented

- A temporary database/API refresh failure no longer clears the admin's signed-in state or replaces loaded records. Expired Auth tokens and deactivated staff accounts still lose access.
- Ten minutes without typing, clicks, touch input or scrolling signs the current browser session out. Background data reads and automatic token refresh do not restart the timer. A warning appears in the last minute.
- Authenticated saves, RPC changes and Storage uploads protect the session while they run. Ten idle minutes are available after completion. Activity and short work leases are shared across tabs. Closing a tab cannot leave a permanent work exemption. The timer also continues after leaving the admin pages; browsing the public website does not reset admin inactivity. Reloading a tab does not reset inactivity; a click after expiry cannot revive it.
- Password login goes through the deployed `admin-access` Edge Function. Only an active staff profile can sign in. Consecutive incorrect passwords are counted atomically in a private table; three within fifteen minutes block new gateway sign-ins for fifteen minutes. Parallel requests cannot race the count. Auth service outages do not count as wrong passwords or reset previous failures.
- Database permissions deny admin access to fresh direct Auth sessions while the account is blocked. Existing sessions continue to work. The optional native password verification hook also tracks password attempts made directly to Supabase Auth; see activation below.
- The administrator keeps `admin@avrasyaproperties.com` as the sign-in address. Its recovery links and security alerts target `info.avrasyaproperties@gmail.com`. Other active staff use their own email.
- Recovery uses Supabase's single-use recovery token, delivered through an application email provider. Tokens are in the URL fragment and removed from the address bar before verification. A verified, live Auth session is required to change the password. A successful password change clears the block and requests sign-out of other sessions; the recovery browser then signs out too.
- Security alerts are queued durably, use a stable provider idempotency key, and record provider acceptance separately from failed delivery. Failed alerts remain available for retry. No password or recovery token is stored in the alert queue or logged.
- Team sign-in emails are protected from direct browser updates so a profile edit cannot disconnect an account from Supabase Auth. Current live team emails were checked and already match their Auth accounts.
- Website settings include a Sign-in and recovery tab showing actual email configuration and queued alerts, with Check connection and Retry queued alerts buttons.
- Homepage collection wording and buying-journey heading are editable in Website appearance. Published homepage sections appear below its hero/search. Contact-page introduction can be managed under Website pages / Page sections while its main form and live office details are retained. Other page, property and financial management from the previous repair is retained.

## Configuration still required

Email sending was confirmed unconfigured by the owner. Do not claim that any live alert or recovery email has been delivered.

Configure these **Supabase Edge Function secrets**, never frontend VITE variables or Git:

| Secret | Value |
| --- | --- |
| RESEND_API_KEY | Key for the application's email provider |
| ADMIN_MAIL_FROM | Sender address verified with that provider |
| ADMIN_SITE_URL | Exact published HTTPS website URL |

The owner selected “Custom domain” but did not provide its address. Never infer the domain from the admin email. Recovery returns a clear setup error until all three values exist. If another provider is preferred, replace the small server-side `send` adapter before configuring it.

In Supabase Authentication → Hooks, enable the **Password Verification Attempt** Postgres hook `public.admin_password_verification`. This native hook currently requires a Teams or Enterprise plan; do not upgrade or claim activation without the owner’s decision. Without that setting, gateway attempts are counted and database access is blocked after the third gateway failure, but incorrect passwords sent directly to Supabase Auth are not counted. The repository migration alone cannot change hosted Auth settings.

Queued alerts retry on a successful gateway sign-in, the admin’s Retry queued alerts button, and a scheduled Supabase worker every minute. The worker uses a random single-use request token that expires after 90 seconds; only its hash is stored privately. Replaying a captured request is rejected. A reusable credential never goes into extension request logs. The hosted scheduler is active and runs every minute. It leaves alerts queued while email sending is unconfigured.

The existing public enquiry endpoint separately requires `WEBSITE_ALLOWED_ORIGINS` containing the actual website origin. Missing configuration previously produced HTTP 503. This setting cannot safely be replaced with a guessed domain or wildcard.

## Verification

The automated checks use a disposable database and fictional accounts, not production customer or property records. They cover migration replay, permissions, counter concurrency, exact three-attempt blocking, direct-session access, recovery targeting, queued-mail claiming, provider failure and session revocation checks. Persistent browser checks operate the actual sign-in form and deployed handler source against PostgreSQL/PostgREST, test an actual failing data refresh with an unsaved property edit, and advance the browser clock to observe warnings and sign-out. Existing property publishing, separate-visitor website synchronization, receipts, deal transitions and mobile checks remain in CI.

A passing test with a stubbed mail provider proves the integration contract; it does not prove real inbox delivery. Complete a real recovery and mailbox delivery check once sender credentials and website URL are configured.

## Production checks and limits

A correct administrator sign-in through the deployed gateway returned real Supabase Auth tokens. The deployed status endpoint confirms ten idle minutes, three attempts, a fifteen-minute block and the requested Gmail recovery address. It also confirms that email sending is unconfigured. Recovery therefore returns an honest setup error rather than claiming delivery.

Lockout and publishing trials run in the isolated PostgreSQL browser workflow. No production lockout trial or live inbox delivery is claimed. The temporary production verification account is disabled and has no active sessions; permanent deletion through the connector returned an expired approval-state error. Its disabled account record remains for owner cleanup; no customer, property or payment records were created for this trial.

Supabase manages the pg_net extension's default request-queue grants. A grant-only migration did not override its owner-issued PUBLIC grant. The single-use worker-token design removes reusable secrets from those logs without rebuilding the extension. The extension namespace advisor warning remains; moving/recreating production infrastructure was not necessary for this application fix and was not performed.

The earlier production-account lockout trial was stopped by automatic approval review because it could leave persistent test records. Lockout verification was completed in the isolated browser/database environment instead. The live administrator’s successful sign-in was verified separately; no live lockout or inbox-delivery result is claimed.
