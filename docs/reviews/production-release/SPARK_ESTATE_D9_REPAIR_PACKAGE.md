# D9 Repair Package: Founder and Ecosystem Data Saving

**Status: ready for your approval. Nothing is in production.**
- The repair is on its own branch: no merge, no deploy, and no change to the production database.
- The Brain release stays on **HOLD**.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Branch | **`hotfix/d9-ecosystem-server-access`** (from production `c13fec292`) |
| Commits | `48c4c8af3` honest failures (code) · **`d88a718ec`** database grant (`supabase/migrations/20261009_founder_ecosystem_server_access.sql`) |
| Production | unchanged: `main` = `c13fec292`; grants as in §1 |

---

## 1. Which role needs access, and why

**Who uses these tables:** only the server reads and writes the 11 founder and ecosystem tables. It does so through `getFounderSupabaseAdmin()`, the **`service_role`** key. No member or visitor code touches them.

**Root cause (found in production, read-only):**
- This project's default privileges for new `public` tables give `service_role` only TRUNCATE, REFERENCES, TRIGGER and MAINTAIN.
- Tables created without explicit grants are therefore unusable by the server.
- The 2026-10-04 hardening correctly removed `anon` and `authenticated`; nothing ever granted `service_role` its read/write access.

**Least privilege, from what the code actually calls:**

| Tables | Code operations | Granted to `service_role` |
|---|---|---|
| `founder_projects`, `founder_experiments`, `founder_notes` | select, upsert, delete | SELECT, INSERT, UPDATE, **DELETE** |
| `ecosystem_signal_counts`, `_content_drafts`, `_postcraft_sync`, `_postcraft_publishing`, `_user_health`, `_revenue_events`, `_cost_events`, `_google_assets` | select, upsert only | SELECT, INSERT, UPDATE (**no DELETE**) |
| all 11, for `anon` and `authenticated` | none | **nothing** (unchanged) |

Row security stays **on** with **no policies**, so no member or visitor can reach a row. `service_role` bypasses row security by design.

**Rollback** (restores today's production grants exactly):

```sql
revoke select, insert, update, delete on public.founder_projects, public.founder_experiments, public.founder_notes from service_role;
revoke select, insert, update on public.ecosystem_signal_counts, public.ecosystem_content_drafts, public.ecosystem_postcraft_sync, public.ecosystem_postcraft_publishing, public.ecosystem_user_health, public.ecosystem_revenue_events, public.ecosystem_cost_events, public.ecosystem_google_assets from service_role;
```

## 2. Honest errors instead of false "ok"

**Before:** 8 of the 9 stores logged a refused save, then answered **`ok: true`** or kept the item in one server instance's memory and showed that as real data.

**Now:** when a database read or write fails, each store throws `FounderStoreError`.
- Routes answer **503** with `code: "store_unavailable"` and a plain message, e.g. *"Could not save activity. Nothing was saved."*
- Where an outside service may already have received something, the message says so. For example: *"PostCraft may already have received this draft; check PostCraft before retrying."*
- The business dashboard marks the signal sections **unavailable** in its existing error list instead of showing fallback numbers.
- Local development without a database key still uses memory, as before.

**Routes covered:**
- `ecosystem/` routes: `user-health`, `signals`, `postcraft` (export, drafts, sync, publishing), `cost`, `revenue`, `google-workspace`, `intelligence-hub`, `briefing`, `advisor`;
- `founder/workspace/items`.

**Not changed:**
- No auth checks: signed-out is still 401, and dashboard routes still need their token.
- No member-facing feature.

## 3. Tests

### Local database with production's exact table definitions and grants

The 11 tables were rebuilt from production's own definitions, with production's grants (row security on, 0 policies). The checks ran through the real Supabase data API.

| Check | Before the grant (= production today) | After the grant |
|---|---|---|
| Server key: save (insert) | **403** ×11 | **201** ×11 |
| Server key: save again (update) | 403 | **200** ×11 |
| Server key: read back | 403 | **1 row** ×11 |
| Server key: delete, founder tables | 403 | **204**, row gone |
| Server key: delete, ecosystem tables | 403 | **403** (not granted; the code never deletes) |
| Signed-out visitor: select / insert / delete | 401 | **401** ×11 |
| Signed-in member: select / insert / delete | 403 | **403** ×11 |
| Applied twice | — | identical result |
| Rollback, then re-apply | — | rollback restored today's grants **exactly** on all 11; re-apply worked |

### The repaired code against that real database

| Check | Result |
|---|---|
| **Granted:** user health saves and reads back (login count 1) | ✅ |
| **Granted:** cost event saves and reads back (amount 1.25) | ✅ |
| **Granted:** signal saved twice reads back count 2 | ✅ |
| **Granted:** founder note saves, reads back, deletes | ✅ |
| **Refused** (production grants): user health, cost, founder note, signals throw `FounderStoreError` with the right table and operation; nothing reported as saved | ✅ ×5 |

### Unit and route tests (Vitest)

| Suite | Result |
|---|---|
| New: 8 ecosystem stores (save + read-back; refused save throws and nothing appears; refused load throws, no stale data) | **24/24** |
| New: founder workspace (save + read-back; refused load, save and delete each throw) | **3/3** |
| New: real route handlers for `user-health`, `signals` (increment + reconcile), `postcraft/drafts`, `founder/workspace/items`: signed-out **401** · success **200** · refused **503 `store_unavailable`, no `ok`** | **12/12** |
| `lib/ecosystem`, `lib/founderWorkspace`, `lib/ghl`, `lib/memberScope`, member-auth and auth-ratchet suites | **502 passed, 2 failed (504)**. The 2 failures also fail on unmodified `main` (`founderAiAdvisor` cost fallback; `userIntelligenceEngine` counts; both date-dependent). |
| Without the fix | 22 of the 39 new tests fail |
| TypeScript | **365 errors, the same as `main`**; none in the touched areas |

## 4. Production approval request

**Approve D9: grant `d88a718ec` and code `48c4c8af3`.** Proposed order:
1. Re-snapshot production grants. Stop if they differ from §1.
2. Apply the migration and verify the grants.
3. Fast-forward `main` to `d88a718ec`; Vercel deploys.
4. Smoke test from a session that can reach the site:
   - the founder dashboard's User Health and signals sections load without "unavailable";
   - one signed-in activity appears in User Health;
   - a PostCraft draft saves and survives reload.

**Order risk:**
- If the code deploys before the grant, those dashboard routes return honest 503s until the grant is applied.
- If the grant goes first, the data starts saving under the old code.

Either order is safe. The grant first is smoother.

## 5. Notes

- **Founder-only table names:** a dashboard error can now read *"Could not load founder_projects."* That is founder-only, not member-facing.
- **Reads that write:** loading User Health also writes refreshed health statuses, so the read needs the write grant too. The grant covers that.
- **Partial saves:** signals and PostCraft multi-step writes can be partly saved; their messages say so.
- **Same gap, unused tables:** `subscriptions`, `user_data` and `app_heartbeat` have the same default-privilege gap and give `TRUNCATE` to signed-out visitors (D2). No app code uses them. They are not included here.

## 6. Hand-offs

| Item | Where |
|---|---|
| **Four live security checks on `c13fec292`** (signed-out refusals; chat and voice; dashboard credentials; test attachment) | Queued as a separate task, *"Run live security checks on c13fec292"*, for a session or machine that can reach `ecosystem.visualsparkstudios.com`. Not retried here. |
| **D10** (readiness check queries the wrong endpoint first; harmless 404) | Queued as a small cleanup task, *"Clean up attachment readiness bucket check"* |
