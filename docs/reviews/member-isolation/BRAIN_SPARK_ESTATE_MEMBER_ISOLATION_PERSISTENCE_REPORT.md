# BRAIN SPARK ESTATE™ — One Brain Member Isolation + Account Persistence

**Verdict: HOLD for production.** It is ready as an isolated integration preview.

Member isolation and account-backed persistence are built and pushed. The full shared-browser leak seen in the baseline is closed. The work is also verified live in Chromium against a real Supabase stack, run locally. Production needs three things first, listed under [Remaining blockers](#remaining-blockers):
1. the RLS migration applied and confirmed in production;
2. the remaining gaps closed;
3. a reviewed merge.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Integration preview branch | `integration/one-brain-member-persistence` |
| Commits | `bcd2d6569` (isolation, persistence, chat auth, claim, migration); `8db43a616` (per-visit transcript fix, stuck-pending fix); a final lint fix (see the end of this report) |
| Built on | `atomic/one-brain-convergence-r1` `33541725e` + `feat/one-brain-strategic-continuity` `59caff945` + `atomic/research-r8-readout` `1ac7eb898` (merge `d472838f8`, the **baseline** for every comparison below) |
| Not done | Nothing merged to `main`, nothing deployed, no production database touched |

---

## 1. Current-truth reconciliation

### Lines inspected
- **`main`** (`b25f96dcb`, 2026-10-01) contains **none** of OB-1…OB-6.
  - The OB line (`e5c53e73`) sits on an R0 base that is not in `main` (112 ahead, 223 behind).
- The newest One Brain line based on `main` is **`atomic/one-brain-convergence-r1`** (34 ahead, 0 behind). It already contains specialist-convergence, question-help, Research/VTS R1–R7 and create-recovery-r1.
- Merged into the preview on top of it:
  - **Strategy**: `feat/one-brain-strategic-continuity`. One additive conflict, in `lib/questionHelp/conversation.ts`; both functions were kept.
  - **Research/VTS**: `atomic/research-r8-readout`. One additive conflict, in the `CompanionPageClient` imports and hint list; both were kept.
- **Create**: create-recovery-r1 was already inside convergence-r1.
- **Not merged:** `fix/one-brain-p0-execution`.
  - Its P0 work was already hand-ported into convergence-r1.
  - Its Strategy Remove/Undo commits overlap `538762406` on strategic-continuity.

### The contradiction about account persistence
- The OB-6 / OB-6 Final audit said: *"only Create, Saved Spark and billing are on the server."* That was true **for `e5c53e73`**. It is **out of date for the convergence line.**
- On this line, `companion_member_records` already carried these domains:

| Domain | Flag | What it holds |
|---|---|---|
| `strategic_decision` | always on | Decision Ledger, one row per entry |
| `strategic_continuity` | always on | Strategic resume point only: concern, project, open question, pending confirmation |
| `user_strategy` | always on | My Strategies |
| `strategy_work_item` | always on | Strategy work items |
| `saved_spark` | **on** | Saved Spark |
| `saved_work` | off | — |
| `evidence_vault` | off | — |
| `work_body` | off (founder only) | — |

- Create uses its own table, `companion_creation_workspaces`, which is always on when signed in.

### Confirmed gaps before this work
1. No browser store was tied to the signed-in member.
2. Sign-out removed only the login token.
3. Strategy hydration was not tied to sign-in. Its merge could push one member's newer local data into **whoever was signed in**.
4. `/api/companion-chat` checked sign-in only when attachments were present. `claire-reasoning`, `research-live` and `board/recommend` had no member check.
5. Row-level security on `companion_creation_workspaces` was commented out in the repository ("modeled, not verified").
6. Most business knowledge was browser-only.

### Deployed versions and flags
- I have no access to Vercel or the production Supabase, so I could not read the deployed commit or the production flags. Both must be checked before release.
- Flags in code:
  - New sync: on by default. Kill switch: `NEXT_PUBLIC_MEMBER_SYNC=0` or local `spark.flag.memberSync=0`.
  - Isolation: always on.

---

## 2. What was built

### Member isolation
- **Account-scoped browser storage** (`lib/memberScope/storageShim.ts`).
  - Installed before any app code runs (a `beforeInteractive` script in the root layout).
  - Every `localStorage` / `sessionStorage` key is stored under the signed-in member, as `spark.m/<memberId>/<key>`. This covers reads, writes, property access, enumeration and `clear()`.
  - Only device keys stay shared: the sign-in session, the sign-out marker, flags and reload guards.
  - Signed-out use has its own `guest` scope.
  - The member id comes from the stored Supabase session. It decides only *where this browser keeps its cache*; it is never used as authorization.
- **Account switch and sign-out.** When the member changes in this tab, or in another tab through the `storage` event:
  1. the member epoch increases;
  2. in-flight member requests are aborted;
  3. any response that arrives after the change is dropped;
  4. the page is left, either to sign-in or by reloading for the new member, so **no in-memory state from the previous member survives**.
- **Sign-out** first saves anything still unsaved to the account (bounded wait), then revokes the session. The member's own local copy is kept in their scope and is **never deleted**.
- **Late responses:** a wrapper on member `/api/*` calls (`lib/memberScope/memberFetch.ts`) does three things:
  - attaches the bearer token and the `x-member-scope` header;
  - aborts the call when the member changes;
  - discards any response that arrives after a change.

### Account-backed persistence
- **No new table and no competing store.** The new domain `member_store` lives on the existing `companion_member_records` table, with one record per member store.
- Local storage is now an account-scoped **cache**; the account record is the source of truth across browsers.
- Engine: `lib/memberSync/engine.ts`.
  - **Three-way merge** against the last synced copy (`lib/memberSync/merge.ts`).
    - Records with an `id` merge record by record, so additions in two browsers both survive.
    - A record removed on one side but edited on the other is kept.
    - A true conflict on the same field keeps the newer record by its own timestamp. The other value goes to a recoverable conflict log (`spark.sync.conflicts.v1`).
  - **Compare-and-set writes** on `record_version`, with a **verified read-back** of every write.
  - **Removal of a whole store** writes a soft `deleted` tombstone. Writing the store again restores it.
  - **Record-level Remove / Restore / Undo flags** inside stores travel as ordinary field changes, with identities, links and versions preserved.
  - **Failed saves** stay queued: the queue is saved per member, retried with backoff, and survives a reload. The local copy is never discarded.
  - **Hydration on sign-in** happens **before the workspace renders** ("Bringing your work in…", bounded at 8 s). The account is also pulled on focus, on reconnect, and every 30 s.
  - If account data changes underneath an open page, the page reloads, unless the member is typing. In that case the page's next write is merged, never overwritten.
  - The last-synced copies live in IndexedDB, so they don't compete with the stores for localStorage quota.

### Shared chat path
- `/api/companion-chat`, `/api/claire-reasoning`, `/api/research-live` and `/api/board/recommend` now call `requireCompanionMember`. It:
  1. verifies the bearer token with Supabase (`auth.getUser`);
  2. returns 401 without a valid session;
  3. returns 409 when `x-member-scope` does not match the token. The header is a consistency check only, **never authorization**.
- Development without sign-in (`NEXT_PUBLIC_COMPANION_AUTH_DISABLED` / dev bypass) still works and carries no member data.
- The chat model still receives current-turn context from the browser. That context is now the signed-in member's own scoped data, merged with their account copy.

### Legacy and signed-out data
- Old unscoped records, and data saved while signed out, are **hidden from active reads** and never attached silently.
- On sign-in, when meaningful legacy data exists, a small dialog (`LegacyDataClaimPrompt`) asks **"Is this your work?"** with three answers:
  - **Yes, it's mine:**
    1. merge into the member's stores (union by record id, so repeating it adds nothing twice);
    2. write to the account;
    3. **verify** the account copy;
    4. only then move the originals to a recoverable archive (`spark.legacy/archive/<member>/…`).
    5. If verification fails, the originals are kept and the dialog says so.
    - `restoreLegacyArchive` puts originals back.
  - **Not mine:** remembered for this member only; the data stays untouched for whoever owns it.
  - **Decide later:** asks again next time.

### Database
- `supabase/migrations/20261002_member_isolation_rls.sql`. It is idempotent: it was applied twice without errors.
- For `companion_member_records` it re-asserts owner-only select, insert and update, and revokes `anon`.
- For `companion_creation_workspaces` it enables owner-only RLS: select, insert and update where `auth.uid() = user_id`. It also revokes `anon` and adds the owner index.
- **There is no member delete policy on either table** (soft delete only).

---

## 3. Persistence coverage

| Area | Member stores (keys) | Account source | Status |
|---|---|---|---|
| Business profile and history | `companion-business-profile-v1` (envelope incl. write log), `companion-business-os-v1`, `companion-decision-intelligence-v1` | `member_store` | **Account-backed (new)** |
| Ideal clients | `companion-ideal-clients-v1` | `member_store` | **Account-backed (new)**; browser-verified |
| Decisions | `companion-decision-ledger-v1` | `strategic_decision` (existing) | Account-backed; now member-isolated |
| Projects | `companion-projects-v1`, `-project-items-v1`, `-project-conversations-v1`, `-project-continue-v1`, `-project-asset-notes-v1`, `-project-plan-completions-v1`, `-recent-work-v1`, `-last-activity-v1`, `project-moments-v1` | `member_store` | **Account-backed (new)**; browser-verified (save, edit, remove, restore, concurrent) |
| Board / Chamber / Strategy | `spark.board.director-discussions.v1`, `spark.boardroom.discussions.v1`, `spark.board.call-the-board.v1`, `companion-board-discussions-v1`, `spark:strategy-decision-memory:v1`, `companion-outcome-thread-v1`, `companion-outcome-goals-v1`, `chamber-*` meta, patterns, blockers, preferences, momentum stores | `member_store` | **Account-backed (new)** |
| My Strategies, strategy work items | `companion-user-strategies-v1`, `spark:strategy-work-items:v1` | `user_strategy`, `strategy_work_item` (existing) | Account-backed; now member-isolated |
| Research findings and sources | `companion-research-library-{collections,sessions,inquiries,active,observations,contextual-pending}-v1` | `member_store` | **Account-backed (new)** |
| VTS maps | `companion-visual-focus-maps-v1` | `member_store` | **Account-backed (new)** |
| Events | `companion-events-intelligence-v1`, `…-active-id` | `member_store` | **Account-backed (new)** |
| Reminders / Rhythms / My Day | `companion-reminders-v1`, `companion-rhythms-v1` (+ owner variants), `-rhythm-history-v1`, `-rhythm-prefs-v1`, `-attention-obligations-v1`, `-day-state-v1`, `-plan-schedule-prefs-v1`, `-remember-referent-v1`, `spark:pending-remember-create:v1` | `member_store` | **Account-backed (new)**; reminders tombstone browser-verified |
| Conversation continuity | `spark:active-work-context:v1`, `companion-conversation-handoff-stash-v1`, `spark-intent-workflow-v1`, `spark-suspension-v1`; strategic resume point | `member_store`; `strategic_continuity` | Account-backed. **Transcript and session spine stay local** (see blockers) |
| Preferences, relationship memory | `companion-prefs-v1`, `companion-relationship-memory-v1`, `-relationship-preference-v1`, `spark:support-style-prefs:v1`, focus and talk-it-out preferences, onboarding state | `member_store` | **Account-backed (new)** |
| Create | creation caches | `companion_creation_workspaces` (existing) | Account-backed; RLS migration added |
| Evidence Vault | `companion-evidence-bank-v1` | none (kept separate as instructed) | **Member-isolated only; never synced, no new integration** |
| Everything else (UI state, drafts, analytics) | ~1,300 other keys | none | **Member-isolated local cache** (temporary screen state) |

---

## 4. Migrations

| Migration | What it does | Verified |
|---|---|---|
| `20261002_member_isolation_rls.sql` | RLS and grants for member records and Create workspaces | Applied twice to local Supabase; live two-member RLS test passes |
| Browser legacy → account claim | Ownership-confirmed, verified, repeatable, originals archived | Unit tests and live browser |
| Signed-out (guest) → account | Same dialog | Unit test |

---

## 5. Live evidence

**What "live" means here.** All of this is **browser-context testing**: headless Chromium, with separate browser contexts (independent cookie and storage jars) in one machine. It is **not physical-device testing.**

**Setup.**
- Supabase is the real stack (GoTrue, PostgREST, Postgres 17 with the repository schemas), run locally through the Supabase CLI. It is reached through an HTTPS test hostname, because the app accepts only `*.supabase.co` URLs.
- There are two real accounts.
- The app runs with sign-in forced on (`NEXT_PUBLIC_COMPANION_AUTH_DISABLED=false`).
- Chat replies were stubbed at the network layer so request bodies could be captured. The server's auth check was exercised directly.

### Candidate vs baseline, identical script (`suite.mjs`)

| # | Scenario | Candidate | Baseline `d472838f8` |
|---|---|---|---|
| S1.0 | Sign-out through the account menu | PASS | PASS (but A's conversation is **still readable** after sign-out) |
| S1.1 | Member A sees own conversation | PASS | PASS |
| S1.2 | Member B's screen shows none of A's conversation | PASS | PASS |
| S1.3 | Member B reads none of A's stores | **PASS** | **FAIL**: B reads A's ideal client |
| S1.4 | Member B's **chat request** carries none of A's information | **PASS** | **FAIL**: A's data is sent in B's prompt |
| S1.5 | Chat requests carry the member token (and scope) | PASS (scope = member) | token only, no scope |
| S1L.1 | A's late reply never reaches B (another tab switches account mid-reply) | PASS: the first tab leaves; the late reply is kept only under A's own scope | PASS (B's tab never loaded A's thread) |
| S2.1 | Saved work carries to a second signed-in context of the same account | **PASS** | FAIL |
| S2.2 | Conversation spine carries to the second context | FAIL (by design: see blockers) | FAIL |
| S2.3 | Edit carries back | **PASS** | FAIL |
| S2.4 | Removal carries | **PASS** | FAIL |
| S2.5 | Restore carries | **PASS** | FAIL |
| S2.6 | Whole-store removal carries as a tombstone | PASS | PASS (trivially: never shared) |
| S3.1 | Concurrent edits in two contexts keep both, no duplicates | **PASS** | FAIL |
| S4.1 | Failed save (simulated HTTP 500) keeps the local copy, stays queued | **PASS** | FAIL (no account save) |
| S4.2 | Retry succeeds after the outage; the other context receives it | **PASS** | FAIL |
| S5.1 | Legacy data not attached silently; ownership dialog shown | **PASS** | FAIL (attached silently) |
| S5.2 | "Yes" merges, saves to the account, archives (not deletes) originals | **PASS** | n/a (the run stopped at this step: the baseline has no isolation layer to place the legacy data in) |
| S5.3 | Repeating the claim creates no duplicates | **PASS** | n/a |
| S5.4 | "Not mine" leaves data untouched and hidden, and is remembered | **PASS** | n/a |
| S6.1 | Chat without a signed-in member | **401** | **200** |
| S6.2 | Forged token with a real member id in the header | **401** | **200** |
| S6.3 | Valid token, mismatched member scope | **409** | — |
| S6.4 | Valid signed-in member | 200 | 200 |

**Candidate: 23 of 24 pass.** The one failure, S2.2, is explained below.

### Database (live, local Supabase)
- `lib/memberSync/memberStore.integration.test.ts` passes 4/4:
  - two contexts of one member converge through the account, including concurrent edits (version 3, all three records);
  - soft tombstone and restore;
  - member B cannot read, update or plant member A's rows; anon has no access;
  - the same holds on `companion_creation_workspaces`.
- The existing `durableRecords.integration.test.ts` passes 7/7.

### Unit tests (new)
| Area | Tests |
|---|---|
| Shim | 12 |
| Merge | 7 |
| Engine | 11 |
| Server member auth | 5 |
| Route rejection | 4 routes |
| Legacy claim | 7 |
| **All new tests** | **all pass** |

- Three existing route tests now call the route as a signed-in member, through a mock of `requireCompanionMember`. Their assertions are unchanged.

### Comparisons
- **TypeScript:** the error set is identical to baseline (366 = 366, same files and codes; pre-existing).
- **Lint on changed files:** no new problems after the final fix. The `rules-of-hooks` and `exhaustive-deps` findings in `CompanionAuthGate` / `CompanionAuthProvider` exist in baseline too.
- **Full unit suite, same command on both:** see [the final section](#full-suite-comparison).

---

## Remaining blockers

1. **Production database.**
   - Apply `20261002_member_isolation_rls.sql` in production.
   - First compare it with the live `pg_policies` for `companion_creation_workspaces`; the repository's earlier policy text was never verified.
   - Confirm the deployed commit and flags. I could not read either.
2. **Conversation transcript and session spine stay per-browser (S2.2).**
   - A reload in the *same* browser already starts a fresh spine, and the transcript is cleared on each fresh visit (it is restored only inside the Chamber).
   - Syncing them would let one context's fresh visit overwrite another's, so they stay member-isolated local caches.
   - What does cross browsers: the strategic return point (`strategic_continuity`), active work, outcome thread, pending reminders, projects, Board and research.
   - **Cross-browser "continue this exact chat"** needs a Founder product decision on whether conversations are per-visit. The persistence is ready for it.
3. **Stores are synced whole, one record per key.**
   - Each store is one account record, merged by record id. That is correct but coarse.
   - A very large store, such as a long research library, is rewritten on each change.
   - Per-record rows would scale better. The business profile envelope is also merged as one JSON document.
4. **Pages read their stores once on load.** When another browser changes data, an open page reloads, unless the member is typing. While typing, a removal made by that page of an item it never displayed can be undone by the merge (deliberately, so nothing is lost). The data is correct after the next reload.
5. **Device storage quota is shared** by every member who uses the same browser. Quota recovery only trims the current member's keys.
6. **Other `/api/*` routes:**
   - The browser now sends the member token to all of them.
   - Only the four member-context routes *require* it.
   - Review the remaining paid AI routes (`decision-analyze`, `project-brain`, `braindump-classify`, `avatar-research`, `refine`, `remix`, and others) for member data before release.
7. **Not checked:** Safari / Firefox, physical devices, and production Supabase latency.

---

## PASS / HOLD

| | |
|---|---|
| Member isolation (one browser, two accounts) | **PASS**: no leak in screens, stores, chat prompts or late responses (live browser) |
| Server ownership (chat path, RLS) | **PASS** locally; **HOLD** until the migration is confirmed in production |
| Account persistence across browser contexts | **PASS** for saved work, edits, removals, restore, concurrent edits, failed-save retry; **HOLD** on cross-browser chat transcript (Founder decision) |
| Legacy migration | **PASS** (confirmed, verified, repeatable, recoverable) |
| **Overall** | **HOLD for production; preview ready.** Not merged, not deployed |
