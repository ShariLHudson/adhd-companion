# R0 Release Gate — Return Report

**Final verdict: R0 BLOCKED — DO NOT BEGIN R1**

Date: 2026-09-26 · Repository: `ShariLHudson/adhd-business-companion-vs3`

The release gates that can be closed from inside the repository are closed: phone defects triaged, one small fix made, regression green, Claire endpoint classified.

**Gate B (Production configuration) could not be verified.** This environment's network policy refuses connections to Vercel, the Production site, Supabase and OpenAI, and there is no Vercel credential. Per the gate rules I **did not push main and did not deploy**. Gates E, F and G were therefore not run.

---

## 1. Starting main SHA
`7e2efec6144c5f1872aa1062b8802cb75c2cd2cf`, re-fetched this round and unchanged.

## 2. Starting R0 candidate SHA
- **Required:** `df5bb516c28945d01f1d4c5af0ab40dd1271102c`.
- **Actual branch tip:** `claude/spark-r0-foundation-landing-l7edvu` = `a4ef163ab1a332dfd43584f1c117d72a89fc6853`.

**The discrepancy is immaterial.** `a4ef163a` is exactly one commit on top of `df5bb516`. It is the R0 return report itself: 1 file, docs only, 312 lines, no code. The code tree is identical to `df5bb516`, and it is still a valid fast-forward descendant of `7e2efec6` (`merge-base --is-ancestor` passes). I judged this not to be a material change and continued; the Founder may disagree.

## 3. Final release-gate branch and SHA
- Branch: `claude/spark-r0-release-gate-l7edvu` (pushed).
- SHA: `5124a6ee652cf8df4ed6f3e1f0601715e992cff0` is the commit that adds this report. A final follow-up commit only records this SHA here. The branch is `a4ef163a` plus:
  - `03e8188e` — the Living Model header fix
  - this report commit

It remains a fast-forward of `7e2efec6`.

## 4. Had main moved?
**No.** `origin/main` was still `7e2efec6` at both the start and the end of this round.

## 5. Phone defects: main vs candidate
I ran local `next dev` servers side by side:
- main `7e2efec6` on :3101
- candidate `a4ef163a` on :3100
- both with `NEXT_PUBLIC_BOARD_DELIBERATION_V2=true`
- Playwright Chromium at iPhone 13 390×844 (DPR 3, touch), iPad 820×1180 and desktop 1440×900
- nameplate and header rectangles were measured, and the screenshots compared by eye

| Defect | main @7e2efec6 | candidate @df5bb516 | Classification |
|---|---|---|---|
| Board Room home (phone): Renee Ashford / Camille Turner nameplates overlap | Present | Present, identical | **Pre-existing** |
| Board Room home (phone): David Kim / Sofia Ramirez plates cover the welcome-panel text | Present | Present, identical | **Pre-existing** |
| Board Room home (phone): Sofia Ramirez clipped at right edge | Present | Present | **Pre-existing** |
| Board Room home (phone): James Holloway clipped at right edge | Just touching the edge ("JAMES HOLLOWAY" fits) | Clipped ("JAMES HOLLOWA") | **Marginally worsened by R0** — see below |
| Living Model: header collides with the top chrome (clock / Board Room menu / profile) | Present on **phone, tablet and desktop** | Present, identical | **Pre-existing** |

**What worsened James Holloway.** Commit `4f3abbce` (R3F-5B "Founder retest — nameplate collisions", inside Stack 3) added Founder-requested offsets:
- `nameplateOffsetX: 22` for `strategic-reinvention` (James)
- `nameplateOffsetX: -22` for `economic-survivability` (Margaret)

They were added to stop desktop plates creeping onto the conversation glass. On a 390 px phone the same offset pushes James further right.

**Board Room home nameplates — not fixed; Founder decision.**
- The overlaps and the panel obstruction are pre-existing.
- The only R0 contribution comes from a Founder-approved placement.
- A correct fix needs phone-specific seat and nameplate geometry: per-viewport offsets, and deciding whether plates stay above or go below the welcome panel. That is a Board Room visual-design change, not a tiny CSS patch.
- Overriding Founder-approved placement is outside a release gate. Options for the Founder:
  - (a) per-viewport nameplate offsets in `boardRoomV4BFallSeatLoci.ts`
  - (b) welcome panel above the plates on phone, where plates reappear on Close
  - (c) accept for this release

**Living Model header — fixed (§6).**

## 6. Bounded fixes
`03e8188e` — `fix(board): R0 release gate — Living Model title clears the Estate top chrome`. It adds one CSS declaration: `margin-top: 3.6rem` on `.boardroom-lmc__identity`, with a comment.

Measured after the fix (title and note rectangle vs. the global chrome):
- phone: [70,63 → 380,151], no collision
- tablet: [358,71 → 806,151], no collision
- desktop: [978,71 → 1426,151], no collision

All three: no horizontal overflow, 7 of 7 nameplates rendered, no page errors. Board home nameplates are unchanged.

**WebKit/iOS was not run.** Only Chromium is installed (`/opt/pw-browsers`).

## 7. Files changed this round
- `app/companion/boardroom-living-table.css` (+4 lines)
- `docs/verification/r0/R0_RELEASE_GATE_RETURN_REPORT.md` (this report)

## 8. Production configuration (no secrets)
| Category | Status |
|---|---|
| `NEXT_PUBLIC_BOARD_DELIBERATION_V2=true` | **inaccessible** |
| OpenAI key (`OPENAI_API_KEY` / `OPENAI_KEY` / `OPENAI_SECRET_KEY`; model is hard-coded `gpt-4o-mini`) | **inaccessible** |
| Supabase URL and anon key (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `…PUBLISHABLE_KEY` / `SUPABASE_ANON_KEY`) | **inaccessible** |
| `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE` (optional; defaults to on) | **inaccessible** |

How this was checked:
- Connections to `api.vercel.com`, `ecosystem.visualsparkstudios.com`, `*.supabase.co` and `api.openai.com` were all refused by the environment's egress proxy (`connect_rejected`).
- There is no Vercel token in the environment.
- The GitHub connector does not expose Vercel environment variables or deployment statuses.

**This is a release blocker.** The Board flag cannot be verified, and with the flag off, new seven-Director Board discussions are held rather than going to the legacy Board.

## 9. `/api/claire-reasoning` security classification
| Question | Finding |
|---|---|
| Externally reachable in Production? | **Yes, by code.** No auth check; `proxy.ts` only matches `/founder` and `/api/founder`. Not confirmed live, because Production is unreachable. |
| Paid model calls? | **Yes.** POST → `executeClaireReasoningServer` → OpenAI. GET is a no-model probe that reveals only whether a model is configured. |
| Accepts member/business context? | **Yes**, all caller-supplied: `memberLine`, `recentTurns`, `progressContext` (unbounded on main), `sharedContextBlock` (capped at 2000 characters, added by R0), `communicationStyleBlock` (uncapped, added by R0). It reads **no** stored member data on the server and writes nothing. |
| Created or materially worsened by R0? | **No.** The endpoint and its unbounded inputs predate R0. R0 added two optional prompt fields, one of them capped. |
| Severity if unchanged | **P1.** Anyone can use it as an LLM relay with a fixed prompt, which costs money. Server-side member data is not exposed. |

**Not fixed this round.** Adding the Board's Bearer scheme would change how Claire behaves for any caller without a session (dev bypass, founder proof), so it is not "no change to Claire's conversational behavior". Recommended as the first P1 of the next security round: the same Bearer / `auth.getUser` pattern as `/api/board/*`, plus body and field caps.

## 10. Regression results (Gate C)
Run on the release-gate tree at `03e8188e`.
- **Focused gate suites: 147 files, 1,748 passed, 2 skipped, 0 failed.** They cover:
  - `canonicalWriterBoundary`, BC-P0, BC-6
  - `app/api/board/material-signals`
  - Claire C-5 / C-5.1 / C-5.3 / C-5.4
  - `executableIntent.round1` and `lib/memberIntent` (including `r0SubjectCadenceWords`)
  - `lib/relevantSituation` (including `r0LegacyTruthResurfacing`)
  - all of `lib/board` (including the R3F-2/3/4/5, 3F-5B continuity and conversational-move suites)
  - `components/companion/board` and `components/companion/boardroom`
- **Full suite:** the R0 full run (`df5bb516`-equivalent tree) had **0 new failures** vs main (457 vs 462 at baseline). This round only added one CSS declaration, which is covered by the boardroom suites above.
- **TypeScript:** unchanged. There are no TS changes this round; R0's error multiset was identical to baseline (353).

## 11. Canonical writer boundary
**Green**, 36/36.

## 12. BC-P0
**Green.**

## 13. BC-6
**Green.**

## 14. Material-signals authentication
**Green**, 9/9 route tests: anonymous → 401 with no model call; no provider text leaked.

## 15. Pre-deployment verdict
**NOT CLEARED.**
- Gate A is closed except for the Founder decision on the phone Board Room home nameplates.
- Gate C is green.
- Gate D is classified as a P1 follow-up.
- **Gate B is inaccessible, which blocks deployment.**

## 16. Was main pushed?
**No.**

## 17. Ending main SHA
`7e2efec6144c5f1872aa1062b8802cb75c2cd2cf`

## 18. Deployment
None was triggered, so there is no deployment ID. Pushing the release-gate branch may create a Vercel **preview**; I could not observe it.

## 19. Production URLs tested
None. Production is unreachable from this environment.

## 20–22. Live Founder tests (Claire / Board / Executable Intent)
**Not run.** They require the deploy, which Gate B blocked, plus Supabase and OpenAI access. The local, test-based evidence is in the R0 report, §15–18.

## 23. Phone / tablet / desktop Production results
Not run on Production. Local results are in §5–6. Earlier local runs found all Estate entrances rendering without errors on all three sizes (R0 report §24).

## 24. Remaining defects
1. **Phone Board Room home nameplates** (pre-existing; James slightly worsened by the Founder-approved offset in `4f3abbce`). **Founder decision.**
2. **`/api/claire-reasoning` is unauthenticated** (P1, pre-existing).
3. **Convene failure copy** says "sign-in has lapsed" whenever there is no token.

## 25. Known R1+ findings deliberately left unfixed
Unchanged from R0 and not touched:
- "Add walking the dog to my Rhythm every day at 7 AM" gets the estate guide
- a feeling can become a Rhythm subject
- the Reminder path has no read-back
- the monthly day of the month is lost
- "every weekday" becomes daily

No phrase rules, regexes, vocabularies or routing exceptions were added this round.

## 26. Adversarial self-review
| # | Question | Answer |
|---|---|---|
| 1 | Second authority? | No. The only change is one CSS line. |
| 2 | Board or LMC regained canonical write ability? | No. G-0.2 is green. |
| 3 | Unauthenticated route triggers paid model work? | **Yes — `/api/claire-reasoning`** (pre-existing, P1, §9). Material-signals is closed. |
| 4 | Success claimed without verified state? | Rhythm re-reads storage before saying Done. The Reminder path does not re-read (R1 finding). |
| 5 | Board flag-off unsafe or dead? | **Flag-off holds new Board discussions, so members can't start them.** That is why an unverified flag blocks the release. |
| 6 | Phone fix damaged tablet or desktop? | No. Measured on all three, and it also fixes tablet and desktop. |
| 7 | R1 architecture introduced? | No. |
| 8 | Language solved with phrase rules? | No. |
| 9 | Stale legacy truth resurfaces? | No. The R0 fix is covered by `r0LegacyTruthResurfacing`, which is green. |
| 10 | Raw provider errors exposed? | Material-signals: no. `/api/claire-reasoning` returns only structured fields and flags, not error text. The Board route returns bounded stages. |
| 11 | Discussion mistaken for authorization? | BC-6 is green: the Board examines and the member decides. Member answers are meeting data, not decisions (R3F-3 tests). |
| 12 | Can Production be proven to run the intended SHA? | **No — not from this environment.** This alone blocks acceptance. |

## 27. Rollback instructions
Nothing was deployed and main is unchanged, so nothing needs rolling back.
- **To drop this round:** delete `claude/spark-r0-release-gate-l7edvu`, or revert `03e8188e` (CSS only).
- **After a future landing:** follow the R0 report §27. For the Board, revert the Stack 3 merge `a85bfff1` with `-m 1`; for executable intent, set `NEXT_PUBLIC_EXECUTABLE_REQUEST_PRECEDENCE=0`.

## 28. Final verdict
### R0 BLOCKED — DO NOT BEGIN R1

**Blocker:** the Production configuration (Board V2 flag, OpenAI, Supabase) cannot be verified, and deployment plus live Founder proof are impossible from this environment. The phone Board Room home nameplate layout also needs a Founder decision.

**To unblock:**
1. Allow `api.vercel.com`, the Production domain, `*.supabase.co` and `api.openai.com` in this environment's network settings and provide Vercel read access — or run Gates B, E, F and G from a machine that has them.
2. Confirm `NEXT_PUBLIC_BOARD_DELIBERATION_V2=true` in Production.
3. Decide on the phone nameplates.
4. Fast-forward main from `7e2efec6` to the release-gate branch tip and run §20–23 live.
