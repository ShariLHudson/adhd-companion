# D9 Release: Applied

**Status: LIVE in production (2026-10-09).** The reviewed D9 package (`48c4c8af3` + `d88a718ec`) is applied: the database grant and the code.
- The server-role save, update and read-back passed on all 11 tables, using marked test records.
- Those records are removed. Visitor and member restrictions and row security are unchanged.
- **Still blocked:** the live checks through the website, because this session can't reach the site (§5).
- The Brain release stays on **HOLD**.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| `main` before | `c13fec292` (production deployment `9WmMCMFTu4yv2DVL7sLatCKvX4Sz`) |
| **`main` now** | **`d88a718ec`**, a fast-forward with no merge commit, and exactly the reviewed commits `48c4c8af3` + `d88a718ec` |
| **Vercel production deployment** | **`DFZr6ayHwRWZvjKPh2hfwKmAKQtg`**, "Deployment has completed" 01:27:52 UTC. (`8tkQSyPvx…` on the same commit is the earlier branch preview.) |
| Database migration | `20261009012600 founder_ecosystem_server_access` |

---

## 1. Error messages: checked before approval

**Every new message is in one of three groups:**

| Kind | Wording pattern | Examples |
|---|---|---|
| **Failed load** | "Could not load …" | "Could not load user health." · "Could not load signals." · "Could not load the sync queue." · "Could not load revenue intelligence." |
| **Failed write, nothing saved** | "Could not save/delete … Nothing was saved/deleted." | "Could not save activity. Nothing was saved." · "Could not save draft. Nothing was saved." · "Could not delete item. Nothing was deleted." |
| **Uncertain outcome** | says what may already have happened | "Could not save signals. Some or all were not saved." · "PostCraft may already have received this draft; check PostCraft before retrying." · "The Google file may already have been updated." · "Its old copy was already removed; save again to restore it." |

**What all errors share:**
- They are HTTP **503** with `code: "store_unavailable"`.
- None carries `ok: true`.
- None reports success.

**Three wording imprecisions, accepted as they are.** None misreports success; the package was approved as reviewed, so they weren't changed. They are follow-up nits:
1. Two single-write failures don't add "Nothing was saved." Both are on the PostCraft publishing route: `cancel` → "Could not save the publishing status.", and the webhook → "Could not save the PostCraft status update." Both are single writes, so nothing was saved.
2. Generating a PostCraft draft from an opportunity first loads signals. If that **load** fails, the reply says "Could not save draft. Nothing was saved." The outcome is true, but the category says "save".
3. In the PostCraft webhook, if the status save succeeds but the follow-up load fails, the reply says "Could not load publishing status." It doesn't say the update was saved. A retry is harmless, because the save is an upsert.

## 2. Pre-checks: matched the reviewed baseline

| Check | Expected | Found |
|---|---|---|
| `main` | `c13fec292` | `c13fec292` ✅ |
| Branch head | `d88a718ec`, parent `48c4c8af3`, parent `c13fec292` | same ✅ |
| 11 tables: `service_role` | REFERENCES, TRIGGER, TRUNCATE | same on all 11 ✅ |
| 11 tables: `anon`, `authenticated` | none | none ✅ |
| Row security / policies | on / 0 | on / 0 on all 11 ✅ |
| Rows | 0 | 0 on all 11 ✅ |

## 3. Applied

**Database:** exactly the two statements in `d88a718ec`.
- `service_role`: SELECT, INSERT, UPDATE, DELETE on `founder_projects`, `founder_experiments`, `founder_notes`.
- `service_role`: SELECT, INSERT, UPDATE on the 8 `ecosystem_*` tables.

**Code:** `main` was fast-forwarded `c13fec292 → d88a718ec`, and Vercel deployed production.

**Grants after applying:**

| | Result |
|---|---|
| Founder tables, `service_role` | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ✅ |
| Ecosystem tables, `service_role` | INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE (no DELETE) ✅ |
| `anon` / `authenticated` | **0 of 88** read/write permissions across the 11 tables ✅ |
| Row security | on, 0 policies, unchanged ✅ |

## 4. Verification in production

| Check | Result |
|---|---|
| **Save** as the server role: one `D9-TEST-…` record in each of the 11 tables | ✅ 11/11 |
| **Update** through the app's upsert path (`founder_projects`, `user_health`, `signal_counts`) and plain update (`content_drafts`, `cost_events`) | ✅ |
| **Read-back** as the server role | ✅ 11/11 with the updated values (title "updated", login count 2, signal count 2, cost 1) |
| Signed-out visitor reads `ecosystem_user_health` | **permission denied** ✅ |
| Signed-in member reads `founder_projects` | **permission denied** ✅ |
| Server role can delete ecosystem rows | **no**, by design (the code never deletes them) ✅ |
| **Cleanup** | Deleted by exact key plus test marker: **exactly 11 rows, one per table**. Afterwards all 11 tables have 0 rows and 0 `D9-TEST` rows ✅ |
| **Failed operations no longer report success** | **Deployed code** (`48c4c8af3` is in `d88a718ec`). Proven before approval: against a database with production's old grants, the real store code threw `FounderStoreError` ×5; route tests return 503 `store_unavailable` with no `ok` (12/12). I did not re-break production to repeat it live. |

**Incident during testing, no effect.** One test call (a server-role delete meant to show it is refused) timed out in the tool before it reached the database:
- no log entry;
- the test row was intact;
- no session or transaction was left open.

The no-delete rule was confirmed from the permission table instead.

## 5. Still blocked

These need a session that can reach `ecosystem.visualsparkstudios.com`. This one can't (network policy).

| Check | Status |
|---|---|
| Domain serves `d88a718ec` | **BLOCKED.** Vercel reports deployment `DFZr6ayHwRWZvjKPh2hfwKmAKQtg` completed for `d88a718ec`; the domain itself can't be checked from here. |
| Security checks 1–4 for `c13fec292` (signed-out 401s; chat and voice; dashboard credentials; test attachment) | **BLOCKED** |
| D9 through the app: dashboard User Health and signals load; a member's activity appears; a PostCraft draft survives reload | **BLOCKED.** There has been no app traffic to these tables since the deploy, so I can't see it in the logs yet. |

All of these are in one hand-off task, *"Run live checks: security c13fec292 + D9"*. That replaces the earlier security-check card, which was already dismissed. **D10** stays a separate small cleanup task.

## 6. Rollback (if a live check fails)

1. **Code:** in Vercel, **Promote** `9WmMCMFTu4yv2DVL7sLatCKvX4Sz` (`c13fec292`).
2. **Database:**

   ```sql
   revoke select, insert, update, delete on public.founder_projects, public.founder_experiments, public.founder_notes from service_role;
   revoke select, insert, update on public.ecosystem_signal_counts, public.ecosystem_content_drafts, public.ecosystem_postcraft_sync, public.ecosystem_postcraft_publishing, public.ecosystem_user_health, public.ecosystem_revenue_events, public.ecosystem_cost_events, public.ecosystem_google_assets from service_role;
   ```

   This restores the earlier grants exactly; the restore was tested locally.
