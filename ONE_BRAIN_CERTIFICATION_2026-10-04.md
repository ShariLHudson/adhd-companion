# One Brain — Certification Report (2026-10-04 → 2026-10-05)

**Integration branch (single):** `one-brain/convergence` @ `4058d03f32e97da736d00e41e6629b5a2a308fc8`
**Preview of that commit:** Vercel "Deployment has completed": https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/CRzR3Mg22i97s88zRLsLea47opFL (open it, press **Visit**)
**Production:** `main` untouched. **Release gate: CLOSED. Production: HOLD.**

## Current status (2026-10-05)

### Verdict

**Not ready for release.** Every live desktop step run so far either passes, or failed and was fixed and passed on retest. The remaining desktop checks, the phone, cross-device and member-isolation checks have not run yet.

### VERIFY: how it works today, the gap, and the change (`c3773dae`)

**How VERIFY works today (before this change):**
- **Writes:** compare-and-set on every record version, so a stale device cannot overwrite newer state.
- **Decisions:** only current decisions reach any model call; superseded ones are history. A short reply resolves only an Open Offer that is still open, and only on the work in focus. "Actually no…" corrects the last resolution only.
- **Resume:** the line is read fresh from the server's saved place in the work (its Foothold), never from a browser cache or a stale pending question (fixed today).
- **External actions (Action Gateway):** an approval is bound to the exact target and payload fingerprint, so a changed payload voids it. An idempotency key prevents double sends. Nothing is called done until the provider confirms it.
- **Reconcile:** applies only the exact plan the member reviewed (fingerprint).

**The gap this requirement exposes (real):** VERIFY checked execution and payload integrity, not whether the situation was still current at the moment of acting. Concretely:
1. A conversation → Create build kept writing sections even if the member had since approved a different outline, or archived or combined the work.
2. "keep writing" would resume on the old outline.
3. The Action Gateway does not re-check, at execute time, that the work and decisions behind a prepared action are still current. The payload check catches edits, but not a newer decision or a reply that arrived meanwhile.

**Smallest reliable change (done for 1 and 2; 3 is the next step):**
- **Done (1 and 2):** a build records which approved outline it is based on. Each section re-checks on the server that the work is still open and current, and that the outline was not replaced. If not, it stops honestly and keeps what was written. "keep writing" after an outline change asks once instead of resuming. Silent when nothing changed. 4 new tests.
- **Next (3), when the next external action is wired:** the gateway records the work's current decision ids at "prepared" and re-checks them at "execute". If they changed, or the follow-up's recipient has already replied, it returns `situation_changed` and asks once.
- **Not built:** Authority Scope (what Spark may do externally). It stays a retained future requirement; the gateway's approval binding is today's boundary.

### Shared workflow: implemented on `33a20d8d` (2026-10-05; Vercel "Deployment has completed"; full suite running)

**Live desktop (W-steps):**

| # | Step | Result | Evidence |
|---|---|---|---|
| W0 | Review notice appears (`33a20d8d`) | **PASS** | Screenshot: "Some of your work was saved more than once. Review" |
| W1 | Review → Combine (`c3773dae`, 15:25) | **PASS (partial)** | Live trace `turn_fbd2…` `reconcile`: Chicago unlinked, 4 merges, 2 requirements. `mat_0fee…`, `mat_db4b…`, `mat_58d7…` and `mat_27a8…` are now superseded with `mergedInto` = course (kept, not deleted). Course: **$59** and the outline choice still current; Project `1791141639086-ntyago` linked; Project **renamed to "Launch a course"** (synced record, 15:25:14). The "everything we write…" Matter was not included (the include option was not used) |
| W1b | Include the mixed Matter | **FAIL → fixed (`12790bfd`)** | After the combine the review notice disappeared: the planner lost the trail because the work in focus when that Matter was made had itself been merged. Fixed: reconcile follows merged copies, and the notice stays while a kept-separate item remains (test reproduces the live order) |
| W1c | Combine should open a Project | **Added (`12790bfd`)** | After combining, and when Continue opens work that has a Project, its Project home opens (next step, decisions, requirements, materials, "Pick up in conversation") |
| W2 | Combine again (`12790bfd`, 15:35) | **PASS (Project) / FAIL (include) → fixed (`a65c5fb5`)** | PASS: after Combine the **Launch a course Project home opened**, showing "Still open: Which one would you like to tackle next?", "Decided: $59 · Creating a course content outline", both requirements in the member's words (the partial one marked), and "Pick up in conversation". FAIL: trace `turn_d0fa…` shows that Combine saved one requirement and did **not** include the mixed Matter. The include link was easy to miss, and the review kept re-offering a requirement that was already saved (a no-op, since the claim id was the same). Fixed: two clear buttons ("Combine all: … is part of … too" / "Combine, but keep it separate"), and a saved requirement is never offered again |
| W3 | "Combine all" → one course entry (`a65c5fb5`, 15:45) | **PASS** | Screenshot: Continue shows "1. Launch a course · Still open: Which one would you like to tackle next?" and "2. Speaking Engagement in Chicago Checklist · In Progress", then "Combined. Nothing was deleted. Undo". Live records: `mat_39c2…` superseded with `mergedInto` = course; course current decisions **$59** and "Creating a course content outline"; the unrelated "Working on the brain configuration of the app" is kept as **history (superseded)**, not as a course decision; Project `1791141639086-ntyago` "Launch a course"; focus = course. **One course, one Matter, one Project, one Continue entry** |
| W4 | "every lesson needs a 5-minute action step" (16:10, `4058d03f`) | **PASS** | Trace `turn_84e0…` `work_requirement`, ops `recordClaim` + `saveFoothold`, selected `mat_61a6…`. Saved on the course as `requirement:every_lesson_needs_a_5_minute` (member_statement, the member's own words). **No new Matter** since 15:46. The follow-up "help me figure that out" (`turn_d81a…`) also stayed on the course. Note: Spark's reply treated the requirement as a lesson-planning prompt rather than acknowledging it; a style point, not an identity failure |
| W5 | "Develop lesson 1 in Create using our approved outline and course requirements. Save it under Launch a course and give me a link to reopen it." | pending on `adc3bd2c` (Vercel "Deployment has completed": https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/34J2ECuamyRzgx1xgvaycy6HNwmZ). Checked just before: course Matter v32 has requirements, no `approved_outline`, no `outline_candidate`, no Create link | **Found before it was typed:** (1) the course has **no approved outline saved**: the 13:16 approval predates outline saving, so there is nothing to build from; (2) "lesson 1" (one part) was not a Create request; (3) there was no reopen link. Fixed in `4058d03f`: with no approved outline, Spark says so and offers to draft one for approval, and writes nothing. With an approved outline, only lesson 1 is written, from the outline and the requirements, into the course's Create piece, then a "Reopen it in Create" link (`/companion?creation=<id>`). A menu of options is no longer mistaken for an outline. Tests: 5 new; Brain and route suites 189/190 (the remaining failure also fails on the base) |
| W5-fix | Shared approval → save path, every document type (`cac88b21`, `adc3bd2c`) | **Fixed, code-verified; live retest pending** | (1) An approval now looks at the **last two** Spark replies, so a reply in between (a question, a note) no longer loses the outline. (2) A build request with no approved outline but an outline **found** for the work (a recovered copy, or an outline Spark gave earlier in the conversation) shows that outline **word for word** and asks one yes/no: "Is this the outline you approved?". **Yes** saves it as the approved outline (member_decision, the "yes" quoted) and runs the build that was asked for. **No** writes nothing. Nothing is generated in its place. (3) Nothing found at all: Spark says so honestly and writes nothing. (4) The browser says "Saved" only after reading the Create piece **back from the account** (`fetchAuthoritativeCreation`); then the reopen link `/companion?creation=<id>`, which also works after reload. (5) Shared by type: course, proposal, event plan, email sequence, checklist, guide (tests for course, proposal and event). (6) `adc3bd2c`: Spark's closing question ("Does this outline resonate…?") is no longer stored as a point of the last section |
| W5 live | Lesson 1 request, 18:23 UTC (on `adc3bd2c`) | **FAIL → fixed** | Trace `turn_5d62…` `develop`. Spark showed the **16:11 brainstorming menu** ("Understanding the Course Topic / Identifying Your Audience / Setting Learning Goals … Which of these options resonates with you?") as "the outline from earlier". It saved that menu on the course as an `outline_candidate` (spark_inference) and opened "Is this the outline you approved?". **Verified nothing else was written:** no `approved_outline`, no Create row since 18:00, no creation link. $59 is still current and all three requirements are still current. **Cause:** the "is this an outline?" check accepted numbered items with no points of their own when the text contained the word "outline" anywhere ("Guide students to *outline* what they want…"). **Fixed in `121a02a3`, shared for every document type:** (1) a document outline gives its sections points of their own. (2) Bare numbered items are **choices**: never an outline when the Brain recorded them as an offer that asked the member to pick, and otherwise only when Spark presented them as the outline / agenda / sequence and asked no one to pick. (3) A saved outline candidate that reads as a menu is ignored. (4) The approved outline always wins over anything more recent. Regression tests use the live menu text: menu ≠ outline; menu-only → honest "no approved outline", nothing saved; recovered outline plus a more recent menu → the recovered outline is shown. Brain and route suites 195/196 (the remaining failure also fails on the base); 365 type errors (no change) |
| W5-recover | The outline the member approved at 13:16 | **Recovered and saved as a candidate, 18:33 UTC (not approved)** | Not in any record (Matter claims and decisions, traces, the archive, every `companion_creation_workspaces` row): the approval came before outline saving existed. The only copy is the member's paste in this thread: 6 sections, 12 points, from "Introduction to ADHD in Business" to "Wrap-up and Action Plan", kept **word for word** (including Spark's closing question, which the parser leaves out of section 6). Written on `mat_61a6…` with a version check (v33 → v34): new claim `clm_recovered_1316_outline` (`outline_candidate`, source `legacy_record`, quoted as recovered from the member's copy, "not approved until the member confirms"). The wrong menu candidate is kept as **superseded** history, not deleted. The open yes/no `off_7877…` is **expired**, so a "yes" can no longer approve the menu. The stale `lastOffer` was cleared (state v52 → v53). After: $59 current, "Creating a course content outline" current, 3 requirements current, `pending_develop` (the lesson 1 request) kept, 0 open offers, no creation link |
| Note | Board room, 18:32 UTC | **Finding (not fixed here)** | The member's Board message about marketing the app started a separate Matter `mat_617d…` and moved focus to it. That is correct work identity (different work, different room). But that turn left **no Brain trace** (`turn_f532…` has no trace record). Logged for the Board pass. Focus must return to the course before the lesson 1 request |
| W6 | Continue after the Board question (screenshot, on `121a02a3`) | **FAIL → fixed** | Continue listed: 1. the Board question, as its raw sentence ("i don't know much about marketing my app…"); 2. Launch a course, "Next: Confirm the outline you approved, then write lesson 1"; 3. the Chicago checklist. **Member:** the Board question is not something to return to, and there was no way to clear entries. **Causes:** (1) convening the Board (and the Chamber) created a new piece of work and moved focus to it; (2) only Brain work had a menu: older workspace entries like Chicago had none; (3) the ⋯ menu offers Remove from Recent and Archive, but nothing says so until it is opened. **Fixed in `bf5101e9`:** Board and Chamber questions join the work in focus only when they are about it; otherwise they create nothing and focus stays. Older workspace entries get ⋯ → Remove from Recent (kept and restorable, with Undo). ⋯ is larger and has a tooltip. The existing Board entry `mat_617d…` was **not removed by me**; it is the member's to remove (⋯ → Remove from Recent; nothing is deleted). There is no permanent Delete on Continue by design (saved work is preserved); to be confirmed with the member. Tests: 1 new; Brain, route and Daily Opening suites 305/306 (the remaining failure also fails on the base); 365 type errors (no change) |
| W6b | ⋯ → Remove from Recent on the Board item (on `bf5101e9`) | **FAIL (not yet reproduced)** | Member: "didn't work"; the item was still listed. **Nothing reached the account:** `mat_617d…` was unchanged at v1, and no Brain write came after 18:35. The server action itself works on an exact copy of that record ("Removed … from Recent. The work itself is kept."). The jsdom click test passes. So the break is in the live page, between the click and the request; asked the member what they saw. **Done for the member, as asked and reversible:** `mat_617d…` set to hidden from Recent (v1 → v2), and focus returned to the course (state v54 → v55). Nothing deleted |
| H0 | **Page harness** (new, `5a8f654a`, `e2e-harness/`) | **Built** | Why: this container cannot reach the Vercel preview, Supabase or OpenAI (network policy), so I could not drive the live page. The harness runs the **real companion page** (local `next dev`) in Chromium. Its `/api/brain/*` calls go to the **real route handlers** and Brain code, on a memory store. The browser's Supabase calls go to an in-memory stand-in for the same tables. Only the token check, the section model and Spark's chat reply are canned. The account is rebuilt through the real routes to match the live one: course, $59, 3 requirements, the recovered outline (unconfirmed), the Project, and the Board item in focus. **Not covered:** the production build, real Supabase/RLS, the real model, a phone. Run with `PAGE_HARNESS=1 npx vitest run e2e-harness` |
| H1 | Remove from Recent, through the page | **PASS (harness)** / **live: not reproduced** | ⋯ on item 1 → Remove from Recent: one `POST /api/brain/work` → 200, record hidden, notice shown, list shows only "Launch a course". **After reload it stays removed** (read back from the account store). A forced save failure shows "That didn't save just now, so nothing changed (…)" **in view**. **Live cause still unknown:** nothing reached the account at 18:50. Before `5a8f654a`, any failure message appeared at the bottom of the card, below the fold in the member's screenshot. **Fixed:** the message now shows under the card title, and failures are logged with their code in the browser (`[work-action-failed]`) and the server (`[brain-work-action-failed]`). The live Board item is still hidden by my **temporary** account repair, which is not a pass. Tracked separately |
| H2 | Course, end to end through the page | **PASS (harness, `5a8f654a`)** | Continue → "Launch a course" opens its **Project home** (next step, $59, 3 requirements) → Pick up in conversation → the lesson 1 request → Spark shows the **recovered six-section outline** word for word (not the menu) and asks "Is this the outline you approved?" (nothing approved yet) → "yes" → `approved_outline` saved (member_decision, "yes") → lesson 1 written with **all 3 requirements in the writer's prompt** → saved, read back, linked to the course (`links.creation`) → Create opens **on lesson 1**, titled "Launch a Course" → chat: "Saved: "Introduction to ADHD in Business" is in Create under "Launch a course"… Reopen it in Create" → Foothold "Write section 2 of 6" → reload: conversation and link kept → link on a **fresh load** opens lesson 1 → **Projects → Launch a course → "Open in Create: Launch a course"** opens lesson 1 |
| H2-fix | Found and fixed while driving the course | **Fixed (`5a8f654a`)** | (1) The Create title was garbled (`Course" From Approved Outline`), and Projects called it "Launch a course: full course". Pieces are now named after the work, the same everywhere, for every document type. (2) "Develop lesson 1" opened on an empty section 2; a one-part build now opens on that part |
| H3 | Proposal, through the page | **FAIL → fixed → PASS (harness)** | With the course in focus: "I'm pitching Acme on a rebrand. Give me an outline for the client proposal first." **Before the fix**, this was read as part of the course. "looks great" saved the **proposal outline as the course's approved outline**, and "write the full proposal in Create" built 5 proposal sections into a piece **under the course**. That is the same mix-up as all day, caught here before reaching the member. **Shared fix:** a request naming a different **standalone** piece (proposal, course, event, book) that does not point back is new work. Supporting pieces (sales page, emails) still get the one short question. A sentence about the member's own other thing ("marketing **my app** … sell **it**") never attaches to the focused work; this also fixes the live "saved more than once" note, which would have offered to merge the Board question into the course. **After:** new work "Client proposal"; approved outline on it; 5 sections in Create titled "Client Proposal"; **0 course requirements in its prompts**; course decisions unchanged and no Create link added to it; link on a fresh load opens the proposal |
| H-suite | Regression check | **0 new failures** | Brain, routes, Daily Opening, companion components, creationDurable, registry and createEstate: 144 failures of 1,765 on `bf5101e9` vs 144 of 1,767 at `5a8f654a`, the **same tests**. 365 type errors (no change) |
| Side | Onboarding profile | **Finding (not fixed)** | Live `companion-phase1-onboarding-v1` has course chat stored as profile fields (e.g. businessType "every lesson needs a 5-minute action step", winDefinition "develop the course first"). The legacy onboarding capture is still reading chat turns. Logged |

| Area | What is implemented | Verified how | Result |
|---|---|---|---|
| Work identity | While work is in focus, tasks ("let's start at the top and develop lesson 1"), requirements and scope changes stay with it. New work needs an explicit signal ("a new…", "another…") or a clearly different declared intent ("I need to write a proposal for Acme"). Errands and unrelated questions are never attached. When unclear ("let's write a sales page"), Spark asks once: part of X, or separate? | 20 classifier cases from the member's real sentences plus event and proposal cases; the journeys below | **PASS (code)** |
| Requirements and tasks | Saved on the Matter in the member's words. Shown in every model call and in Create's section writer. A task becomes the next step | Journeys: the section-writer prompt contains the decision and the requirement | **PASS (code)** |
| Spark's follow-up choices | Choices whose question refers back to the work ("Where should it be?", "How should we price it?") belong to it | Event and proposal journeys | **PASS (code)** |
| Reconcile, not hide | Duplicates are merged from records and history (same member statement; made while other work was in focus, and is a task or requirement of it). Copies are kept, superseded, with a pointer. Links (including the Project), decisions, offers and rooms move. A Matter holding its own decisions is left as it is, and its requirement is carried over. A Create link is removed only when that piece's own record shows it is other work. The member reviews, then applies exactly the reviewed plan. **Undo** restores it exactly | `reconcile.test.ts` replays the member's live records, including apply and Undo with an exact before/after match | **PASS (code)**; **live apply pending the member's review** |
| Chicago link | Verified first: `work-417dc…` is "Speaking Engagement in Chicago Checklist", made 2026-09-30, before the course existed, for "Create a checklist for a speaking engagement in Chicago". The link was added at 11:49 by a reopen that joined the focus. Only that link is removed; the piece itself is untouched | Record evidence, and in the plan | Planned |
| Saturday Project | `1791141639086-ntyago` **is in the account** (synced `companion-projects-v1` record), not browser-only. Reconcile moves its link onto the course Matter. The Project record is unchanged | Live database | **Preserved** |
| Continue | One entry per open piece of work, with its next unfinished step. Legacy items appear only when no work links them. Actions: **Edit, Move to Project, Remove from Recent (work kept), Archive**, each with **Undo** | Journeys (all actions and their Undos through `/api/brain/work`), card tests | **PASS (code)** |
| Project home | Shows its work from the Brain: next step, decisions, requirements and Create materials. Create pieces keep their Project on save (two save paths fixed) | Type check; lightweight imports only | **PASS (code)** |
| Three journeys | Course, event and client proposal through the real routes. Each one: one identity; decisions; requirements; errands and unrelated questions not attached; an unclear item asked once; outline approved; Create build interrupted after 2 sections; reload on another device shows the next step "Write section 3 of N"; "keep writing" resumes at 3; Move, Remove and Undo, Archive and Restore all leave one identity intact | `sharedWorkflowJourneys.test.ts` (4 tests) | **PASS (code)** |

**Member records found today (they change the plan):** at 14:05–14:07 the member had an unrelated conversation ("working on the brain configuration of this app… API keys", then "1"). It attached a decision to the stray Matter `mat_39c2…`, because that Matter was in focus. The reconcile **keeps `mat_39c2…` as it is** (it holds a decision about other work) and carries its course requirement to the course. The member's second requirement ("everything we write needs to sound as human as possible, not AI written…") survives only as the first 80 characters in its turn trace. It is saved as written and marked "the rest of this sentence wasn't saved"; the rest is not invented.

### Shared-workflow diagnosis and plan (2026-10-05, before further implementation)

**Evidence: the course conversation produced 6 Matters for one course.**

| Matter | Created by | Shared cause |
|---|---|---|
| `mat_61a6…` "Launch a course" (real: $59, outline choice) | Brain `new_matter` | — |
| `mat_0fee…` (run 1, active_work) | Legacy Active Work label from a chat sentence | A chat sentence could start work (closed in `89aad5a3`, record remains) |
| `mat_db4b…` (run 1, holds the **Project** link) | Projects menu | The Project was created as separate work. The Project record is **not in the account's saved records** (browser-only) |
| `mat_58d7…` "develop the entire outline…" | Legacy label | Same as `mat_0fee…` |
| `mat_27a8…` "Start at the top and develp lesson 1" | **Brain** `new_matter` | Interpreter: any "let's <verb> …" is new work, **even with a Matter in focus** |
| `mat_39c2…` "everything we write for the course needs … fun, humor" | Legacy label | A **requirement** treated as work; requirements are never saved |

**Already connected:** offers, decisions, corrections and recall; resume line and Continue from the Brain Foothold; the Brain block in chat, generate and Create routes; the conversation → Create build (code-verified only).

**Where the shared flow breaks:**
1. Work identity has no "same work by default" rule.
2. Requirements, scope changes and tasks are not saved on the work.
3. Duplicates are only hidden, never reconciled.
4. Projects are separate, browser-held, and not built from the work.
5. Create materials are not reliably tied to the work or Project home.
6. Continue merges three sources by title, and shows decisions rather than the next step.

**Plan (shared paths only, no course rules, no forced Projects):**
1. **Work identity:** while a Matter is in focus, every turn and Room proposal attaches to it. New work needs an explicit signal: the member names something different ("a new …", "another …", or a different object with no reference to the current work).
2. **Requirements, scope and tasks:** saved on the Matter in the member's words; used by every model call and by Create; tasks move the Foothold's next step.
3. **Reconcile:** a kernel merge moves links, claims, decisions and rooms into the surviving Matter. Each merged Matter is kept, marked superseded, with a pointer, and its sentence is preserved as a requirement or note. An unlink step removes the wrong Chicago link. Applied to this account through the same write path, with a trace. Nothing is deleted. The display-only collapse is then removed.
4. **Projects:** a Project home, when the member makes one, reads its Matter: decisions, requirements, linked Create materials and next step. The Project link must survive across devices.
5. **Create:** every piece is tied to its Matter (and the Project home, if one exists) by link, never by title.
6. **Continue:** one entry per open Matter; legacy items only when not linked to a Matter; the line shows the next unfinished step.
7. **Verify** three journeys (course, event, client proposal) through the real routes, with interruption, reload and device switch: one identity, decisions, requirements, linked materials, next step. Then live desktop for the course; phone after.

### Live desktop results (real member account, real model)

| Area | Result | Evidence |
|---|---|---|
| Original unpunctuated message → **one** course Matter | **PASS** | D1: Matter `mat_61a6…` "Launch a course", price offer `opt_49`/`opt_59`/`opt_79` |
| Short answer "2" → $59 | **PASS** (Brain) | D2: `offer_answer` → $59, real model called (992 ms). A duplicate send caused an extra menu, fixed in `cae3d795` |
| Duplicate chat call without a Brain turn ID | **Fixed, code-verified** | The quality-repair rewrite no longer writes. Only the reply shown is recorded, on the same turn (`b72a8513`). Live recheck: step D3 |
| Reload keeps the decision | **PASS** | R2: "You'd chosen price: $59… Still open: …". No price question |
| Home → Continue shows the course | **PASS** | R3e: numbered list "1. Launch a course · You'd chosen price: $59", "2. Speaking Engagement in Chicago Checklist" |
| Click Continue item → resumes the course | **PASS** (state); reply now lists the open choices (`dc828ff7`), live recheck R3g | R3f |
| Duplicate send ("Actually no, the first." twice) | **pending** | D3 |
| $49 correction | **pending** | D4 |
| "What were my choices?" | **pending** | D5 |
| Reload + "Where were we?" | **pending** | D6 |
| Research → Strategy → Board → Create | **pending** | D7 |
| Phone and cross-device | **not started** | Starts after desktop passes |
| Member isolation on a second account | **not started** | |

### Saved Brain state (member `80aa790b…`, read live from the database)

- **One** live course Matter, `mat_61a649eb7caa4f1a` "Launch a course". Price **$59 current** is its only decision, decided by the member's "2". **No reason was given, so none is recorded.**
- The open choice is the topic menu: content outline / marketing strategy / platform.
- Two older Matters for the same course, `mat_0fee…` and `mat_db4b…`, are left over from the phone run of `a76b021c`. They were created before the one-Matter fix and hold no decisions or offers. They are **preserved, not deleted**, and hidden behind the real Matter on Home. Merging them is optional and needs the member's OK.
- No decision or history was lost or rewritten during any repair.

### Failures found live today, and their fixes (all on `one-brain/convergence`)

| Commit | Failure seen | Root cause | Fix |
|---|---|---|---|
| `b72a8513` | A second offer was saved 3 s after a reply | The client quality-repair rewrite called chat without a Brain turn ID, and the server recorded its menu | The rewrite request never writes. The shown reply is recorded through `/api/brain/reply` on the same turn |
| `83358267` | On reload Spark asked for the price again | The legacy resume line read a stale `spine.pendingQuestion` | The resume line comes from the Brain Foothold. The pending question is cleared when the Brain answers |
| `71fa97e3` | Continue card showed an old workspace | The Welcome card read only the legacy workspace registry | The Brain's Matter leads Continue, and clicking it re-enters through the Brain |
| `feabf347` | Still the old workspace | The account's onboarding flag (`complete: false`) hid all Continue options | Saved Brain work always counts. Numbered list added at the member's request |
| `89aad5a3` | Brief and approved outline not saved; "develop the outline" gave chat text only; stray second Matter; Chicago piece linked to the course | No conversation → Create path; a chat-sentence label could start a Matter; a reopened piece joined focus | The hand-off above |
| `dc828ff7` | Resume reply didn't show the open question's choices | The re-entry reply used only the Foothold text | The stored choices are listed, numbered, in the reply |
| `ec9b9c01` | Course listed 3 times, no numbers visible | Leftover run-1 copies; card styles hid the list numbers | Same-work entries collapse into one. Numbers are drawn explicitly |

Every fix added regression tests built from the live records (15 new tests). TypeScript: **366 errors, unchanged** (baseline 370).

### Full suite on `4058d03f` (run in a separate checkout at that exact commit)

**PASS: 0 new failures in behaviour.** 20,639 tests. 588 fail, and all but one also fail on the pre-Brain base `228627b0`. 2 tests that fail on the base now pass. The 5 suite load errors are the same ones as on the base. The one difference is `projectHomesImportSafety` "loads panel graph" timing out at vitest's 5 s default. The same cold import takes about 18 s on `ec9b9c01` and about 16 s on `4058d03f` (measured), so it is runner timing, not a heavier page. The test asserts the import graph, not speed; it now has an explicit 30 s timeout (`2cfc27a2`), nothing skipped, and passes. TypeScript: 365 errors (baseline 370; this work removed one).

### Release gate

| Requirement | Status |
|---|---|
| Real-model test | **PASS so far** (live Brain turns with the OpenAI call recorded in traces); remaining desktop steps pending |
| Physical desktop test | **In progress**: R2 and R3e pass; R3f and D3–D7 pending |
| Physical phone and cross-device test | **Not started** |
| Cross-Room journey (Research → Strategy → Board → Create) | PASS (code); **live pending** (D7) |
| Member isolation | PASS (code and RLS); **live second-account check pending** |
| No new test failures | **PASS** (`4058d03f`: 0 new in behaviour; one runner-timing timeout addressed in `2cfc27a2`) |
| Honest failure, Brain trace, kill switch | PASS |
| No competing authoritative state | **PASS after today's fixes**: the resume line and the Continue card now read the Brain. The legacy pending question and workspace registry remain as caches only |

### Release recommendation

**HOLD.** Release only when all of these pass on the same commit with no further code change:
- R3f and D3–D7 on desktop;
- the phone and cross-device steps;
- the second-account isolation check;
- 0 new failures in the full suite.

If a fix is needed, the affected steps are re-run on the new preview. Release means fast-forwarding `main` to the certified commit. No database migration is needed.

### Rollback plan

1. **Instant:** Vercel → Promote / Instant Rollback to the previous production deployment. No code change.
2. **Feature off without rollback:** set `NEXT_PUBLIC_ONE_BRAIN=0` and redeploy. The Brain gate, Brain resume line and Brain Continue items switch off, and legacy behaviour returns.
3. **Data:** Brain rows are additive (`brain_matter`, `brain_member`, `brain_trace`, `brain_action`), with no schema change. They can be left in place.
4. **Code:** `git revert` of the release merge on `main`.

### Open items (not blocking the desktop run)

- Optional: merge the two leftover run-1 course Matters into `mat_61a6…` (needs the member's OK).
- The account's onboarding flag is still `complete: false`. It no longer hides work, but onboarding may still be offered.
- Known from earlier rounds: legacy short-reply handlers; file delivery on the surfaces whose paperclip is hidden; Sheets and Forms on the Action Gateway; work links for Reminders and Rhythms.

---

## History (2026-10-04 onward, kept as recorded)

## Preview (exact commit)

- Vercel deployment for `a76b021c`: **Deployment has completed (success).**
- **Preview URL:** https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/77R93DssRvzUE5GsZimSH8sv7Auf
  - This is the Vercel page for this exact deployment. Open it and press **Visit** to load the preview.
- **Direct app URL: BLOCKED from here.** Vercel isn't reachable from this environment, and GitHub only exposes the dashboard link above. To get it, open the link and copy the address under **Domains** (or press **Visit**). Then sign in and open `/companion`.
- **One Brain on this preview:** it is on by default in the code of `a76b021c`. It turns off only if `NEXT_PUBLIC_ONE_BRAIN` is set to `0`, `false` or `off`, and nothing in the repo sets it. I can't read the Vercel environment settings from here, so step 2 of the journey confirms it live.
- Before testing, confirm in Vercel → Settings → Environment Variables (**Preview**) that these are set:
  - `OPENAI_API_KEY`
  - the Supabase URL and anon key

## Results

| Check | Result | Evidence |
|---|---|---|
| Single integration branch | **PASS** | All work is on `one-brain/convergence`; the side branches were merged in and removed |
| Preview build of the exact commit | **PASS** | Vercel status `success` on `a76b021c` |
| One Brain enabled on the preview | **PASS (code) / confirm live at step 2** | On by default; no repo setting disables it |
| Real model calls on the deployed preview | **BLOCKED** | This environment's network policy refuses `api.openai.com`, `*.supabase.co` and `*.vercel.app` (proxy 403). It needs your phone and laptop test below |
| Phone → laptop golden journey on the preview | **BLOCKED** | Needs a real member and two real devices: steps below |
| Short replies ("the second one", "$59", "option B", out of range, "what were my choices?") | **PASS (code)** | `lib/brain/offers.test.ts`, `goldenJourneys.test.ts` (GJ1 run 5×) |
| Corrections ("Actually no, the first"; Business Core audience) | **PASS (code)** | GJ1, GJ4 (`specialists.test.ts`); the superseded value is never shown as current |
| Rejected directions / negative knowledge | **PASS (code)** | `negativeAndConflict.test.ts`; survives Rooms and devices |
| Source continuity (research stays evidence; the same Matter across Rooms) | **PASS (code)** | `crossRoomJourney.test.ts`, 5 out of 5 runs through the real routes |
| Board perspectives never become decisions | **PASS (code)** | Cross-Room journey; `/api/board/deliberate` records a perspective only |
| Home "Continue where I left off" | **PASS (code)** | `lib/brain/homeContinue.test.ts` |
| Member isolation | **PASS** | Kernel and route tests, plus the live Postgres RLS check (rolled back) |
| Honest failure / Brain trace / kill switch | **PASS (code)** | GJ6, trace assertions, `NEXT_PUBLIC_ONE_BRAIN=0` client tests |
| No misleading paperclip | **PASS** | See below; `noMisleadingPaperclip.test.ts` enforces it |
| Final full-suite comparison on `a76b021c` | **PASS** | 20,556 tests. 589 fail in 261 files, and every one also fails on the pre-Brain base `228627b0`, so there are **0 new failures** |
| TypeScript ratchet | **PASS** | 366 errors, against a baseline of 370 |

## Paperclips

| Surface | Action |
|---|---|
| Main chat, Welcome Home, Chamber live chat | Connected (sends files to the model) |
| Talk It Out, Research Library, Item Research, Claire research | Connected (shared research engine sends files) |
| Events, Clear My Mind | Connected or associated (files kept with the event or review turn) |
| Board intake (×2), Strategy Chamber, Create entrance, Create draft review, Visual Thinking request, My Day planning box, Current Focus answers | **Paperclip removed until supported** (these surfaces never read files) |

## Phone → laptop golden journey (about 12 minutes; same tested commit `a76b021c`)

Type the words exactly as written. Do not give a reason for any choice: the journey checks that Spark does not invent one.

1. **Phone**, signed in on the preview, main chat. Type: "I want to launch a course. Give me three price options as a numbered list: $49, $59 and $79, and ask which one I want."
   Expect a numbered list that is exactly **1. $49 · 2. $59 · 3. $79**, followed by a question.
2. **One Brain is on (check):** type "the fifth one."
   Expect exactly: "I only gave you 3: 1. $49  2. $59  3. $79. Which one?"
   If you get anything else, stop: One Brain is off on this preview. In Vercel, check that `NEXT_PUBLIC_ONE_BRAIN` is unset (not `0`, `false` or `off`).
3. Type "the second one." Spark confirms **$59**.
4. Type "Actually no, the first." Spark confirms **$49** as a change.
5. Type "What were my choices?" Expect the same three options listed, with "You chose $49."
6. Type "We're not doing the workshop."
7. Open **Research** and research "Do ADHD founders buy cohort courses?" Let it finish.
8. Open **Strategy** and confirm the 6-week cohort format. Rule out "1:1 only."
9. Open **Board** and convene on "Should I cap the first cohort at 10?" The Board's advice should appear, but no decision should be recorded.
10. Close the app on the phone.
11. **Laptop**, same account, Home. "Continue where I left off" shows **Launch a course**. Choose it.
    Expect a Foothold that mentions $49 and does not name $59 as current.
12. Type "Where were we?" Expect $49, the cohort format and "Not doing the workshop." Then type "Yep."
13. Type "Why did we choose $49?" Expect three things:
    - the options ($49, $59, $79), that you first picked $59 and then changed it, and the date;
    - a plain statement that **no reason was recorded**, possibly offering to note one;
    - **FAIL if Spark invents a reason** (for example "because it's accessible").
14. Open **Create** and ask for a launch email. It should use $49 and the cohort, and should not mention the workshop.
15. **Phone**, refresh, then type "where were we." It should show the same state as the laptop.

**PASS only if every step matches.** Note any mismatch with its step number and the exact reply.

## Release gate (all required)

| Requirement | Status |
|---|---|
| Real-model test | BLOCKED |
| Physical phone and laptop test | BLOCKED |
| Cross-Room journey | PASS (code) |
| Member isolation | PASS |
| No new test failures | PASS (`a76b021c`, 0 new) |
| Honest failure, Brain trace, kill switch | PASS |
| No migrated capability with competing authority | PASS (see the retirement table in `docs/one-brain-estate-connection-report-2026-10-04.md`) |

**Gate stays CLOSED** until the BLOCKED rows pass. Production remains on **HOLD** (`main` untouched).

## Live certification session (commit `a76b021c`)

### Environment facts (verified from here)

| Item | Result | Evidence |
|---|---|---|
| Branch head = tested commit | **PASS** | `one-brain/convergence` → `a76b021c44d1` (git ls-remote) |
| Preview build of `a76b021c` | **PASS** | Vercel commit status: "Deployment has completed" |
| Live database ready for the Brain | **PASS** | `companion_member_records` has RLS `auth.uid() = user_id`; storage contract certified (rolled back) |
| Brain records written by the preview so far | **0 rows** | Live query: no `brain_*` rows yet, so the preview has not been used |
| Vercel environment variables (`OPENAI_API_KEY`, Supabase, `NEXT_PUBLIC_ONE_BRAIN`) | **BLOCKED** | No Vercel access from this environment (proxy 403, no Vercel connector). Secrets are never needed to check: the journey confirms behaviour |
| Direct app URL | **BLOCKED** | Open the deployment page → copy the address under **Domains** → add `/companion` |
| Real Spark replies and live research run from here | **BLOCKED** | `api.openai.com`, `*.supabase.co` and `*.vercel.app` refused by the network policy |

### How each step is verified during your walkthrough

After each step you report the reply. I then read that turn's **Brain trace** and the **Matter record** straight from the live database: interpretation, Matter id, committed operations, model called (yes/no), failure. So a failing step is diagnosed from evidence, never from wording.

`[model-call]` lines appear in the Vercel function logs: Project → Deployments → this deployment → **Logs**, filter `model-call`.

### Release recommendation (conditional)

- **Release only if** steps 1–15 pass on the preview with the real model, the traces match, and member isolation holds on a second account.
- Release means fast-forwarding `main` to `a76b021c` (main is an ancestor; no conflicts). No database migration is needed: Brain records live in the existing table, in new domains.

### Rollback plan

1. **Instant:** in Vercel, Promote / Instant Rollback to the previous production deployment (`b25f96dcb`). This takes seconds and needs no code change.
2. **Feature-off without rollback:** set `NEXT_PUBLIC_ONE_BRAIN=0` and redeploy. The client gate and all Brain forwarding stop; legacy behaviour returns. The variable is built into the client bundle, so a redeploy is required.
3. **Data:** Brain data is additive (`brain_matter`, `brain_member`, `brain_trace`, `brain_action` rows), with no schema change. It can be left in place, or removed per domain if ever required.
4. **Code:** `git revert` of the merge on `main`, if a permanent removal is wanted.

**Production: HOLD.**

## Live run 1: preview `a76b021c`, member's phone (2026-10-04 19:20 UTC)

| Step | Result | Evidence (live Brain trace / records) |
|---|---|---|
| One Brain enabled on the preview | **PASS** | `brain_trace` row `turn_059be97e…` written from device `dev-thad1…`, room `home` |
| 1. "I want to launch a course give me three price options…" (no punctuation) | **FAIL** | Trace: `interpretation: continue`, `committed: false`. The Brain did not recognise new work in the run-on sentence |
| 1. Price options shown | **FAIL** | The legacy router (`resolveWorkIntent` → `launch_is_project`) sent the turn to the Projects room menu ("create a project / research / ask for help / see the project"). The model was not asked |
| One Matter | **FAIL** | Two Matters were created: `mat_0fee…` (from the legacy Active Work sentence label) and `mat_db4b…` (from the project made in the Projects menu, status `committed`) |

### Repairs: commit `d111c947` (same branch)

1. Run-on phone typing: the work ends where a request to Spark begins (`give me`, `can you`, `please`, `ask`…), so the Matter is named "Launch a course".
2. When the Brain has just recognised new work, the legacy "launch = project" routing no longer leaves the chat. "Create / open a project" still routes.
3. A legacy label or new project that clearly matches the Matter in focus (two or more shared meaningful words) joins it, so there is no second Matter.
4. Regression tests replay the exact live message and the split (`lib/brain/liveRegression.test.ts`). Brain and route suites: 87 of 87 pass. TypeScript stays at 366.

**New preview (`d111c947`): Vercel "Deployment has completed".** https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/uwnmv9ZdeMq7ugzsoBtgYAFa37uF
Retest from step 1 on this preview. The full suite on `d111c947` is running.

Note: the test Matters from run 1 remain on the test account. They do not affect focus or resume, and can be removed on request.

## Live run 2: desktop first, preview `d111c947`

- Deployed commit confirmed: branch head `d111c9471dfa` → Vercel "Deployment has completed" (https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/uwnmv9ZdeMq7ugzsoBtgYAFa37uF).
- Run 2 counts only Brain records created after 2026-10-04 21:43 UTC. The two test Matters from run 1 are excluded, not deleted.
- The full suite on `d111c947` is running.

| # | Desktop step | Result | Brain record check |
|---|---|---|---|
| D1 | Original unpunctuated message | **PASS** | Trace `turn_ba2d…`: `new_matter`, ops `createMatter`+`focusMatter`, committed. **One** new Matter `mat_61a6…` titled **"Launch a course"** (the legacy Active Work label joined it: `active_work` link, no second Matter). Open Offer `price` with ids `opt_49`/`opt_59`/`opt_79`. Real model reply, no Projects menu. Note: the reply was recorded twice (an identical offer superseded the first), which is harmless and noted for cleanup |
| D2 | Short answer (sent as "2") | **PARTIAL → fixed** | Brain: trace `turn_0f5f…` `offer_answer` → `resolveOffer opt_59`, **real model called** (OpenAI, 992 ms), decision **Price: $59** saved. FAIL: the same "2" was sent a second time 2 s later (trace `turn_e815…`, `continue`, not handled), so the legacy path added a second, unrelated menu. Fixed in `cae3d795`: duplicate sends are dropped, and identical offers are never recorded twice |
| D2b | Price restated as "$59" (new device session, 22:03) | **PASS** | Trace `turn_4e9c…` `continue` (no new choice to resolve, so legacy chat replied). Price stays **$59** (one current decision, `dec_443a…`). Still **one Matter** since the run began. The reply's topic menu is saved as the single open offer `off_60a6…`, matching what was on screen. Note: a second offer was saved 3 s earlier and then superseded (`off_616f…`): a second chat call without a Brain turn id. Known open item |
| D3 | "Actually no, the first." (on `cae3d795`) | pending | Checked offline: this phrase is not read as option 1 of the topic menu. It corrects the price choice to $49 |

**New preview `cae3d795`** (repairs for D2): Vercel "Deployment has completed". https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/7Mythq9qXSHdRSep3DtY7FrfFHEj. The desktop run continues on it. The Matter saved so far is kept server-side, so the run resumes from D3. **Full suite on `cae3d795`: PASS.** 20,562 tests. 589 fail, every one already failing on the base, so **0 new failures**. The 5 suite load errors are the same ones as on the base. (The run on `d111c947` was stopped because that commit was superseded.)

## Resume: 2026-10-05, desktop first

**Checked before any typing:**
- Branch `one-brain/convergence` was at `cae3d795` (GitHub and `git ls-remote` agree). No Brain activity since 2026-10-04 22:03 UTC, so the saved work is unchanged.
- Saved course Matter `mat_61a6…` "Launch a course": **one** Matter for the course. Price decision **$59 current**, the only price decision, decided by the member's "2". The member gave no reason, and none is recorded.
- Offers: the price offer `off_5b27…` is resolved ($59). The only open offer is the topic menu `off_60a6…` (content outline / marketing strategy / platform), the menu last shown.
- What "Actually no, the first." refers to: the **price choice** (the Brain's last resolution), so it changes the price to **$49**. Checked against the code: the phrase is not read as option 1 of the open topic menu.
- **Duplicate chat call without a Brain turn ID: was NOT resolved on `cae3d795`.** Cause: the client's quality-repair rewrite (`CompanionPageClient`) calls companion-chat a second time without a turn ID. The server saved that rewrite's menu as an offer even when the rewrite was not shown.
- **Fixed in `b72a8513`.** The rewrite request never writes. When the rewrite is shown, it is recorded once on the same Brain turn (`/api/brain/reply`). A rewrite that asks nothing withdraws the first reply's offer. 3 new regression tests pass, 114 Brain tests pass, and there are 366 type errors, the same as before.
- Preview `b72a8513`: Vercel "Deployment has completed", https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/Cmco8HJGvDmpGQ4AsT1TSFpB3Vv2. It is the branch head.
- Full-suite runs on `b72a8513`, `83358267`, `71fa97e3` and `feabf347` were stopped because each commit was superseded. The run on `ec9b9c01` is reported in Current status.

| # | Desktop step (commit as noted) | Result | Brain record check |
|---|---|---|---|
| R1 | Open the preview and resume (on `b72a8513`) | **FAIL → fixed** | Spark reopened with "Picking up where we left off … I'd asked: $79 Which one would you like to choose?" and the member had to give $59 again. **Cause:** the reload rebuilt the chat with a legacy resume line (`conversationResumeCue`). It read `spine.pendingQuestion`, which still held yesterday's price question because nothing cleared it when the Brain resolved the price. The Brain was right the whole time: **$59 current, one decision** (`dec_443a…`), untouched. The "$59" typed at 11:38 (trace `turn_77b1…`, `continue`) changed nothing. **Fixed in `83358267`:** with One Brain on, the resume line comes from the Matter's Foothold, read fresh from the server ("Launch a course. You'd chosen price: $59. Still open: … Pick one: …"). The legacy pending question is cleared whenever the Brain answers. Decisions and history are preserved |
| R2 | Reload (on `83358267`, Vercel "Deployment has completed": https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/9oycx4XoNATY2UoF6tT1fydgJBqN) | **PASS** | Screenshot: "Picking up where we left off — Launch a course. You'd chosen price: $59. Still open: Which one would you like to dive into? Pick one: Create a course content outline, Develop a marketing strategy or Set up the platform." No price question. History kept above it. Brain: no write on reload; still **one** price decision, **$59 current**; one Matter |
| R3 | Home → Continue (on `83358267`) | **FAIL → fixed** | Welcome Home's "Continue Recent Work" card showed "Checklist for a Speaking Engagement in Chicago, In Progress", not the course. **Cause:** that card read only the legacy Active Workspace registry and ignored the Brain's Matter. The Continue ranking also pushed chat-type options (which included the Brain's Matter) below any workspace. The Brain itself was correct (focus `mat_61a6…`, $59). **Fixed in `71fa97e3`:** the Brain's Matter always leads Continue. The card shows "Launch a course · You'd chosen price: $59 · Pick up the question that's still open". Choosing it re-enters through the Brain, and the card refreshes when the Brain view arrives. Without a Brain Matter, the legacy workspace still resumes. 4 new regression tests pass. Related tests: only failures that also fail on the base. 366 type errors (no change) |
| R3b | Home → Continue (on `71fa97e3`) | **FAIL → fixed** | The card still showed "Speaking Engagement in Chicago Checklist". **Cause:** this account's onboarding record is still marked incomplete (`companion-phase1-onboarding-v1`: `complete: false`), so Continue returned "onboarding" before it looked at the Brain, and the card fell back to the old workspace. Not caught earlier because the tests passed `onboardingActive: false`. **Fixed in `feabf347`:** saved Brain work always counts, and the onboarding flag applies only when there is no Brain Matter |
| R3c | Member request: several items to go back to | **Added in `feabf347`** | When there is more than one thing to go back to, the Continue card shows a **numbered list**: the Brain's open Matters, the one in focus first, each with its saved decision ("Launch a course: You'd chosen price: $59"), then the legacy workspace. Clicking a number opens that item directly. A Matter re-enters through the Brain. With one item the card is unchanged. 6 new tests pass. 366 type errors (no change) |
| R3d | Home → numbered Continue list (on `feabf347`) | **PARTIAL → fixed** | PASS: "Launch a course · You'd chosen price: $59" is now first, and Chicago is listed. FAIL: the course appeared **three times**, and no numbers were visible. **Cause:** two older Matters for the same course are left over from the phone run of `a76b021c` (`mat_0fee…`, `mat_db4b…`), created before the one-Matter fix in `d111c947`. They are titled with the raw sentence and hold no decisions or offers. The card's styles also hide list markers. **Fixed in `ec9b9c01`:** entries for the same work collapse into the Matter in focus, using the Brain's own "same work" rule. Numbers are drawn explicitly. The leftover Matters are **not deleted** (saved work preserved); merging them is offered as an optional cleanup |
| R3e | Home → Continue list (on `ec9b9c01`, Vercel "Deployment has completed": https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/62UgNdwnw6CHnSXyEudjjYGZsCLX) | **PASS** | Screenshot: "1. Launch a course · You'd chosen price: $59", "2. Speaking Engagement in Chicago Checklist · In Progress". One entry per piece of work, numbered and clickable, no price question |
| R3f | Click "1. Launch a course" (on `ec9b9c01`) | **PASS (state) / PARTIAL (reply) → fixed** | Reply: "Launch a course. You'd chosen price: $59. Still open: Which one would you like to dive into? Want to pick up there…". Brain: trace `turn_b069…` `reentry`, ops `focusMatter` + `setReentry` on `mat_61a6…`, no model call, **no decision written**. Price **$59** is still the only current decision. The open offer is `off_60a6…` (1. Create a course content outline, 2. Develop a marketing strategy, 3. Set up the platform). PARTIAL: the reply named the open question but **not its choices** (member request). **Fixed in `dc828ff7`:** re-entry and "Back to …" list the stored choices, numbered as stored, and "2" then answers that same offer (regression test). Note: at 12:32, on `feabf347`, a click on one of the duplicate entries sent "Back to Launch a course give me three price options as…" → `return_unclear`, nothing written. That duplicate entry was removed in `ec9b9c01` |
| R3g | Continue → course (on `dc828ff7`) | **PASS (state)** | Reply: "Launch a course. You'd chosen price: $59. Still open: …". Trace `turn_b069…` `reentry`; no decision written. Note: the member's pasted reply shows no numbered choices; to be rechecked after the handoff fix |
| C1 | Live acceptance: "1" → content outline | **PASS** | Trace `turn_7c51…` `offer_answer`, **real model called**. Decision "Part: Creating a course content outline" (member_decision, quote "1"). $59 unchanged |
| C2 | Audience and purpose ("it's for adhd business people, and fun ways to deal with their adhd…") | **FAIL** | Trace `turn_67c2…` `continue`, no ops. **Nothing saved** on the Matter (claims empty). Only the legacy onboarding profile captured it |
| C3 | Outline approval ("it good i like it") | **FAIL** | Trace `turn_a763…` `continue`, no ops. The approved outline was **not saved** anywhere: no decision, no artifact. Only a new menu offer (marketing / platform) was recorded |
| C4 | "develop the entire outline into the course completion" | **FAIL** | Trace `turn_797e…` `continue`, not handled. Spark returned **another outline in chat**. **No Create artifact** exists: the newest `companion_creation_workspaces` row is from 2026-09-30. The legacy Active Work label then created a **second Matter**, `mat_58d7…`, titled with the sentence, and **moved focus to it**. One course is now two Matters again |
| C5 | Cross-Matter link | **FAIL** | The course Matter carries `creation: work-417dc…`, which is the **Chicago checklist**. The link was made at 11:49 when the old Continue card resumed that workspace while the course was in focus |
| C6 | Course creation complete? | **NOT complete** | Chat text only; nothing saved or editable. Not marked complete |
| C-fix | Conversation → Create hand-off (`89aad5a3`, Vercel "Deployment has completed") | **Fixed, code-verified; live retest pending** | (1) "it's for X, and Y" saves **audience** and **purpose** on the Matter in focus, in the member's words. (2) Approving an outline Spark just gave saves it on the Matter as the **approved outline** (member_decision, with the approval quoted). (3) "develop / turn / write the full …" hands the build to Create. It builds from the approved outline, never from a later menu. A new outline counts as approved by the request. (4) The browser writes one Create section at a time through `/api/brain/develop/section`, which builds from the Matter's brief, decisions and outline. Each section is saved (durable) before the next, progress shows in chat, and the editable workspace opens at the end. (5) The Foothold records progress ("Wrote 2 of 6 sections…", next "Write section 3 of 6…"), so "keep writing" resumes. (6) A legacy label from a chat sentence never starts a Matter. A reopened Create piece with no name is never attached to whatever is in focus. **Second document type:** an outline of emails plus "turn this into an email sequence" → Email Sequence (test). 26 new tests from the live conversation; neighbouring suites 0 new failures; 366 type errors (no change) |
| C7 | Live retest on `89aad5a3` | pending | Step 1: "Back to Launch a course" (focus returns to the course from the stray `mat_58d7…`) |
| D3 | Duplicate send: "Actually no, the first." pressed twice quickly | paused | |
| D4 | $49 correction | pending | |
| D5 | "What were my choices?" | pending | |
| D6 | Reload, then "Where were we?" | pending | |
| D7 | Research → Strategy → Board → Create | pending | |
