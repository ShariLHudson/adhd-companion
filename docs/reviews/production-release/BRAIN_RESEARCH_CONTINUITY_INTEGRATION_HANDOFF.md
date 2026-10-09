# Brain Research Continuity: Integration Handoff to Production

**Status: accepted for combined-preview testing; not production-certified.**
- Branch `brain/research-continuity` is complete. Preserve these commits:

  | Commit | What |
  |---|---|
  | `3f77bafad` | Research never joins unrelated work |
  | `292ac23d8` | Rename and resume are verified actions |
  | **`a82c2dfe7`** | Recent-research list dedupe (branch head) |
  | `bedcef9` | Journey evidence, in `adhd-companion` |
  | `9579e23` | Report, in `adhd-companion`; count erratum appended in the next commit |

- No merge or deploy was done by the Brain agent.
- **Board integration is separate.** It is not on this branch and is not started.

## 1. Base and lineage

| | |
|---|---|
| Base | `0cb567fe7` (held candidate: `df6a12a7b` + strict dashboard guard `a9872ea0e` + D1) |
| Not included | Production `515d77f57`, `c13fec292`, `48c4c8af3`, `d88a718ec`; earlier upload fix `c2f1429c8` (it **is** in the base) |
| Research branch | `vts/universal-visual-quality` @ `6f3369868` (base `df6a12a7b`) |

## 2. Shared files: what must survive the combination

| File | Brain owns / changed | Also changed by | What must be preserved |
|---|---|---|---|
| `app/companion/CompanionPageClient.tsx` | `BRAIN_WORK_TURNS`; pending research choice answered before the Brain call; `brainTurn.clientAction` → `runResearchAction`; repeat guard in `executeWorkIntent` case `"research"` (`existingResearchFor`); helpers `brainResearchRecords`, `openSavedResearchByBrain`, `brainResearchDeps`, `showBrainResearchResult` | **Research** (`6f3369868`): Library management and visual intent | **All of these hooks must survive.** The Brain call must stay ahead of the legacy research launch, and research launches only after the repeat check. |
| `lib/researchLibrary/persistence.ts` | `noteResearchLaunched` on a new inquiry; new `retitleResearchRecord` (record + its threads; no re-forward; active pointer unchanged) | **Research** (`04ada43c2`): Library rename/archive/Trash | One rename path or two that agree. **Archived or Trashed records must be excluded from conversational resume:** the Brain lists via `listSavedResearch()` (status saved/active). Confirm the Library's archive/trash status values fall outside that filter. |
| `lib/brain/proposals.ts` | research joins focus only via id / holder / `researchIsAbout` | **Board** (`e16f1cae9`): no textual change, but uses `perspective`/`decision`/consultation proposals | The research branch only. Board's perspective and confirmed-decision paths are unchanged. |
| `lib/brain/forward.ts` | `noteResearchLaunched`, `researchLaunchedFor` | Board imports `brainForwardingSuspended` | No conflict. |
| `lib/brain/interpret.ts`, `pipeline.ts`, `client.ts`, `workScope.ts`, `app/api/brain/turn/route.ts` | rename/resume readings; `clientAction`; verified work rename; `replyIsNotAboutFocus`; `VISUAL_OF_MATERIAL` | none | Keep `clientAction` in the turn route response. |
| New: `lib/brain/researchReference.ts`, `researchActions.ts`, `researchContinuity.test.ts` | Brain | none | — |

**Local trial merge** of `a82c2dfe7` + `6f3369868` (not pushed, discarded):
- **Clean**, no conflicts.
- Tests (`lib/brain`, `lib/researchLibrary`, the Research Library panel, `lib/workAttachments`): **914/918**. The 4 failures are pre-existing: 3 `ResearchLibraryPanel` tests fail on each branch alone, and `brainDumpVisualClusters` fails on the base.
- No TypeScript errors in Brain or persistence files.

## 3. Dependencies

1. **Member sync**: `flushMemberSync` / `activeMemberSync` decide "saved to your account" versus "on this device". Keep the research stores account-synced (`companion-research-library-collections-v1` / `-sessions-v1` / `-inquiries-v1`).
2. **Exact reopen**: `stageContextualResearch({ reopenCollectionId })` + `ResearchLibraryPanel`'s reopen path (Research-owned). It must keep returning **before** any auto-explore.
3. **One Brain on**: the research actions ride on the Brain turn. The kill switch `NEXT_PUBLIC_ONE_BRAIN=0` falls back to the legacy path, which has none of these protections.
4. **No database migration.**

## 4. Tests Production must keep green on the combined build

| Test | Where | Expected |
|---|---|---|
| `lib/brain/researchContinuity.test.ts` (audit sentences, real titles) | unit | 23/23 |
| `lib/brain/researchContract.test.ts` (incl. "about something else never joins focus") | unit | 19/19 |
| `lib/brain/client.test.ts` (`clientAction` parsing) | unit | 6/6 |
| Full suite vs the same-scope base | unit | No new failures (base `0cb567fe7`: 21,041 / 588 failing) |
| `brainresearch.mjs` (`bedcef9`): R1, S1, S2, P1, W1/W2, C1, X1, X2, V1, F1/F2, I1, N1 | signed-in, two accounts, DB checks | **18/18** |
| **Combined only:** Library rename and conversational rename on the same record → same title in the record, its thread and the account copy | preview | new |
| **Combined only:** an archived/Trashed record is not offered or opened by "go back to my … research" | preview | new |
| **Combined only:** "Create a concept map from this information" uses the member's material (Research `283b951af`) and adds nothing to the focus work (Brain) | preview | new |
| Real-model preview: R1, S2, P1, F1, I1 with DB checks | preview | not yet run (no preview/model access here) |

## 5. Open items carried

- **Production data cleanup** (Harbor Dental Matter `mat_d95e…`, collections' `matterId`, the mistaken records): proposal in the report §6; needs founder approval.
- **Board integration:** waiting for `BRAIN_AGENT_HANDOFF_BOARD_CONVERSATION.md` and `BOARD_SIGNED_IN_CERTIFICATION_AND_AI_PLAN.md`. It will be a separate branch from the agreed baseline.
