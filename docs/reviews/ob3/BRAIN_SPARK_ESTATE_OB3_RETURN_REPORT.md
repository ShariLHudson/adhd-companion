# BRAIN SPARK ESTATE™ — OB-3 Return Report
## One Pending Authority + Binding Convergence

**Status:** Complete and certified locally. **Not pushed, not merged, not deployed.** `main` is untouched. OB-4 has not been started.

**Outcome.** A member's "yes / no / not now / the first two / yes, but make it 4:00" now binds through **one** pending record: the spine's existing `ownership.expectedReply`. Boundary reads it as plain pre-turn data (`pendingOwnerSnapshot`). One function, `resolvePendingBinding` (Boundary meaning + `permitsFor`), decides once per turn what the reply belongs to. Every converged bind site obeys that decision instead of deciding on its own. Specialists still decide what an accepted offer *means* in their domain.

**Divergence:** 2/120 → **1/120** in the 8 OB-1 situations, and 4/285 → **2/285** with every phrasing. The two remaining cells are both the *just-executed* Rhythm correction, which is exactly OB-4's receipt scope.

---

## 1. Verified starting point

| Check | Result |
|---|---|
| Accepted OB-2R SHA `3a30dc26a0791a395e88d249dce11da635c7a59d` | **Exists** (commit), on `ob2/one-brain-hold-answer`. Parents: `6b48a4bc` (OB-2) → `c1110a89` (OB-1). |
| Contains the OB-1 meaning contract, `permitsFor`, the OB-2 room gate, the OB-2R Board/Events uncertainty repair and the OB-2R Current Focus repair | **Yes** (`lib/conversationBoundaryMeaning.ts`, `lib/conversationBoundaryRoomGate.ts`, `lib/currentFocus/submitCurrentFocusResponse.ts`) |
| Certification baseline shows only the four Rhythm correction cells | **Yes:** 4/285, all `Rhythm owner × {S4-correct, S4b-not-what-i-meant}` |
| Base used | **Exactly `3a30dc26`.** Not `main`. |

## 2. Branch and ending SHA

| | |
|---|---|
| Branch | `ob3/one-pending-authority`, created from `3a30dc26` (isolated worktree) |
| Ending SHA | **`ddf8e966e522d9fd0bfc09b37e8992d9b44e1922`** (local commit on `ob3/one-pending-authority`, parent `3a30dc26`) |
| Pushed | **No.** A push triggers a Vercel preview, which needs Founder authorization. |

## 3. Files changed

**One Brain**

| File | Change |
|---|---|
| `lib/conversationBoundaryLexicon.ts` | `DEFERRAL_INSTRUCTION_RE`: the structural deferral family (§ First) |
| `lib/conversationBoundaryMeaning.ts` | The decline clause includes deferral instructions. A deferral put as a question ("Can we come back to this one?") is a decline, not an `ask`. |
| `lib/conversationBoundary.ts` | `BoundaryPendingOwner` type. Reconciliation rule 3: a HIGH acceptance bound to the live pending offer is not a topic switch (evidence `meaning_binds_pending`). |
| `lib/conversationBoundaryInputs.ts` | `pendingOwnerSnapshot()` (generalized pending snapshot), `pendingLastRelevantTurn()`. The pre-turn snapshot carries `pendingOwner`. Boundary is fed `pendingOffer`/`armedItems` from it (not with the kill switch). |
| `lib/conversationBoundaryRoomGate.ts` | `resolvePendingBinding`, `pendingBindingAllows`, `pendingBindingOwnedBy`, `acceptanceUnboundFor` |
| `lib/conversationSession/ownership/types.ts` | `OwnershipExpectedReply` extension (§5) |
| `lib/conversationSession/ownership/pendingReply.ts` | **New**, thin spine accessors (not a store): `armPendingReply`, `notePendingReplyHeld`, `releasePendingReply`, `readPendingReply` |

**Owners, arming their own offers**
- `lib/frictionlessActionLayer.ts`: `saveFrictionlessPending` arms (this covers frictionless, VTS and Strategy offers). The Remember binders (legacy and Round 1 `continueActiveRemember`) and `tryFrictionlessYesContinuation` obey the binding. The layer accepts `pendingBinding`.
- `lib/remindersVsRhythms/conversationPending.ts`: a Remember *offer* (confirm phase) arms, with its requested capabilities as `items[]`.

**Main chat:** `app/companion/CompanionPageClient.tsx`
- one binding per turn, plus the hold/release lifecycle;
- arm choke points: `setAwaitingUserConfirmation` (38 call sites), `setPendingAcceptanceRecord` (7), Board invite, Chamber invite, Decision Compass, conversation handoff, the Decision Ledger;
- converged bind sites (§6);
- a fail-safe "which ones?" reply;
- model-text arms marked non-executable.

**Certification**

| File | Change |
|---|---|
| `lib/oneBrainCertification/pendingBinding.ob3.test.ts` | **New**, 85 cases on the real production chain (§13) |
| `corpus.ts` / `bakeoff.ob1.test.ts` | `OB3_ADDITIONS`: the deferral family, 10 paraphrases + 6 negative controls, in the HIGH-precision and false-execution gates |
| `roomDrivers.ts` | The Rhythm drivers run the page's binding step before the frictionless layer, as production now does |
| `roomDivergence.ob1.test.ts` | One Brain ON is certified against `docs/reviews/ob3/divergence_baseline.json`. The OB-2R baseline stays committed as history. |
| `oneBrainConsumers.test.ts` | OB-3 structural rules (§12) |

## First — the OB-2 language gap is closed (in One Brain only)

**Structural rule.** A clause is a deferral instruction when it has three parts:
1. an optional softener ("let's", "can we", "maybe we can", "I'd rather", …);
2. a deferral verb:
   - an inherent deferral: come back to, circle back to, revisit, skip, park, pass on;
   - a placement verb plus a setting-aside complement: put / set / leave … aside, on hold, for now;
   - an ordinary verb plus an explicit time tail: do / handle / look at … later, for now, another time;
3. a **deictic object** (this / that / it, optionally + one / question / part), then an optional time tail.

The deictic object is what separates an instruction about Spark's pending item from domain content. Events was **not** touched.

| Positive (all HIGH `decline`) | Negative control (never `decline`) |
|---|---|
| Let's come back to that later. · Let's come back to that one later. · Can we come back to this one? · Let's skip this one for now. · Let's skip that one for now. · Maybe we can do this later. · Put this aside for now. · Can we circle back to that? · I'd rather leave that for later. · Could we revisit that later? | We usually skip the networking hour. · Guests come back later for the awards dinner. · I'll come back to coaching later in my career. · We can do that later in the agenda. · Can we come back to the budget question? (`ask`) · Do it. (`accept`) |

**Checks on the new family:**
- HIGH precision is still **100%** on corpus, holdout, OB-2 additions and OB-3 additions.
- False execution authorizations: **0**.
- In Events, "Let's come back to that one later." and "Let's skip that one for now." are now Events' own **skip**. They are no longer stored as answers.

## 4. Final `pendingOwnerSnapshot`

Plain pre-turn data, read from the ONE pending record. It carries no domain content.

```ts
type BoundaryPendingOwner = {
  bindKey: string;                          // which owner armed it ("remember_offer", "board_invite", …)
  expects: "yes_no" | "choice" | "free";    // from expectedReply.kind
  offeredAtTurn: number;                    // when the owner made the offer / asked
  heldThroughTurn?: number | null;          // last person-before-process hold that kept it alive
  optional?: boolean;
  items?: { id: string; label: string }[];  // enumerated items, only when needed
  authority: "owner" | "model_text";        // who armed it
};
```

- `captureBoundaryPreTurnSnapshot()` now includes `pendingOwner`.
- The Create discovery question and the Decision Ledger confirmation remain the `pendingQuestion` shape, as before.
- `resolveTurnBoundaryDecision` feeds Boundary:
  - `pendingOffer = { summary: bindKey, offeredAtTurn: lastRelevantTurn }`;
  - `armedItems`, but only for owner-armed items.

## 5. Exact spine `expectedReply` extension

`OwnershipExpectedReply` (`lib/conversationSession/ownership/types.ts`) keeps `kind` and `allowedValues`. It adds these fields, all optional:

```ts
bindKey?: string;
offeredAtTurn?: number;
heldThroughTurn?: number;
optional?: boolean;
items?: { id: string; label: string }[];
authority?: "owner" | "model_text";
```

**Legacy records:**
- a record without `offeredAtTurn` falls back to `continuation.offeredAtTurn` or `continuation.sourceTurn` (collection and win-save offers already carry these);
- a record with no offer turn **cannot bind**.

**Arming never changes who owns the conversation.** An active owner gets the pending reply attached. Only when nobody owns the conversation is a `confirmation` owner created (the existing free-form pending shape). A newer arm **replaces** the previous pending item, which is what makes "only the newest offer may bind" hold.

**No new store, registry, acceptance authority or router.** `pendingReply.ts` is four accessors over the existing ownership record.

## 6. Bind sites converged

"Converged" means the site acts on an acceptance **only** when `pendingBindingAllows(pendingBinding, its own offer)` is true. That requires the binding to be `bind` and executable, and the offer made on the bound turn, or under the bound key.

| # | Bind site | Where | Was |
|---|---|---|---|
| 1 | Board invite acceptance | page | `isBareGenericAcceptance`, **no Boundary gate at all** |
| 2 | Chamber invite acceptance | page | same (ungated) |
| 3 | Decision Compass offer | page | `isAcceptanceAttempt` + `!boundaryClaimedTurn` |
| 4–5 | `pendingAcceptanceAuthority` dispatch (main path + workflow-continuation path) | page | `resolvePendingAcceptance` record + turn limit 2 |
| 6–7 | Create consent (two sites) | page | `userAcceptedCreateConsent` |
| 8 | Frictionless pending "yes" | page | `isShortAcceptanceOfArmedOwner` / `isFrictionlessAffirmation` |
| 9 | Frictionless confirmation in `tryContinueConversationWorkflow` | page | same |
| 10 | Strategy offer "yes" | page | `strategyOfferOnLastTurn` (text-detected) |
| 11 | Client-avatar offer | page | `isShortAcceptanceOfArmedOwner` |
| 12 | Collection offer acceptance (save to Hall / Vault / Garden) | page | `resolveCollectionOfferReply`, **no Boundary gate** |
| 13 | VTS menu bare acceptance | page | `resolveVisualMenuSelection`, **no Boundary gate** |
| 14 | Conversation-handoff (assembly) confirmation | page | `userAcceptedAssemblyConfirmation`, **no gate** |
| 15 | Survey offer | page | inferred from assistant text + `isAcceptanceAttempt` |
| 16 | Decision Ledger confirmation (B-10) | page | skipped whenever Boundary claimed the turn (§10) |
| 17 | Remember offer, Round 1 `continueActiveRemember` (the live Rhythm path) | frictionless | `interpretRememberReply` + `isOfferAnswerTurn` |
| 18 | Remember offer, legacy block | frictionless | `isBareShortAcceptanceText` + `isOfferAnswerTurn` |
| 19 | `tryFrictionlessYesContinuation` | frictionless | `isFrictionlessAffirmation` / `isConfirmationAcceptance` |

The main `resolveFrictionlessAction` call now receives the **Boundary decision** (it previously got none) and the **pending binding**. The 6,000-line layer was not rewritten: three binders take one extra check.

**Lifecycle, once per turn:**
- `preserve` → `notePendingReplyHeld(turn)`;
- `release` → `releasePendingReply`;
- `ask_which` → a deterministic "Which of those would you like me to do? …" reply that keeps the offer alive and executes nothing.

The Board and Chamber invites no longer lapse on a clarification (a hold keeps them).

## 7. Binders retired, bypassed or kept

| Class | Site | Note |
|---|---|---|
| **REPLACED** | The 19 sites in §6 | One Brain owns the binding; the legacy predicate runs only with the kill switch `0` |
| **REPLACED** | Remember's own decline/deferral reading (offer phase) | Release comes from One Brain. This fixed 2 matrix cells: a correction of a *pending* Rhythm offer used to be read as a decline. |
| **REPLACED** | The `PENDING_ACCEPTANCE_TURN_LIMIT` (2 turns) and `isOfferAnswerTurn` freshness rules at converged sites | One provenance-based freshness rule (§8) |
| **KEEP** (domain, after binding) | Collection room choice / menu, VTS *named* option ("the mind map"), Remember modifier parsing ("make it weekly"), Claire's `parseMemberConfirmationResponse`, Board/Events/Create room gates (OB-2) | What an accepted item means |
| **KEEP** (choice, not yes/no) | Win-save `1–4` choice (`resolveWinSaveReply`) | Numbered choice of a destination; its own freshness. A bare "yes" is not a choice. |
| **KEEP** (vocabulary only) | `isShortAcceptanceOfArmedOwner`, `isBareGenericAcceptance`, `isAcceptanceAttempt` … | Still used as *negative* guards ("this is not an acceptance") and inside converged sites. They are no longer an authority on what a yes binds to. |
| **DEFER → OB-4** | Rhythm *just-executed* correction; receipts / `lastExecuted` | The 2 remaining cells |
| **DEFER** | Work Recognition ready-line (`isSimpleAffirmation`), Create `bareContinue`, Claire subject-change check, the late spine resolver's `confirmation_acceptance` (B3), `speedProfile.isYesContinuation` (latency hint only) | Not reachable as a stale-yes executor in the certified paths. Each needs its own owner arm, and is listed for OB-4/OB-5. |
| **Not individually traced** | The ~40 offer kinds armed through `setAwaitingUserConfirmation` / `pendingAcceptanceRecord` | Now armed on the one record automatically; their launches go through converged sites 4–9 |

## 8. Freshness rule

A bare acceptance binds only when the pending item's **last relevant turn** is the **immediately previous turn**. The last relevant turn is the later of:
- the owner's offer turn;
- the turn of a later person-before-process hold that kept the item alive.

It must also be:
- not released (a decline, or a newer owner claim that dropped `expectedReply`);
- not replaced by a newer arm (the single record keeps only the newest).

This is the Round 1 rule, generalized by provenance rather than raw array position. It is implemented in `resolvePendingBinding` and passed to `permitsFor` as `armedOfferedAtTurn`.

**Turn arithmetic.** The page advances `chatTurnRef` *after* Boundary runs, so the binding uses `chatTurnRef + 1`. That is the same number offers made on this turn carry as `offeredAtTurn`.

## 9. Clarification-preserve rule

A HIGH `clarify`, `ask`, `unsure` or `correct` on a **fresh** pending item returns `preserve`, and the page records `heldThroughTurn = this turn`. The next turn's "Yes." is therefore fresh and binds to the **same** offer. The Founder example is certified end to end for five clarification paraphrases:

> Rhythm offer → "What do you mean?" → Spark explains → "Yes." → the original Rhythm is created.

**A hold does not revive a stale offer** (negative control).

## 10. Decision Ledger B-10

**Reproduced.**
1. With the Ledger's pending confirmation (`{kind:"confirmation", expects:"yes_no", role:"decision"}`), "Yes." makes Boundary return `answer_pending_question`.
2. `boundaryClaimedTurn` is then true.
3. The only consumer (`if (!boundaryClaimedTurn) processConversationDecisionTurn(...)`) was skipped, so the "yes" fell through to other paths and the decision was never recorded.

**Fixed through the shared authority** (no Ledger special case):
- the Ledger arms its yes/no on the one record (`bindKey: "decision_ledger"`);
- the consumer runs when `!boundaryClaimedTurn || decisionLedgerOwnsReply`, where `decisionLedgerOwnsReply` means the binding is `bind` or `release` for `decision_ledger`.

Certified with 5 replies ("Yes." · "Yep" · "Yes please." · "No." · "Not now."). A source check pins the gate.

## 11. Model-text arming

**Ended as an execution authority.**
- The free-form "Would you like me to…?" arm (`shouldArmPendingQuestion`) now arms `authority: "model_text"`. A "yes" to it binds to the conversation (`bind`, `executable: false`), and **no executing bind site accepts it**.
- The Collection offer recovered from assistant text is `model_text`.
- The Strategy, estate and VTS offers recovered from assistant text never arm, so they cannot bind an acceptance. VTS *named* options remain a domain choice.
- The survey offer (only ever inferred from assistant text) no longer launches under One Brain.

**Certified:** model-text-armed offers are never executable (5 paraphrases); model-text items are never selectable.

## 12. Duplicate pending / binder count, before → after

The same measure on both commits: yes-predicate call sites in the page and the frictionless layer, and whether a One Brain binding check guards them.

| | OB-2R (`3a30dc26`) | OB-3 |
|---|---|---|
| Page: yes-predicate call sites | 28, **0** guarded | 28, **14 guarded** |
| Page: remaining unguarded | 28 | 14. Of these, 9 are *negative* guards ("not an acceptance"); 1 is a latency hint; 2 are the client-avatar confirmation-reply flag (feeds only the OB-2 hold guard); 1 is win-save choice (KEEP); 1 is the "offer may have passed" message (no execution). **0 unguarded executing binders.** |
| Frictionless: yes-predicate call sites | 7, 0 guarded | 7, **2 guarded** + `tryFrictionlessYesContinuation` guarded by pending identity. The remaining 4 are negative guards. |
| Places that decide freshness for a main-chat offer | 5 (turn limit 2; `isOfferAnswerTurn`; `strategyOfferOnLastTurn`; `isFrictionlessPendingExpired`; the awaiting-confirmation age) | **1** at every converged site (`resolvePendingBinding`); the others remain only behind the kill switch or as domain expiry |
| Pending records a "yes" could bind to at once | Parallel: awaiting-confirmation ref, the acceptance record, frictionless pending, Remember pending, invites, Compass, handoff, and the spine | **One authoritative record** (spine `expectedReply`); the domain records are owner detail |

**Structural rules now enforced by `oneBrainConsumers.test.ts`:**
- exactly **one** `resolvePendingBinding` call in the page;
- the only production callers are the page and the gate;
- `heldThroughTurn` is written only by the spine accessors;
- model-text arms carry `authority: "model_text"`;
- the frictionless binders obey the binding.

## 13. Certification results

| Gate | Result |
|---|---|
| 1. OB-1 corpus / holdout | **Green** |
| 2. OB-2 / OB-2R hold certification (`roomHold.ob2`, 49) | **Green** |
| 3. New deferral family (10 + 6) | **Green** |
| 4. HIGH precision | **100%** (corpus, holdout, OB-2 and OB-3 additions) |
| 5. False execution authorizations | **0** |
| 6. Pending/binding suite (`pendingBinding.ob3`, 85) | **Green** |

The binding families in `pendingBinding.ob3` run on the real production chain: an owner arms through its production save path → snapshot → Boundary → binding → Remember's real bind path. The observer is language-free: was a Rhythm actually created?

| Family | Paraphrases / negative controls | Result |
|---|---|---|
| Fresh acceptance | 6 / 3 | bound executably; Rhythm created only for the positives |
| Stale acceptance | 5 / 1 control | `none(stale)`; nothing created |
| Modified acceptance | 5 / 3 | bound `amended`; the **unmodified (monthly)** Rhythm is never created ("make it weekly" → Remember applies weekly) |
| Partial acceptance (3 items) | 6 / 4 | exactly items 1+2; unarmed items → **ask which**; no-items offer → ask which; model-text items unselectable |
| Named partial | 5 / 3 | Susan included, David excluded; the 3 phrasings the contract does not read ("Add Susan, not David.", "Only Susan for now.", "Susan yes, David no.") **fail safe**, with nothing authorized |
| Decline / defer | 6 | released; spine record cleared; nothing created |
| Clarification-preserved | 5 + 1 negative | offer survives; the next "Yes." binds the original |
| Question-preserved | 5 | answered first; offer survives; `heldThroughTurn` recorded; nothing executes |
| Replaced offer | 1 scenario | only the newer offer binds; the older owner does not execute |
| Open-question bare yes | 5 | `none(not_yes_no)` |
| Reload / missing pending | 5 | `none`; nothing created |
| Model text | 5 | `bind` with `executable: false`; no bind site allows it |
| Compound | 3 | never executes a guess (amended / check / answer-first) |
| B-10 | 1 reproduction + 5 + source gate | reproduced, then routed |
| Kill switch | 1 | binding `null`; Boundary transition identical to legacy; the legacy Remember binder still works |

| 7. Stale yes never executes | **Proven** (5 paraphrases, production path) |
| 8. Partial acceptance cannot select an unarmed item | **Proven** (unarmed ids → ask which; itemless → ask which; model-text items never) |
| 9. Clarification preserves pending | **Proven** |
| 10. Model text cannot arm execution | **Proven** |
| 11. Kill switch | §14 |

**Real-room divergence** (`docs/reviews/ob3/divergence_baseline.json`):

| Matrix | OB-2R | OB-3 |
|---|---|---|
| 8 OB-1 situations × 15 rooms | 2/120 | **1/120** |
| All 19 situations | 4/285 | **2/285** |
| Kill switch `0` | = OB-1 exactly | **= OB-1 exactly** (asserted) |

The two cells that changed: `Rhythm owner (offer pending) × {S4-correct, S4b-not-what-i-meant}`. "No, that's wrong. I said Tuesday." used to release the pending offer through Remember's own decline rule. It is now a One Brain hold that preserves the offer.

## 14. Kill switch

The same single switch as OB-2, `NEXT_PUBLIC_BOUNDARY_MEANING_HOLD=0`, bypasses all of OB-3:
- `resolvePendingBinding` returns `null`, so every converged bind site takes its legacy predicate (`pendingBindingAllows(null, …) === true`);
- `resolveTurnBoundaryDecision` does not feed the pending owner to Boundary, so the transition is OB-2R-identical;
- reconciliation rule 3 is off (it sits inside the gated reconciliation).

**Not bypassed:**
- arming the record: it's harmless data;
- the lexicon deferral family: a meaning-only change, and meaning is consumed only by the gated layers.

**Proof:** the kill-switch matrix still equals OB-1 exactly, and `pendingBinding.ob3` asserts that the legacy Remember binder still executes with the switch at `0`.

## 15. Full-suite, typecheck and lint comparison

| Check | Result |
|---|---|
| **Full suite, OB-2R (`3a30dc26`) vs OB-3** | OB-2R: 20,720 tests, 464 failing. OB-3: **20,812 tests, 465 failing.** |
| New failing ids | **1, not caused by OB-3.** `numberedChoiceResolution > nested menu replacement` asserts that two menu registrations made back-to-back get different ids, but the id is `type-${Date.now()}`, so it fails whenever both land in the same millisecond. Measured on unchanged code: **OB-2R base fails 1/12 runs, OB-3 fails 1/12 runs.** It is a pre-existing timing flake, not fixed here (out of scope; the fix is a monotonic counter in `createPendingChoiceId`). |
| Fixed | 0 |
| Earlier OB-3 full run | Found 5 new failures, all **source-layout tests** that read `CompanionPageClient.tsx` by character windows (Board/Chamber invite state declarations and blocks). They were resolved by keeping the original declarations and compacting the invite gates into two small helpers (`inviteAccepted` / `inviteHeld`); behavior is unchanged and the tests were not edited. |
| `tsc --noEmit` | **353 vs 353; identical (file, code) multiset, 0 new** |
| ESLint on every changed/new file | **0 new findings** (159 → 158 on those files, measured against the same files at `3a30dc26`) |
| One Brain certification (`lib/oneBrainCertification`) | **160 / 160 green** (corpus, holdout, OB-2 + OB-3 additions, room holds, consumers, divergence, pending binding) |

## 16. Founder preview script (after you authorize a push)

| Step | Say / do | Expect |
|---|---|---|
| 1 | Say something that makes Spark *offer* a Rhythm (for example, describe a recurring task where Spark asks whether it should be a Reminder or a Rhythm, then pick Rhythm) → Spark asks "Want me to set it up?" | An offer (nothing created yet) |
| 2 | "What do you mean?" | Spark explains; **nothing is created**; the offer stays |
| 3 | "Yes." | **The original offer is accepted.** The Rhythm appears (Rhythms room) |
| 4 | Ask for a new Rhythm offer, then "Yes, but make it 4:00." | The same offer, bound with the amendment. **No unmodified Rhythm.** Remember applies the time it can parse, or asks. |
| 5 | Get an offer, then talk about something unrelated, then "Yes." | **Nothing happens** from the stale offer |
| 6 | Get an offer, then "Do the first two, not the third." | The offer has no enumerated items, so Spark asks **"Which of those would you like me to do?"** and executes nothing |
| 7 | "Help me write an email to my client" → at "Who is receiving this email?" say "Yes." | Spark checks; "yes" is **not** stored as the answer |
| 8 | Get the Board invite, then "What would that involve?", then "Yes." | The invite survives the question; "Yes." starts the Board intake |

**Not browser-verified.** Steps 1–8 are certified on the production functions (`pendingBinding.ob3`, the room drivers and source gates), not in a live browser. The exact wording that makes Spark *offer* (rather than directly create) a Rhythm, and the Board-invite hold in step 8, should be confirmed in the preview.

**Honest limit on the multi-item step.** No production owner *today* makes an offer with several independently selectable actions. The Remember offer arms `items[]` only when a request carries more than one executable capability. So "Do the first two, not the third" is certified end to end on the binding chain with armed items (`pendingBinding.ob3`). In the live preview it demonstrates the **fail-safe**: ask which, execute nothing.

## 17. Remaining divergences

Exactly 2 of 285 cells:
- `Rhythm owner (just executed) × S4-correct`;
- `Rhythm owner (just executed) × S4b-not-what-i-meant`.

A correction of an **already executed** Rhythm is not applied. That needs the receipt (`lastExecuted`) fed from the spine, and the owner's correction path: **OB-4.**

**Known, documented, fail-safe (nothing executes wrongly):**
- digit-only item references ("Do 1 and 2 but skip 3");
- "Just Susan for now, not David."-style phrasings.

Neither is read as a HIGH scoped acceptance.

## 18. Recommended OB-4 scope — not implemented

**OB-4 — Receipts and corrections through One Brain.**
1. **Arm a receipt on the spine when an owner executes.** Reuse the existing Remember `phase: "executed"` / `executedItemId` and the spine record: `lastExecuted {id, label, executedAtTurn}`. Feed it to Boundary's existing `lastExecuted` input.
2. **Route a HIGH `correct` bound to `executed` through `permitsFor.mayModifyExecuted`** to the owner's correction path. For Remember, that is the existing Round 1 modification (`applyRhythmRecord` with modifiers). **This closes the last 2 cells** ("No, I said Tuesday").
3. **Receipt history on the spine**: the last N executions, so "undo that" and "change the one from earlier" bind correctly.
4. **Fold in the OB-3 DEFER list:**
   - Work Recognition ready-line;
   - Create `bareContinue`;
   - Claire's subject-change check;
   - the late resolver's `confirmation_acceptance`.

   Each needs an owner arm on the one record plus a binding check.

**Not in OB-4:** the capability catalog connection (OB-5), the KNOW lens (OB-6).

---

*OB-3 complete. Certified locally. Not pushed. Not merged. Not deployed. OB-4 not started.*
