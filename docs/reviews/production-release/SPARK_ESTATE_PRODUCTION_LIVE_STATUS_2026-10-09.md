# Production Live Checks: Status, 2026-10-09 11:50 UTC

**Have the live checks been completed? No.**
- No results report exists on any branch of `adhd-companion`.
- No other session has run them.
- This session still can't open the site: `ecosystem.visualsparkstudios.com` and `*.vercel.app` were re-tested at 11:46 UTC and refused by the network policy.

What *could* be checked from here: the production version, plus production database and log evidence from real use of the site since the D9 deploy. Some of that real use covers part of check 5.

**Nothing was changed:** no redeploy, no database change, no code change. The Brain release stays on **HOLD**.

## Production version today

| | |
|---|---|
| `main` | **`d88a718ec`** (unchanged since 01:14 UTC). It contains `c13fec292` → `48c4c8af3` → `d88a718ec`. |
| Vercel production deployment | **`DFZr6ayHwRWZvjKPh2hfwKmAKQtg`**, "Deployment has completed" 01:27:52 UTC; no newer deployment status |
| Domain serving it | not checkable here (BLOCKED) |

## Results

| # | Check | Result | Evidence |
|---|---|---|---|
| 0 | Domain serves `d88a718ec` | **BLOCKED** | `main` and Vercel both show `d88a718ec` / `DFZr6ayH…` as current; the domain can't be reached from here. |
| 1 | Signed-out POST to `/api/tts`, `/api/ecosystem/user-health`, `/api/ecosystem/signals` → 401 | **BLOCKED** | These refusals happen in the app server, whose logs I can't see; the site is unreachable. |
| 2 | Signed-in chat and voice work | **BLOCKED** | A sign-in did happen at about 11:22 UTC (auth token issued; the account's records synced normally, with 329 reads and 631 updates all returning 200). But chat replies and voice go to OpenAI through the app server, which I can't observe. |
| 3 | Founder dashboard needs credentials, then opens | **BLOCKED** | Site unreachable. |
| 4 | Test attachment saves, reopens, survives reload | **BLOCKED** | No attachment has been created since the deploy (last one 2026-10-08 20:56). The 13 attachment reads since then all returned 200. |
| 5a | **D9: real app activity now saves** | **PASS** (from production evidence) | Signed-in use since 11:22 UTC wrote through the deployed app:<br>• `ecosystem_user_health`: 2 rows, latest 11:46 UTC; database API 201×2 and 200×4; reads 200×4.<br>• `ecosystem_signal_counts`: 1 row, 11:45 UTC; 201 and 200.<br>• **No "permission denied" errors** since the deploy. The only two were my own deliberate visitor/member refusal tests at 01:28.<br>These writes come only from the `user-health` and `signals` routes, which need a signed-in member, so the member check passed and the save landed. |
| 5b | D9: dashboard User Health and signals sections display | **BLOCKED** | The data is present, but I can't look at the dashboard. |
| 5c | D9: a PostCraft `D9-TEST` draft persists after reload | **BLOCKED** | No drafts have been created (`ecosystem_content_drafts` is empty). |

**Summary:** 1 PASS, 0 FAIL, 7 BLOCKED. **No rollback indicated.**

## New finding: D11, account updates rate-limited (predates both releases)

- **What happens:** while the app is in use, the browser calls `PUT /auth/v1/user` (update the account) hundreds of times an hour, and Supabase refuses **more than half** of those calls with **429 Too Many Requests**.
- **Scale this hour (11:00 UTC):** 162 accepted and 347 refused.
- **It predates both releases.** The same pattern ran all day yesterday, for example 08 Oct 13:00 (142 accepted, 159 refused) and 17:00 (236 accepted, 301 refused).
- **Likely callers:** the two places that update the account, `lib/firstLoginWelcome/persistence.ts` and `lib/companionUserLanguage.ts`.
- **Effect:** it isn't causing a visible failure that I can see. But it wastes requests, and a preference save that hits a 429 may be lost.
- **Recommendation:** treat it as a separate investigation, not part of these releases. Nothing was changed.

The same session also shows heavy account-record syncing: 631 updates in about 25 minutes. That rate is also the same as yesterday.

## Still needed

Run the consolidated hand-off (`MESSAGE_FOR_BROWSER_SESSION_LIVE_CHECKS.md`) from a session or computer that can open the site. Checks 0–4, 5b and 5c remain.

**To let this session do it instead:** add `ecosystem.visualsparkstudios.com` under **Allowed domains** in this environment's Network access settings (session title bar → Edit). After that, signed-in steps still need you to sign in yourself in the browser.
