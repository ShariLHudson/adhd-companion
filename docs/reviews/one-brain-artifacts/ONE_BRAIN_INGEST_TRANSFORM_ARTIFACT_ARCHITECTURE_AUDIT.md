# One Brain + / + Visual/Artifact Intelligence: Architecture Audit

**Audit only. Nothing was built or changed.**

| | |
|---|---|
| Spark Estate code read | `ShariLHudson/adhd-business-companion-vs3`, `integration/one-brain-member-persistence` at `901057b6e` |
| My Total Health Companion code read | `ShariLHudson/my-total-health-companion`, `main` at `ae66a1d` |
| Method | Four read-only code investigations, with key claims re-checked in the source |

---

## The short version

**1. The architecture you've chosen fits what already exists.**
Spark Estate already has two working examples of "one body of information, many views":
- **WorkBody** (`lib/workBody`). Its header states the rule: *"ONE body of information; many lenses."* Research is *referenced, never copied*.
- The **Living Business Model → Living Model Canvas projection** (`lib/profile/businessUnderstanding`, `businessModelProjection`).

Both enforce separation between what the work *is* and how it is drawn. The rest of the visual and artifact system does not follow that rule yet.

**2. The main problem is fragmentation, not missing features.**

| Gap | Today |
|---|---|
| Visual models | Three, side by side: Visual Focus maps (`lib/visualFocus`), the Visual Thinking Studio pipeline (`lib/cartographersStudio`, which lives only in temporary session storage) and WorkBody. |
| Handoffs between Research, VTS and Create | They **copy text**. Research → Create flattens sources into a "Sources:" paragraph, losing provenance. |
| Visual-need recognizers | There are **five**, all keyword-based, and none sits behind One Brain. |
| Capability registries | There are **four** (`resolveWorkIntent` types, `companionCapabilityRegistry`, `estateCapabilityRegistry`, `sparkSharedCapabilities`). |

**3. One Brain can't yet hear an implicit need for a visual.**
- `resolveWorkIntent` has no "visual" work type at all.
- "I need to see how changing this offer affects the rest of my business" matches none of today's recognizers.
- The ripple/impact logic that *could* answer it exists, but only inside Business Canvas.

**4. Slash commands do not exist anywhere.** Nothing to migrate. The "+" exists as a paperclip on one certified attachment pipeline, beside four older upload paths.

**5. My Total Health Companion forbids any connection to Spark Estate.** See `.env.example`, `docs/SECURITY.md` and the master spec. It is also a different platform (Expo / React Native), with a server-only write model.
- "Shared infrastructure" must therefore mean a **shared design contract**, built separately in each app. Not shared code, shared data or a shared service.
- Its provenance, time-certainty and review model is already **stronger** than Spark Estate's. Health should lead on those rules.

**Recommendation:** don't build a new artifact engine. Make **WorkBody's pattern the shared semantic core**. Then:
1. teach One Brain one new decision ("would a representation help?");
2. route `/` and natural language into that one decision;
3. turn the existing visual modes, VTS presentations and Create document types into **lenses** over the same body.

Order and certified rounds are in §9–10.

---

## 1. What already exists

### One Brain and routing (Spark Estate)

**The decision.**
- `resolveWorkIntent` / `decideWorkIntent` (`lib/workIntent/resolveWorkIntent.ts:292, 309`) is the one shared routing decision for chat, Create and Events.
- It returns a work type: navigation, information, artifact, event, project, strategy, research, decision_support, plan_day, calendar, edit_active or conversation.
- It returns an owner: create, events, projects, strategy, research, board, chamber, plan_my_day, calendar or conversation.
- **There is no visual, practice, learn or present type.**

**The chat pipeline.**
- `handleSend` → pending-owner check → `resolveWorkIntent` → `executeWorkIntent` (`CompanionPageClient.tsx:17740–17828`).
- Older routers still run after it whenever One Brain doesn't act: frictionless actions, the priority engine, the estate kernel, the fast paths and the turn arbiter.
- The frictionless layer is still the main opener for the visual studio and Create (`immediateVisualOpen`, `immediateCartographersStudioOpen`, `immediateCreateOpen`).

**Pending-question binding and specialist hand-off.**
- Question help (`lib/questionHelp`) can already hand off to `"visual" | "create"` and keeps the open question on the conversation spine.
- This is the cleanest existing model of "One Brain decides; a specialist child does the work; return to the question".

**Visual recognizers.** Five of them, all explicit-wording:
- `inlineRequestSignals.isExplicitStructuralRequest`. Its header states *"NOT implied/proactive recognition"*.
- `visualThinkingOverreach`, which has good **over-offer suppression**: overwhelm, anxiety, procrastination, decision-compass.
- `visualRecommendationEngine`.
- `visualThinkingRecommendationIntelligence`. It has usefulness scoring and decline memory, but is used only by the Projects and Learning pilots.
- The VTS request intake.

**Refinement.** Partial and scattered:
- "simpler / more detail" (`detectUserControl`, not wired to any caller);
- "turn this into a dependency map" (classified, then always honestly declined);
- tap-to-compare (R6);
- Create revisions (shorter, warmer…).
- **Not handled anywhere:** "show only what matters now", "focus on this branch", "show dependencies", "back to the whole picture".

**Return to origin.**
- It works for Research ↔ Chamber/Project/VTS, Create ↔ VTS, question help, and the VTS "Back" control.
- There is **no general navigation stack**.

### Visual and artifact models (Spark Estate)

| Model | Shape | Provenance | Durable? | Lenses / views |
|---|---|---|---|---|
| **WorkBody** (`lib/workBody`) | Items + typed relations (relates_to, depends_on, blocks, informs, derived_from); status, date | Findings by id only; never copied | Account record `work_body`, **founder-only flag (off)** | path, mind map, timeline, surface. View state stored separately |
| **Living Business Model** facts (`profile/businessUnderstanding`) | `FactRecord` with status, validity dates, supersession; typed edges with evidence references | 6 provenance kinds; append-only log | Account (business profile) | LMC and Value Exchange implemented; Evidence, Economics, Operations, Change-over-time and Scenario lenses **reserved** |
| **Visual Focus map** (`lib/visualFocus`) | Tree + side tables of relationships (affects, depends-on, leads-to…) + per-node claim state (7 kinds: member-stated, external-evidence, spark-inferred…) | Yes, per node | Account (as of this branch's member sync) | 14 modes; `switchMapPresentation` re-renders while keeping ids and provenance; full version snapshots. **Layout is stored inside the map** |
| **VTS pipeline** (`lib/cartographersStudio`) | `KnowledgePackage`: 21 item types, typed relationships (depends_on, causes, conflicts_with…), groups, gaps, conflicts, uncertainties | Source references with reliability and verification | **No.** Session storage only | ~28 deliverable types and ~20 presentation types; separates *presentation switch* from *deliverable conversion*. Not connected to the Visual Focus map |
| **Research library** | Findings with source, retrieval date, evidence basis, confidence, verification | Strong | Account | Readout, VTS hand-off (text copied, ids kept) |
| **Create** | Template sections + answers + one `draft` string; per-section revisions | **Flattened to prose** on hand-off | Account (Create table) | 22 document types; slides/handout only as companion outputs; speech exists |
| **Decision Ledger** | Scope, supersession, frozen evidence snapshot | Strong | Account | Chat read-back, strategic resume |
| **Strategy work items** | Options, assumptions, risks and "not chosen" as string lists; typed connections to 21 entity types | Partial | Account | Strategy Chamber |
| **Creation ecosystem** | Typed edges across 12 entity kinds, including `cartography_node` and `document` | — | Account | None |

### Business visual intelligence present today

| Exists | Partial | Not found |
|---|---|---|
| Business Model Canvas (6 canvas types); Living Model Canvas; value-exchange/offer map; decision tree; opportunity map; comparison | Impact/ripple (inside Canvas only); dependency map (relation type only); evidence map (Evidence lens reserved); capacity (Plan My Day views, no map) | Offer portfolio map; assumption map; risk map; experiment board; SWOT model (reference text only); spatial planning (the estate map is navigation art) |

### Ingest, the future "+" (Spark Estate)

**One certified pipeline (work attachments).**
- Paperclip → private storage → extracted text → model, scoped to the conversation thread.
- Supports images (sent to the model as vision input), PDF, txt and md. Limits: 10 MB per file, 3 files per turn.
- Promotion to library, vault or project is modelled but has no UI.

**Missing.** Camera/scan capture, OCR, link/URL import, drag-and-drop or paste, folder import, reading from Google Drive (Google is write-only today) and server transcription. Voice is browser speech-to-text only.

**Four older, separate upload paths.** All browser-only, each with a 2–8 MB cap: Growth attachments, Project assets, Mind-map file read, and profile/avatar uploads.

### My Total Health Companion

**Routing.**
- A deterministic "Health Brain": rules-based interpreter → orchestrator `switch` over 33 stances.
- No model in routing. No capability catalog. Everything runs client-side.
- Writes go only through whitelisted server functions (`brain_*`) into a private schema with row-level security.

**Data.**
- One `health_records` table with 17 record kinds: symptoms, medications, conditions, providers, questions, labs, appointments, care-plan goals and tasks…
- `measurements` (blood pressure, pulse, SpO2, temperature, weight), plus documents, people and roles, and access grants.

**Provenance and certainty (stronger than Spark Estate).**
- Immutable `sources` holding the verbatim words, channel and contributor.
- `time_certainty`: exact, approximate, relative, range or unknown. Dates are never invented.
- `review_state`: AI extraction is always *needs review*.
- Relationship assertions: explicit, member-confirmed, evidence-supported, imported or system-proposed.
- Append-only revisions.
- Connections are computed on read and labelled **"not causal"**.

**Views.**
- A raw-point readings chart (no trend line, no ranges).
- A timeline, Journey, Thread and Evidence views.
- **Appointment preparation** board: when, who, why, questions, relevant, missing.
- **Not found:** medication map, care-team map, body-system explainer, lab trend, learning map.

**Ingest.**
- Camera, photo library and document picker. Upload contents are **never analysed** (`analysis_status` is always `not_analyzed`).
- No FHIR, OCR, PDF lab parsing or link import.

**Safety.**
- A public Help Now page (911, 988, Poison Help).
- Refuses personal medical advice. "I won't guess" fallbacks.
- Grounded knowledge from MedlinePlus with citations.
- **But no red-flag or emergency detection is registered in conversation.** The safety interceptor hook exists, and none is installed.
- No literal "not medical advice" wording.

**Slash commands:** none.

**Isolation:** connection to Spark Estate is explicitly forbidden.

---

## 2. What can be reused

| Need in the new architecture | Reuse |
|---|---|
| Semantic core (entities, relationships, status, time, provenance, view separation) | **WorkBody** types and its two tested laws (semantic/view separation; reference, never copy). Its durable record domain already exists. |
| Claim and provenance vocabulary | Visual Focus `ContextClaimState` (member-stated / external-evidence / spark-inferred / calculated / estimated…). Living Business Model `FactRecord` provenance, validity and supersession. Research finding fields. |
| Lens/projection pattern | `BusinessModelLens` + `projectLivingModelCanvas` (projections carry `asOf`, `sourceVersion`, `scope`). `switchMapPresentation`, which already refuses unsafe re-renders. |
| Typed knowledge extraction | VTS `KnowledgePackage` item and relationship types, gaps, conflicts and uncertainties. **Merge it into the semantic core** rather than keeping it as a second model. |
| Representation catalog | VTS deliverable and presentation lists, Visual Focus modes and layout kinds, Create document types. Together they are the *specialist format* tier. |
| "Should we offer a visual?" judgement | `assessVisualThinkingRecommendation` (usefulness scoring and decline memory) and `visualThinkingOverreach` suppression. |
| Specialist hand-off and return | Question help `handoff {kind, request, focus}` plus the open question kept on the spine. Research and Create return contexts. |
| Durability, isolation, cross-device | `companion_member_records` + member sync (this branch). The legacy-claim and account-separation work already done. |
| Ingest | The work-attachments pipeline and its `promote.ts` seam; `surfaceInventory.ts` as coverage tracker. |
| Change/impact reasoning | Canvas `impactModel` and `RippleStripProjection` (certainty-graded edges). This is the seed of "how does changing this offer affect my business". |
| Health | Its provenance, time-certainty, review state and assertion model, *as the reference standard* for the shared contract. Its appointment-prep and question-helper outputs as the first health representations. |

---

## 3. Overlap with existing One Brain / routing work

**Must converge, not multiply:**

1. **Five visual-need recognizers.**
   - Fold them into **one** One Brain decision: *"is a representation the best next step, and which family?"*
   - Keep `visualThinkingOverreach` suppression as its guard.
   - Retire the frictionless visual openers' independent decisions once that decision covers them.
2. **Four capability registries.**
   - A new `/visualize`, `/plan`, `/present` etc. must map into `resolveWorkIntent`'s types and owners, which is the one decision. Do not add a fifth registry.
   - The other registries can feed it as data, not decide separately.
3. **Three visual models.**
   - The VTS pipeline (session-only) and the Visual Focus map (layout embedded) should become lenses or producers over the semantic core, not parallel stores.
   - WorkBody is already partly adopted by the unified workspace (`components/companion/unifiedWorkspace/*Lens.tsx`).
4. **Refinement verbs** live in at least four places (`detectUserControl`, active-map presentation request, compare selection, Create revisions). They need one interpreter that acts on whichever representation is active.
5. **Return-to-origin** has several per-pair contracts. Generalise to one "return point" held on the conversation spine. Strategic resume and question help already do this for their cases.

---

## 4. What is missing

**One Brain**
- A **representation decision**: *"would seeing / planning / presenting this materially reduce confusion or load?"* Today, routing reacts only to explicit words.
- **Implicit intent** for change/impact, dependency, comparison, sequence, evidence, risk, capacity and learning needs. The example "changing this offer affects the rest of my business" must resolve to *impact view of the offer within the business model*.
- **Slash-command parsing.** No `/` handling exists. It must be an accelerator into the same decision, never a separate path.
- **Learn, present, practice** as first-class intents. Today they are covered only indirectly: learning pilots, Create presentation type, Momentum Institute.

**Semantic core**
- **owner, importance, timeframe and scope** consistently on items (today only scattered).
- **Inference labelling at transform time.** Nothing today marks "this edge/claim was inferred to make this representation". Only Visual Focus claim states and LMC epistemic status come close.
- **A durable semantic store** used beyond WorkBody's founder flag. The VTS knowledge package lives only in session storage.
- **Reference-based hand-offs.** Research → Create currently flattens sources into text.

**Lenses / representations**
- A **representation registry** where each lens declares:
  - what it **requires** from the source (e.g. a timeline needs dates; a dependency map needs dependency edges);
  - what it **may infer** (and must label);
  - what it **must not** do.

  This is how "not every transformation is valid" becomes enforceable.
- Missing lenses: assumption map, risk map, experiment board, offer portfolio, SWOT, evidence map (reserved), dependency view (declined today), spatial planning.

**Refinement and return**
- Lens-level "simpler / what matters now / focus branch / show dependencies / more detail / whole picture".
- One return point for every specialist round-trip.

**+ ingest**
- Camera/scan, OCR, link import, paste and drag-drop, connected storage reads, folders.
- One registry so the four separate upload paths retire into it.

**Health**
- Red-flag detection actually registered, *before* any new health representation ships.
- Upload analysis.
- Representations: medication map, care-team map, lab trend, body-system explainer, learning map.

---

## 5. What should become shared (as a contract, built separately in each app)

Because health forbids cross-connection, "shared" means **the same written specification and test suite pattern**, implemented in each codebase. Not a shared library or service.

1. **Semantic artifact model contract.**
   - **Entity:** id, kind, label, status, importance, timeframe (with **time certainty**, adopted from health), owner, scope.
   - **Relationship:** typed, directed, with an **assertion level**: explicit / member-confirmed / evidence-supported / imported / system-proposed (adopted from health).
   - **Provenance:** source kind, verbatim origin where it exists, contributor, retrieved/recorded at.
   - **Review state.**
   - **Version history:** append-only.
2. **Lens contract.** A pure projection from the semantic model to a view. Each lens declares *required inputs*, *permitted inferences* (always labelled) and *forbidden inferences*. View state (positions, collapsed, camera) is stored separately and never mutates meaning (WorkBody law 1).
3. **Transformation contract.**
   - Representation A → B is a **re-projection of the same semantic body**, plus a list of *new inferences* each marked `system_proposed` and shown to the member.
   - If B needs something A doesn't have (e.g. dates for a timeline), the transform asks or shows the gap. It never invents.
4. **Representation decision contract.** One Brain returns: intent, recommended representation family, why, and a confidence. It offers **one** recommendation and at most two alternatives, and it respects decline memory and overwhelm suppression.
5. **Slash grammar.** Six first-level verbs; specialist shortcuts underneath. Natural language is equivalent.
6. **Refinement verbs.** One shared vocabulary acting on the active lens.
7. **Ingest contract for "+".** Each source declares type, provenance stamp, analysis status, scope (this work / keep), and where it can be promoted.

---

## 6. What belongs specifically to Spark Estate

- **Lenses:**
  - impact/ripple map (generalised from Canvas `impactModel`, keyed to the Living Business Model);
  - dependency map;
  - decision tree (exists);
  - assumption map and experiment board (from Strategy work items' assumptions and options);
  - evidence map (the reserved LMC EVIDENCE lens over research findings);
  - risk map;
  - capacity map (Plan My Day + projects);
  - opportunity map (exists);
  - offer/portfolio map (from offers in the business model);
  - SWOT as a *lens*, not a store;
  - spatial planning (events and venues).
- **Transforms:** research → evidence map → comparison → slides/handout (Create); decision → impact map → decision brief → action plan (Decision Ledger + Strategy + Projects); conversation → relationship map → plan → project.
- **Rooms stay the specialist children.** The Board, Strategy Chamber, Research, Create, Events and VTS keep their identities. One Brain chooses; the room renders and edits.
- **Business truth rules:** the Living Business Model stays canonical. Lenses read it and never write a second copy.

## 7. What belongs specifically to My Total Health Companion

- **Lenses:**
  - symptom timeline (with time-certainty shown honestly: approximate and relative dates are drawn as ranges, not points);
  - care-team map (people and roles exist);
  - medication map (medications, reasons, conditions; **no interaction claims** unless sourced);
  - lab trend (only from recorded values, **units exactly as given**, no reference ranges unless sourced);
  - question-prep board (exists as appointment prep);
  - care-plan timeline (goals + tasks + relationships exist);
  - body-system explainer and learning map (grounded in MedlinePlus citations only).
- **Stronger rules than Spark Estate:**
  - every relationship drawn must show its assertion level;
  - system-proposed links are visually distinct and labelled *"not causal"*;
  - a representation never upgrades certainty (an approximate date stays approximate);
  - nothing diagnostic, no dosing;
  - AI extraction is always *needs review*;
  - red-flag detection must gate generation;
  - nothing leaves the health schema; no connection to Spark Estate.
- **Transforms:** health timeline → appointment brief → question list → learning map. Each step lists what it inferred and what the member must confirm.

## 8. What should NOT be built

- A second Brain, resolver, router or capability registry. `/` and natural language both go through `resolveWorkIntent` (Spark) and the Health Brain orchestrator (Health).
- A new artifact engine beside WorkBody, the VTS pipeline and Visual Focus. Converge them.
- 30 equally visible visual choices, or a slash menu that lists every specialist format. First level: six verbs. Specialist formats appear only after a recommendation, or when typed.
- Image/PNG as the stored representation. Exports can be images; the stored artifact is the semantic body plus lens settings.
- Transformations that silently invent: dates, causality, dependencies, priorities, owners.
- A shared code package, database or service between Spark Estate and Health. Health forbids it, and the platforms differ.
- More localStorage-only upload pipelines. Promote into the existing work-attachment pipeline.
- New health visuals before the safety interceptor is registered.
- Proactive offers during overwhelm, crisis or emotional turns. Keep the existing suppression.

## 9. Recommended implementation order (Spark Estate first; Health follows the same contract)

1. **Write the contract** (§5) as one short spec, plus a conformance test pattern. Review it with you first.
2. **Semantic core.**
   - Promote WorkBody into the shared semantic model for Spark: add owner, importance, timeframe and time-certainty, scope and assertion level.
   - Make it durable for all members through the existing records table.
   - Map VTS `KnowledgePackage` items into it.
3. **One Brain representation decision.**
   - Add one decision ("representation") inside `resolveWorkIntent`, fed by the converged recognizers, with the overreach suppression.
   - Recognise implicit change/impact, dependency, comparison, sequence, evidence and learning needs.
   - Offer one recommendation.
4. **Lens registry.** Register existing modes, presentations and document types as lenses with required/permitted/forbidden inference declarations. Start with lenses that exist: mind map, timeline, comparison, decision tree, LMC, path.
5. **Slash accelerators.** Parse `/visualize /write /plan /learn /present /transform` (and specialist shortcuts) into the same decision. Unknown or ambiguous input falls back to natural language.
6. **Refinement + return.** One refinement interpreter over the active lens. One return point on the spine.
7. **Transforms with inference labelling.**
   - Research → evidence map → comparison → slides/handout.
   - Then decision → impact → brief → action plan.
   - Hand-offs pass references, not text.
8. **Business lenses.** In order: impact/ripple, dependency, evidence, assumption/experiment, risk, offer portfolio, capacity, SWOT, spatial.
9. **"+" consolidation.** A single ingest registry over work attachments. Add camera/scan, paste/drag, link import, then Drive read. Retire the separate upload paths.
10. **Health (separate codebase).**
    1. Register the safety interceptor and red-flag detection.
    2. Adopt the same contract on its own data model.
    3. Build these lenses: symptom timeline, care-team map, medication map, lab trend, question-prep, care-plan timeline, learning map.
    4. Then the health transforms.

## 10. Smallest certified rounds

Each round is independently shippable, keeps existing behaviour, and has its own tests and browser check.

| Round | Scope | Certified when |
|---|---|---|
| **A0 – Contract** | The written contract (§5) and conformance test templates. No code. | You approve it. |
| **A1 – Representation decision (Spark)** | One new decision in `resolveWorkIntent` + converged recognizers + suppression. **Offers only**, using today's visual studio. | The implicit examples (offer impact, "see how this fits together", "what depends on what") get one fitting offer. Emotional/overwhelm turns get none. No change to existing routes (adversarial set). |
| **A2 – Slash accelerators** | `/visualize /write /plan /learn /present /transform` + 6–8 specialist shortcuts, mapped into A1 and existing owners. | Each slash form and its natural-language equivalent produce the same decision. Unknown slash words fall back to conversation. |
| **A3 – Semantic core v1** | WorkBody fields extended (owner, importance, timeframe + certainty, scope, assertion); durable for all members; VTS knowledge items mapped in. | Round-trip tests; no duplicated research text (reference-only law holds); cross-device check. |
| **A4 – Lens registry v1** | Existing lenses registered with required/permitted/forbidden declarations. | A lens without its required input shows the gap instead of inventing (e.g. timeline without dates). |
| **A5 – Refinement + return** | "Simpler / what matters now / focus branch / show dependencies / more detail / whole picture" on the active lens. One return point. | Each verb changes only the view (meaning untouched). Return always lands on the originating question/work. |
| **A6 – First transform chain** | Research → evidence map → comparison → slides/handout, by reference, with inference labels. | Sources and retrieval dates survive to the handout. Every inferred element is labelled and confirmable. |
| **A7 – Offer impact** | Impact/ripple lens over the Living Business Model, with the dependency view. | "How does changing this offer affect my business" produces an impact view built only from recorded links; anything else is marked as suggested. |
| **A8 – "+" v1** | Unified + over work attachments: camera/scan, paste/drag, link import. | One pipeline; provenance stamped; nothing reaches the model without its "attached source" label. |
| **H0 – Health safety gate** | Register the safety interceptor (red flags → Help Now). | Red-flag phrases always route to Help Now; no other behaviour change. |
| **H1 – Health contract + first lenses** | Contract on the health model; symptom timeline + care-team map + question-prep board as lenses. | Time certainty is drawn honestly; every link shows its assertion level; nothing diagnostic. |
| **H2 – Health transforms** | Timeline → appointment brief → question list → learning map (cited). | Each step lists inferences and needs-review items; citations from MedlinePlus only. |

**Open questions for your review**
1. Should WorkBody become *the* semantic core, rather than a new model? This audit recommends yes.
2. Health: is a written shared contract, implemented separately, acceptable given its no-connection rule? Or should the apps not share even the contract?
3. Which first-level verbs show for a new member on day one? All six, or start with three?
