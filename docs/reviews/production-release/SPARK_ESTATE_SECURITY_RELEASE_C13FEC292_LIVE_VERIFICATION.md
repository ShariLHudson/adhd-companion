# Security Release `c13fec292`: Live Verification

**Result: the four live checks are BLOCKED.**
- This session's network policy refuses connections to `ecosystem.visualsparkstudios.com`. I tested both the site root and `/api/tts`; the proxy returned `connect_rejected` (organization policy).
- The browser here uses the same proxy, so I could not open the sign-in page either.
- Nothing was changed: no code, no deployments, no permissions. The Brain release stays on **HOLD**.

**Rollback: not indicated.**
- Production's logs since the deploy show no new errors.
- Attachment reads are succeeding.
- The two errors that appear in the logs were already happening before the release (§3).

---

## 1. Deployed commit

| Evidence | Value |
|---|---|
| `origin/main` | `c13fec292b79f8bbdcd8b9d4ec9c6aef995f5bac` |
| Vercel status on that commit | **success**, "Deployment has completed", 2026-10-09 00:43:57 UTC, deployment `9WmMCMFTu4yv2DVL7sLatCKvX4Sz` |
| Is `ecosystem.visualsparkstudios.com` serving that deployment? | **Not confirmable here.** I can't reach the domain or `vercel.com`, and GitHub's deployments API refuses this session (403). |

**To confirm:** Vercel → *adhd-business-companion-vs3* → Deployments → the **Production / Current** deployment should read `c13fec292` (`9WmMCMFTu4yv2DVL7sLatCKvX4Sz`).

## 2. The §4 checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Signed-out requests to `/api/tts`, `/api/ecosystem/user-health` and `/api/ecosystem/signals` are refused | **BLOCKED** | Host refused by the network policy. On the commit itself, the route tests pass **40/40**: all three return 401 with no member. |
| 2 | Signed-in chat and voice work | **BLOCKED** | Host refused; I can't open the sign-in page for you. |
| 3 | Founder dashboard needs its existing credentials and opens with them | **BLOCKED** | Host refused. The release doesn't touch the dashboard routes (`advisor`, `postcraft/drafts` are not in the diff `0620aa0a8..c13fec292`). |
| 4 | A test attachment saves, reopens and survives reload (dedicated test account) | **BLOCKED** | Host refused. Supporting evidence: production's attachment check ran right after the deploy (`GET companion_work_attachments` → **200**, 00:44:37 UTC). In the database, a member reads only their own attachments and a signed-out visitor is denied (verified earlier today). Data is unchanged: 55 rows, 51 files. |

## 3. Production logs since the deploy (Supabase, 00:44–01:00 UTC)

| Signal | Since the deploy | Before the deploy (previous 24 h) | Caused by this release? |
|---|---|---|---|
| `companion_work_attachments` reads | 200 | — | — |
| Attachment permission errors from the app | **0** | — | No |
| `permission denied for table ecosystem_user_health` (the app's save of user-health returns 403) | 2 | **14**, every few hours since at least 2026-10-08 12:00 | **No.** It predates this release. |
| `GET /rest/v1/buckets?id=eq.companion-work-attachments` → 404 | 3 | **41**, never a 200 | **No.** It predates this release. |
| Other `permission denied` lines | 1, from my own read-only signed-out test | — | Expected |

**Two pre-existing defects, logged and not fixed (no changes authorized):**
- **D9:** the ecosystem user-health save has been refused by the database since before this release. A member's ecosystem health record is not being saved.
- **D10:** a storage bucket check queries the wrong endpoint and always gets 404. It looks harmless, because attachment reads succeed.

## 4. Unblocking

Do **either** of the following.

**(a) Let this session reach the site:**
1. Open the cloud environment menu in the session title bar → **Edit** → **Network access**.
2. Add `ecosystem.visualsparkstudios.com` under **Allowed domains**, and leave *Allow package managers* ticked. Steps: https://code.claude.com/docs/en/cloud-environments#network-access
3. Then I'll open the sign-in page and ask you to sign in to the test account. I will never ask for a password.

**(b) Run the checks yourself (about 5 minutes):**
1. In a private window, open the site.
2. In the console, run:

   ```js
   fetch('/api/tts',{method:'POST'}).then(r=>r.status)
   ```

   Expect **401**. Repeat for `/api/ecosystem/user-health` and `/api/ecosystem/signals`.
3. Sign in to the test account:
   - chat replies;
   - voice plays;
   - attach a file to a piece of work, reload, reopen it.
4. Open the founder dashboard with its credentials.

**Rollback (only if a check fails):**
- **Code:** in Vercel, **Promote** `8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`.
- **Database:**

  ```sql
  grant references, trigger, truncate on public.companion_work_attachments to anon, authenticated;
  ```
