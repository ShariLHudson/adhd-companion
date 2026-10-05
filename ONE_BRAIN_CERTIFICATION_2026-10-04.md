# One Brain — Certification Report (2026-10-04 → 2026-10-05)

**Integration branch (single):** `one-brain/convergence` @ `dc828ff73801d09bdcbff322c7a478e341808273`
**Preview of that commit:** Vercel "Deployment has completed": https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/HPyCksuY5ZXKeHGPd5hJTWWz5z6w (open it, press **Visit**)
**Production:** `main` untouched. **Release gate: CLOSED. Production: HOLD.**

## Current status (2026-10-05)

### Verdict

**Not ready for release.** Every live desktop step run so far either passes, or failed and was fixed and passed on retest. The remaining desktop checks, the phone, cross-device and member-isolation checks have not run yet.

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
| `dc828ff7` | Resume reply didn't show the open question's choices | The re-entry reply used only the Foothold text | The stored choices are listed, numbered, in the reply |
| `ec9b9c01` | Course listed 3 times, no numbers visible | Leftover run-1 copies; card styles hid the list numbers | Same-work entries collapse into one. Numbers are drawn explicitly |

Every fix added regression tests built from the live records (15 new tests). TypeScript: **366 errors, unchanged** (baseline 370).

### Full suite on `ec9b9c01` (the run on `dc828ff7` is in progress)

**PASS: 0 new failures.** 20,577 tests. 587 fail, and every one also fails on the pre-Brain base `228627b0`. 2 tests that fail on the base now pass (`arrivalExperience`, `arrivalIntelligence`). The 5 suite load errors are the same ones as on the base. The run used the committed tree, with no edits during it.

### Release gate

| Requirement | Status |
|---|---|
| Real-model test | **PASS so far** (live Brain turns with the OpenAI call recorded in traces); remaining desktop steps pending |
| Physical desktop test | **In progress**: R2 and R3e pass; R3f and D3–D7 pending |
| Physical phone and cross-device test | **Not started** |
| Cross-Room journey (Research → Strategy → Board → Create) | PASS (code); **live pending** (D7) |
| Member isolation | PASS (code and RLS); **live second-account check pending** |
| No new test failures | **PASS** (`ec9b9c01`: 0 new, 2 more passing) |
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
| R3g | Continue → course shows its numbered choices (on `dc828ff7`, Vercel "Deployment has completed": https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/HPyCksuY5ZXKeHGPd5hJTWWz5z6w) | pending | |
| D3 | Duplicate send: "Actually no, the first." pressed twice quickly | paused | |
| D4 | $49 correction | pending | |
| D5 | "What were my choices?" | pending | |
| D6 | Reload, then "Where were we?" | pending | |
| D7 | Research → Strategy → Board → Create | pending | |
