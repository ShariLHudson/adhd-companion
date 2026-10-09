# Message for the session with browser access: Spark Estate live checks

*Paste everything below the line into the session that can open https://ecosystem.visualsparkstudios.com.*

---

Please run the live checks on Spark Estate production. Report each check as **PASS**, **FAIL** or **BLOCKED**, with evidence: HTTP status codes, the exact text on screen, and timestamps.

## What is deployed

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Production `main` | **`d88a718ec`**, a fast-forward that contains `c13fec292` → `48c4c8af3` → `d88a718ec` |
| Vercel production deployment | **`DFZr6ayHwRWZvjKPh2hfwKmAKQtg`** (completed 2026-10-09 01:27:52 UTC) |
| `c13fec292` | **Security release:**<br>• production builds no longer honour the sign-in bypass;<br>• voice (TTS) and the ecosystem `user-health` and `signals` writes need a signed-in member;<br>• visitors have no access to work attachments, and members have only SELECT, INSERT and UPDATE, on their own rows. |
| `48c4c8af3` | **D9 code:** founder and ecosystem stores return an honest error (HTTP 503, `store_unavailable`) instead of "ok" when the database refuses. |
| `d88a718ec` | **D9 database:** the server role was granted access to 11 founder/ecosystem tables; this is already applied to the production database. |

## Rules

- **No changes of any kind:** no code changes, no deployments, and no database or permission changes.
- **Never ask for a password in chat.** If sign-in is needed, open the sign-in page in the browser and ask the founder to sign in themselves.
- Use a **dedicated test account** for the member checks, not the founder's real account.
- The **Brain release (`0cb567fe7`) stays on HOLD.**
- If this session can't reach the site either, say so and stop. Don't retry.

## Checks

**0. Deployed commit.** In Vercel (project *adhd-business-companion-vs3* → Deployments), confirm that Production / Current is `d88a718ec` / `DFZr6ayHwRWZvjKPh2hfwKmAKQtg`, or ask the founder to confirm it.

**1. Signed-out refusals.** In a private window with no session, send a POST to each of `/api/tts`, `/api/ecosystem/user-health` and `/api/ecosystem/signals`. Each should return **401**. For example, in the browser console on the site:

```js
fetch('/api/tts',{method:'POST'}).then(r=>r.status)
```

**2. Chat and voice.** Signed in as the test account, chat replies and voice playback works.

**3. Founder dashboard.** It refuses access without its existing credentials and opens with them.

**4. Attachment.** Signed in as the test account:
- attach a file to a piece of work; it saves;
- reopen it;
- reload the page; it is still there and opens.

**5. D9 through the app.**
- After the test account has been active, the founder dashboard's **User Health** and **signal** sections load: no "unavailable" or "Could not load…" message, and the activity appears.
- Create one PostCraft draft whose title starts with `D9-TEST`, reload, and confirm it persisted.
- Give the founder the draft's id so it can be removed. Don't delete it yourself unless the founder asks.

## If a check fails

1. Diagnose it, using:
   - Vercel function logs;
   - Supabase logs for project `weercszpdcxjxauxrhmj`;
   - the browser's network tab.
2. Say whether rollback is needed.
3. Roll back **only with the founder's approval:**
   - **Code:** in Vercel, Promote `9WmMCMFTu4yv2DVL7sLatCKvX4Sz` (`c13fec292`, before D9), or `8ZB5ugCdoTfuwSqBZYEdE8a5pXLe` (before the security release).
   - **D9 grants:**

     ```sql
     revoke select, insert, update, delete on public.founder_projects, public.founder_experiments, public.founder_notes from service_role;
     revoke select, insert, update on public.ecosystem_signal_counts, public.ecosystem_content_drafts, public.ecosystem_postcraft_sync, public.ecosystem_postcraft_publishing, public.ecosystem_user_health, public.ecosystem_revenue_events, public.ecosystem_cost_events, public.ecosystem_google_assets from service_role;
     ```

   - **Attachment grants (only if check 4 fails because of permissions):**

     ```sql
     grant references, trigger, truncate on public.companion_work_attachments to anon, authenticated;
     ```

**Known and harmless:** D10, a 404 in the Supabase logs from the attachment readiness check.

## Deliver

Write `SPARK_ESTATE_PRODUCTION_LIVE_RESULTS_D88A718EC.md` with the six results (0–5) and their evidence. Push it to `ShariLHudson/adhd-companion`, branch `claude/one-brain-convergence-audit-603ck1`, folder `docs/reviews/production-release/`. If that session can't push there, give the founder the file instead.
