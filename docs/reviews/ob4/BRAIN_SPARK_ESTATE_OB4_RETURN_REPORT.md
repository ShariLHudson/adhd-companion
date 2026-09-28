# BRAIN SPARK ESTATE™ — OB-4 Return Report
## Receipts + Universal Correction Loop

**Status:** Complete and certified locally. **Not pushed, not merged, not deployed.** `main` is untouched. OB-5 has not been started.

**Outcome.** The loop UNDERSTAND → BIND → ACT → **RECEIPT → CORRECT → RETURN → CONTINUE** now runs through One Brain:
- **Receipt:** an owner that commits a change records **one receipt** on the conversation spine.
- **Understand:** Boundary sees it through its existing `lastExecuted` input, but only while it is fresh. When the member corrects, Boundary says `relation = correct`.
- **Bind:** `resolveCorrectionBinding` decides by **provenance** what is being corrected.
- **Act:** the receipt names the owner, which alone decides how its data changes, using its own existing update, parser and read-back.

**The OB-3 Rhythm "Tuesday" defect is fixed through this universal path** (no Tuesday phrase, no Rhythm-only detector). **Real-room divergence: 2/285 → 0/285.**

---

## 1. Verified starting SHA

| Check | Result |
|---|---|
| `ob3/one-pending-authority` @ `ddf8e966e522d9fd0bfc09b37e8992d9b44e1922` | **Exists**; parent `3a30dc26` (OB-2R) |
| OB-3 report | `docs/reviews/BRAIN_SPARK_ESTATE_OB3_RETURN_REPORT.md` present in that commit |
| Base used | **Exactly `ddf8e966`**, as an isolated worktree. Not `main`. |

## 2. Ending branch / SHA

| | |
|---|---|
| Branch | `ob4/receipts-universal-corrections` (from `ddf8e966`) |
| Ending SHA | `b9ef5d6abcb02e5e619b55e02e013817cc31da8f` (`ob4/receipts-universal-corrections`, local, not pushed) |
| Pushed | **No.** A push triggers a Vercel preview, which needs Founder authorization. |

## 3. Receipt architecture

**One receipt authority: the spine's `ConversationSession.receipt`.**
- It extends the existing sole durable conversational authority; it is not a new store.
- Accessors live in `lib/conversationSession/receipts.ts`.

```ts
type ConversationReceipt = {
  receiptId: string;            // stable across a correction chain on the same object
  ownerKey: string;             // who performed it and receives corrections ("remember", "reminder")
  capability: string;           // "rhythm", "reminder"
  operation: "create" | "update" | "delete";
  objectId: string;             // the domain object that changed
  label: string;                // short read-back label
  committed: Record<string, string | number | boolean | null>; // values READ BACK from storage
  correction: "owner_supported" | "not_supported";   // owner-declared
  undo: "delete" | "none";                           // owner-declared
  items?: { id: string; label: string }[];           // several objects changed at once
  executedAtTurn: number; correctedAtTurn?: number; heldThroughTurn?: number; at: string;
};
```

- **Recorded only by owners, only after a verified commit:**
  - **Remember/Rhythm:** `savePendingRememberCreate` with `phase: "executed"` records it, with values re-read via `getMemberRhythm`.
  - **Reminders:** `recordReminderReceipt` records it after `resolveReminderTurn` commits (page and frictionless call sites). Values are re-read from `getReminders()`.
- **Boundary:** the receipt becomes the existing OB-1 `lastExecuted` input (`{ id: receiptId, label }`), and **only while fresh**. Boundary holds no domain data. `permitsFor.mayModifyExecuted` (OB-1) now has a real receipt to check against.
- **Correction chain:** a later change to the same object keeps the `receiptId` and sets `correctedAtTurn`, so "and make it 10 instead" continues the chain.
- **Undo:** a successful undo clears the receipt.
- **Reload / new chat:**
  - after a reload the turn counter restarts, so an old receipt is never fresh;
  - New Chat resets the spine.

**Freshness rule.** The receipt's last relevant turn (execution, a correction, or a person-before-process hold that kept it alive) must be the immediately previous turn. This is the same provenance rule OB-3 uses for pending items.

## 4. Correction-binding architecture

`resolveCorrectionBinding` (`lib/conversationBoundaryRoomGate.ts`) is **one call per turn** in the page and the drivers. It is built on Boundary meaning, `permitsFor`, the OB-3 pending owner and the receipt.

| Situation | Binding |
|---|---|
| HIGH `correct`, fresh receipt (more recent than any pending) | `correct_receipt` (+ `undo` when Boundary saw an undo instruction) |
| HIGH `correct`, fresh pending offer/candidate (more recent) | `correct_pending` |
| Fresh receipt **and** fresh pending from the same turn | `check: ambiguous` (never guesses) |
| Receipt names several objects | `check: multiple_items` ("Which one should I change — 1. …, 2. …?") |
| Receipt exists but is not fresh (conversation moved on, reload) | `check: stale` |
| LOW `correct` | `check: low_confidence` |
| Not a correction | `none` (OB-2 conversation behavior unchanged) |

**Return to the owner:**
- `correct_receipt` for **Remember** goes into the frictionless layer, where `continueActiveRemember` calls `correctExecutedRhythm`. That function uses only Remember's own capabilities: `parseRememberModifiers`, `detectSubjectCorrection`, `updateExecutedRhythm` (update + read-back) and `deleteMemberRhythm`.
- A weekday on a **weekly** Rhythm is read with the receipt's context ("I said Tuesday"). Anything unreadable leads to "What should I change about …? Right now it's …", with nothing written.
- `correct_pending` for the Remember offer amends the offer with Remember's parsers and re-offers it. Nothing is created.
- Every other owner goes through `resolveReceiptCorrectionReply` (`lib/conversationSession/receiptCorrection.ts`). It is a dispatcher, not a brain: owner-supported undo (Reminder delete, verified), `OWNER_CORRECTION_NOT_SUPPORTED`, or the deterministic check replies.
- **Continue:**
  - a check or a hold keeps a fresh receipt correctable (`noteReceiptHeld`);
  - a stale receipt is never revived;
  - "What do you mean?" after an execution still lets "No, I said Tuesday." correct it next turn.

**Structural One Brain additions** (lexicon, in Boundary only, no room vocabulary):
- `CORRECTION_DIRECTIVE_RE`:
  - (lead: no / actually / and / just / …) + amend verb (make / change / move / switch / set / update / fix / edit / reschedule) + deictic or ordinal object;
  - read as a correction **only against a fresh executed receipt**;
  - against a pending offer, "Make it 4:00." stays OB-1's amended acceptance;
  - with nothing executed, "make it monthly" stays a request.
- `UNDO_INSTRUCTION_RE`: undo / remove / delete / revert / take back / get rid of + deictic, or "put it back". Only against a fresh receipt.
- An acceptance lead ("Yes, but make it 4:00") is still OB-3's amended acceptance; a polite leading "please" is not a yes.

**Correction vs decline.** Decline remains the OB-1/OB-3 decline ("No, don't do that." / "Not now."). An explicit correction marker or directive wins over a leading "no" ("No, I said Tuesday." / "No, undo that.").

**Correction vs discussion.** "I'm thinking monthly might be better." has no directive and no marker, so nothing changes.

## 5. Existing code reused (connected, not rebuilt)

| Reused | Where |
|---|---|
| OB-1 `lastExecuted` input + `permitsFor.mayModifyExecuted` | Boundary / meaning contract; now fed by the receipt |
| Round 1 Remember executed-phase record (`phase: "executed"`, `executedItemId`) | The receipt is recorded from it |
| `updateExecutedRhythm` (update → **re-read** → verified reply) | Correction apply + read-back |
| `parseRememberModifiers`, `detectSubjectCorrection`, `applyModifiers`, `saveActiveRemember` | Owner-side amendment reading |
| `deleteMemberRhythm`, `deleteReminder` | Undo (verified afterwards) |
| OB-3 pending owner + freshness | Correction of a pending candidate; ambiguity between pending and receipt |
| Conversation spine (`patchConversationSpine`) | The single receipt authority |

**Older architecture inspected, not resurrected** (`atomic/global-conversation-action-r1`, fetched read-only):
- `lib/executionFoundation/actionGate.ts`, `lib/memberIntent/actionProposal.ts`, `actionToolDefinitions.ts`, `lib/spark/shadowActionInterpretation.ts`: an Action Gate plus model tool definitions. Evidence only; not merged.
- **On the current base:**
  - `lib/executionFoundation/*` (manifest, `executionRunStore`, `verifyProjectExecution`, `authorizationReceipt`) covers **one** capability: the Board decision → project starter;
  - `lib/executionReceipts.ts` holds only receipt *copy* strings.

  Neither is a conversation receipt. They are recorded for OB-5 (§14).

## 6. Duplicate authority removed

The correction detectors and owners encountered (35 production files carry correction logic):

| Detector / owner | Class | Note |
|---|---|---|
| Remember's own decline reading of "No, …" after execution (the Tuesday defect) | **REPLACED** | A bound correction reaches `correctExecutedRhythm` **before** the decline path (a structural test pins the order) |
| Remember's Round 1 executed-phase amendment readers (modification / subject / act) with their own 3-turn window | **REPLACED** (One Brain on); **LEGACY behind rollback** | They could amend after context was lost ("make it monthly" several turns later). Now only a bound, fresh correction amends an executed Rhythm. |
| Remember confirm-phase amendment of a pending offer | **KEEP** (domain), fed by `correct_pending` | Remember decides what the amended offer is; One Brain decides that it is a correction of this offer |
| `MEMBER_CORRECTION_RE`, `STATED_WRONG_RE`, `SAID_MEANT_RE`, `REFERENT_CORRECTION_RE`, `turnRecovery` (in Boundary) | **KEEP** (the One Brain reader itself) | The one correction reader |
| Board `detectConversationalMove` correction | **LEGACY behind rollback** (since OB-2) | |
| Events `applyCorrections` (values inside an answer) | **KEEP** (domain specialist) | Runs only on an answer the gate allowed |
| Claire `parseMemberConfirmationResponse` "modified" | **KEEP** (domain specialist) | After the OB-2 gate |
| `conversationContinuity/workflowCorrection.ts`, `universalCreation/orchestrator` / `discoveryContextHarvest` corrections, `visualFocus/applyInlineCorrection`, `relationshipEditing` | **DEFER** (owner-internal, room-scoped) | Each corrects its *own* in-progress artifact inside its room; not a competing authority over what Spark committed from chat; no receipt yet |
| `companionMistakeRecovery`, `certifyCompanionDelivery`, `shariAnswerFirst/conversationContinuity`, `groundedAcknowledgement`, `naturalVoice`, `talkItOut/reflectiveEngine`, `noHiddenMeaning` | **KEEP** (response-style only) | They shape *how Spark speaks* after a correction; they write no member data |
| `conversationSession/ownership/resolveOwnership` "correction release" | **DEFER** | Ownership lifecycle; OB-5 / spine demotion |
| `estate/collectionFramework/collectionOfferRelease`, `estatePlaceNavigation` | **KEEP** (domain) | Release/navigation semantics |

**Net:** for member data Spark committed from chat, there is now **one** correction authority (One Brain binding + the receipt's owner). The two competing Remember paths are no longer authorities while One Brain is on.

## 7. Owner correction support matrix

| Owner | Receipt | Field corrections | Undo | Status |
|---|---|---|---|---|
| **Rhythm (Remember, from chat)** | ✅ (read back) | title (spelling), cadence, weekday (weekly), time with AM/PM | ✅ delete (verified) | **SUPPORTED** |
| Rhythm **offer** (pending) | pending record (OB-3) | cadence / time / title amended, then re-offered | n/a | **SUPPORTED** (nothing created until accepted) |
| **Reminders (from chat)** | ✅ (read back; `items[]` when several) | ❌ | ✅ delete (verified) | Fields: **`OWNER_CORRECTION_NOT_SUPPORTED`**. `updateReminder` exists, but no correction reader is connected: **exists but disconnected**. Spark says so and changes nothing. |
| Create (Universal Creation / Current Focus) | ❌ none | edits happen in the workspace UI | Post-create Undo exists as a **45-second UI button** (`createEstate/postCreateUndo.ts`) | **No receipt**; the undo capability is disconnected from conversation |
| Events | ❌ none | `applyCorrections` inside answers only | ❌ | No receipt |
| Claire / Business Profile | Claire's own write candidate + confirmation contract | "modified" in Claire's contract (OB-2 gate) | ❌ | KEEP (room-scoped); no chat receipt |
| Projects | Board project starter: `executionRunStore` + `verifyProjectExecution` | ❌ | ❌ | Execution record exists, but no conversation receipt |
| Board | Board-owned reopen / redeliberation | not chat-correctable | ❌ | Owner-internal |
| Decision Ledger | ❌ none | `supersedes` / `supersededBy` exist | ❌ | No receipt; capability exists |
| Collections (Wins / Evidence Vault / Garden) | ❌ none | `updateEvidenceEntry` exists | `deleteEvidenceEntry` exists | No receipt; **exists but disconnected** |
| Saved Work | ❌ none | `updateSavedWork` exists | `archive` / `delete` exist | No receipt; **exists but disconnected** |
| Calendar | n/a (link-out / `.ics` only) | ❌ | ❌ | **External integration missing** (OAuth scope has no calendar) |

## 8. Rhythm Tuesday proof

The OB-3 matrix cells `Rhythm owner (just executed) × {S4-correct, S4b-not-what-i-meant}` behave as follows.

**"No, that's wrong. I said Tuesday."**
1. Boundary returns `correct` HIGH (target executed).
2. `resolveCorrectionBinding` returns `correct_receipt` (ownerKey `remember`).
3. `correctExecutedRhythm` reads Tuesday in the weekly context and calls `updateExecutedRhythm`.
4. Storage now reads weekly, **Tuesday**, 3:00 PM, with everything else the same.
5. Reply: "Updated — “…,” weekly on Tuesday at 3:00 PM…". The same Rhythm id; no duplicate.

**"No, that's not what I meant."** This is bound as a correction but carries **no new value**. Nothing is written, the receipt is kept, and Spark asks: "What should I change about “…”? Right now it's weekly on Monday at 3:00 PM."
- The matrix expectation for this one cell was `executed: true`, which would require a guess.
- It is now documented as `executed: false, pendingPreserved: true` in `roomDrivers.ts`. This is a legitimate expectation fix, not a weakened gate.
- The other executed-shape cells are unchanged.

Certified in `receiptCorrection.ob4.test.ts` with 5 paraphrases, including frustration: "Ugh, no — I said Tuesday!", "This is so frustrating. I said Tuesday.", "Sorry, I meant Tuesday."

## 9. Adversarial examples (the 12 required, plus extras)

All run on the production chain (`receiptCorrection.ob4.test.ts`), after a weekly Monday 3 PM Rhythm was committed on the previous turn.

| # | Member | Binding | Result |
|---|---|---|---|
| 1 | No, I said Tuesday. | `correct_receipt` | Tuesday; everything else kept |
| 2 | That's not what I meant. | `correct_receipt` | **Asks** what to change; no write |
| 3 | I meant ASEA, not Assia. | `correct_receipt` | Title corrected only (the brief's "Sarah, not Susan" pattern, on a Rhythm subject) |
| 4 | Keep everything else the same, just change it to 4. | `correct_receipt` | **Asks** (4 AM or 4 PM is never guessed); no write |
| 5 | Actually make it monthly. | `correct_receipt` | Monthly; time kept |
| 6 | No, don't do that. | none (decline) | No write |
| 7 | Not now. | none (decline) | No write |
| 8 | I'm thinking monthly might be better. | none (discussion) | No write |
| 9 | Why did you change it? I said Tuesday. | none (`ask`: answer first) | No write; the receipt stays correctable, so the next "No, I said Tuesday." applies it |
| 10 | Change that. | `correct_receipt` | **Asks**; no write |
| 11 | Undo that. | `correct_receipt` + undo | Rhythm **deleted, verified**; receipt cleared |
| 12 | Make the second one Thursday. (two reminders genuinely exist) | `check: multiple_items` | "Which one should I change — 1. Call Susan, 2. Call David?"; no write |
| — | And make it 10am instead. (right after a correction) | `correct_receipt` (same chain) | Tuesday + 10:00 AM |
| — | Make that 4pm instead. / Move it to 4pm. | `correct_receipt` | Only the time changes |
| — | No, I meant weekly. (pending offer) | `correct_pending` | Offer amended + re-offered; **nothing created** |
| — | Reminder + "No, I said Tuesday." | `correct_receipt` → `OWNER_CORRECTION_NOT_SUPPORTED` | Honest reply; reminder unchanged |
| — | Reminder + "Undo that." | `correct_receipt` + undo | Reminder deleted, verified |
| — | Fresh offer + fresh receipt on the same turn + "No, I said Tuesday." | `check: ambiguous` | Asks which; no write |
| — | "No, I said Tuesday." after an unrelated turn, or after a reload | `check: stale` | No write |
| — | "Actually make it monthly." / "Undo that." after an unrelated turn | not a correction | No write |

## 10. Remaining divergences

**0 of 285** real-room cells (`docs/reviews/ob4/divergence_baseline.json`). With the kill switch at `0`, OB-1 is still reproduced exactly.

## 11. False-write proof

| Proof | Result |
|---|---|
| False correction writes (every negative control, decline, discussion, question, ambiguity, stale, low-confidence and unsupported case in `receiptCorrection.ob4`, checked against storage) | **0** |
| False execution authorizations (corpus, holdout, OB-2/3/4 additions) | **0** |
| HIGH precision (corpus, holdout, OB-2/3/4 additions) | **100%** |
| Ambiguous corrections that correctly resulted in a check or ask | **10** paraphrase cases (6 valueless/ambiguous-value + 1 ambiguous target + 3 multiple items) |
| Stale corrections that did nothing | **7** (3 marker + 3 directive/undo + 1 reload) |
| LOW confidence never modifies | Asserted |
| Duplicate objects created by a correction | **0** (same id; `listMemberRhythms()` length unchanged) |

## 12. Test / typecheck / lint evidence

| Check | Result |
|---|---|
| Full Vitest suite | OB-3: 20,812 tests / 465 failing → OB-4: 20,882 tests / 464 failing. **NEW failures: 0.** FIXED: 1 (`numberedChoiceResolution` nested-menu case — pre-existing `Date.now()`-id flake, flaps 1/12 on base; not claimed as an OB-4 fix). All 464 remaining failures are pre-existing on OB-3. |
| One Brain certification (`lib/oneBrainCertification`) | 230/230 pass |
| Room divergence vs OB-3 baseline | 0 / 285 |
| TypeScript (`tsc --noEmit`) | 353 errors, identical multiset to OB-1 baseline (0 new) |
| ESLint (changed files) | 159 → 159 (0 new) |

**Kill switch:** OB-4 uses the existing single switch, `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD=0`.
- `resolveCorrectionBinding` returns `null`.
- Boundary is not fed the receipt; the transition is identical.
- The legacy Remember paths run.
- Receipts are still *recorded*; that is harmless data.

## 13. What Spark still cannot correct, and why

**A. Now corrected reliably, from natural conversation:**
- a Rhythm Spark just created or changed from chat: its day of the week, cadence, time (with AM/PM) and name;
- undoing it;
- amending a pending Rhythm offer before it is created;
- undoing a Reminder Spark just created;
- repeated corrections of the same result;
- safe checks when the correction is unclear, ambiguous, several items are involved, or context was lost.

**B–C. Still cannot be corrected, and why:**

| Correction | Reason class | Why |
|---|---|---|
| Change a Reminder's time/date/text from chat | **Capability exists but disconnected** | `updateReminder` exists; no correction reader maps "make it Tuesday" onto a reminder's `scheduledAt` (the Reminder intake parser is not wired to amendments) |
| A bare time without AM/PM ("change it to 4") | **Insufficient provenance** (by design) | Ambiguous; Spark asks |
| Correct a Create workspace / section from chat | **No receipt** | Create writes to its runtime record but records no conversation receipt; its Undo is a 45-second UI button only |
| Correct an Events record from chat after the fact | **No receipt** | Events corrects values only inside an answer turn |
| Correct / supersede a Decision Ledger entry from chat | **No receipt** (capability exists) | `supersedes` / `supersededBy` exist; there is no receipt, and no conversational supersede path |
| Undo / correct a Win / Evidence / Saved Work save | **Capability exists but disconnected** | Update / delete / archive exist in the stores; there is no receipt from the collection save flows |
| Correct Business Profile facts from main chat | **Capability exists but disconnected** | Claire's confirmation contract handles "modified" only inside Claire |
| Correct a Board-created project | **No receipt** | `executionRunStore` + `verifyProjectExecution` exist, but produce no conversation receipt |
| Change something in the member's real calendar | **External integration missing** | No calendar OAuth scope; only link-out and `.ics` |
| "Change the second one" when several objects were changed | **Capability truly missing** (ordinal resolution against receipts) | Spark asks which (fail-safe). The reader's item resolution exists for offers (OB-3) but is not connected to receipts. |
| "Put it back" after an undo | **Capability truly missing** | No owner keeps a restorable copy; no fake rollback was built |

**D. Connect later rather than rebuild:**
- `updateReminder` plus the existing Reminder time parser (`reminderIntelligence`);
- `supersedes` in the Decision Ledger;
- `updateEvidenceEntry` / `deleteEvidenceEntry`;
- `updateSavedWork` / `archiveSavedWork`;
- Create `postCreateUndo`;
- `executionRunStore` / `verifyProjectExecution` (they already record and verify executions; they need to emit a conversation receipt);
- OB-3's item resolution (`referencedItems`) for multi-item receipts.

Each owner needs only to **record a receipt** after its commit and **declare** its correction/undo support. The binding is done.

## 14. Discoveries for OB-5

| Existing piece | What it is | OB-5 relevance |
|---|---|---|
| `lib/executionFoundation/capabilityManifest.ts` (+ `types.ts`, `readinessGate`, `idempotency`, `executionRunStore`, `verifyProjectExecution`, `authorizationReceipt`) | A real, typed **action manifest + executor + verification** foundation, with **one** manifest (Board decision → project starter). It has runtime-connection states (`PROVEN_RUNTIME` / `ADAPTER_REQUIRED` / `NOT_YET_CONNECTED`). | The natural home for capability → executor → verification. Each executor should emit the OB-4 receipt. |
| `atomic/global-conversation-action-r1`: `actionGate.ts`, `actionProposal.ts`, `actionToolDefinitions.ts`, `shadowActionInterpretation.ts` | An earlier Action Gate + model tool definitions + shadow interpretation (not on the current base) | Evidence for OB-5 tool definitions. **Do not resurrect** as a parallel authority; its tool definitions could feed the capability catalog. |
| `lib/estateCapabilityRegistry/catalog.ts` (the Capability Connection Audit) | Capability catalog, not visible to One Brain | OB-5's CONNECT step |
| Owner update functions | `updateReminder`, `updateMemberRhythm`, `updateEvidenceEntry`, `updateSavedWork`, Ledger supersede, Create post-create Undo | The correction targets OB-5 should register as each capability's `correct` / `undo` operations |
| Return paths | Research return (`researchReturnHintForChat`); the Remember read-back (`composeRhythmReply`); Board handoffs (`DESTINATION_NOT_CONNECTED`) | A uniform "result returns to chat" contract should reuse the receipt `label` + `committed` |
| `lib/executionReceipts.ts` | Receipt *copy* strings only | Merge into the owner read-back, not a second receipt store |

## 15. Recommended next step

**OB-5: Capability connection**, reusing the existing pieces rather than rebuilding them.
1. Give One Brain one read path to `estateCapabilityRegistry/catalog` (the Capability Connection Audit's CONNECT gap).
2. Register each capability's **executor** through the existing `executionFoundation` manifest shape. Require every executor to **record the OB-4 receipt** after its verified commit, and to declare its correction/undo support.
3. Connect the "exists but disconnected" owners in §13 in impact order:
   - Reminder amendments (`updateReminder` + the existing parser);
   - the Decision Ledger supersede;
   - Evidence and Saved Work updates / deletes;
   - Create's post-create Undo.
4. Chat → Claire, and Board results → chat (Capability Connection Audit §8).

---

*OB-4 complete. Certified locally. Not pushed. Not merged. Not deployed. OB-5 not started.*
