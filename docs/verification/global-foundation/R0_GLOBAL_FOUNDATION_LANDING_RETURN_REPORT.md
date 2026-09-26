# R0 Global Foundation Landing — Return Report

**Verdict: R0 BLOCKED — DO NOT BEGIN R1**

All three stacks are reconciled, fixed and regression-clean on the landing branch
`claude/spark-r0-foundation-landing-l7edvu`. **`main` was NOT pushed and nothing was deployed.** The Production
gates (Production env/config for the Board cutover, a real-model Founder test, and post-deploy verification) could not be
met from this environment. There is also one open phone layout defect on the Board Room home.

Date: 2026-09-26 · Repository: `ShariLHudson/adhd-business-companion-vs3`

---

## 1. Starting main SHA
`7e2efec6144c5f1872aa1062b8802cb75c2cd2cf`. This is the SHA the reconciliation expected.

## 2. Ending main SHA
`7e2efec6144c5f1872aa1062b8802cb75c2cd2cf`. It is **unchanged, because main was not pushed** (see §25).

The landing branch tip that is ready to fast-forward main is
`df5bb516c28945d01f1d4c5af0ab40dd1271102c` on `claude/spark-r0-foundation-landing-l7edvu` (pushed). Its first parent chain starts from `7e2efec6`, so main can fast-forward to it.

## 3. Source stack tips
| Stack | Branch | Tip |
|---|---|---|
| 1 Claire + Canonical Truth + LMC | `atomic/lmc-s0b-founder-seed-isolation` | `1c4d776e6ce920fc2b39880773f1f3ca57401aaa` |
| 2 Executable Intent Round 1 | `executable-intent/round-1-remember-precedence` | `c047cc72c853d3c457974ae358b8e18ca346036e` |
| 3 Board R3F-5B | `atomic/board-r3f5b-conversation-continuity` | `ced219afa6a645e135a4a2925ad090e1700a1619` |

## 4. Had main moved since the reconciliation?
**No.** `origin/main` was still at `7e2efec6`.
- Stacks 1 and 3 fork at `f48361bd`. The only main commits beyond that are 5 drift-glass commits (`292b89f6`…`7e2efec6`). They touch 14 files, none of which overlaps any stack.
- Stack 2 is based directly on `7e2efec6`.

## 5. New commits discovered and their effect
- **On main:** none since the reconciliation.
- **Superseded check:** no remote branch contains any stack tip (`for-each-ref --contains`). No newer descendant supersedes a stack. The newest branches after 2026-09-24 are the stacks themselves and their own ancestors (`g1-4`, `lmc-s0`, `board-r3f1..r3f5`).
- **Ancestors inside the stacks:** `atomic/g1-4-canonical-authority-closure` and `atomic/claire-c54a-…` are ancestors of Stack 1. `atomic/board-r3f5-…` is an ancestor of Stack 3.
- **DO-NOT-MERGE list:** I checked 72 matching refs. None of their tips is an ancestor of any stack or of the landing branch.
  - `board-bc-6-no-advice-contract`, `board-bc-p0-provenance-boundary`, `board-r3f-member-in-deliberation` and `claire-c5-person-before-process` only *share older ancestors* with the stacks.
  - Their own commits (`09b75a7b`, `28ee7d1a`, `95cb9551`, `d13b436e`…) are **not** in the lineage.
  - BC-6, BC-P0 and C-5 enter only through the stacks' own authoritative re-applications.

## 6. Merge / reconciliation method
Each stack was merged intact with `git merge --no-ff`, one merge commit per stack, so every stack's lineage is preserved. Nothing was cherry-picked out of a stack. `merge-tree` was conflict-free for all three, sequentially.

- **Stack 3:** the R0 security and quality fixes were committed **on top of the stack tip first**, in `r0/board-r3f5b-landing-fixes`. That branch was then merged. As a result, no first-parent main commit ever carries the unauthenticated route.
- **Cross-stack fixes:** fixes that depend on two stacks at once sit directly after the merge that exposes them.

## 7. Merge commits (landing-branch first-parent order)
| # | Commit | What |
|---|---|---|
| 1 | `07c693b7f782eff66f99de6cc798508a91daf3bb` | **Merge Stack 1** (Claire / Canonical Truth / LMC @ 1c4d776e) |
| 2 | `ffa86d5edd41bad867e9facb62f5c51d95632649` | R0 test reconciliation (Stack 1 × main) |
| 3 | `13341534ac0aab668347a87514d8b571c2199e4f` | **Merge Stack 2** (Executable Intent Round 1 @ c047cc72) |
| 4 | `84d1869e9ea66c70162fd61944bbd26e901d5929` | R0 fix — Rhythm subject truncation |
| 5 | `a85bfff1210b333c95e270fdb6142d942739048a` | **Merge Stack 3** (Board R3F-5B @ ced219af + 6 R0 commits) |
| 6 | `df5bb516c28945d01f1d4c5af0ab40dd1271102c` | R0 fix — stale legacy truth reaching the Board (Stack 1 × Stack 3) |

The Stack 3 R0 commits sit on top of `ced219af` before the merge:

| Commit | What |
|---|---|
| `81a9411e374b735ead30de7f895a8c2d669969e5` | Authenticate `/api/board/material-signals` |
| `874ad55cd745ea5367ba73f93ce2f6e3af86bc6d` | Scope the Board Brief print rule |
| `e31caf84e84b3572e8d2d6b4dd9b1c9d539e4acc` | Reconcile stale J1/J1c fixtures |
| `7673e76220135aec217d4e5e01d774c86016bc27` | No canonical writer in Board-side proof code (G-0.2 / S0b) |
| `adae269889dee78c5ce6168bc73ff889020cad1a` | Close the 7 new TypeScript errors |
| `96ef9bb7d9debe39197021823610ed3b433bf46d` | Reconcile the Living Table Back assertion |

## 8. Files changed by bounded R0 fixes
- **Board security:**
  - `app/api/board/material-signals/route.ts`
  - `app/api/board/material-signals/route.auth.r0.test.ts` (new)
  - `lib/board/delivery/readMemberAccessToken.ts` (new; the existing token reader was moved here unchanged)
  - `lib/board/delivery/requestBoardDeliberation.ts`
  - `lib/board/reconstructed/selection/requestMaterialSignalsViaRoute.ts`
  - `components/companion/board/boardReviewSemanticSignals.test.tsx`
- **Print scope:** `app/companion/boardroom.css`, `lib/board/boardroomPrintScope.r0.test.ts` (new).
- **G-0.2 / S0b in Board code:**
  - `lib/board/delivery/subjectBrief/printFounderProof.ts`
  - `lib/board/delivery/subjectBrief/founderProofDump.test.ts`
  - `app/prototype/board-subject-brief/page.tsx`
- **TypeScript:**
  - `lib/board/delivery/boardBrief/mapSynthesisToBoardBrief.ts`
  - `lib/board/boardDiscussion/boardDirectorDiscussion.ts`
  - `lib/board/delivery/subjectBrief/condenseBoardSubjectKnowledge.ts`. This fixes a latent `NaN` ranking bug for the BC-P0 provenance kinds.
  - `lib/relevantSituation/collectBusinessUnderstandingItems.ts`
- **Stale test reconciliation**, each traced to the stack commit that intentionally changed the UI or contract:
  - `lib/board/conveneFailure.j1c.test.tsx` and `lib/board/memberJourney.j1.test.tsx`. Bisected: first broken at `e11d08b2` (BOARD-CONVERGE merge) and `0eacc013` (Round 3E).
  - `components/companion/boardroom/BoardRoomLivingModelScene.test.tsx`: changed by `532223ca`.
  - `lib/profile/claireProfileRouting.test.ts`: changed by S0b `1c4d776e`.
- **Cross-stack truth:** `lib/relevantSituation/retrieveRelevantSituation.ts`, `lib/relevantSituation/r0LegacyTruthResurfacing.test.ts` (new).
- **Round-1 subject:** `lib/memberIntent/executableRequest.ts`, `lib/memberIntent/r0SubjectCadenceWords.test.ts` (new).

No new router, classifier, registry, pending store, yes/no vocabulary or execution system. `CompanionPageClient` and `handleSend` are not touched.

## 9. Material-signals authentication — finding and fix
**Finding (confirmed):** `app/api/board/material-signals/route.ts` had no authentication, no body bound and no flag gate. It made a paid server model call for any anonymous caller. It also returned the extractor's `trace.rejectedReason`, which can contain provider error text such as `"OpenAI HTTP 401: …"`.

**Fix:** the route now uses the **same scheme as `/api/board/deliberate`**:
- The Supabase access token is sent as a `Bearer` header and verified with `getCompanionSupabaseServer().auth.getUser(token)`.
- No token or a bad token → 401 `{error:"unauthorized"}`.
- Sign-in unavailable → 503.
- Body capped at 128 KB (413).
- The response returns only `result` and `trace.{pathUsed, modelCallSucceeded}`.

The Review client sends the member's token through the existing reader. With no signed-in member it uses the deterministic extractor and makes no network call.

**Proof** (`route.auth.r0.test.ts`, 9 tests):
- **Red on the original route:** 7 of 9 failed.
- **Green after the fix.** It covers:
  - no header → 401 with no model call
  - non-Bearer header → 401
  - expired token → 401, with no JWT text leaked
  - Supabase unavailable → 503
  - authenticated member → result identical to the extractor's
  - 400/413 validation unchanged
  - provider error text never returned
  - a source check that both Board routes use the same `Bearer` / `getUser(token)` scheme
- **Client side:** `boardReviewSemanticSignals.test.tsx` (8 tests) confirms the Bearer header is sent and that signed-out members get no route call.

## 10. Baseline (main @ 7e2efec6)
- **Vitest (full):** 2,282 files, 19,291 tests. **462 failing tests and 467 failing IDs**, all pre-existing debt.
- **TypeScript:** `tsc --noEmit` reports **353 errors**, pre-existing.
- **Build:** `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so type debt does not fail the build. The build was not run (see §25).

## 11. Post-Stack-1 delta
Tests related to Stack 1 changes (`vitest --changed origin/main` at `ffa86d5e`): 11,588 tests, **0 new failures vs baseline**.
- The merge itself left one stale main test, `claireProfileRouting`, which asserted the old mount-time seed that S0b intentionally removed. It was fixed in `ffa86d5e`.
- Stack 1's own 26 changed test files plus the LMC suites: 682 of 682 pass.

## 12. Post-Stack-2 delta
Tests related to Stack 2 changes (`--changed` at `13341534`): 12,280 tests, **0 new failures**.
- The 15 failures in `frictionlessActionLayer.test.ts` (8) and `talkItOutAndPeacefulMomentsNav.test.ts` (7) are identical on main.
- After the subject fix, the Round-1 and related suites pass apart from those same 8 baseline failures, which are identical by test name.

## 13. Post-Stack-3 delta
- **Stack 3 on its own, before R0 fixes:** the full Board suite had 7 failures (J1/J1c) plus 1 Living Table failure, and it added **7 new TypeScript errors**.
- **Combined with Stack 1:** it also produced **2 G-0.2 violations**, which are Board-side canonical writers.
- **After the R0 commits:** the Board, board-component, boardroom, Board API and relevantSituation suites give **138 files and 1,537 tests passing, 0 failing**.

## 14. Final combined regression delta
- **Full suite on the combined tree:** 20,621 tests, **457 failing vs 462 at baseline, and 0 new failures.**
  - The only IDs that differ textually are 4 baseline "suite failed to run" entries (a missing module, `earlyLocalSupportTurn`, on main too). They differ only because of path and message truncation.
  - 5 baseline failures now pass.
- **TypeScript:** 353 errors, **identical to baseline** as a (file, error code) multiset. Two baseline errors only changed wording.
- **The two later fixes (`84d1869e`, `df5bb516`)** were checked with `vitest --changed 13341534` on the final tree: 12,602 tests related to everything after the Stack 2 merge, **0 new failures**.

## 15. Claire Founder-test results
These results come from tests. **A live-model conversation was not possible** because `api.openai.com` is blocked from this environment.

| Scenario | Result | Evidence |
|---|---|---|
| A. Adds a business fact | PASS | `claireMemberConfirmedWrite` "single confirmed fact → one transaction"; `canonicalWriteActivation` #10 |
| B. Corrects a fact | PASS | `bp2bWriteExecution` "supersedes $149 → $150 and preserves history" |
| C. Retired or corrected truth doesn't reappear from a legacy field | PASS | `legacyApprovedDedup`; `g14CanonicalAuthorityClosure` E/G; **R0 fix §8** closes the path through the Board's situation read |
| D. LMC reflects canonical truth | PASS, partial | `lmcClaireHandoff` E; `businessModelProjection` C–I. There is no test of an LMC projection taken right after a Claire write. |
| E. LMC cannot write | PASS | G-0.2 "protected host rooms hold no canonical writer"; `lmc1Hardening` |
| F. Seed cannot contaminate | PASS | `s0bFounderSeedIsolation` (21 tests); `s0MemberDataSafetyBoundary`. **Caveat:** the founder seed still matches records by name ("Association Executives" / "November Workshop"). It is gated to founder chrome. |
| G. Person before process | PASS | `claireC5PersonBeforeProcess` (36), C-5.1/5.3/5.4 suites |

Rendered: Claire opens on phone, tablet and desktop, and shows its intro and first question (§24).

## 16. Canonical truth / LMC
- **Canonical transaction** (`canonicalWriteTransaction.ts`): it runs one mutate, re-reads the store, and runs `plan.verify(landed)`. If that fails the result is "did not save" and nothing is written.
- **LMC** (`lib/lmc`, `components/lmc`) is projection-only, and the stack does not change LMC code.
- **In the combined tree**, the Board now reads business truth through the same current and never-resurrected rules. Before the fix, `retrieveRelevantSituation` returned the legacy **$99** beside the confirmed **$149**, and again after the member retired it. It now uses Stack 1's single authority, `isLegacyLive`.

## 17. Executable-intent Founder-test results
New natural-language phrasing was run through the page's real seam order on the combined tree.

| # | Member said | Owner → outcome |
|---|---|---|
| 1 | "Please put 'send the weekly client update' in my Rhythm every Monday at 8am." | Rhythm created. **Found a defect:** it was saved as "'send the". Fixed in `84d1869e`; it now saves "Send the weekly client update". |
| 2 | "Could Spark keep track of recurring tasks for me?" | `chat_api`, no write ✔ |
| 3 | "Add reviewing my sales pipeline to my Rhythm." → "Yes, but make it every Tuesday at 10am." | Asks how often, then creates the Rhythm Tuesdays at 10:00 ✔ |
| 4 | The same offer, then 3 unrelated turns, then "yes" | No write ✔ (stale yes) |
| 5 | "Set up a rhythm to reconcile my receipts every Friday at 4pm and also put it on my calendar." | Rhythm created, and Spark says honestly that it can't add the calendar event ✔ |
| 6 | Same as #1 while storage fails | "I couldn't save … nothing was set up yet." ✔ No completion claim. |
| 10 | #1 with `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE=0` | Pre-Round-1 routing (`direct_action`) ✔ |

The existing tests `round1.test.ts:125/143/156/172/189/305/321/341` also pass.

## 18. Board Founder-test results
**Not run as a live conversation.** Supabase auth and OpenAI are blocked here, so Convene cannot reach the server model.

Steps covered by tests that run the real `/api/board/deliberate` route with only the model faked:

| Step | Evidence |
|---|---|
| 2–3. Convene seven; Directors receive the situation and authorized BU | `roundThreeCConveneActualBoard`, `siBuReadIntegration` |
| 4–7. Director asks; member answers; understood in context; deliberation continues | `round3f3MemberQuestionContinuation`, `round3f5bConversationContinuity`, `round3f5bConversationalMoveConsequence` |
| 8. No repeat of the intake | `round3f5bMeetingTruthContinuity` |
| 9. Answer, correction, clarification, question back to a Director, and continuation are distinguished | `round3f5cConversationalMoveUnderstanding` §1–9 |
| 10. BC-6 | §20 |
| 11–13. Leave and return; Continue; Start New | `boardDiscussionLifecycleChoice`, `boardDiscussionLifecycle` |
| 14. No canonical write | §21 |
| 15. Material-signals is not anonymous | §9 |

Rendered, locally with the flag on:
- Board Room home shows the seven Directors.
- Situation → Subject Brief → Review works.
- Convene fails truthfully with no raw codes.
- The resume card, "Continue where I left off" and "Start a new discussion" all work on phone, tablet and desktop.

## 19. BC-P0 verification
`lib/board/provenanceBoundary.bc-p0.test.tsx` §1–13 pass, including "the Board's Business Understanding read has no write path". The BC-P0 provenance kinds now also rank correctly in the Subject Brief (a latent `NaN` bug, fixed).

## 20. BC-6 verification
`lib/board/noAdviceContract.bc-6.test.tsx` §1–15 pass: the Board examines and the member decides.

## 21. G-0.2 writer-boundary verification
`canonicalWriterBoundary.test.ts` passes 36/36 on the combined tree. The allowlist was **not** widened.
- **Before the R0 fix it failed:** two Board-side founder-proof modules imported canonical `writeHelpers`.
  - `lib/board/delivery/subjectBrief/printFounderProof.ts` sits under a protected root with no allowlist.
  - `app/prototype/board-subject-brief/page.tsx` wrote on mount in dev.
- **Both are now read-only.** Board, Chamber, Strategy and LMC hold no canonical writer.

## 22. Kill-switch verification
- **`NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE=0`** restores the pre-Round-1 routing. This is shown by the test "kill switch off restores prior routing" and by scenario 10.
  - **Caveat:** the older pending-confirm path is stricter even with the switch off. It now uses provenance and turn expiry. This is safe but not byte-identical to before.
- **`NEXT_PUBLIC_BOARD_DELIBERATION_V2`** is inlined at build time. It is a `NEXT_PUBLIC_` value read by both the client and the server route.
  - **On:** new discussions go to the reconstructed seven Directors → `/api/board/deliberate` → R3F-5B.
  - **Off:** the server returns 503 `deliberation_not_open`. New seven-Director drafts are held, by the explicit Founder decision R1 in `boardDeliberationRoute.ts`. Only legacy-twelve drafts still use the legacy engine.
  - **So turning the flag off is safe but not a full rollback:** it stops new Board discussions rather than restoring main's legacy Board. A full rollback is reverting merge `a85bfff1` (§27).

## 23. Cross-system isolation
- **Board does not steal Claire turns, and Claire does not steal Board turns.** They are separate destinations. Chat turns naming the Board or a profile update go to `chat_api` with no execution (scenarios 7 and 8).
- **Executable intent does not swallow ordinary conversation** (scenario 9 → `chat_api`).
- **LMC and Board are not writers** (§21).
- **No new global routing logic.**
- **Other entrances:** Chamber, Strategy, Create, Events, Welcome and Sensorium all open without errors on all three device classes (§24).
- **Print:** Stack 3's unscoped print CSS would have blanked printing for Plan My Day, My Journey, Confidence Vault, Spark Notes and Growth. It is now scoped to pages showing a Board Brief.

## 24. Phone / tablet / desktop
The check used local `next dev` with the flag on and Playwright Chromium at three sizes:
- iPhone 13: 390×844, touch, DPR 3
- iPad: 820×1180, touch
- Desktop: 1440×900

It captured 17 surfaces per device, 51 screenshots in total. No error overlay, page error, console error or horizontal overflow was seen.

**Open defects (phone only):**
1. **Board Room home, phone:** Director nameplates overlap (Renee Ashford / Camille Turner). The David Kim and Sofia Ramirez plates sit over the welcome panel text, and James Holloway and Sofia Ramirez are clipped at the right edge. Stack 3 changed `BoardRoomLivingTableScene.tsx` and `boardroom-living-table.css`. **Not yet compared against main, so it may be pre-existing. It is unresolved.**
2. **Living Model on phone:** the header collides with the top chrome (clock and menu).

**Not verified:**
- Real iOS Safari or WebKit.
- Anything after Convene.
- Anything on Production.

## 25. Production deployment
**Not deployed. main was not pushed.** Three gates are blocking:
1. **Production config for the Board cutover can't be checked.** Access to Vercel and the Production domains is blocked here (the proxy rejects the connection).
   - Required: `NEXT_PUBLIC_BOARD_DELIBERATION_V2=true`, plus an OpenAI key (`OPENAI_API_KEY`, `OPENAI_KEY` or `OPENAI_SECRET_KEY`, at least 20 characters) and the Supabase URL and anon key.
   - If the flag is off in Production, landing Stack 3 means **members cannot start new Board discussions** (§22).
2. **Post-deploy verification isn't possible:** Production hosts, Supabase and OpenAI are all unreachable from here.
3. **Board and Claire live-model Founder tests** could not run for the same reason.

The phone Board Room layout defect (§24) also needs a decision.

## 26. Production URLs
None verified. Nothing was deployed, and the Production host is unreachable from this environment. The repository docs name `https://ecosystem.visualsparkstudios.com`. The member area is `/companion`; the Board Room, Chamber and Strategy open from the Welcome Home menu → Guidance, and Claire from Profile → My Business Profile.

## 27. Rollback instructions
Nothing is deployed, so there is nothing to roll back. After a future landing:
- **Board only:** revert merge `a85bfff1` with `-m 1`. That restores main's legacy Board (without the security fix, which is only needed for the new route). As a softer option, set `NEXT_PUBLIC_BOARD_DELIBERATION_V2` to false and redeploy; that holds new Board discussions (§22).
- **Executable intent only:** set `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE=0` and redeploy, or revert `13341534` (with `-m 1`) and `84d1869e`.
- **Stack 1:** revert `07c693b7` (`-m 1`) and `ffa86d5e`. The canonical data format is additive; check stored member data before doing this.
- **Everything:** reset main to `7e2efec6`, using a revert commit rather than a force-push.

## 28. R1+ findings intentionally NOT fixed
1. `/api/claire-reasoning` is **unauthenticated**. This predates R0 and is the same class of problem as material-signals. Stack 1 added an uncapped `communicationStyleBlock` input. Recommend the same Bearer scheme next.
2. Round-1 gaps:
   - "Add walking the dog to my Rhythm every day at 7 AM" is answered by the estate guide first (same as on main).
   - A feeling can become a Rhythm subject ("I had a long day").
   - The Reminder path hands off to `resolveReminderTurn` without the Rhythm-style read-back.
   - "on the 1st of every month" loses the day of the month.
   - "every weekday" becomes daily.
3. The Convene failure copy says "sign-in has lapsed" whenever there is no token, even when sign-in is simply unavailable.
4. The founder seed matches records by name (§15F).
5. There is no test of an LMC projection taken after a Claire write (§15D).
6. The branch report in `docs/reviews/global-executable-intent-round-1.md` wrongly says "No remote branch exists".
7. Main's pre-existing baseline: 457 failing tests (was 462) and 353 TypeScript errors.
8. The phone layout defects in §24, if they turn out to be pre-existing on main.

## 29. Adversarial self-review
| Question | Answer |
|---|---|
| 1. Two authorities for one responsibility? | No. There is one canonical writer path (G-0.2 green). The Board runtime is chosen by one flag; the legacy engine is rollback only. The legacy-truth check uses Stack 1's `isLegacyLive`, not a copy. |
| 2. Legacy writer reachable again? | No. Two Board-side writers were **found and removed** (§21). |
| 3. Lineage lost? | No. All three tips and their audited ancestors are ancestors of `df5bb516`, and every merge is `--no-ff` with the whole stack. |
| 4. Board gained write authority? | No (§21, BC-P0 §1–13). |
| 5. LMC gained write authority? | No. |
| 6. Can a model claim execution without verified state? | For Rhythm, no: it re-reads with `getMemberRhythm` (scenario 6). The Reminder path has no re-read (§28.2). |
| 7. Material-signals callable anonymously? | No (§9). |
| 8. A kill switch that doesn't restore the safe path? | The Board flag off *holds* new discussions rather than restoring the legacy Board. It is safe but not a full rollback. Documented in §22 and §27. |
| 9. R1 architecture introduced? | No. There is no turn-interpretation layer, no global model call, and no `handleSend` or pending-store changes. |
| 10. Patched a test sentence? | No. Each reconciled assertion is traced to the stack commit that changed it on purpose. The Rhythm fix is a structural rule tested with 13 cases across different phrasings. |
| 11. New test or TS failures? | 0 new test failures and TypeScript identical to baseline (§14). |
| 12. Other rooms altered? | Print CSS was scoped (§23). The `retrieveRelevantSituation` change affects every consumer, including Chamber and Claire, but only removes stale legacy values. The rooms render (§24). |

## 30. Final verdict
### R0 BLOCKED — DO NOT BEGIN R1

The code is ready: `claude/spark-r0-foundation-landing-l7edvu` @ `df5bb516` can fast-forward main. What is blocking is outside the code:
- **(a)** The Production Board flag, OpenAI and Supabase configuration must be confirmed.
- **(b)** The deploy and live Founder tests must be run from an environment that can reach Production, Supabase and OpenAI.
- **(c)** The phone Board Room nameplate overlap must be resolved or accepted.

Once (a) and (b) pass, fast-forward main to `df5bb516` and run §17–18 live.
