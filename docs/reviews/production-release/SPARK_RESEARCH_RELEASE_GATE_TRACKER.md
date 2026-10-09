# Spark Estate Research Release Gate Tracker

*Owner: Production agent. Updated 2026-10-09. Nothing here is merged or deployed.*

**Status labels:**
- **Preview-tested:** the reporting agent tested it on a preview build. Not certified for production.
- **Combined-build verified:** checked by the Production agent on a local trial merge of everything planned for release.
- **Production-certified:** verified live on production. Nothing in this tracker is production-certified yet.

## Where things stand

| | Commit | Branch | State |
|---|---|---|---|
| Production | `d88a718ec` | `main` | Contains `0620aa0a8` + security `515d77f57`, `c13fec292` + D9 `48c4c8af3`, `d88a718ec` |
| Held release candidate | `0cb567fe7` | `release/final-2026-10-08` | HOLD. Base `df6a12a7b` + strict dashboard guard `a9872ea0e` + D1 fix |
| Integration branch | `62e0a4abf` | `release/int-2026-10-08-v4` | **Moved since review** (was `df6a12a7b`). It added `caf9fd6e9` (mind map of the current discussion), then reverted it. |
| **Research repair** | **`6f3369868`** | **`vts/universal-visual-quality`** | Base `df6a12a7b` + 17 commits (2026-10-08 → 10-09). Preview-tested by the Research agent. |
| Brain research-continuity repair | `a82c2dfe7` | `brain/research-continuity` | Brain agent. Base `0cb567fe7`. Testing in progress. |

## Gates for the Research repair `6f3369868`

| # | Gate | Status | Evidence |
|---|---|---|---|
| G1 | Commit and branch exist; ancestry known | ✅ | `vts/universal-visual-quality`; merge-base with `main` = `0620aa0a8`; with the held candidate = `df6a12a7b` |
| G2 | Contains the four production commits (`515d77f57`, `c13fec292`, `48c4c8af3`, `d88a718ec`) | ❌ **none** | Must be merged before release. A trial merge needs only 3 conflict resolutions (G4). |
| G3 | Contains the strict founder-dashboard guard (`a9872ea0e`) | ❌ | On its own branch, `advisor` and `postcraft/drafts` have **no member check** (they inherit the loosened base). Release from this branch alone would be a regression. |
| G4 | Combined build merges cleanly | ✅ with 3 resolutions | Conflicts: `ecosystem/advisor`, `ecosystem/postcraft/drafts`, `modelRoutes.authRatchet.test.ts`. Production's strict and D9 versions kept (the branch's 17 commits never touch them). |
| G5 | Auth guards on routes the branch changes | ✅ | `research-live`, `research/source-content`, `visual/mind-map` (new) and `companion-chat` require a signed-in member. Attachment GET/DELETE/new retry POST are bearer- and owner-checked (403/404 for others' files). The production-build sign-in bypass block is present. |
| G6 | Security + research tests on the combined build | ✅ | Member-auth, auth-ratchet, member scope, ecosystem (D9), work attachments, research library: **709/709** (local trial merge, not pushed) |
| G7 | Earlier upload fix in production | ❌ **missing** | `c2f1429c8` *R2-6: store a document's extracted text as a type the bucket accepts* (2026-10-07): it is on every candidate branch and the Research branch, but not on `main`. Production document uploads can still end "processing" / failed. |
| G8 | Citation and excerpt repair (`8ed7e0aa7`, `9f88d4cbe`, `cea6ddb10`, `c9ce97d4d`, `6f3369868`) | 🟡 **preview-tested** | Reported by the Research agent. Not production-certified. |
| G9 | Upload repair (`d1d219f3b`: every picked file, honest size limit, safe Try again, one bad file never blocks the rest) | 🟡 **preview-tested** | Reported by the Research agent. Not production-certified. |
| G10 | Research Library management (`04ada43c2`, `45ffc00a4`: rename/archive/Trash/delete forever) | 🟡 preview-tested | It now overlaps the Brain's conversational rename (see G13). |
| G11 | The original 21-upload investigation | 🔴 **OPEN** | The Research agent could not access those records. Production now (read-only, 2026-10-09) shows **17 not readable**:<br>• 7 failed documents (09-17 → 10-07);<br>• 6 text files stuck "processing" (09-17 → 09-30);<br>• 4 documents stuck "processing" (10-07).<br>Plus 6 readable (3 text, 3 documents). Not reconciled to "21"; no record changed. |
| G12 | Research report `RESEARCH_TRUST_AND_SOURCES_REPAIR.md` | ⚠️ **not found** | Not in either repository (all branches searched). Needs to be pushed or sent. |
| G13 | Combined with the Brain continuity repair | ⏳ | Overlapping areas:<br>• research persistence (`retitleResearchRecord` vs Library rename);<br>• "from this information" visual intent (`283b951af` vs Brain `VISUAL_OF_MATERIAL`);<br>• `CompanionPageClient`.<br>Needs a trial merge and the tests listed in the review report. |
| G14 | Live production checks for the security + D9 releases | ⛔ BLOCKED | The site is unreachable from the cloud session; a hand-off is pending. |

**Release decision for `6f3369868`: NOT READY as a standalone release.** It needs G2, G3 and G7 in one combined build, the tests in the review report (§6), and G11 resolved or explicitly accepted.
