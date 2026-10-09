# Research Repair `6f3369868`: Release Gate Review

**Verdict: NOT READY to release on its own; ready to enter a combined build.**
- The Research repair is real, on a pushed branch, and keeps every member-auth guard on the routes it changes.
- But it was built on the old candidate base. It lacks all four production commits and the strict founder-dashboard guard.
- The earlier upload fix (`c2f1429c8`) is still not in production.
- A local trial merge with production and the held candidate needed only three conflict resolutions and passed 709/709 security, attachment and research tests.
- The citation and upload improvements are **preview-tested, not production-certified**.
- The 21-upload investigation stays **open**.

**Nothing was changed:** no merge, deploy or member-data change. The trial merge was local and discarded.

Gate-by-gate status: **`SPARK_RESEARCH_RELEASE_GATE_TRACKER.md`**.

---

## 1. The commit and branch

| | |
|---|---|
| Commit | `6f3369868` *Readout: find the source-check note in saved turns (bold markers stripped)*, 2026-10-09 11:07 −05:00 |
| Branch | **`vts/universal-visual-quality`** (pushed). It is the only branch containing it. |
| Research report | `RESEARCH_TRUST_AND_SOURCES_REPAIR.md` was **not found** in `adhd-business-companion-vs3` or `adhd-companion` (all branches). I worked from the commits; please push or send it. |

**What the branch adds** (17 commits on top of `df6a12a7b`):

| Area | Commits |
|---|---|
| Citation and excerpt trust | `8ed7e0aa7` (every citation checked against its own page; real excerpts only; corrections withdraw the claim); `9f88d4cbe`, `cea6ddb10`, `c9ce97d4d`, `6f3369868` (claim-check precision, readout) |
| Uploads | `d1d219f3b` (every picked file, honest size limit, safe Try again, one bad file never blocks the rest), plus a new owner-checked `POST /api/work-attachments/[id]` retry |
| Research Library | `04ada43c2`, `45ffc00a4`: rename, archive, Trash, restore, confirmed delete-forever, duplicate hints |
| Visual Thinking | `caf9fd6e9`, `31b47e20f` (WIP), `c93292045`, `dcda93667`, `ccdeec22c`, `0f300914a`, `595bd1b2c`, `283b951af`, `ccd33478d`; new `POST /api/visual/mind-map` |

## 2. Ancestry

| Compared with | Merge base | Missing from the Research branch |
|---|---|---|
| Production `main` `d88a718ec` | `0620aa0a8` | `515d77f57`, `c13fec292` (security), `48c4c8af3`, `d88a718ec` (D9) |
| Held candidate `0cb567fe7` | `df6a12a7b` | `c8dd5f9cf` / `a9872ea0e` (strict dashboard guard), `0cb567fe7` (D1) |
| `release/int-2026-10-08-v4` | `caf9fd6e9` | `62e0a4abf`: int-v4 **reverted** `caf9fd6e9`, which the Research branch keeps. Decide which mind-map behaviour ships. |

**Also note:** `int-v4` moved after the last review (`df6a12a7b` → `62e0a4abf`).

## 3. The earlier upload fix missing from production

**`c2f1429c8` — R2-6: store a document's extracted text as a type the bucket accepts** (2026-10-07).

**What it fixes:**
- The private bucket refused the extracted text (`application/json`).
- Every PDF or text upload ended in a 500, stuck in "processing".
- The fix stores it as `text/plain` and marks the file *failed* (never stuck) if that write fails.

**Where it is:**
- On every candidate branch, the Research branch and the preview branches.
- **Not on `main`.** Production uploads can still get stuck until it ships.

## 4. Security regression check

| Check | Result |
|---|---|
| Routes the branch changes or adds: `research-live`, `research/source-content`, `visual/mind-map` (new), `companion-chat` | All require a signed-in member (`requireCompanionMember`) ✅ |
| Attachment routes: GET, DELETE, new retry POST | Bearer token checked against Supabase; owner-checked (another member's file → 403/404); retry never re-runs a ready file ✅ |
| Production-build sign-in bypass (`515d77f57`'s guard) | The same guard is present in `serverMemberAuth.ts` (inherited through the base) ✅ |
| `tts`, `ecosystem/signals`, `ecosystem/user-health` member checks | Present, same as production ✅ |
| **Founder-dashboard routes `ecosystem/advisor`, `ecosystem/postcraft/drafts`** | ❌ **No member check on the branch.** The base had loosened them; production and the held candidate require member + dashboard token. **Releasing this branch alone would regress this.** |
| D9 honest store errors (`48c4c8af3`) | ❌ Not on the branch. Alone it would bring back "ok" on failed founder/ecosystem saves. |
| Attachment privileges / D9 grants | Database-side; already applied in production. Not affected by code. |

**Combined trial build** (local only, discarded):
1. Merged `origin/main` into `6f3369868`: 3 conflicts (`advisor`, `postcraft/drafts`, `modelRoutes.authRatchet.test.ts`). I kept production's strict and D9 versions; the Research branch's 17 commits never touch these files.
2. Merged `0cb567fe7`: the same two routes conflicted; I kept the strict + D9 version.
3. Result: contains `515d77f57`, `c13fec292`, `48c4c8af3`, `d88a718ec`, `a9872ea0e`, `0cb567fe7`, `6f3369868` and `c2f1429c8`. `advisor` has both guards.
4. Tests:

   | Suites | Result |
   |---|---|
   | member-auth, auth-ratchet, member scope, ecosystem (D9), work attachments, research library | **58 files, 709/709** ✅ |

## 5. Status of the reported improvements

| Improvement | Status |
|---|---|
| Source attribution: each citation checked against its own page | **Preview-tested** (Research agent). Not production-certified. |
| Genuine source excerpts only | **Preview-tested.** Not production-certified. |
| Corrections persist and withdraw the claim | **Preview-tested.** Not production-certified. |
| Upload processing: every file, honest size limit, one bad file never blocks the rest | **Preview-tested.** Not production-certified. |
| Retry handling: safe Try again on failed or stuck files | **Preview-tested.** Not production-certified. |

## 6. The original 21-upload investigation: OPEN

The Research agent could not access those records. A **read-only** look at production today (no record changed):

| State | Kind | Count | Dates |
|---|---|---|---|
| failed | document | **7** | 09-17 → 10-07 |
| stuck "processing" | text | **6** | 09-17 → 09-30 |
| stuck "processing" | document | **4** | 10-07 |
| ready | text / document | 3 / 3 | to 10-09 |
| ready | image | 28 (+6 deleted) | — |

**17 documents and text files are not readable today.** That doesn't match "21", so the original set still has to be identified.

**What remains:**
- Which 21?
- Whether `c2f1429c8` and `d1d219f3b` recover them through **Try again**, or whether the member must re-upload.
- Who runs the retry. It needs the member's sign-in, or explicit approval to touch member data.

## 7. Tests required for a combined build

**Combined build:**
1. Build `main` + `0cb567fe7` + `6f3369868` (+ Brain `brain/research-continuity` if included) on one isolated release branch.
2. Resolve the 3 conflicts as above.
3. Run the full unit suite and compare with production's baseline; zero new failures allowed.
4. TypeScript error count no higher than the parents'.

**Security:**
- Signed-out `POST` to `tts`, `ecosystem/user-health` and `ecosystem/signals` → 401.
- Dashboard routes need member + token.
- Attachment GET, DELETE and retry → 403/404 for another member's file.
- New `visual/mind-map` → 401 signed out.
- The auth-ratchet test lists the new route.

**Uploads (signed-in, preview):**
- PDF, DOCX and TXT become readable.
- An oversized file gets the honest limit message.
- A mixed batch where one bad file doesn't block the rest.
- **Try again** on a failed file and on a stuck one.
- A ready file is never re-run.
- The extracted text is stored as `text/plain` (`c2f1429c8`).

**Citations:**
- Each cited claim links to its own page with a genuine excerpt.
- A correction withdraws the claim and survives reload and a second device.

**Research Library vs Brain rename:**
- Rename from the Library menu and by conversation ("rename my research about … to …"). Both reach the same record and thread, and the account copy.
- Archive and Trash keep the records out of conversational resume.
- Delete-forever is never offered by the Brain.

**Visual intent:**
- "Create a concept map from this information" uses the member's material (Research `283b951af`) and is never filed on the work in focus (Brain `VISUAL_OF_MATERIAL`).
- The mind-map choice between int-v4's revert and the branch's version is decided and tested.

**Continuity:**
- Resume existing research without duplicates.
- Same request twice gives one record.
- Research saved while unrelated work is in focus stays separate (Brain repair).

**Isolation:** a second account sees no other member's research, uploads or visuals.

**Live:** production checks need a session that can reach the site.

## 8. Not done (as instructed)

No merge, no deploy, no member data modified. The upload records were only counted.
