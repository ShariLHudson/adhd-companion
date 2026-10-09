# Security Release `c13fec292`: Live Checks, D9 and D10

**Summary:**
- **All four live checks are BLOCKED.** `ecosystem.visualsparkstudios.com` is still refused by this session's network policy (re-tested 2026-10-09).
- **D9 is wider than one table:**
  - The server cannot read or write **any of 11 founder/ecosystem tables**.
  - It **predates this release**, and all 11 tables are empty, so no data was lost.
  - Most failed writes are **not** reported honestly: the app says "ok".
- **D10 is log noise from a working readiness check.** Severity: low.
- **No rollback is indicated.**
- Production is unchanged: no code, deployment, data or permission changes. The Brain release stays on **HOLD**.

---

## 1. Live checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 0 | Deployed commit is `c13fec292` | **PARTIAL** | `main` = `c13fec292`; Vercel deployment `9WmMCMFTu4yv2DVL7sLatCKvX4Sz` "completed". I can't confirm the domain serves it (no access to the site, `vercel.com`, or GitHub's deployments API). |
| 1 | Signed-out TTS / user-health / signals → refused | **BLOCKED** | Host refused (`connect_rejected`). The commit's route tests pass 40/40. |
| 2 | Signed-in chat and voice work | **BLOCKED** | Host refused; I can't open the sign-in page for you. |
| 3 | Founder dashboard needs its credentials and opens | **BLOCKED** | Host refused. The release doesn't touch the dashboard routes. **Note (D9):** once open, most dashboard sections show empty or in-memory data. |
| 4 | Test attachment saves, reopens, survives reload | **BLOCKED** | Host refused. Database checks earlier today passed: own rows only, signed-out denied, data unchanged. |

**To unblock:** add `ecosystem.visualsparkstudios.com` under **Allowed domains** in this environment's Network access settings (session title bar → Edit). Or run §4b of *…_LIVE_VERIFICATION.md* yourself.

---

## 2. D9: the server key has no table access on 11 founder/ecosystem tables

### Cause

These tables have row security on and no policies. The 2026-10-04 hardening correctly removed `anon` and `authenticated`. But **`service_role`, the server's key, holds only REFERENCES, TRIGGER and TRUNCATE**: no SELECT, INSERT, UPDATE or DELETE. So every server read or write is refused with `permission denied` (HTTP 403 from the database API).

| Table | `service_role` grants | Rows |
|---|---|---|
| `founder_projects`, `founder_experiments`, `founder_notes` | REFERENCES, TRIGGER, TRUNCATE | 0 |
| `ecosystem_signal_counts`, `ecosystem_user_health` | same | 0 |
| `ecosystem_content_drafts`, `ecosystem_postcraft_sync`, `ecosystem_postcraft_publishing` | same | 0 |
| `ecosystem_revenue_events`, `ecosystem_cost_events`, `ecosystem_google_assets` | same | 0 |

For comparison, `companion_work_attachments` has full `service_role` access and works.

### Is it this release?

**No.** Database refusals were already logged before the release: `ecosystem_user_health` from 2026-10-08 12:52 UTC, and `ecosystem_signal_counts` 10 times. The release changes no grants on these tables. All 11 tables are empty, so nothing that was saved has been lost; nothing was ever saved.

### Affected features

| Feature | Table(s) | What members or you see on failure | Honest? |
|---|---|---|---|
| **Founder Workspace** (projects, experiments, notes) | `founder_*` | Load fails → the API returns **500** "could not load"; saves throw → **500** | ✅ Yes, an error is shown |
| **User Health** (dashboard section + members' background activity) | `ecosystem_user_health` | Save logs the error and the API still returns **`ok: true`** (`userHealthEngine.ts` `saveHealthRecord`). The dashboard falls back to whatever is in one server instance's memory and shows it as real. | ❌ No |
| **Signals** (members' background counts → dashboard insights) | `ecosystem_signal_counts` | Load falls back to in-memory counts; the client is fire-and-forget | ❌ No |
| **PostCraft drafts, sync, publishing** | `ecosystem_content_drafts`, `_postcraft_sync`, `_postcraft_publishing` | A draft "saves" into memory only, returns success, and is gone on the next cold start | ❌ No |
| **Revenue and cost intelligence** | `ecosystem_revenue_events`, `_cost_events` | Events are logged and dropped; reports show in-memory or empty figures | ❌ No |
| **Google Workspace assets** | `ecosystem_google_assets` | Same pattern | ❌ No |

**Member impact:**
- Members don't see these features directly; they are founder-dashboard data and anonymous background telemetry.
- Member chat, work, Create, attachments and account sync use other tables and are **not** affected.
- Since `c13fec292`, signed-out background calls are refused (401) by design. Signed-in calls still carry the member token and reach the refused tables.

### Proposed fix (NOT applied; needs your approval)

1. **Database:**

   ```sql
   grant select, insert, update, delete on public.<each of the 11 tables> to service_role;
   ```

   - No `anon` or `authenticated` access.
   - Row security stays on with no policies, so only the server can read or write.
   - Rollback:

     ```sql
     revoke select, insert, update, delete on … from service_role;
     ```

2. **Code, separately:** make the eight "log and say ok" stores return an error, so a failed save is shown honestly instead of kept in memory.

---

## 3. D10: classification

**What it is:** `lib/workAttachments/readiness.ts`, the attachment readiness check behind `GET /api/work-attachments/ready`. It decides whether the paperclip upload is enabled.

**Why the 404:**
- It first asks the database API for `buckets`. That table lives in the `storage` schema, which the API doesn't expose, so every call returns **404** (41 in the last 24 hours, none ever succeeding).
- It then **falls back** to `storage.listBuckets()`, which works. The check passes and attachments work.
- One side-effect: when the fallback runs, a missing bucket size limit is treated as OK.

**Classification:** **cosmetic / log noise, low severity.** It is not a security issue and does not break anything. The fix is a one-line code change: query `storage.listBuckets()` directly. It isn't urgent.
