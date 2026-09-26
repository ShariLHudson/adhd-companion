# Spark Estate — Global Companion Architecture Audit

**Status: IN PROGRESS. These are preliminary findings.** Six read-only tracers are still running. This file will be replaced with the full 14-section report when they finish.

- **Audited repository:** `ShariLHudson/adhd-business-companion-vs3`, branch `main` (production per `VERCEL.md`), HEAD `7e2efec6` (2026-09-23)
- **Note:** The session's attached repo, `adhd-companion`, contains only the Fable 01 markdown file. The Estate code lives in `adhd-business-companion-vs3`, which I attached read-only.
- **Mode:** audit only. Nothing was implemented, changed, merged or deployed.

---

## Preliminary findings (verified directly)

### 1. Several "established" global systems are NOT on production `main`

Their commits are not ancestors of `main`, and their distinctive files are missing from `main`:

| Concept the research assumed exists | Where it actually lives | On `main`? |
|---|---|---|
| Runtime Intelligence Contract V1 (`lib/runtimeIntelligenceContract/v1.ts`) | `cursor/atomic-0a-p0-05-production-enforcement-39cc`, `cursor/atomic-2-proven-capability-registry-39cc` | **No** |
| Proven Capability Registry V1 (`lib/provenCapabilityRegistry/*`) | `cursor/atomic-2-proven-capability-registry-39cc` | **No** |
| Production routing-ownership enforcement (`lib/estateBrain/routingOwnership.production.test.ts`) | same branches | **No** |
| Explicit "Research this" (`lib/researchLibrary/explicitResearchIntent.ts`) | `atomic-3d1…`, `atomic-3d3-research-claire-return-continuity` | **No** |
| Research handoffs / cross-Estate inquiry handoffs (3c1–3c4, 3d2) | `atomic-3c*`, `atomic-3d*` | **No** |
| BU canonical write contract + transaction (`lib/profile/businessUnderstanding/canonicalWriteContract.ts`) | `atomic/g1-4-canonical-authority-closure`, `atomic/claire-c5-person-before-process` | **No** |
| Claire "person before process" / shared context (C5, C54) | `atomic/claire-c5…`, `atomic/claire-c54…` | **No** |
| Executable Intent round 1 (`lib/memberIntent/executableRequest.ts`, `capabilityObject.ts`) | `executable-intent/round-1-remember-precedence` (2026-09-25) | **No** |
| Main-conversation continuity (pending-question ownership, parked topics, durable transcript into model context) | `claude/main-conversation-continuity` | **No** |
| Board no-advice contract | `atomic/board-bc-6-no-advice-contract` | **No** |

**Merged into `main`:** Conversation Gate (`lib/conversationGate/`, atomic-4), Turn Contract reconcile (atomic-7-p1), Continuity Read Model (`lib/workContinuity/`, atomic-7a), Research consumption (atomic-6b3a), Conversation Continuity Tier 1, Timer notification preference, LMC-1b experience contracts.

**Implication:** Much of what the research treats as existing global infrastructure is branch-only. The first job is **landing or retiring** these branches, not building anything new.

### 2. The de facto runtime is one very large client component

- `app/companion/CompanionPageClient.tsx` has **31,810 lines and 758 imports**. That is where pre-turn classification, routing, context assembly and persistence are orchestrated.
- `app/api/companion-chat/route.ts` (699 lines) is **stateless**:
  - It uses `gpt-4o-mini`.
  - It has no tool calling.
  - It never reads Supabase or a user id.
  - It receives about **30 client-assembled hint strings** (`activeWorkContextLine`, `gatedSituationPromptBlock`, `strategyAuthorizedPromptBlock`, `chamberAuthorizedPromptBlock`, `businessContext`, `memoryConfidence`, `recoveryHint`, `momentumHint`, `hiddenIntentHint`, `intelligenceContext`, and more; see route.ts:211–300).
- **Implication:** "Member operating context" does exist, but only as an ad-hoc set of prompt strings built in the browser. It is not a typed, shared seam.

### 3. Many overlapping continuity, pending and memory modules exist at the top level of `lib/`

This is a sign of piecemealing. Examples:

- **Pending and "yes" handling:** `pendingAction.ts`, `createPendingAction.ts`, `pendingAcceptanceAuthority.ts`, `pendingChoice/`, `yesContinuationTrace.ts`, `strategyOfferContinuation.ts`, `conversationWorkflowContinuation.ts`
- **Continuity and resume:** `companionLedContinue.ts`, `postLoginContinue.ts`, `continuityManifest.ts`, `continuityRecovery.ts`, `conversationContinuity/`, `workContinuity/`, `cognitiveReturn/`, `welcomeHome/`
- **Memory:** `companionMemory.ts`, `memory/`, `sparkCompanionMemory/`, `estateMemory/`, `institutionalMemory/`
- **Reminders and rhythms:** `reminderStore.ts`, `reminders/`, `reminderIntelligence.ts`, `reminderAlerts.ts`, `rhythms/`, `remindersVsRhythms/`

The tracers are determining which of these are wired, canonical, duplicate or legacy.

### 4. Supabase

`supabase/` holds 12 schema files, mostly ecosystem, founder and creation records. There is no migrations folder. The tracers are checking which member state is server-persisted and which is browser-only, which decides whether anything survives a switch to another device.

---

## Pending sections (arriving when the tracers finish)

1. Executive summary · 2. Capability matrix · 3. Runtime map · 4. Memory/context map · 5. Continuity map · 6. Execution map · 7. Duplication/piecemeal map · 8. Case traces A/B/C · 9. Return across time and device · 10. Global gaps · 11. Reuse/extend/retire table · 12. Minimum global foundation · 13. Proposed atomic sequence · 14. Questions for founder
