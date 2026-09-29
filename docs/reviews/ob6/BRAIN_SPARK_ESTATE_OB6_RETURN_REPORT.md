# BRAIN SPARK ESTATE™ — OB-6 Unified Knowledge Access (KNOW)
## Return report

| | |
|---|---|
| Repository | `ShariLHudson/adhd-business-companion-vs3` |
| Branch (isolated) | `ob6/unified-knowledge-access` — **not merged, not deployed, `main` untouched** |
| 1. Starting SHA | `2dca87e4` (OB-5 Final; verified equal to `origin/ob5/final-connection-cleanup`, and the OB-5 Final report was re-read) |
| 2. Ending SHA | **`e5c53e73`** (pushed to `ob6/unified-knowledge-access`) |
| Companion map | `BRAIN_SPARK_ESTATE_KNOWLEDGE_INTELLIGENCE_MAP.md` |

**Principle kept: connect, don't rebuild.** This round created no knowledge store, no truth authority, no capability registry, no specialist and no RAG. One Brain's KNOW is:
- a **lens and scope on the existing shared read path** (`retrieveRelevantSituation`);
- **plus** each owner's own read functions where the read path is not allowed to import them.

Every truth type is **derived** from fields the sources already carry.

---

## 3. Unified read architecture

```
member question
  → UNDERSTAND   knowQuestion.ts   (Boundary lexicon + owner recognizers; light — capability selection imports it)
                 is it a KNOW question? which subject/source? which lens: current | history | reason?
  → FIND/READ    retrieveRelevantSituation({ lens, sources })      ← THE shared read path (extended, not duplicated)
                   existing collectors: BU facts/offers/persons/edges · estate · work · projects · ledger · Board · research · evidence
                   OB-6 collectors:     BU history + reasons · member decisions (any scope) · Events · Visual maps · Board view
                 + Living Model: projected in know.ts from the SAME BU snapshot (kept out of the shared façade)
                 + Strategy Chamber's own store (know.ts) — the read path's boundary test forbids it importing the Chamber
                 + "who knows" → Board/Chamber/Strategy topic selectors; "what can you do" → capability projection + availability map
  → LABEL        truthTypeOf(item)  — derived from status / provenance / temporal fields
  → ANSWER       deterministic precedence → member-language answer (no architecture words)
                 or, when nothing decisive is saved: the Conversation Gate passes the SAME scoped, labelled items to the model
  → CONTINUE     the conversation carries on; capability selection yields ("knowledge") so no room opens
```

**Why `retrieveRelevantSituation` is the KNOW read path** (§2 of the brief).
- It is already the single shared reader for **chat, the Board, the Chamber, Create, Research and Strategy** (through `consumeAuthorizedSituation`).
- It already keeps a status on every item.

**What it lacked, and was given (OB-6):**
- a `lens` option (current / history / reason);
- a `sources` scope (so a question about the Board reads the Board even without word overlap);
- `temporal` metadata on items (`state`, `supersedesId` / `supersededById`, `validFrom` / `validTo`, `changeReason`), copied from the source and never inferred;
- collectors for the owners it never read: Events, Visual maps, the Board's view, member decisions at any scope, and BU history.

The Living Model is projected in One Brain from the same Business Understanding snapshot. It is derived and has no store of its own, and keeping it out of the façade keeps every other consumer's import graph unchanged (1,688 vs 1,687 modules).

**Where it cannot be the reader, and why (proven):**
- `lib/relevantSituation/architectureBoundaries.test.ts` forbids the façade from importing the Strategy Chamber, and forbids the page from importing the façade.
- So the Strategy Chamber is read through its own store in `know.ts`, in the same labelling scheme.
- The page reaches the read path only through One Brain (`know.ts`) and the Conversation Gate.
- **No second general reader was created.**

**Default behaviour unchanged.** Without `lens` / `sources`, retrieval behaves exactly as before, except for two changes:
- retired offers are no longer presented as current;
- quantities read as `price: $49` instead of raw JSON.

The room-divergence baseline (0 / 285) is unchanged.

## 4. Sources connected (full table in the Map)

| Source | Before OB-6 | After OB-6 |
|---|---|---|
| BU temporal chain (`supersedesId`, `changeReason`) | **Dropped** by `factToProjectionFact` (OB-0's finding re-verified: still true at `2dca87e4`) | Passed through (read path + LMC history) |
| Superseded BU facts | Never read for chat | History / reason lens |
| Retired offers | Presented as current member truth | Current: excluded; history: labelled retired |
| Structured prices | `{"kind":"quantity","measure":"price","value":49,…}` | `price: $49` (the owner's unused `quantityFactSummary`) |
| Member decisions outside a project / the Board | Not read | Read when scoped (decisions) |
| Events records | Not read | Active event's state, decisions, next action; canceled = history |
| Strategy work items / strategic memory / conclusion | Not read | Settled direction + why; tentative stays tentative |
| Visual focus maps | Not read | Latest map, what it holds |
| Living Model (projection) | Not read | Per-area lines, confirmed vs still open |
| Board's view (certified projection, any discussion) | Only chat-started, only on return | Scoped read, labelled advice |
| Avatars | Read as BU persons | Unchanged (already connected) — now answerable directly |
| Director expertise (`memberBio` "Bring her when…") | Not in the model's self-knowledge | Added; also answered deterministically |
| Executable availability map | Internal | Read-only accessor for honest "not yet" answers |

## 5. Truth precedence (deterministic)

1. **Time outranks status.** A superseded or retired version never answers "now".
2. For "now": **CURRENT (member-confirmed fact / member decision) > PLANNED > MEMORY > RESEARCH > SPECIALIST > TENTATIVE > UNKNOWN**. HISTORICAL and SAMPLE never answer "now".
3. The history lens shows earlier versions **marked "no longer current"**, plus **what replaced them**. "What replaced them" follows the source's own supersession chain; a browser run found the first version picked the wrong line.
4. A reason is given **only when recorded** (the member's own words). Otherwise Spark says there is none, asks, and never guesses.
5. Research, the Board's view and tentative strategy are always labelled; they are never merged into member truth.
6. **The model gets the same labels.** Superseded lines are tagged `[earlier version — superseded, not current]` and carry the recorded reason. A fixed rule is added: "a current member-established line wins over earlier or retired versions, research, the Board's view and hypotheses… Give a reason for a change only if one is listed."

## 6. Current / history / reason implementation

| Member asks | Lens | Read | Answer (certified and browser-proven) |
|---|---|---|---|
| "What are we charging now?" | current | BU current facts + member decisions (pricing-scoped) | "Here's the price on record right now: • price: $49 (confirmed)". **$99 never appears.** |
| "What did we originally plan to charge?" | history | + superseded facts (`includeSuperseded`) | "Earlier: price: $99 (no longer current) • Now: price: $49" |
| "Why did we change the price?" | reason | `changeReason` on the replacing fact (the member's words, captured by Claire's write path) | "When it changed from price: $99 to price: $49, you said: “Pilot buyers said $99 was too steep for a first workshop.”" |
| Same, no reason recorded | reason | — | "I can see it changed (earlier: …; now: …), but there's no reason on record — I won't guess. Do you remember what prompted it?" |
| "What was the old version?" | history | Business record | The earlier value, marked not current |

No RAG was used for structured truth: every answer above is a structured lookup plus the lens.

## 7. The five partial-return repairs

| Owner | Existing store read (no new store) | Member asks | Browser answer |
|---|---|---|---|
| **Avatar Builder** | `companion-ideal-clients-v1`, as BU persons (Claire's reader) | "What do we know about my ideal client?" | "New managers — First-time managers at mid-size companies — Promoted without training; drowning in one-on-ones (confirmed)" |
| **Living Model Canvas** | `projectLivingModelCanvas` over the BU snapshot | "What does my business model say now?" | "People I Help: New managers; … (confirmed) · How Money Comes In: price: $49 (confirmed)" |
| **Events** | `getActiveEventRecord` (`companion-events-intelligence-v1`) | "What event am I working on?" | "Spring Leadership Workshop (Workshop) · stage: planning · next: Confirm the speaker list · decided: Downtown library · 1 decision still open" |
| **Strategy Chamber** | `getActiveStrategyWorkItem` + `buildStrategyDecisionRecord`; strategic memory; conclusion | "What strategy did we settle on?" | "You settled on: Keep the $49 entry workshop and add a $300 cohort — because it lowers the first yes and gives a path up." Unconfirmed → "not confirmed yet". Exploring → "nothing's settled yet". |
| **Visual Thinking** | `getActiveVisualFocusMap` (`companion-visual-focus-maps-v1`) | "What did we map out?" | "My three commitments (unsorted) · brought in: Course launch, podcast and three client projects all at once" |

All five adapter rows are now `connected`, with `returnPath: main_chat` (they were `partially_connected`). The stale Rhythm limit ("can't tell what 'this' means") was removed; OB-5C fixed it.

## 8. Visual Thinking context — **verified**

- **Bridge.** `lib/visualFocus/looseThinking/bridgeConversationVisualHandoff.ts` uses the **same intake as the Research bridge**. The member's own words are captured with `captureSource` (verbatim, `claimState: "member-stated"`) into an "unsorted" Loose Thinking map. The studio's hub entry consumes it once, in the same state update the Research handoff uses.
- **No second intake system.** Nothing is split or interpreted: "Help me see this" is still the only place loose items are made.
- **What is carried.** At offer time, the Visual Thinking handoff takes the member's recent words in this conversation (never the "yes", never the request itself).
- **Browser, no fixtures:**
  1. "I'm juggling client work, a podcast and my newsletter, and it all feels tangled together."
  2. "I need to see this visually." → offer → "yes".
  3. The studio shows **ALREADY BROUGHT IN: "I'm juggling client work, a podcast and my newsletter, and it all feels tangled together."**
  4. Close → "What did we map out?" → the map is read back into the same conversation.

## 9. Specialist intelligence findings (audit; nothing rewritten)

| Specialist group | Runtime config actually used | Expertise source | Guardrails | Member context they receive | Can reach shared knowledge? | Result returns to One Brain? |
|---|---|---|---|---|---|---|
| **Board — seven** (live when `NEXT_PUBLIC_BOARD_DELIBERATION_V2`) | `lib/board/reconstructed/*`: reasoning protocols RP-1..7 in the first-pass prompt; synthesis prompt; `/api/board/deliberate` | `DIRECTOR_IDENTITIES.memberBio` + the material-signal → dimension → director selector | Runtime guards, grounding rules, synthesis validation, no-advice contract | `buildAuthorizedBoardContext` → `retrieveRelevantSituation` (board role) + BU snapshot | ✅ **Now also receives Events, Visual and member-decision items when they overlap** | ✅ Certified projection → KNOW / OB-5 return |
| Board — legacy twelve | `boardDirectorRegistry.ts` | `decisionLens`, `watchesFor` | — | Legacy path | — | History only |
| **Chamber of Momentum — 24** | `chamberMemberPrompt.ts` (answers inside the chat reply) | `CHAMBER_MEMBERS` bio / `howTheyHelp`; `resolveExpertiseCategory` | Shari remains the voice | `chamberAuthorizedContext` → `retrieveRelevantSituation` | ✅ | ✅ In chat. Knowledge packs are **document paths only**; the content is not read |
| **Strategy Chamber** | 11 `STRATEGY_TYPES`; only **pricing and growth** have domain packs | `entrySignals` | Deterministic engine | `strategyAuthorizedContext` → `retrieveRelevantSituation` | ✅ | ✅ **Now read back by KNOW** |
| **Claire** | `/api/claire-reasoning` system prompt | Business Understanding areas | Confirmation contract | Gated shared context + BU | ✅ | ✅ OB-5 receipt |
| Other rosters | Advisory 18, founder 7, workspace 4, `AdvisorType` 8, Estate experts 15 | Each its own | — | Varies | ◐ | ◐ |

**Does One Brain know who knows what? Now yes, from the owners' own selectors.**
- Example: "Who on my Board knows about pricing?" → "On your Board: Sofia Ramirez (Operating executive · customer strategist). Bring her when pricing, demand, or willingness to pay is on the line. / In the Chamber of Momentum: Finance Intelligence. / The Strategy Chamber can work through it with you as Pricing Strategy."
- The chat model's self-knowledge now carries each director's own "bring her/him when…" line.

**Duplicate or dormant definitions (unchanged, reported):**
- seven separate advisor rosters, with no shared advisor registry;
- `collaborationProfiles` escalations are metadata only;
- the Chamber expert registry is flag-gated;
- no GPT or persona configuration files exist (all prompts are inline TS).

## 10. Estate self-knowledge result

| Member asks | Answer source | Result (certified) |
|---|---|---|
| "What can you help me with?" | OB-5 capability projection + canon counts | Names every connected capability, plus the Board (7) and the Chamber (24) |
| "Who on my Board knows about pricing?" / "Who should help me with cash flow?" | Board, Chamber and Strategy selectors | Named director, with their own expertise line, plus the Chamber specialist |
| "Can you research this?" | OB-5 selection | Offer to open the Research Library with the question (unchanged) |
| "Can you change my reminder?" | The Remember owner (OB-4 path, unchanged; a request, not a KNOW question) | Its stated limit ("a reminder can't be edited in place from chat…") is also listed in "What can't you do yet?" |
| "Can you update my calendar?" | Executable availability map | "Not yet — I can't add or change anything on your calendar from here. I can set a reminder or a Rhythm for it instead." |
| "What can't you do yet?" | Availability map + each adapter's own `cannot` | Calendar, plus each capability's stated limit |
| "Where does my business model live?" | LMC adapter row | "Living Model Canvas: Spark opens My Business Estate straight onto your Living Model." |
| "What does the Strategy Chamber do?" | OB-5C explain (unchanged) | Explained from the projection |

**No new self-knowledge registry was added.**

## 11. Member-context result

- **Authoritative business truth:** the canonical envelope (`companion-business-profile-v1` → `estate.understanding`).
- **Redundant copies of business identity:**
  - the legacy flat mirror (same key), which main chat still sends as `businessContext` every turn;
  - relationship memory ("business type / current goal");
  - estate memory's profile slice.
- **Local vs durable:** everything is local except Create workspaces, Saved Spark and billing (Supabase).
- **Unified read without a new store:** yes, for everything in the Map's ✅ rows, through the one read path. **No data was migrated.**
- **Precedence:** the legacy prose is never used for KNOW answers, and the gate rule tells the model labelled current truth wins.
- **Not yet:** the prose itself is still sent unlabelled (first broken connection 1, §15). Demoting it would change every chat turn's prompt, so it is left for the live certification to measure.

## 12. Certification totals

**One Brain certification (`lib/oneBrainCertification`): 10 files, 448 / 448 pass.**

| File | Tests |
|---|---|
| bakeoff.ob1 | 15 ✓ |
| roomDivergence.ob1 — **room divergence 0 / 285**; baseline unchanged | 3 ✓ |
| roomHold.ob2 | 49 ✓ |
| oneBrainConsumers (Visual Thinking guard strengthened to require the studio intake) | 19 ✓ |
| pendingBinding.ob3 | 85 ✓ |
| receiptCorrection.ob4 | 66 ✓ |
| capabilityConnect.ob5 ("What can you do?" is now answered by KNOW) | 45 ✓ |
| connectionCompletion.ob5c | 44 ✓ |
| finalConnection.ob5f (the five rows now `connected` / `main_chat`) | 72 ✓ |
| **know.ob6 (new)** | **50 ✓** |

**False actions: 0.** Every KNOW read, answer and selection leaves all member stores byte-identical (certified across 14 questions against fully seeded stores).

KNOW families certified:
- current / history / reason (with and without a recorded reason);
- read-path temporal fields; gate labels and the precedence line; current-lens non-leakage;
- Avatar, LMC, Events (plus a canceled event), Strategy (settled vs tentative), Visual, Board, Research, Decisions;
- the five connected rows;
- the Visual Thinking bridge (verbatim sources, member-stated; consumed once; empty input);
- who-knows ×2 and self-knowledge ×5;
- conflicts ×4;
- empty stores ×7 (unknown stays unknown);
- negative controls ×5;
- KNOW never opens a room, and a follow-up KNOW question held on the thread stays KNOW (found in the browser);
- 0 false actions.

## 13. Conflict tests (certified)

| Conflict | Question | Winner |
|---|---|---|
| Current vs superseded | "What are we charging now?" | $49 current; $99 never shown |
| Research vs member-confirmed truth | "What are we charging now?" with a $120–$180 benchmark saved | $49 (member); research not mentioned |
| Board opinion vs canonical fact | Same, with the Board discussing $99 | $49; the Board's view only when asked, and labelled advice |
| Tentative vs settled strategy | "What strategy did we settle on?" | Unconfirmed → "not confirmed yet" (TENTATIVE) |
| Legacy summary vs profile (two stores disagreeing) | Legacy `sells: "Workshops at $99"` | $49 from BU; the legacy prose is never read by KNOW |
| Stale event | Canceled event | Never "the event you're working on" |
| Demo / sample vs member data | — | **Cannot be distinguished at read time** (no sample flag); reported, not guessed |

## 14. Full suite / TypeScript / lint

| Check | Base `2dca87e4` | Ending `e5c53e73` | Delta |
|---|---|---|---|
| Full Vitest suite (final code) | 21,050 tests · 456 failing | 21,100 tests · 459 failing | **0 new attributable failures** (see below); +50 tests |
| TypeScript (`tsc --noEmit`, file + code multiset) | 353 | 353 | **identical** |
| ESLint (all 23 changed / new files) | 157 | 157 | **0 per file/rule changes** |
| Room divergence | 0 / 285 | 0 / 285 | unchanged |

**The comparison lists 5 "new" and 2 "fixed" entries. None is attributable to OB-6:**
- **Two Journal snapshot tests (+2 / −2)** are the known worktree-path artifact (the same tests, reported under a different absolute path).
- **Three import-time tests:** `truthfulnessRemovals` ×2 (`removal 3`) and `projectHomesImportSafety › loads panel graph`.
  - **What fails.** Each dynamically imports a graph of about 1,700–1,850 modules under Vitest's default 5-second timeout. Cold, that import takes about 22–27 seconds, so the tests pass only when earlier files in the same run have already warmed the transform cache.
  - **Base proof.** They **fail identically on the base `2dca87e4`** when run alone and in their own directory. The base's full run passed them only because of warm-cache timing (1.9 s and 3.4 s).
  - **Graph size.** OB-6 changes those graphs by +1 module (1,687 → 1,688 and 1,852 → 1,853): the Living Model projection was deliberately kept out of the shared façade for this reason.
  - **Status.** Recorded as a pre-existing timing defect in those tests. Not changed here; the no-weakening rule excludes raising their timeouts.

## 15. What Spark still does not know

**A. What One Brain can now retrieve reliably**
- Current, earlier and reason for Business Understanding facts, including price.
- The member's decisions, with superseded ones marked.
- The ideal client.
- The Living Model per area.
- The active event.
- The strategy direction (settled or tentative), strategic memory and the Chamber's conclusion.
- The latest visual map.
- The Board's view and the member's Board decision.
- Research findings, with their evidence basis.
- Active and suspended work.
- Who knows what (Board, Chamber, Strategy).
- What Spark can and can't do.

**B. Knowledge that exists but is still disconnected**
1. **The legacy business prose** (`businessContextSummary`, built from the flat mirror) is sent to the model **unlabelled** on every turn. *First broken connection:* it reads the mirror, not Business Understanding.
2. **Non-active projects.** The read path reads only the active or named project.
3. **Rhythms, reminders and attention holds** are not in the read path; they reach the model only through `dailyContextHint`.
4. **Research observations** are excluded by design.
5. **The provenance log** is not needed for reasons, but its full audit history is unread.
6. **"This" without the chat model.** The active-topic tracker is model-fed, so locally "this" falls back to the member's recent words.

**C. Knowledge that exists only in specialist prompts or configs**
- The Board reasoning protocols RP-1..7 (inline first-pass prompt).
- The synthesis rules.
- The Chamber member prompt.
- Claire's system prompt.
- The founder advisor prompt.

These are behaviour, not member facts. The Chamber knowledge packs are **document paths only**: their content is never read at runtime.

**D. What is still duplicated or conflicting**
- Business identity exists in four copies (envelope, legacy mirror, relationship memory, estate memory).
- The transcript is stored twice.
- There are two Board discussion stores.
- There are seven advisor rosters.
- The Rhythm cadence is duplicated by attention obligations.
- The edge economics prose can disagree with the price fact.
- The deprecated room registry still exists.

**E. What is truly missing (proven absent)**

| Missing | Evidence it is absent | Why connection can't solve it | Smallest build (not built) |
|---|---|---|---|
| **Offer history** ("what was the original offer?") | `planBusinessUnderstandingOffer` replaces the offer in place; only a `before` snapshot goes into the log, with no reason | Nothing stores the earlier offer as a version | Supersede offers the way facts are superseded |
| **Reason on ledger decisions** ("why did we decide X?") | `LedgerEntry` has no reason field (`decisionLedger/types.ts`) | No reason is ever captured | An optional `reason` on `recordDecision`, filled by member-authored writers |
| **Planned / historical statements** ("we originally planned $99" said in chat) | `writeMeaningAuthority` blocks historical and planned writes (`NEVER_CURRENT_WRITE_TEMPORAL`) | By design nothing is stored; only superseded records exist | A HISTORICAL write path (founder decision needed) |
| **Per-fact sample / demo flag** | Seeds write CONFIRMED facts into the member store; isolation is enforced only by an importer allowlist | Nothing to read | A provenance value, e.g. `seed`, on seed writes |
| **Semantic recall for unstructured corpora** (long research notes, evidence, Board / Chamber artifacts) | Token overlap only; no embeddings anywhere | Scoped reads solve "what did Research find?", not paraphrase recall across long text | **Post-beta:** evaluate hybrid recall against a labelled question set first; never for structured truth |

## 16. Exact recommendation: final One Brain live certification

**Run once, on the Vercel preview with real keys.** First allow `*.vercel.app` in the environment's Network settings. Then run the scripted member sessions below, recording transcripts plus store diffs.

1. **KNOW with the live model.** Ask the §6 / §7 questions once as scripted, and once **paraphrased** ("how much is the workshop these days?", "what did my board end up saying?"). Pass condition: the live model's answers follow the labelled context and never state $99 as current, whether KNOW answers locally or the model answers.
2. **The legacy-prose test.** Seed a disagreeing legacy `sells`, then ask pricing questions in free phrasing. Measure whether the model ever repeats the old price. **If it does, that is the first fix:** derive `businessContext` from Business Understanding (B.1).
3. **Real owner results end to end:** Claire's reasoning write → "why did we change it?"; a real Board deliberation → "what did the Board say?"; live research → "what did Research find?". Verify the labels.
4. **Visual Thinking bridge with the live topic tracker.** Confirm "this" carries the active topic.
5. **Re-run all certification suites on the preview build**, and keep false actions at 0.

**Stop there. OB-6 is complete; no further round was started.**

## Files changed (`2dca87e4` → ending SHA)

| File | Change |
|---|---|
| `lib/relevantSituation/retrieveRelevantSituation.ts` | `lens` + `sources`; collectors: member decisions, Events, Visual maps, Board view; scoped research |
| `lib/relevantSituation/collectBusinessUnderstandingItems.ts` | History / reason lens, readable quantities, retired offers kept out of current, `mentionsPricing` |
| `lib/relevantSituation/types.ts` | `SituationTemporal`, `SituationKnowLens`, `SituationSourceFamily` |
| `lib/profile/businessUnderstanding/readProvider.ts`, `types.ts` | Pass `supersedesId` / `changeReason` / `confirmedAt` through |
| `lib/conversationGate/gateRelevantSituationForConversation.ts`, `types.ts` | Temporal / Board / event / visual labels; recorded reason; precedence line; lens and scope pass-through |
| `lib/oneBrainCapability/knowQuestion.ts` (new), `know.ts` (new) | KNOW: understand / read / label / answer; Living Model projection; Strategy read |
| `lib/oneBrainCapability/selectCapability.ts` | KNOW questions yield (`none: knowledge`), after bindings only |
| `lib/oneBrainCapability/connections.ts`, `projection.ts`, `readPath.ts`, `handoffs.ts` | Five rows connected; Visual reach; director expertise; `namesBusinessModel`; Visual material |
| `lib/visualFocus/looseThinking/bridgeConversationVisualHandoff.ts` (new), `components/companion/VisualFocusWorkspacePanel.tsx` | Conversation → studio sources (same intake as Research) |
| `lib/memberIntent/executableRequest.ts` | Read-only availability accessor |
| `lib/conversationBoundaryLexicon.ts` | `KNOW_RECALL_RE` / `KNOW_REASON_RE` / `KNOW_HISTORY_RE` (the universal lexicon) |
| `app/companion/CompanionPageClient.tsx` | KNOW answer in the One Brain block; gate scope; Visual material at offer; bridge on accept |
| Tests | new `know.ob6.test.ts` (50); pinned-gap updates in `ob5`, `ob5f`, `oneBrainConsumers` |

## Final question

> *If Spark Estate already knows something somewhere, can One Brain reliably find the right version of it, know what kind of truth it is, use the right specialist if needed, answer the member correctly, and continue the conversation?*

**Yes for every source in the Map's connected rows**, certified and browser-proven:
- the right version (current / earlier / reason);
- the right truth type (confirmed / tentative / research / Board advice / history);
- the right specialist (Board / Chamber / Strategy by topic);
- a correct answer with unknowns kept unknown;
- the conversation continues and no room opens.

**No in these places. The exact broken connections:**
1. `businessContextSummary()` reads the **legacy mirror**, not Business Understanding, and is sent unlabelled on every turn. The model *could* repeat an old price in a free-form answer; KNOW's own answers never do.
2. **Offers** keep no earlier versions, and **ledger decisions** keep no reasons (§15-E). "What was the original offer?" and "why did we decide X?" have nothing to find.
3. **Sample / demo** facts are indistinguishable from member facts at read time.
4. **Non-active projects and rhythms / reminders** are outside the read path.
5. **Live-model behaviour** could not be exercised here (no keys). §16 is the test that closes it.
