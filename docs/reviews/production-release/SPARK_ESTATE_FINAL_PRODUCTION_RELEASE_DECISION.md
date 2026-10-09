# Spark Estate: Final Production Release Decision

## Decision: CONDITIONAL GO

A safe subset can enter production now. The rest waits on named conditions.

| Release | Commit | Decision |
|---|---|---|
| **Security release** (3 route protections + attachment privileges SQL) | `hotfix/p0-security-followup` @ **`c13fec292`** | **GO when you confirm.** You approved it on 2026-10-08. The newer gates instruction ("do not merge, deploy, change production data") arrived before anything ran, so **nothing was applied**. It needs one confirmation from you, then it runs exactly as documented in §6. |
| **Brain + Research/VTS + images release** | `release/final-2026-10-08` @ **`0cb567fe7`** | **HOLD.** All automated and simulated checks pass. Still open: the One Brain owner's review, a real-model desktop run, and a live two-account image check. **Images must launch switched off** (`SPARK_ART_DISABLED=1`) until the live privacy check passes. **Canva stays excluded** (the `CANVA_*` variables are not set). |

**Production is unchanged:** `main` is `0620aa0a8`; nothing merged, deployed or changed in the database. Investigation was read-only; the only writes were to new isolated branches.

**How to read the evidence labels:**
- **Implemented:** code committed.
- **Automated-tested:** unit tests and typecheck.
- **Simulated:** the real page in Chromium, with the model scripted and Supabase faked.
- **Local signed-in:** real sign-in against a local database with production's rules; model stubbed.
- **Live-preview-tested:** a Vercel preview with the real model.
- **Production-verified:** checked on production.

---

## 1. Reconciliation: the actual repository (`ShariLHudson/adhd-business-companion-vs3`)

| What | Commit | Notes |
|---|---|---|
| **Deployed production** | `0620aa0a8` (`main`) | Vercel production deployment `8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`, 2026-10-05 |
| **`main`** | `0620aa0a8` | P0 integrity hotfix |
| Integrated candidate (another session) | `release/int-2026-10-08-v4` @ **`df6a12a7b`** | = `d726efcf8` + V4 (`961e4c59a`) + image cost safety (`f5fc151b9`) + V5 `d25a32ea8` + "a switch never creates work". **Left untouched.** |
| V5 baseline | `visual/v5-assets` @ `d25a32ea8` | Included in `df6a12a7b` |
| Earlier candidate (mine) | `release/candidate-2026-10-08` @ `a9872ea0e` | Simulated 13/14 (D1); local signed-in 20/22 (2 outdated expectations). **Superseded** by the final branch below. |
| One Brain owner's certified commit | `one-brain/convergence` @ `81135935b` | Simulated 156/156 (2026-10-07); live never run |
| Security branch | `hotfix/p0-security-followup` @ `c13fec292` | §3 |
| **Final candidate (this round)** | `release/final-2026-10-08` @ **`0cb567fe7`** | = `df6a12a7b` + `a9872ea0e` (strict founder-dashboard guard) + D1 fix. Vercel preview built (`8US53bSCG6hX6f9Dm5GALwkPfPKP`). |

### Final candidate ancestry (verified with `git merge-base`)

| Included | Commit |
|---|---|
| Production `main` | `0620aa0a8` |
| One Brain convergence (certified simulated) | `81135935b`, incl. continuity `cd91d6dbd`, readability `dfa71596c` |
| Research/VTS lane | `b5fbc341b` |
| Research Source Workspace R2-2…R2-6 | `ebe1f5417` |
| VTS V1–V3 | `2e55688a5` |
| VTS V4 artwork + `VSS-IMG` image references | `77bfd7371` |
| V5 Matter continuity + creative assets + Canva Connect (env-gated) | `d25a32ea8` |
| Image cost safety: kill switch + 20/day cap | `f5fc151b9` |
| Work switching: a switch never creates work | `df6a12a7b` |
| Member persistence + AR1/AR2 + R8 reconciliation | `303bceec1` |
| Round 0A route protections + owner-only legacy claim | `8312d7a7e`, `d9f858f11` |
| "+" brings information in only | `d726efcf8` |
| Founder-dashboard routes keep production's stricter guard | `a9872ea0e` (merged as `c8dd5f9cf`) |
| **D1 fix:** a question never replaces an outline | `0cb567fe7` |

### Not included

| Excluded work | Why |
|---|---|
| Strategy repairs, 5 commits on `integration/one-brain-member-persistence` @ `a4738f50a` | Round 0A plan: port them as Brain rules, don't merge the Strategy code |
| Two late fixes on `candidate/one-brain-combined` | Unreviewed |
| `foundation/one-brain` | Its commits are carried in adapted form; its `+` "Do something" menu is removed |
| The security patch's own commits `515d77f57` / `c13fec292` | Their code protections are already in the candidate via `8312d7a7e`. The SQL is a database step. |

**Conflicts found and resolved:**
- **`df6a12a7b` had dropped the strict founder-dashboard guard.** It inherited `8312d7a7e`'s loosening. The final candidate restores production's guard (member + dashboard token) on `/api/ecosystem/advisor` and `/api/ecosystem/postcraft/drafts`, matching `main` byte for byte.

**Other agents' work was not overwritten:** `df6a12a7b`, `81135935b`, `visual/*` and `hotfix/*` are unchanged; all new work is on new branches.

---

## 2. One Brain owner review of the work-switching repair

| | |
|---|---|
| Owner | Cloud session `session_01Y9kmkVQc4auKGVbNpUKm2R` ("One Brain convergence") |
| Reachable? | **No.** Idle and disconnected since 2026-10-07 19:00 UTC. It is not listed as a reachable peer, and this session has no way to message a cloud session. |
| Outcome | **NOT REVIEWED.** No approval was invented. |

**What needs review:** `df6a12a7b` + V5 `71461797d`. Changed files: `lib/brain/interpret.ts`, `pipeline.ts`, `commit.ts`, `types.ts`.

Claimed behaviour and my evidence:

| Behaviour | Evidence here |
|---|---|
| Switch to existing work | Automated: `matterContinuity.test.ts` 10/10 |
| Unknown work → suggestions, never new work | Automated (same file); the commit notes "found live on the integrated preview" |
| Same-name disambiguation; "the first one" | Automated |
| Focus persists after reload | Simulated: continuity journey ✔ |
| No duplicate creation | Simulated: build integrity ✔ (repeated send never makes another piece) |
| Real-model check of switching | Not run (§7) |

**To close this gate:** open that session and ask it to review `df6a12a7b`'s `lib/brain/*` changes against `81135935b` and `docs/brain-contract.md`. Record APPROVED / APPROVED WITH CONDITIONS / REJECTED.

---

## 3. Security reconciliation

| Protection | In final candidate? | Required before Brain release? | Independently deployable? | Dependency |
|---|---|---|---|---|
| No sign-in bypass on production builds | ✅ (`8312d7a7e`) | Already covered by the candidate | ✅ `c13fec292` | None |
| `POST /api/tts` member-only | ✅ | Same | ✅ | None |
| `POST /api/ecosystem/user-health` / `/signals` member-only | ✅ | Same | ✅ | None |
| **Founder-dashboard routes: member + dashboard token** | ✅ restored (`a9872ea0e`) | Yes (must not loosen) | ✅ (the patch does not touch them) | None |
| **Attachment-table privileges** (no `TRUNCATE` for `anon` / `authenticated`) | n/a (database) | **Yes, before images go live**: images live in this table | ✅ SQL in `c13fec292` | One SQL step, approved; snapshot below |
| RLS on member records / Create / attachments; storage owner-folder policies | Production already | — | — | Applied 2026-10-02 / 09-13 |

**Production-build evidence for `c13fec292`:**
- With `NEXT_PUBLIC_COMPANION_AUTH_DISABLED=true`, every signed-out write is refused with **401**: tts, user-health, signals, chat, and a forged token.
- A signed-in member passes the guard.
- The dashboard GET and advisor stay strict.
- Patch tests 40/40; `app/api` suites have the same 24 pre-existing failures as `main`; TypeScript identical.

**Attachment privileges: reconfirmed on production 2026-10-08, read-only, unchanged since the review:**
- `anon`: REFERENCES, TRIGGER, TRUNCATE.
- `authenticated`: INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE.
- `service_role`: all. RLS on with 3 policies; 4 storage policies.
- Data fingerprint: 55 rows `f7f491e7…`; 51 files `f77a90c2…`.

**Verified locally on production's exact grants:** applied twice, owner insert/select/update work, another member sees 0, member/visitor `TRUNCATE` denied, rollback restored the snapshot exactly, re-apply worked.

**Rollback SQL:**

```sql
grant references, trigger, truncate on public.companion_work_attachments to anon, authenticated;
```

**Not approved, so not applied:** the same `TRUNCATE` revoke for `subscriptions`, `user_data` and `app_heartbeat` (D2).

---

## 4. Cross-account privacy gate: `VSS-IMG-A5449118`

| Step | Result |
|---|---|
| **Live test on `VSS-IMG-A5449118`** (main account → sign out → separate account → retrieve by reference and by file id) | **NOT VERIFIED LIVE.** This environment can't reach the preview or production (network policy), and no second live test account is available to it. Nothing was run while signed in as the main account. |
| Code review of `0cb567fe7` | A `VSS-IMG` reference is resolved only from the member's **own** synced visual store (client-side, member-scoped storage). The image file is served only through `/api/work-attachments/[id]`, which checks ownership before returning metadata or a 60-second signed link. |
| **Local two-account test** (real sign-in, local database with production's RLS and storage policies) | **9/9 passed.** Two distinct user ids (`e6e24a34…` / `1d8a4d8c…`). Account A stored a private image (`VSS-IMG-746FF396`) and could open it. Account B: by file id **403**, no metadata; download **403**, no link or content; artwork-thread listing **0**; storage folder listing **0**; database row **0** (RLS); A's reference and id appear **nowhere** in B's account records. Cleaned up. |
| Minor finding (D8) | For another member's file the route answers **403** instead of **404**, which confirms the id exists. No content or metadata is exposed. Recommend answering 404. |

**Gate status:** NOT VERIFIED LIVE. Images (V4 generation, V5 creative assets) launch with `SPARK_ART_DISABLED=1` until the live two-account test passes on the preview.

---

## 5. Final candidate checks

### Image cost and safety (`f5fc151b9`, in the final candidate)

| Item | Finding |
|---|---|
| Off switch | `SPARK_ART_DISABLED=1` (or `true`/`yes`/`on`) turns generation off everywhere; Spark says plainly that images can't be made right now |
| Daily limit | `SPARK_ART_DAILY_LIMIT`, **default 20** per member per UTC day. Counted from the member's own stored artworks, including removed ones. **Fails closed** when the count can't be read. `0` blocks all. Tests 3/3. |
| Known gap | The count is checked before generation, so two requests at the very same moment could exceed the limit by one. Low risk. |
| Provider and models | OpenAI Images, server-side only: `OPENAI_IMAGE_MODEL` if set, then `gpt-image-1`, then `dall-e-3`. Sizes 1024², 1536×1024, 1024×1536. |
| Cost | Charged per image by OpenAI at the published rate for the model and size. The worst case is 20 images × members × days; check OpenAI's current price list before enabling. Not measured here (no key). |
| Failure handling | Member-only route; explicit failure reasons (`not_configured`, `limit_reached`, provider error), never a fake image. Stored as the member's private attachment. |
| Canva | Off unless `CANVA_CLIENT_ID` + `CANVA_CLIENT_SECRET` are set; the buttons are hidden when not configured. **Keep unset (excluded).** |

### Migrations and environment

| Item | Status |
|---|---|
| Migrations | **None new.** `20261002_member_isolation_rls` is in the repo and already applied. No new tables; new record domains in `companion_member_records` (`brain_*`, `strategic_*`). |
| Required env (existing) | `OPENAI_API_KEY`, Supabase URL/anon/service keys |
| Optional / new env | `OPENAI_IMAGE_MODEL`, `SPARK_ART_DAILY_LIMIT` (default 20), `SPARK_ART_DISABLED`, `CANVA_*` (keep unset) |
| Kill switches | `ONE_BRAIN=0` / `NEXT_PUBLIC_ONE_BRAIN=0`, `NEXT_PUBLIC_MEMBER_SYNC=0`, `SPARK_ART_DISABLED=1` |

### D1 fixed in the shared outline path (`0cb567fe7`)

- **Cause:** when a chat turn ended with no reply (the request didn't finish in time), the shared turn guarantee filled the gap with a reflective question ("You're still sitting with this decision…") that reads like an answer.
- **Fix:** an outline turn now gets the honest P0-D failure line and **never a question**. An outline turn means the member asked for an outline, or Spark's last reply was one (shown and saved); "outline" uses the Brain's own `outlineSections`.
- **Tests:** 4 new; 3 fail without the fix. chatFastPath 48/48.

### Corrected security expectations (isolation suite, harness only)

The two checks that expected the old claim prompt now test the stricter Round 0A rule:
- **S5.1:** legacy data with no recorded owner is offered to nobody and kept untouched.
- **S5.1b:** the recorded owner is asked before anything is attached.
- **S5.4:** another member is never offered it, even when a different account is the recorded owner.

---

## 6. Final certification

### Automated (final `0cb567fe7`)

| Check | Result |
|---|---|
| Full unit suite | **21,041 tests; 590 failing.** **All 590 also fail on production `main`** (each failing file re-run on `main`; whole-file load failures matched). **0 new failures** vs `main` and vs the earlier candidate. 11 tests that fail on `main` pass. |
| Your production baseline (20,016 tests / 614 failing) | Not reproduced exactly in this environment. A full run of `main` here wasn't repeated this round (Round 0: `b25f96dcb` had 19,935 / 607). The comparison above is identity-based on this environment. |
| TypeScript | 365 errors, identical to the earlier candidate. One file+code pair differs from `main`, and it already exists on a parent. |

### Simulated (final `0cb567fe7`, production build, scripted model, fake Supabase, desktop)

**14/14 passed:**
- boot;
- course;
- **proposal (the D1 journey)**;
- live re-entry;
- course, proposal and event journeys (choose/correct/recall, outline, build, save, Project, interrupt, reload, resume);
- "yes" probe;
- continuity + second account;
- Remove from Recent;
- five workflows (**Board** exit/resume, Board → Projects → Brainstorm, Projects help, sections, Research reopen);
- ordinary-chat research;
- **visuals + Creation Workspace (V1–V5, W1)**;
- build integrity.

### Local signed-in (final `0cb567fe7`)

| Check | Result |
|---|---|
| Two-account image privacy | **9/9** (§4) |
| Isolation and persistence suite (both accounts reset first) | **Partial: 6/6 checks run passed** (S1.0 sign-out, S1.1–S1.5: B sees and sends none of A's data; requests carry the member token). The local dev server stopped mid-run and the founder ended the session before a full rerun. **S2–S5 (persistence, failed saves, concurrent edits, legacy claim) were NOT rerun on `0cb567fe7`**; they passed 24/24 on the earlier reconciled candidate. |

### Journeys rerun after the final integration commit

| Journey | Rerun? |
|---|---|
| Work switching, Matter focus + persistence | ✅ simulated + automated; real model ⛔ |
| Projects and Create handoffs | ✅ simulated |
| Board | ✅ simulated |
| Research sources / citations | Research reopen ✅ simulated; R2 source-workspace answers automated only; real model ⛔ |
| VTS structured visuals | ✅ simulated (V1–V5, W1) |
| **Real image generation / editing** | ⛔ no OpenAI access here |
| **Automatic image references** (`VSS-IMG`) | Automated ✅; local privacy ✅; live ⛔ |
| **Mobile layout** | ⛔ not run this round (desktop only) |
| Cross-account isolation | Local ✅; live ⛔ |

**Production-verified:** nothing (no deployment).

---

## 7. What still blocks the Brain release (conditions)

1. **One Brain owner review** of `df6a12a7b`'s switching changes (§2).
2. **Real-model desktop run** on the preview of `0cb567fe7` (switching, Matter focus, Research citations, VTS, Projects/Create, Board, image generation and editing).
   - **Blocked by:** this cloud environment's network policy (no `*.vercel.app`, `vercel.com` or `api.openai.com`) and no test credentials.
   - **One setup step:** environment settings → *Network access*: allow `*.vercel.app` and `vercel.com`; add `VERCEL_AUTOMATION_BYPASS_SECRET`, `PAGE_HARNESS_EMAIL`, `PAGE_HARNESS_PASSWORD`, `PAGE_HARNESS_EMAIL_B`, `PAGE_HARNESS_PASSWORD_B` (two dedicated test accounts); then start a new session. **No keys in chat.**
3. **Live two-account image test** of `VSS-IMG-A5449118` (§4). Until it passes: `SPARK_ART_DISABLED=1`.
4. **Mobile layout check** (your phone, or a phone-size run once step 2 is set up).
5. **Attachment privileges SQL applied** (security release) before images are enabled.

**Remaining defects:**

| # | Defect | Severity |
|---|---|---|
| D2 | `TRUNCATE` grants on `subscriptions` / `user_data` / `app_heartbeat` | Medium; SQL ready; not approved |
| D3 | `user-health` accepts any anonymous analytics id from a signed-in member | Low |
| D5 | Previews write to the production database | Process |
| D7 | Browser-sent hint fields still enter the system prompt uncapped | Medium |
| D8 | 403 vs 404 reveals that an attachment id exists | Low |
| — | The image daily cap can be exceeded by one under exactly simultaneous requests | Low |

---

## 8. Production deployment plan (nothing authorized by this report)

### A. Security release: `c13fec292`

1. Reconfirm production grants and the data fingerprint (queries in §3). Stop if anything differs.
2. Apply `supabase/migrations/20261008_work_attachments_privileges.sql`. Expected grants:
   - `authenticated`: INSERT, SELECT, UPDATE;
   - `anon`: none.
3. Fast-forward `main` to `c13fec292` (a direct descendant of `0620aa0a8`) and let Vercel deploy production.
4. **Smoke tests:**
   - signed-out `POST /api/tts`, `/api/ecosystem/user-health`, `/signals` → 401;
   - signed-in chat and voice work;
   - the founder dashboard opens with its token;
   - attachment upload/open as the owner works; another account is refused;
   - the data fingerprint is unchanged except for members' new activity.
5. **Rollback:**
   - Vercel *Promote* `8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`, and `git revert` on `main`;
   - SQL `grant …` above.

### B. Brain release: `0cb567fe7` (after §7 conditions)

1. Vercel production env:
   - `SPARK_ART_DISABLED=1`, `SPARK_ART_DAILY_LIMIT=20`;
   - `CANVA_*` unset;
   - existing keys unchanged.
2. Merge `release/final-2026-10-08` into `main` (it carries the security code; the dashboard guards stay strict). No migration.
3. **Smoke tests:**
   - sign in; chat; start work → outline in chat → approve → Create;
   - switch to existing work by name and by "the first one"; reload keeps focus;
   - Research → "What do my sources say?" with links;
   - "Show me this" → a visual with one Back;
   - Board → Projects;
   - `+` only brings things in;
   - a second account sees nothing.
4. Watch `brain_trace` growth, model errors and 5xx rates for 24 hours.
5. **Enable images only after the live privacy gate:** set `SPARK_ART_DISABLED=0`, generate one image, confirm the daily cap message at 21.
6. **Rollback:** the kill switches first (`ONE_BRAIN=0`, `NEXT_PUBLIC_ONE_BRAIN=0`, `NEXT_PUBLIC_MEMBER_SYNC=0`, `SPARK_ART_DISABLED=1`); then Vercel *Promote* the previous deployment and revert the merge. No database rollback (no migration).

### Founder approvals required

1. Confirm the security release (§8A), re-approved after the newer gates instruction.
2. One Brain owner's review outcome.
3. Brain release (§8B) after conditions 2–5.
4. Enabling images.
5. D2 SQL (optional).

---

## 9. Database and storage changes in this work

| When | Change |
|---|---|
| 2026-10-02 | `20261002_member_isolation_rls` + backup schema `backup_member_isolation_20261002` (this series, approved) |
| 2026-10-04 | `20261004_p0e_system_tables_rls` (another session) |
| 2026-10-08/09 | **None in production.** Read-only queries only. Local test database and local test certificate only. |
| Storage | No bucket or policy change since 2026-09-13 |
