# Spark Estate: One Brain Account Persistence and Member Isolation

**Verdict: HOLD for production. PASS for the integration preview.**

Your work now follows you between browsers, and a second member using the same browser sees none of yours. Every check below was run live: Chromium browser contexts against a real Supabase stack running locally. Production needs three things, under [Remaining blockers](#remaining-blockers):
1. the database migration applied and confirmed;
2. a hosted preview deployment;
3. a check on a real phone.

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Branch (integration preview) | `integration/one-brain-member-persistence` |
| Head commit | **`f4c833c79`** |
| Commits in this work | `bcd2d6569` isolation, account sync, chat auth, legacy claim, RLS migration · `8db43a616` fixes · `6588310a8` full coverage, conversation continuity · `c641c5ffe` held reminders, resume line, member-level day, sign-out on this device only · `f4c833c79` changes shown when you return to a page |
| Baseline for all comparisons | `d472838f8`, which is One Brain convergence R1 + Strategy continuity + Research R8, before any of this work |
| Served preview version | `f4c833c79` served by `next dev` against local Supabase (GoTrue + PostgREST + Postgres, Supabase CLI 2.119). **There is no hosted preview URL:** this session has no Vercel access. |
| Not done | Nothing merged to `main`. Nothing deployed. No production database touched. |

---

## 1. Current truth (reconciled)

- **Branches.** The active One Brain line is `atomic/one-brain-convergence-r1`, which is based on `main`. Two branches were merged on top:
  - `feat/one-brain-strategic-continuity`;
  - `atomic/research-r8-readout`.

  Both merges had small additive conflicts, and both sides were kept. `fix/one-brain-p0-execution` was not merged: its work was already hand-ported, and its Strategy Undo overlaps newer work.
- **Uncommitted work.** Before this round the integration tree was clean, apart from test-generated artefacts that tests rewrite. Nothing newer was lost.
- **The older OB-6 audit is out of date.** It said only Create, Saved Spark and billing were on the server. On the current line these were also already on your account:
  - Decision Ledger;
  - strategic resume point;
  - My Strategies;
  - strategy work items.

  Everything else was in the browser only. Browser data was not separated per member, and the chat path did not check sign-in.

---

## 2. What changed for you

### Your information is kept separate per member
- Every browser cache and every piece of temporary context is stored under the signed-in account. A second member signing in on the same browser starts empty.
- On sign-out or an account switch, including one made in another tab:
  - requests still in flight for the previous member are cancelled;
  - late answers are thrown away;
  - the page is reloaded, so nothing stays in memory.
- **Your own copy is never erased.** It stays under your account in that browser and on the server.
- **Sign-out now ends only this device's session.** Your phone stays signed in when you sign out on the computer. Before, signing out anywhere signed you out everywhere.

### Your work follows you
- Your persistent work is stored on your account, and each browser keeps an account-scoped cache of it.
- Two browsers editing at once are merged record by record. Nothing is silently overwritten.
- A removal travels as a removal; a restore brings the item back.
- A save that fails stays queued, is retried, and is never lost. The workspace waits for your account copy before it opens.
- When you return to a page (the tab or app comes back into view), it shows changes made on your other device. It never reloads while you are typing.

### The conversation follows you
- The current conversation, its pending question and its return point move with you.
- **The newest real conversation wins.** An empty fresh visit, or **New Chat** on one device, never wipes the conversation on the other. A replaced version stays recoverable.
- Earlier conversations are kept in an account-backed archive.
- After a refresh, a new sign-in or on another browser, the conversation reopens with this line:

  > Picking up where we left off — you were working on "…". I'd asked: …

- "First visit of the day" is now tracked per member. Opening a second browser the same day no longer starts a New Day and clears the conversation.

### Interruptions don't lose work
- **"Remind me tomorrow to call Susan about the venue"** now keeps "tomorrow" and asks only: *"What time tomorrow should I remind you?"*
- **"OK, back to the speech"** no longer gets re-asked as if it were a time. Spark says the reminder is held and **not set yet**, then returns to the question the speech was waiting on.
- A later **"9am"** completes the reminder for tomorrow at 9:00.

### Server and database
- The four member chat/data routes require a verified sign-in: `/api/companion-chat`, `/api/claire-reasoning`, `/api/research-live` and `/api/board/recommend`.
  - A missing or forged token gets **401**.
  - A token that doesn't match the browser's member scope gets **409**.
  - A browser-supplied member id is never used as authorization.
- Row-level security: each member can read and write only their own rows. Removal is soft. The migration covers both member records and Create workspaces.
- The chat model still receives this turn's context, built from your own isolated, account-merged data.

---

## 3. Persistence coverage by capability

| Capability | What is on your account | Notes |
|---|---|---|
| Business profile and change history | ✅ business profile envelope, including its write log; business OS; decision intelligence | |
| Ideal clients and Living Model data | ✅ ideal clients. Living Model answers are fact records inside the business profile. | `lib/lmc` keeps no store of its own |
| Decisions and their reasons | ✅ Decision Ledger (existing account domain) | Reasons travel inside each entry |
| Projects and linked pieces | ✅ projects, project items, project conversations, continue point, asset notes and files, plan completions, moments | Live-checked: create, edit, remove, restore, concurrent edits |
| Board, Chamber, Strategy | ✅ director discussions, boardroom, call-the-board, intake draft; Chamber resume, participants, meta, patterns, blockers, preferences; strategy decision memory, patterns, connections, active item, apply; outcome thread and goals; My Strategies and strategy work items (existing domains) | |
| Research findings, sources, retrieval dates | ✅ collections, sessions, inquiries, active, observations, pending | Live-checked: findings, links and retrieval dates arrive intact in the other browser |
| VTS maps | ✅ | Live-checked: a comparison made in one browser is present in the other |
| Events | ✅ event records, active event, assets, Q&A turns | |
| Reminders, Rhythms, Plan My Day | ✅ reminders; rhythms (including per-owner); rhythm history and preferences; attention holds; day state; time blocks; Plan My Day items and Parking Lot holds (per owner); schedule preferences; completion history | Reminder live-checked: the Susan reminder reaches the second browser |
| Clear My Mind | ✅ brain dumps, draft, active session, thought collections, custom categories | |
| Conversation, pending questions, active work, return points | ✅ current transcript and spine (newest wins); conversation archive; active work; handoff stash; strategic resume point (existing domain) | Live-checked: refresh, second browser, sign-out/sign-in |
| Preferences and learned context | ✅ preferences, relationship memory, preference, learning and intelligence; support style; focus and talk-it-out preferences; discovery history and journey; onboarding | |
| Create | ✅ its existing table, now with row-level security | |
| Evidence Vault | **Kept separate as instructed.** Isolated per member; not synced; no new links. | |
| Temporary screen state (tab-only navigation, drafts in session storage) | Stays in this tab, isolated per member | As permitted |

---

## 4. Migration and recovery

- **Older data with no owner** (saved before accounts were separated, or while signed out) is hidden and never attached automatically. On sign-in you are asked **"Is this your work?"**:
  - **Yes:**
    1. it is merged into your stores by record id, so repeating it creates no duplicates;
    2. it is saved to your account;
    3. **the account copy is verified**;
    4. only then are the originals moved to a recoverable archive. They are never deleted.
    - If verification fails, nothing is moved and Spark tells you so.
  - **Not mine:** remembered for you only. The data stays untouched for whoever owns it.
  - **Decide later:** you are asked again next time.
- **Recovery:** archived originals can be put back (`restoreLegacyArchive`).
- **Database:** `supabase/migrations/20261002_member_isolation_rls.sql` is idempotent; it was applied twice without errors.

---

## 5. Live verification evidence

**How it was tested.**
- Chromium in separate browser contexts (independent storage), one of them at a phone-sized viewport (390×844, touch). **This is browser-context testing, not a physical phone.**
- Supabase is the real software stack, running locally. Two real accounts were used.
- **The language model's replies were stubbed at the network layer** (no model key here). Everything else is real: routing, reminders, research read-back, VTS, stores, sync, auth and RLS.

### Candidate `f4c833c79` vs baseline `d472838f8` (same scripts, same environment)

| # | Check | Candidate | Baseline |
|---|---|---|---|
| **Founder speech → visual aids → choice → development → Susan reminder → return** | | | |
| F1.1 | Speech, visual aids, choice and development stay in one conversation | PASS | _see §5a_ |
| F1.2 | A day-only reminder keeps the day and asks only the time | PASS | |
| F1.3 | "Back to the speech": reminder held, not claimed saved; speech question restored | PASS | |
| F1.4 | The next reply continues the speech with its history | PASS | |
| F1.5 | "9am" completes the held reminder (tomorrow 9:00) | PASS | |
| **Refresh and sign-in continuity** | | | |
| F1.6 | Refresh reopens the work and its pending question | PASS | |
| F1.7 | Second browser context (phone-sized) gets the same conversation, pending question and reminder | PASS | |
| F1.8 | Continuing there keeps the full history | PASS | |
| F1.9 | Sign-out hides the work; signing back in returns it, including the other browser's turn | PASS | |
| F1.10 | Signing out on one device leaves the other signed in | PASS | |
| **Research → grounded answer → selected-findings VTS → return** | | | |
| F2.1 | Research saved in one browser is read back in the other from the saved findings, with no model call | PASS | |
| F2.2 | The read-back shows clickable sources; retrieval dates are intact | PASS | |
| F2.3 | Two chosen findings compared inside the visual ("Comparing 2 of 7") | PASS | |
| F2.4 | Back returns to the originating research | PASS | |
| F2.5 | The VTS map is on the account and in the other browser | PASS | |
| **Two accounts, one browser** | | | |
| S1.0–1.2 | Sign-out; A's work never appears on B's screen | PASS | PASS (but A's data remained readable) |
| S1.3 | B's stores contain none of A's information | **PASS** | **FAIL** (B reads A's ideal client) |
| S1.4 | B's chat request carries none of A's information | **PASS** | **FAIL** (A's data in B's prompt) |
| S1.5 | Chat requests carry the member token and scope | PASS | token only |
| S1L.1 | A's late answer, arriving after another tab switched account, never reaches B | PASS | PASS |
| **Same account, two browsers** | | | |
| S2.1–2.6 | Save, conversation spine, edit, remove, restore, whole-store tombstone | **PASS** | FAIL (except the trivial 2.6) |
| S3.1 | Concurrent edits in both: both kept, no duplicates | **PASS** | FAIL |
| S4.1–4.2 | Failed save (HTTP 500): kept and queued, then retried and delivered | **PASS** | FAIL |
| **Legacy data** | | | |
| S5.1–5.4 | Asked, not silent · merged, verified, archived · repeat makes no duplicates · "Not mine" respected | **PASS** | FAIL / n/a |
| **Server** | | | |
| S6.1–6.4 | No session: 401 · forged token: 401 · mismatched member: 409 · signed in: 200 | **PASS** | 200 / 200 / — / 200 |

**Candidate: 39/39.**

**Database (live, local Supabase):** 11/11. This covers:
- two browsers converge through the account, including concurrent edits;
- tombstone and restore;
- member B cannot read, overwrite or plant member A's rows in either table;
- anonymous callers have no access.

**Unit tests (new):** 58 pass. They cover the scope shim, merge, sync engine (including the newest-wins conversation rules), server member check, route rejection, legacy claim, resume line, conversation archive and the held-reminder flow.

### 5a. Baseline flow results and full-suite comparison
_Filled in from the identical runs below._

---

## Remaining blockers

1. **Production database (access needed).** Apply `20261002_member_isolation_rls.sql` in production Supabase. First compare it with the live `pg_policies` for `companion_creation_workspaces`, because its earlier policy text was never verified.
2. **Hosted preview and deployed version (access needed).** Deploy `integration/one-brain-member-persistence` to a Vercel preview with the production-like Supabase. This session cannot reach Vercel, so the served version above is the local build.
3. **A real phone has not been tested.** All mobile evidence is a phone-sized Chromium context. Safari/iOS and Android Chrome still need a check, especially IndexedDB for the merge copies and the beforeInteractive script.
4. **The same conversation open on two devices at the same moment.** If you type on both without either page coming back into view, the newest conversation wins on your account. The other version is kept in the recoverable conflict log; it is not merged turn by turn.
5. **Granularity.** Each store is one account record, merged by record id. That is correct, but a very large store (a long research library) is rewritten whole on each change. Moving to per-record rows would scale better.
6. **Other `/api/*` routes.** They now receive your sign-in token, but only the four member-context routes require it. The remaining paid AI routes should be reviewed.
7. **Observed, unchanged.** Replying "My topic is ADHD in business" while a numbered choice is pending gets *"I'm not sure which option you meant"* and the choices again. That reply stays bound to the pending choice by the existing one-question rule. Recording the topic as context while keeping the choice open would be a separate improvement.

---

## PASS / HOLD

| Area | Result |
|---|---|
| Member isolation (screens, stores, chat context, late answers) | **PASS** (live) |
| Server ownership: chat path auth, RLS | **PASS** locally · **HOLD** until the migration is confirmed in production |
| Account persistence across browsers (create, edit, reopen, remove, restore, continue) | **PASS** (live, browser contexts) |
| Migration, repeats, failed saves, concurrent edits | **PASS** |
| Founder speech flow · Research → VTS flow · refresh and sign-in continuity | **PASS** |
| **Overall** | **HOLD for production** (blockers 1–3 need access or a device) · **PASS for the integration preview** |
