# Brain Research Continuity, Identity and Verified Actions: Repair Report

**Status: repaired and certified locally; not merged, not deployed.**
- All 5 audit failures are traced to root causes in real account data and repaired in Brain-owned code.
- **18/18 signed-in journeys** pass with database checks and second-account isolation.
- The full regression suite shows **0 new failures** against the base candidate.
- **Not yet verified:** an isolated *preview* with real model replies (no preview or OpenAI access from this environment), and cleanup of the contaminated production records (needs your approval).

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| **Branch** | **`brain/research-continuity`** (pushed). Board integration is deliberately **not** on this branch. |
| Base | `0cb567fe7` (held Brain release candidate, `release/final-2026-10-08`) |
| **Commits** | `3f77bafad` research never joins unrelated work · `292ac23d8` rename/resume are verified actions · **`a82c2dfe7`** recent-research list dedupe |
| Test evidence | `adhd-companion` **`bedcef9`**: `brainresearch.mjs` (journey script) and `brainresearch-results.json` (18/18) |
| Production | unchanged (`main` = `d88a718ec`); no member data modified |

---

## 1. Root causes (from the account's real records, read-only)

The audit ran on a Brain build against the production database: `brain_trace` and `brain_matter` records from 2026-10-09 11:24–12:47 UTC.

| # | Failure | What the records show | Root cause (file) |
|---|---|---|---|
| 1 | "Renamed" but nothing changed | The rename turn was interpreted as `work_requirement` with ops `recordClaim, saveFoothold`. Claim `scope:rename_the_research_session_i_started` was written onto **"CERT Harbor Dental client workshop proposal"**. The research title was never touched. A later rename to "TEST renamed" **created a new research run** with that title. | `lib/brain/interpret.ts` / `workScope.ts`: work-identity "Law 1" reads anything said while work is in focus as about that work. There was no rename action for research, and no read-back before replying. |
| 2 | Resume made a duplicate | "Let's go back to the college research…" → `return_not_found`, listing only Matters ("Launch a course", "Course", the dental proposal). "None of those. Open my research about going back tocollege at 73." → `continue`. The legacy path then started research **titled with those words** (`rs_mv0xekyo`). The college question already existed **twice** (01:04 and 11:24). | `interpret.ts`: return targets were resolved only against Matters, never saved research. Nothing checked for existing research before launching. |
| 3 | College research filed on Harbor Dental | Every research collection that day had `matterId = mat_d95e…` (Harbor Dental). The dental Matter holds **37 claims**, including college, course-pricing and ADHD-noise research. | `lib/brain/proposals.ts` `targetMatter`: research with no Matter id **fell back to the work in focus**. `CompanionPageClient`: any turn with focus counted as "the room was opened for that work". `pipeline.ts` `recordAssistantReply`: Research-room replies wrote their questions onto the focus foothold. |
| 4 | Visual requests to unrelated rooms/work | "Create a concept map from this information" (pasted ADHD notes) → `work_task` with `saveFoothold` on the dental proposal (foothold room "research"). | `workScope.ts`: "this" was read as pointing back at the work in focus. |
| 5 | Success reported before verification | The rename reply came from the model with no action behind it. Work renames (`runWorkAction`) returned "Renamed" from the commit result without reading back. | `pipeline.ts` / `workActions.ts`; no research action path existed. |

## 2. Repairs (existing One Brain architecture and write contracts; no separate research Brain)

| Repair | Where | Commit |
|---|---|---|
| **Existing work is resolved before anything is created.** "rename X to Y", and going back to/opening/resuming research, are read **before** any work-content rule. They are never a claim and never new research. | `interpret.ts` (`research_action`, `rename_work`), new `researchReference.ts` | `292ac23d8` |
| **Rename existing research by its identity.** Resolved by the quoted beginning ("the one that begins '…'", typos tolerated) or by subject. Records with the same question are one research, and the newest copy is meant. Different fits are **asked about by number**. No fit means nothing is renamed and recent research is offered. | `researchReference.ts`, `researchActions.ts`, `persistence.ts` `retitleResearchRecord` (the record and all its threads; never re-forwards, never moves the active pointer) | `292ac23d8`, `a82c2dfe7` |
| **Verified success only.** A research rename is **read back**, then pushed to the account (`flushMemberSync`). "It's saved to your account" is said only when the push succeeded. Otherwise: "on this device, but it hasn't reached your account yet". A store that didn't keep it gets "its name hasn't changed". Work renames run through the one write path and are **read back from the store**; any mismatch gets an honest failure. | `researchActions.ts`, `pipeline.ts` | `292ac23d8` |
| **No duplicate sessions.** Going back to research opens the existing record (`reopenCollectionId`, exact record). Asking the same question again (repeat, retry, reload) reopens it, unless the member says "again/fresh/new". "None of those. Open my research…" is a reference, never a question. | `researchActions.ts` `existingResearchFor`, `CompanionPageClient` | `292ac23d8` |
| **No unrelated Project/Matter contamination.** Research joins a Matter only by an id it carries (captured **when it starts**, in a turn the Brain read as about that work), a Matter already holding it, or a question naming the focus work's own subject. Otherwise it is its own work. Replies in Research/Visual Thinking add questions or options to the focus work only when the Brain read that turn as about it. A rename/resume turn writes nothing on the focus work. | `proposals.ts` (`researchIsAbout`), `forward.ts` (`noteResearchLaunched`), `CompanionPageClient` (`BRAIN_WORK_TURNS`), `pipeline.ts` (`replyIsNotAboutFocus`) | `3f77bafad`, `292ac23d8` |
| **Visual requests.** "A concept map / timeline / diagram from this information" is not a task on the work in focus unless it names that work. The Research/VTS visual-intent improvements are untouched. | `workScope.ts` (`VISUAL_OF_MATERIAL`) | `3f77bafad` |
| **Ambiguity resolved conversationally.** Numbered choices; the member's "2" acts on exactly that record. A new reference in reply is handled as a new reference, never a pick. | `researchActions.ts` `answerPendingResearchChoice` | `292ac23d8` |
| **Context after navigation/reload.** Unchanged mechanism (account-backed conversation); verified (L1). Rename/resume never move the Brain's focus. | — | — |

**Behaviour change (intended), recorded for review:** a research question that names nothing of the focus work (e.g. just "pricing" while "Course launch" is in focus) is now its own work, unless it was launched in a turn the Brain read as about that work. One existing test encoded the old "joins focus" rule. It was rewritten to the new contract and two tests were added; nothing was weakened.

## 3. Automated tests

| Suite | Result |
|---|---|
| New `lib/brain/researchContinuity.test.ts`. Uses the audit's **exact sentences and real titles**: rename, resume, duplicates, quoted beginning, ambiguity, pick-by-number, nothing-matches, verified/unsynced/lost writes, college-vs-dental contamination, Research-room replies, concept-map routing | **23/23** |
| `lib/brain/researchContract.test.ts` (1 rule rewritten, +2 tests) and `client.test.ts` (+1 test for the browser action) | pass |
| `lib/brain` (all) | 266 tests; 1 failure, `brainDumpVisualClusters`, **pre-existing on the base** |
| TypeScript | per-file error codes and counts **identical to the base** (no new errors) |
| **Full regression suite** | Base `0cb567fe7`: **21,030 tests, 588 failing**. Branch `a82c2dfe7`: **21,056 tests, 588 failing** (+26 new tests).<br>Test by test: **1** newly failing and **1** no longer failing.<br>• Momentum Chime frozen-asset checksum: new failure on the branch run.<br>• Chamber portrait uniqueness: failed on the base run only.<br>Both pass when rerun alone on **both** commits; neither area is touched by this repair. Treated as full-run timing flakes. **0 new failures attributable to the repair.** |

## 4. Signed-in live results: 18/18 (local, isolated)

**Setup:**
- Local server on the repair branch, against a local database with production's rules.
- Two authorized test accounts.
- **Account A carries the member's real research titles** from 2026-10-09: both "pros and cons of a 73 year old woman going back to college" copies, the mistaken "What should someone know about None of those…" run, "sources 1 and 3…" and "Price the course". Each thread has realistic turns.
- Spark's model replies were **stubbed**; the Brain, routing, stores, account sync and database were real.
- Every database check reads the database directly.

| # | Journey | Result | Database / evidence |
|---|---|---|---|
| B0 | Real titles in the account | PASS | 5 records in `member_store` |
| B1 | Dental work in focus | PASS | `brain_member.focusMatterId` = the dental Matter |
| **R1** | **Rename existing research**, the audit's exact sentence | **PASS** | Reply: "Renamed "What should someone know about None of those…" to "AUDIT test - college at 73". It's saved to your account."<br>The DB title changed, there are still 5 records, and the dental Matter has **0** scope/requirement claims. |
| R1b | The thread carries the new name | PASS | Session title updated |
| **S1** | **Resume** "the college research I was just doing" (after R1, two *different* records say college) | **PASS** | Asked which (numbered); "2" opened exactly the college research. "Nothing new was started." 5 records. |
| L1 | **Reload and continue** | PASS | Conversation kept after reload |
| **S2** | "None of those. Open my research about going back tocollege at 73." | **PASS** | Opened the existing record: "You asked this 2 times; this is the most recent." No new record. |
| **P1** | **Repeat the same request** ("Research pros and cons of …") | **PASS** | "You already have research on this from Oct 9 — I opened it…". 5 records. |
| W1 | Switch to Harbor Dental | PASS | Focus = dental Matter |
| **W2** | Switch to college research | **PASS** | Research opened; **focus kept on the dental work**; dental Matter has 0 research claims |
| **C1** | College research saved while dental is in focus (`/api/brain/propose`, as Research does) | **PASS** | Filed on its **own** Matter ("pros and cons of a 73 year old woman going back to college"); dental untouched; focus unchanged |
| **X1** | **Correct a mistaken reference** ("my podcast research") | **PASS** | "couldn't find… nothing was opened and nothing new was started. Is it one of these?"; "2" opened that record |
| **X2** | Rename a piece of work | **PASS** | DB `brain_matter.title` = "Harbor Dental workshop 2026"; reply only after the read-back |
| **V1** | **Ordinary-language visual request** ("Create a concept map from this information" after pasted notes) | **PASS** | No `work_task`, no claim or foothold change on the dental work |
| **F1** | **Failed write** (account refuses the save, HTTP 503) | **PASS** | Reply: "…on this device, but it hasn't reached your account yet, so it isn't saved everywhere…". **DB title unchanged** while failing. |
| F2 | The write lands once the account is reachable | PASS | DB title = "College decision 2026" after retry |
| **I1** | **Second account isolation** | **PASS** | Account B: 0 research records; "Open my research about going back to college" finds nothing and starts nothing |
| N1 | No research run started by any rename/resume/repeat | PASS | 0 research model calls |

The script and raw results are pushed (`bedcef9`).

**Evidence runs:**
- The final run is the one above (18/18).
- An earlier run showed 2 stray research runs. They came from **my seed's empty threads**: the account's real threads all have 1–13 turns. With realistic turns there were 0.

## 5. Not verified

| Item | Status |
|---|---|
| Isolated **preview** with **real model** replies and live research | **BLOCKED**: this environment can't reach `*.vercel.app` or `api.openai.com` |
| The exact failures on the **production account itself** | Not run: no changes to member data. The same titles were replicated in an isolated account. |
| Physical second device | Not run (second **browser context** used) |

## 6. Unresolved

1. **Production data already contaminated (needs your approval to clean; nothing changed):**
   - Harbor Dental Matter `mat_d95e393696034fe1` holds research claims from unrelated runs (college, course pricing, ADHD noise) and the `scope:rename…` claim.
   - All recent research collections carry `matterId = mat_d95e…`.
   - The mistaken run "What should someone know about None of those…" (`rcol_mv0xekyo`) and "TEST renamed" (`rcol_mv0yn69e`) exist.
   - **Proposed:**
     - supersede (not delete) the foreign research and scope claims on the dental Matter;
     - clear the wrong `matterId` on those collections;
     - leave the two mistaken records for you to Trash from the Research Library.
2. **Coordination with the Research agent** (`vts/universal-visual-quality` @ `6f3369868`):
   - **Library rename** (`04ada43c2`) vs **conversational rename** (`retitleResearchRecord`): both must reach the same record, thread and account copy. Archived/Trashed records should be excluded from conversational resume (the Brain currently uses `listSavedResearch`: status saved/active).
   - **Visual intent** (`283b951af`) vs Brain `VISUAL_OF_MATERIAL`: compatible by design, but needs a combined-build test.
3. **Board integration**: paused until the two handoff documents arrive. It will go on a **separate branch** from the agreed baseline, reconciling `lib/brain/proposals.ts` (this branch changed only its research path).
4. **D11** (account updates rate-limited, 429): pre-existing; separate.

## 7. Integration requirements (for the Production agent)

1. Combine with the production security and D9 commits (`515d77f57`, `c13fec292`, `48c4c8af3`, `d88a718ec`), plus the Research branch if included. The base already contains the strict dashboard guard and D1.
2. Expected overlaps:
   - `app/companion/CompanionPageClient.tsx`;
   - `lib/researchLibrary/persistence.ts` (Research Library management);
   - `lib/brain/proposals.ts` (Board).
3. Re-run:
   - `lib/brain/researchContinuity.test.ts`;
   - the full suite against the same-scope baseline;
   - the journey script `brainresearch.mjs` (local signed-in, two accounts).
4. Then on the combined preview with real replies:
   - R1, S1/S2, P1, W2, X1, F1 and I1, verifying the database each time;
   - **Library rename + conversational rename** on the same record.
5. Kill switch, unchanged: `NEXT_PUBLIC_ONE_BRAIN=0` (the research actions ride on the Brain turn). No database migration.

**No merge and no deployment were done.**

---

## Erratum (2026-10-09): full-suite test counts

**What was wrong:** §3 quoted **unique test names** (21,030 base and 21,056 branch) as test totals.

**The Vitest totals from the same saved runs** (no rerun):

| | Vitest total | Passed | Failed | Skipped | Unique names |
|---|---|---|---|---|---|
| Base `0cb567fe7` | **21,041** | 20,389 | **588** | 64 | 21,030 |
| Branch `a82c2dfe7` | **21,067** | 20,415 | **588** | 64 | 21,056 |

**Why they differ by 11:** in both runs, 8 test names repeat (parameterised tests such as `memberAuth.route` and `companionIntentRouting`), giving **11 extra rows**. All 19 of those rows **pass** in both runs, so the failure comparison is unaffected.

**Where the +26 tests come from:**

| File | Base | Branch |
|---|---|---|
| `researchContinuity.test.ts` | 0 | 23 |
| `researchContract.test.ts` | 17 | 19 |
| `client.test.ts` | 5 | 6 |

**Conclusions unchanged:** 588 failing in each; 0 new failures attributable to the repair. The 21,041 base figure matches the earlier recorded run of `0cb567fe7`.
