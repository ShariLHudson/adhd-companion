# One Brain — Certification Report (2026-10-04)

**Integration branch (single):** `one-brain/convergence` @ `a76b021c44d1fce0558392a6f222de82d512a173`
**Production:** `main` untouched. **Release gate: CLOSED.**

## Preview (exact commit)

- Vercel deployment for `a76b021c`: **Deployment has completed (success).**
- **Preview URL:** https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/77R93DssRvzUE5GsZimSH8sv7Auf
  - This is the Vercel page for this exact deployment. Open it and press **Visit** to load the preview.
- Before testing, confirm in Vercel → Settings → Environment Variables (**Preview**) that these are set:
  - `OPENAI_API_KEY`
  - the Supabase URL and anon key

## Results

| Check | Result | Evidence |
|---|---|---|
| Single integration branch | **PASS** | All work is on `one-brain/convergence`; the side branches were merged in and removed |
| Preview build of the exact commit | **PASS** | Vercel status `success` on `a76b021c` |
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
| Final full-suite comparison on `a76b021c` | **PENDING** | The run was still in progress at handoff. The previous full run (`4cc2dbb0`, 20,538 tests) found 0 new failures against the base: all 589 failures were pre-existing. Targeted suites on `a76b021c` show 0 new failures |
| TypeScript ratchet | **PASS** | 366 errors, against a baseline of 370 |

## Paperclips

| Surface | Action |
|---|---|
| Main chat, Welcome Home, Chamber live chat | Connected (sends files to the model) |
| Talk It Out, Research Library, Item Research, Claire research | Connected (shared research engine sends files) |
| Events, Clear My Mind | Connected or associated (files kept with the event or review turn) |
| Board intake (×2), Strategy Chamber, Create entrance, Create draft review, Visual Thinking request, My Day planning box, Current Focus answers | **Paperclip removed until supported** (these surfaces never read files) |

## Phone → laptop golden journey (about 12 minutes)

1. **Phone**, signed in on the preview, main chat: type "I want to launch a course." Spark should offer prices.
2. Type "the second one." Spark should confirm **$59**.
3. Type "Actually no, the first." Spark should confirm **$49**.
4. Type "We're not doing the workshop."
5. Open **Research** and research "Do ADHD founders buy cohort courses?" Save it.
6. Open **Strategy** and confirm a format (for example, 6-week cohort). Rule out "1:1 only."
7. Open **Board** and convene on "Should I cap the first cohort at 10?" The Board's advice should appear, but no decision should be recorded.
8. Close the app on the phone.
9. **Laptop**, same account, Home: "Continue where I left off" should show **Launch a course**. Choose it.
10. Type "Where were we?" It should mention $49, the 6-week cohort and "Not doing the workshop," and should not name $59 as current.
11. Type "Yep." Then type "Why did we choose $49?" It should list the options, the change from $59, and the date.
12. Open **Create** and ask for a launch email. It should use $49 and the cohort, and should not mention the workshop.
13. **Phone**, refresh, then "where were we." It should show the same state.

**PASS only if every step matches.** Note any mismatch with its step number.

## Release gate (all required)

| Requirement | Status |
|---|---|
| Real-model test | BLOCKED |
| Physical phone and laptop test | BLOCKED |
| Cross-Room journey | PASS (code) |
| Member isolation | PASS |
| No new test failures | PENDING (final run) |
| Honest failure, Brain trace, kill switch | PASS |
| No migrated capability with competing authority | PASS (see the retirement table in `docs/one-brain-estate-connection-report-2026-10-04.md`) |

**Gate stays CLOSED** until the BLOCKED and PENDING rows pass.
