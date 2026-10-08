# Spark Estate: Production Release Readiness

**Verdict:**
- **Nothing is deployed and production is unchanged.**
- **Two release packages are ready for your decision:**
  - **Security release:** `hotfix/p0-security-followup` @ **`c13fec292`**. Status: **READY WITH CONDITIONS** (your approval, then the SQL step).
  - **Combined Brain + Research/VTS release:** `release/candidate-2026-10-08` @ **`a9872ea0e`**. Status: **READY WITH CONDITIONS**. It still needs the real-model run, your phone check and one defect decision (§5).
- **Release order:** security first; it does not wait on the Brain release.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Production (`main`) | **`0620aa0a8`**, the P0 integrity hotfix. Vercel production deployment completed 2026-10-05 (`8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`). |
| Production database | Supabase `weercszpdcxjxauxrhmj`. Migrations `20261002_member_isolation_rls` and `20261004_p0e_system_tables_rls`. |
| Audit date | 2026-10-08. Branch heads were re-checked at the end and had not moved. |

---

## 1. Consolidated release table

### Ready

| Item | Commit(s) | Status | Evidence |
|---|---|---|---|
| **Security: no sign-in bypass on production builds** | `515d77f57` | READY (with your approval) | A production build with `NEXT_PUBLIC_COMPANION_AUTH_DISABLED=true` returns **401** to signed-out chat/TTS/ecosystem writes. Unit tests 40/40. |
| **Security: `/api/tts` (voice credit) only for signed-in members** | `515d77f57` | READY | Signed out: 401. Signed in: passes the guard. |
| **Security: `/api/ecosystem/user-health` and `/signals` writes only for signed-in members** | `515d77f57` | READY | Signed out: 401. Signed in: signals 200, user-health reaches validation. The dashboard's read calls are unchanged. |
| **Security: attachment-table privileges** (no `TRUNCATE` for visitors or members) | `c13fec292` (SQL migration) | READY WITH CONDITION: apply the SQL with your approval | Verified on a local database set to production's exact grants (§3.3). |
| Founder-dashboard routes keep the stricter guard (member **and** dashboard token) | both packages | Preserved | The security patch does not change them; the candidate was restored to match `main` (`a9872ea0e`). |

### Ready with conditions

| Item | Commit(s) | What's still needed |
|---|---|---|
| **Combined candidate** (One Brain kernel + continuity + Create handoff + Research/VTS lane + Research Source Workspace R2-2…R2-6 + VTS V1–V3 + member sync, AR1–AR2) | `a9872ea0e` | (1) a real-model run on the preview; (2) your phone check; (3) a decision on defect **D1** (§5). |
| "+" brings information in; "/" creates or transforms | `d726efcf8` (in the candidate) | Covered by the real-model run. |

### Hold

| Item | Branch / commit | Why |
|---|---|---|
| **VTS V4 artwork + automatic image references (`VSS-IMG`)** | `visual/v4-art` @ `77bfd7371`; 5 commits beyond the candidate | Paid image generation (`gpt-image-1`/`dall-e-3`) with **no per-member quota**, while anyone can sign up and is confirmed automatically. Pushed today with no certification report. The Canva wording is honest, but **Canva itself is not integrated**. |
| **V5** | — | Not on GitHub. Not included. |
| Strategy repairs (5 commits: a new choice replaces the old; "the first one" corrects; …) | `integration/one-brain-member-persistence` @ `a4738f50a` | Not in either line. The Round 0A plan says to port them as Brain rules and tests, not merge them as Strategy code. |
| Two late fixes on `candidate/one-brain-combined` (`d5ccbac48`, `996c7321e`) | — | Never merged into the V-line; unreviewed. You said no new additions. |
| Simulation Lab (`cursor/anthropic-access-verification-ad71`, 72 commits) | — | A separate experiment, not release work. |

### Blocked

| Check | Blocked by | Exactly what unblocks it |
|---|---|---|
| **Real-model browser run** (C1/C2, J1–J3, B1, P1–P3, R1, RX, V1–V5, W1, X1) | This Claude Code **cloud environment** has no OpenAI key, and its network policy refuses `api.openai.com`, `*.vercel.app` and `vercel.com`. | **One setup step** (§6). |
| **Physical-phone check** | Needs you | §7 |

### Remaining defects

| # | Defect | Where | Severity | Status |
|---|---|---|---|---|
| **D1** | "Give me an outline for the client proposal" (new work while another is in focus): the model's outline is **overwritten** by the reflective rewrite, *"You're still sitting with this decision. What feels murkiest about it right now?"* | Simulated harness "proposal" journey. Fails identically on the **certified baseline `81135935b`** in this environment, so the merge didn't cause it. The original certification (2026-10-07) reported it passing, so it may depend on the date or environment. | High (wrong reply on a core journey) | Not fixed (no repairs without approval). Confirm in the real-model run, then fix. |
| D2 | `subscriptions`, `user_data` and `app_heartbeat` also grant `TRUNCATE`/`REFERENCES`/`TRIGGER` to `anon` and `authenticated` | Production database | Medium | SQL ready in §3.4; **not** in the package unless you approve it. |
| D3 | `user-health` accepts any **anonymous analytics id** from a signed-in member, so a member could record activity under another anonymous id | Production and both packages | Low (ids are random; no account data) | Documented; a design change is needed. |
| D4 | 3 stored files with no attachment record (one account's folder) | Production storage | Low | Clean-up only; nothing exposed. |
| D5 | Previews write to the **production** database. Today: 1 account; `brain_trace` 189 rows, `brain_matter` 20 rows. | Vercel preview → production Supabase | Medium (process) | Use dedicated test accounts for previews, or a separate database. |
| D6 | Security advisor warnings: 3 functions with a mutable `search_path`; leaked-password protection is off | Production database | Low | Pre-existing; unchanged. |
| D7 | Browser-sent hint fields are still pasted into the system prompt uncapped (Round 0A item 2, open) | Both lines and production | Medium | Needs real-model certification to change safely. |

---

## 2. Truth: what is where

| Capability | Production | Candidate `a9872ea0e` | Certified | Notes |
|---|---|---|---|---|
| P0 integrity: member-only model routes, server-owned prompts, honest failure | ✅ `0620aa0a8` | ✅ | Round 0A | Live since 2026-10-04/05 |
| Round 0A follow-up: the three route protections | ❌ | ✅ (via `8312d7a7e`) | 0A tests | **Security package** brings them to production on their own |
| Member isolation in the browser, sign-out, legacy claim (owner-only) | Partial (hotfix version) | ✅ stricter (`d9f858f11`) | Earlier rounds + this audit | |
| Account sync across devices (member records) + AR1/AR2 | ❌ | ✅ | Earlier rounds; this audit | `main` fails all sync checks (expected); the candidate passes |
| **One Brain kernel** (server Matter, Open Offer, Decision, Foothold; `/api/brain/*`) | ❌ | ✅ | Simulated 156/156 at `81135935b` (other session); live **not run** | Kill switch: `ONE_BRAIN=0` / `NEXT_PUBLIC_ONE_BRAIN=0` |
| One Brain continuity (`e78283fb9` = `cd91d6dbd`) | ❌ | ✅ | Founder's own preview checks (report not on GitHub); this audit | |
| Matter switching, "where were we", short answers, list integrity | ❌ | ✅ | Simulated (journeys) | Real-model pending |
| **Create handoff** (outline approved in chat → Create; verified save; Creation Workspace on a second browser) | Older Create only | ✅ | Simulated (J1–J3, V5, W1) | D1 affects the second-work journey |
| Research/VTS lane R1–R8 + truth rules | ❌ | ✅ | Return reports R1–R8; lane `b5fbc341b` | |
| **Research Source Workspace** R2-2…R2-6 ("What do my sources say?", agree/disagree, Verify, per-work sources, your own documents) | ❌ | ✅ | **No report.** Commit notes say "found live"; unit suites pass | Uses the existing private bucket; a document's text is stored as an accepted file type |
| **VTS V1–V3** (show me this; scope; napkin / diagram / infographic) | ❌ | ✅ | **No report**; "found live" notes; unit suites pass | |
| VTS V4 artwork + `VSS-IMG` image references | ❌ | ❌ (held) | None | See Hold |
| Composer `+` | Paperclip | `+` = bring in only | This audit | The V-line had a "Do something" section; removed per your rule |

**Superseded (don't release separately):**
- `integration/one-brain-release-ar` (`303bceec1`), `feat/artifact-r1-sources-vts`, `brain/one-brain-core`, `research-vts/lane-repairs`, `fix/brain-repairs-on-research-vts`: all contained in the candidate.
- `foundation/one-brain`: its three commits are carried in adapted form; its `+` "Do something" section has been removed.

**Conflict risk:**
- `one-brain/convergence` and the V-line split at `b5fbc341b` and edited the same One Brain turn gate. The candidate merge kept both sides' guards (§4.2).
- The Strategy repairs above touch the same turn path. That is the reason they stay out.

---

## 3. Security release package (separate, minimal)

**Branch:** `hotfix/p0-security-followup`, from production `main` `0620aa0a8`.

**Commits:**
1. `515d77f57`: code (7 files, +76/−3).
2. `c13fec292`: SQL migration `supabase/migrations/20261008_work_attachments_privileges.sql`.

**Vercel preview of `c13fec292`:** built successfully (`BQb5Gdu2UgvBaExrwHwZpBCFT6MH`).

### 3.1 What it changes

| Protection | Before (production) | After |
|---|---|---|
| Production build ignores `NEXT_PUBLIC_COMPANION_AUTH_DISABLED` | A production build with the flag set would let signed-out requests reach model routes | Never bypasses on `NODE_ENV=production` |
| `POST /api/tts` | Open (ElevenLabs credit) | Member only |
| `POST /api/ecosystem/user-health` and `/signals` | Anonymous writes accepted (could mark a user "cancelled") | Member only; dashboard GETs unchanged |
| Ratchet test | OpenAI routes only | Also covers ElevenLabs and routes that reach a model through a `lib/` helper |
| Founder-dashboard routes (advisor, PostCraft drafts) | Member + dashboard token | **Unchanged (stricter guard kept)** |
| `companion_work_attachments` grants | `anon`: REFERENCES, TRIGGER, TRUNCATE. `authenticated`: INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE | `anon`: none. `authenticated`: INSERT, SELECT, UPDATE. Row security is unchanged and still owner-only. |

### 3.2 Verification (completed)

| Check | Result |
|---|---|
| Patch tests (member-auth routes, ratchet, `serverMemberAuth`) | **40/40** |
| `app/api` + `lib/memberScope` + `lib/ecosystem` + `components/ecosystem` vs `main` | Same 24 pre-existing failures; **6 new passing** |
| TypeScript | Identical to `main` |
| **Production build** (webpack) with `NEXT_PUBLIC_COMPANION_AUTH_DISABLED=true`, signed out | `/api/tts`, `/api/ecosystem/user-health`, `/api/ecosystem/signals`, `/api/companion-chat`: **401**. A forged bearer token: **401**. Dashboard GET without its token: 401 (unchanged). Advisor: 401 (strict guard kept). |
| Same build, real signed-in member (local Supabase) | Passes the guard: signals **200**; user-health **400** (input validation); tts **500** (no voice key in this environment) |

### 3.3 Attachment privileges: snapshot, verification, rollback

**Production snapshot** (read-only, 2026-10-08):
- `anon`: REFERENCES, TRIGGER, TRUNCATE.
- `authenticated`: INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE.
- RLS on, with 3 owner policies.
- Table: 53 rows. Bucket `companion-work-attachments` is private, limited to 10 MB, with an allow-list of file types and 4 owner-folder policies. The bucket is unchanged since 2026-09-13.

**Verified on a local database set to production's exact grants:**

| Step | Result |
|---|---|
| Apply | `authenticated`: INSERT, SELECT, UPDATE; `anon`: none |
| Apply again | Same (idempotent) |
| Owner inserts, reads, updates their own row | 1, 1, 1 ✔ |
| Another member reads it | 0 ✔ |
| Member `TRUNCATE` | permission denied ✔ |
| Visitor `SELECT` / `TRUNCATE` | permission denied ✔ |
| Rollback | Snapshot restored exactly ✔ |
| Re-apply | Fix restored ✔ |

**Rollback SQL** (restores the snapshot):

```sql
grant references, trigger, truncate on public.companion_work_attachments to anon;
grant references, trigger, truncate on public.companion_work_attachments to authenticated;
```

**Production verification query** (run before and after applying):

```sql
select grantee, string_agg(privilege_type, ',' order by privilege_type)
from information_schema.role_table_grants
where table_schema='public' and table_name='companion_work_attachments' and grantee in ('anon','authenticated')
group by grantee;
```

### 3.4 Optional, same class (D2), not in the package unless you say yes

```sql
-- snapshot (2026-10-08): anon and authenticated each hold REFERENCES, TRIGGER, TRUNCATE (no SELECT) on all three
revoke truncate, references, trigger on public.subscriptions, public.user_data, public.app_heartbeat from anon, authenticated;
-- rollback:
-- grant references, trigger, truncate on public.subscriptions, public.user_data, public.app_heartbeat to anon, authenticated;
```

### 3.5 Deployment sequence (after your approval)

1. Re-run the verification query on production and confirm it still matches the snapshot.
2. Apply `20261008_work_attachments_privileges.sql` to production, then re-run the query (expect `authenticated: INSERT,SELECT,UPDATE`).
3. Merge `hotfix/p0-security-followup` (`c13fec292`) into `main` and let Vercel deploy production.
4. On production:
   - signed out: `POST /api/tts` → 401;
   - signed in: chat replies; voice plays;
   - the founder dashboard opens with its token.

### 3.6 Rollback

- **Code:** Vercel → *Promote* the previous production deployment (`8ZB5ugCdoTfuwSqBZYEdE8a5pXLe`), then `git revert 515d77f57` on `main`.
- **Database:** the two `grant` lines in §3.3.

The code and SQL are independent; either can be rolled back alone.

---

## 4. Combined candidate

**Branch:** `release/candidate-2026-10-08`.

| Commit | What |
|---|---|
| `6009293fd` | Merge of `one-brain/convergence` `81135935b` (certified) + `visual/v3-forms` `2e55688a5` (Research 2 + V1–V3) |
| `d726efcf8` | `+` brings information in only (Create / Visualize / Research / Practice via `/` and conversation) |
| **`a9872ea0e`** | **Final.** Founder-dashboard routes keep the stricter guard. |

**Vercel preview of `a9872ea0e`:** built successfully (`DhaBfaTv1eZD1yXuJmcNaaomGLBp`).

### 4.1 What it keeps (verified by ancestry)

| Certified or approved work | In `a9872ea0e`? |
|---|---|
| `one-brain/convergence` `81135935b`, incl. `dfa71596c` and continuity `cd91d6dbd` | ✅ |
| Research/VTS lane `b5fbc341b` | ✅ |
| Research 2 R2-2…R2-6 (`ebe1f5417`) | ✅ |
| V1–V3 (`2e55688a5`) | ✅ |
| `integration/one-brain-release-ar` `303bceec1` (member persistence, AR1–AR2, R8 reconciliation) | ✅ |
| Production `main` `0620aa0a8` | ✅ |
| Research never shows a failed attempt as a finding (`76bc3301f`) | ✅ |

### 4.2 Merge conflicts and resolution

The conflicts were all in the One Brain turn gate. Each side had added independent guards, and all of them were kept:
- **convergence:** an identical message in flight counts as one turn; outlines the Brain keeps stay in chat; a room opened for the work in focus carries its id;
- **V-line:** the current journey owns its turn; work-source commands never reach the Brain as new research; the capability in use is recorded on the work.

### 4.3 Dependencies

| Area | Finding |
|---|---|
| Packages | No `package.json` changes vs `main` |
| Database | No new tables. New record domains in the existing `companion_member_records`: `brain_matter`, `brain_member`, `brain_action`, `brain_trace`, `strategic_*`. Migration `20261002` is in the repo and **already applied** in production. **No migration needed.** |
| Storage | Existing private bucket and owner policies; no change |
| Environment | Existing `OPENAI_API_KEY` and Supabase keys. Kill switches: `ONE_BRAIN`/`NEXT_PUBLIC_ONE_BRAIN` (`0` = off), `NEXT_PUBLIC_MEMBER_SYNC` (`0` = off). `OPENAI_IMAGE_MODEL` is only used by V4, which is not included. |
| API cost | New member-only Brain model routes (e.g. `brain/develop/section`), all guarded and ratchet-checked. No per-member quota (same as production today). |
| Feature flags | The Brain and member sync are on by default; each can be turned off without a redeploy of code. |

### 4.4 Verification: completed

**Simulated (local, scripted model, fake Supabase)**

| Check | Commit | Result |
|---|---|---|
| Certification page harness, production build (desktop 1280×900) | `d726efcf8` | **13/14 pass.** Boot; course; live conversation re-entry; three journeys (course, proposal, event); "yes" probe; continuity + second account; Remove from Recent; five workflows (Board, Projects, sections, Research reopen); ordinary-chat research; **visuals + Creation Workspace (V1–V5, W1)**; build integrity. **Fails:** "proposal: new work while the course is in focus" (D1). It fails identically on the certified `81135935b` in this environment. |

**Real sign-in against a local database with production's rules (model stubbed)**

| Check | Commit | Result |
|---|---|---|
| Isolation + persistence suite | `d726efcf8` | **20/22 pass.** S1 (two accounts: screens, stores, chat, late replies), S2 (cross-device save/edit/remove/restore), S3 (concurrent edits), S4 (failed save, retry), S6 (server auth). **The 2 failures (S5.1, S5.4) are expected.** The stricter legacy rule means pre-isolation data with no recorded owner is shown to nobody; the run shows it "kept: true, visible to A: false". |
| Same suite on production `main` | `0620aa0a8` | 16/24. All isolation (S1), legacy (S5) and server-auth (S6) checks pass. All sync checks (S2–S4) fail because production has no account sync yet. |

**Automated**

| Check | Commit | Result |
|---|---|---|
| Full unit suite (20,976 tests) | `6009293fd` | 596 failing. **All 596 also fail on `main`, convergence and V3. 0 new.** 11 tests that fail on `main` pass here. |
| `+` change: composer and capability suites | `d726efcf8` | 0 new failures |
| Dashboard-guard restore: `app/api` + `lib/memberScope` | `a9872ea0e` | Same 22 pre-existing failures; ratchet passes |
| TypeScript | `a9872ea0e` | 365 errors, identical to the candidate base. One file+code pair differs from `main`, and it already exists on a parent. |

**Between `d726efcf8` (browser-tested) and `a9872ea0e` (final):** only the two founder-dashboard routes and the ratchet test differ. Neither browser suite uses them.

### 4.5 Verification: blocked or not yet run

- **Real-model browser run on the preview:** blocked (§6). The script is ready (`certification-handoff/liveCertification.live.test.ts` on `adhd-companion` branch `claude/create-fable-0209ax`).
- **Physical phone:** needs you (§7). Everything above used Chromium browser contexts, not a phone.

### 4.6 Deployment sequence (after the security release and your approval)

1. Run the real-model script on the preview of **`a9872ea0e`**, and do your phone check.
2. Decide D1: fix it, or accept it with the kill switch ready.
3. Merge `release/candidate-2026-10-08` into `main` (a PR). It already contains the security code change; the merge keeps the stricter dashboard guards.
4. Vercel production deploy; then a smoke test on production (sign in, chat, Research → sources, Create handoff, a second account sees nothing).
5. Watch `brain_trace` growth and model errors for 24 hours.

### 4.7 Rollback

| Option | When to use it |
|---|---|
| Fast: set `ONE_BRAIN=0` and `NEXT_PUBLIC_ONE_BRAIN=0` (and `NEXT_PUBLIC_MEMBER_SYNC=0` if sync misbehaves) in Vercel, then redeploy | The Brain or sync misbehaves |
| Full: Vercel *Promote* the previous production deployment, then revert the merge on `main` | Anything larger |

There is no database rollback, because the Brain release adds no migration. Member records written by the Brain stay in place, owner-only, and are ignored when the Brain is off.

---

## 5. Decision needed on D1

The model's outline for a **second piece of work** is replaced by a reflective question. Choose one:
- **(a)** approve a targeted fix before release (recommended); or
- **(b)** release with the risk recorded and the kill switch ready.

The real-model run will show whether a real reply is affected.

---

## 6. Real-model testing: exactly what's missing

- **Environment missing it:** this Claude Code cloud environment (the session's container).
- **What it lacks:**
  - there is no `OPENAI_API_KEY` (the app also accepts `OPENAI_KEY` / `OPENAI_SECRET_KEY`);
  - the network policy refuses `api.openai.com`, `*.vercel.app` and `vercel.com`.
- **Existing authorized secret:** the app's `OPENAI_API_KEY` already lives in the Vercel project (the deployments use it). This session can't read it, and shouldn't.

**One setup step (uses that existing key; no key enters the chat):**

1. Open this environment's settings: the cloud environment menu in the session title bar → **Edit**.
2. Under **Network access**, choose Custom and allow `*.vercel.app` and `vercel.com`.
3. Add these environment variables:
   - `VERCEL_AUTOMATION_BYPASS_SECRET`, copied from Vercel → Settings → Deployment Protection → *Protection Bypass for Automation*;
   - `PAGE_HARNESS_EMAIL`, `PAGE_HARNESS_PASSWORD`, `PAGE_HARNESS_EMAIL_B`, `PAGE_HARNESS_PASSWORD_B` for **two dedicated test accounts** (account A with one Project).
4. Start a new session.

---

## 7. Phone check (about 10 minutes, on the preview of `a9872ea0e`)

1. Sign in on your phone and your computer with the same account.
2. Say *"I want to launch a course on ADHD-friendly productivity"*. On the phone, check it's there.
3. Ask for *"an outline for the course with 3 lessons"*; it appears in chat → *"looks great"* → *"yes lesson 1"*. Lesson 1 opens in Create.
4. *"I'm pitching Acme on a rebrand. Give me an outline for the client proposal first."* Expect an outline. If you get *"still sitting with this decision"*, that's D1.
5. Research something → *"What do my sources say?"*. Each point should have a trust label and a link that opens.
6. *"Show me this"*. A visual opens with one Back button.
7. Tap **+**: only File, Photo/Camera, Folder, Scan and Library. Type **/visualize**: it still works.
8. Sign out on the computer; the phone stays signed in.
9. In a private window, sign in with a second account: none of your work.

---

## 8. Database and storage settings changed during this work

| When | What | Who | State |
|---|---|---|---|
| 2026-10-02 | Migration `20261002_member_isolation_rls` (member records and Create workspaces: least privilege, owner policies); backup schema `backup_member_isolation_20261002` | This series, with your approval | Live; backup kept |
| 2026-10-04 | Migration `20261004_p0e_system_tables_rls` (11 system tables) | Another session (P0 hotfix) | Live |
| 2026-10-08 (this audit) | **None in production.** Read-only queries only (grants, policies, counts; no member content read). | — | — |
| 2026-10-08 (local only) | The local test database's attachment grants were set to production's and then to the fix; the local test TLS certificate was reissued | This audit | Local only |
| Storage | No bucket or policy change. Bucket last changed 2026-09-13. | — | — |

**Pending and not applied:** `20261008_work_attachments_privileges.sql` (security package), and the optional D2 SQL.
