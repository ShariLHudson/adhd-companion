# Spark Estate Security Release `c13fec292`: Applied

**Status: LIVE in production (2026-10-09).**
- The code and the attachment-permission database change are both applied.
- Every check I could run from here passed, and production data is unchanged.
- The live HTTP checks need you (§4), because this environment can't reach the production site.
- The Brain release (`0cb567fe7`) stays on **HOLD**.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| `main` before | `0620aa0a8` (production deployment `8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`) |
| `main` now | **`c13fec292`**, a fast-forward with no merge commit |
| Vercel production deployment | **`9WmMCMFTu4yv2DVL7sLatCKvX4Sz`**, "Deployment has completed" |
| Database | production project `weercszpdcxjxauxrhmj`, migration `20261009004054 work_attachments_privileges` |

---

## 1. Pre-checks: everything matched the reviewed package

| Check | Reviewed | Found before applying |
|---|---|---|
| `main` | `0620aa0a8` | `0620aa0a8` ✅ |
| Release branch `hotfix/p0-security-followup` | `c13fec292` = `515d77f57` (code, 7 files) + the SQL file | identical; 8 files, +84/−3, direct descendant of `main` ✅ |
| Founder-dashboard routes (`/api/ecosystem/advisor`, `/postcraft/drafts`) | not touched (strict guard kept) | not in the diff ✅ |
| Package tests (`memberAuth.route`, `modelRoutes.authRatchet`, `serverMemberAuth`) | pass | **40/40** ✅ |
| Grants: `anon` | REFERENCES, TRIGGER, TRUNCATE | same ✅ |
| Grants: `authenticated` | INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | same ✅ |
| Row security / policies | on, 3 table + 4 storage | same ✅ |
| Data | 55 rows `f7f491e76fdc61bb6cc5ceeb29dc97ef`; 51 files `f77a90c2b5df484372329c12b4af482f` | same ✅ |
| Migrations | `20261002165415`, `20261004131157` | same ✅ |

## 2. What was applied

**Database:** exactly the four documented statements.

```sql
revoke all on public.companion_work_attachments from anon;
revoke truncate, references, trigger on public.companion_work_attachments from authenticated;
grant select, insert, update on public.companion_work_attachments to authenticated;
grant all on public.companion_work_attachments to service_role;
```

**Code:** `main` was fast-forwarded `0620aa0a8 → c13fec292`, and Vercel deployed production. The code:
- removes the auth bypass on production builds;
- makes voice (TTS) and the ecosystem `signals` / `user-health` writes require a signed-in member.

Nothing else changed. In particular, D2 (the same `TRUNCATE` fix for other tables) was **not** applied, because it wasn't approved.

## 3. Verification after applying

| Check | Result |
|---|---|
| Grants: `anon` | **none** ✅ |
| Grants: `authenticated` | **INSERT, SELECT, UPDATE** ✅ (no TRUNCATE) |
| Grants: `service_role` | unchanged ✅ |
| A signed-out visitor reads attachments (as `anon`) | **permission denied** ✅ |
| A member reads attachments: the member with the most | sees **44, all their own** (1 owner); storage: 40 of their own files ✅ |
| A member reads attachments: a second member | sees **1, their own** (1 owner); 1 file ✅ |
| An unrelated signed-in account | sees **0** rows, **0** files ✅ |
| Row security and policies | on; 3 table policies, 4 storage policies, unchanged ✅ |
| **Data unchanged** | 55 rows `f7f491e7…`, 51 files `f77a90c2…`: **identical to before** ✅ |
| Migration recorded | `20261009004054 work_attachments_privileges` ✅ |

**How these checks ran:**
- Member checks ran as read-only transactions, using the real `authenticated` and `anon` roles with a member's identity, which is how the app's requests reach the database.
- No production rows were written; for that reason I didn't create a new attachment.
- `TRUNCATE` was checked through privileges, not attempted.

## 4. Not verified live, so please run these (about 5 minutes)

This environment's network policy blocks `adhd-business-companion-vs3.vercel.app`, so I could not send HTTP requests to production.

1. **Signed out.** In a private window, open production, then in the browser console run:

   ```js
   fetch('/api/tts',{method:'POST'}).then(r=>r.status)
   ```

   Expect **401**. Do the same for `/api/ecosystem/user-health` and `/api/ecosystem/signals`.
2. **Signed in:**
   - chat replies;
   - voice playback works.
3. **Founder dashboard:** it opens with its token, as before.
4. **Attachments:**
   - attach a file to a piece of work;
   - reload and open it again; it opens.
5. **Second account:** in another browser, it sees none of your attachments.

## 5. Rollback (if any check in §4 fails)

1. **Code:** in Vercel → Deployments, **Promote** `8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`. Then revert `515d77f57` and `c13fec292` on `main`.
2. **Database:** restores the exact prior grants.

   ```sql
   grant references, trigger, truncate on public.companion_work_attachments to anon, authenticated;
   ```

## 6. Still on HOLD

- **Brain release `0cb567fe7`:** unchanged; nothing merged.
- **`a9872ea0e`:** already contained in the Brain candidate; nothing from it was released separately.
