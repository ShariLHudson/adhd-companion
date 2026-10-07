# Live certification handoff: One Brain candidate `81135935b`

**For:** any agent or person whose machine can reach `*.vercel.app` and `weercszpdcxjxauxrhmj.supabase.co`, such as a local Claude Code session on the founder's computer. The certifying cloud session can't reach either host: its network policy refuses them.

## Hold steady

- **Candidate:** `ShariLHudson/adhd-business-companion-vs3`, branch `one-brain/convergence` @ **`81135935bc0fa5d77d20dedc1b77f274f1c9039c`**. It is `b3bf1f997` plus readability fix `dfa71596c` (one CSS file).
  - Don't push to that branch, rebuild or redeploy.
  - If the branch head isn't `81135935b` when you start, stop and report it.
- **Preview, the exact deployment of this commit:** https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/HwRutWE6oXQHa4nX6Ano3jjZMhqx (Vercel: "Deployment has completed").
- **Branch preview host:** **https://adhd-business-companion-vs3-git-o-4626ae-shari-hudsons-projects.vercel.app**
  - Open `/companion` on it.
  - This alias always serves the branch head, so it serves `81135935b` while the candidate is held.
  - Before running, confirm on the deployment page above that it is the current deployment for `81135935b`.
- **Production:** HOLD. Don't touch `main`.

**What it contains** (checked by ancestry): `557b078c8` (MISC UPDATES), `a1f05cc3d` and `032dbd03c` (through `557b078c8`, not added twice), `dfa71596c`, Research/VTS `caedafb8a` and `b5fbc341b`. Continuity repair `e78283fb9` is included as `cd91d6dbd`, the same change in all 8 files (only one blank line differs), because it comes from a different base (`0620aa0a8`).

## First: confirm the deployed commit (the branch address can change)

1. `git ls-remote https://github.com/ShariLHudson/adhd-business-companion-vs3 one-brain/convergence` must print `81135935bc0fa5d77d20dedc1b77f274f1c9039c`.
2. On https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/HwRutWE6oXQHa4nX6Ano3jjZMhqx check two things:
   - it shows commit `81135935b` with status Ready;
   - its "Domains" list includes `adhd-business-companion-vs3-git-o-4626ae-shari-hudsons-projects.vercel.app`.

   Prefer the deployment's own unique `…vercel.app` URL, shown on that page, as `PAGE_HARNESS_BASE`. It can't move.
3. If either check fails, stop and report: someone changed the candidate.

Start on desktop: the script uses a 1280×900 viewport.

## Run (about 25 minutes, unattended)

```bash
git clone https://github.com/ShariLHudson/adhd-business-companion-vs3 && cd adhd-business-companion-vs3
git checkout 81135935bc0fa5d77d20dedc1b77f274f1c9039c
npm ci && npx playwright install chromium
cp <this folder>/liveCertification.live.test.ts e2e-harness/
PAGE_HARNESS_LIVE=1 PAGE_HARNESS_BASE=https://adhd-business-companion-vs3-git-o-4626ae-shari-hudsons-projects.vercel.app \
PAGE_HARNESS_EMAIL=... PAGE_HARNESS_PASSWORD=... \
PAGE_HARNESS_EMAIL_B=... PAGE_HARNESS_PASSWORD_B=... \
npx vitest run e2e-harness/liveCertification.live.test.ts --testTimeout=3600000 --hookTimeout=300000
```

- **Accounts:** use dedicated test accounts A and B, never the member's own.
  - Account A needs at least one Project for P1–P3 and R1.
  - Instead of A's password, `PAGE_HARNESS_STORAGE_STATE=state.json` can carry an authorized browser sign-in, saved with Playwright `context.storageState()`. In that mode the sign-out → password sign-in step is skipped.
  - Set credentials as environment variables only; never paste them into a chat.
- **Protected preview:** add `VERCEL_AUTOMATION_BYPASS_SECRET` if it's needed.
- **Report back:**
  - the `LIVE RESULTS` table it prints
  - the `./live-shots/*.png` screenshots
  - the preview host and deployed commit you ran against

## What it checks (one ID per acceptance item)

| ID | Live check |
|---|---|
| C1 | Conversation after reload; in a new tab; Sign Out → sign-in page with no session; signed out shows nothing; real password sign-in brings it back |
| C2 | Account B sees none of A's conversation |
| J1 | Choose → correct → recall answers from the saved decision |
| J2 | The outline appears in chat (not Create's search); "looks great" approves it |
| J3 | "yes lesson 1" writes lesson 1 in Create with the 5-minute action step; Spark confirms the verified save |
| B1 | Board question → review; leave → ordinary chat isn't taken over; return → resume the same question → advice |
| P3 | Board → Projects; Ask for Help → Brainstorm gives ideas about that project (no Board intake) |
| P2 | Ask for Help shows the seven choices for the project |
| P1 | Removing a section asks what happens to its tasks; the task is kept in the Inbox; it persists after reload |
| R1 | Research from the project → real answer → Back → Saved research → Reopen opens that exact research |
| RX | Ordinary chat "research the newest AI tools" / "find out what the latest ADHD coaching trends are": Research opens with the question and gives a real answer (not a failure or stall); no claim of live web results without sources |
| V1 | Research (from a project) → "Show … Visually" → exactly one "← Back to <project>", no second back; the map is saved with its origin and research; Back returns to the project |
| V4 | The project's Saved visuals → Open → "← Back to capture": the same work, one Back to origin |
| V3 | Mind Map keeps the same map (no new map, same origin and research, no "Begin My Map") |
| V5 | "Develop this in Create" opens the Creation Workspace carrying the visual id, origin and research |
| W1 | A second browser signed in as A: "open creation workspace" opens the same unfinished workspace (same title) |
| V2 | A new Research hand-off ("ways to grow a small podcast audience") opens that research, not the older visual |
| X1 | Remove from Recent: the item leaves Continue; Undo is offered and brings it back |

Account persistence can be confirmed afterwards, read-only, in Supabase `companion_member_records` (domains `member_store`, `brain_matter`) for the test account's user id.

## Already verified at `81135935b` (SIMULATED: local production build of this exact commit, scripted model, fake Supabase)

The page harness (`pageJourney.harness.test.ts` + `fakeSupabase.ts` in this folder) has **14 tests and 156 per-step checks, all passing**:

- course, proposal and event journeys
- build integrity
- continuity and second account
- Remove from Recent
- the five UI workflows
- ordinary-chat "research X"
- **visuals and Creation Workspace, V1–V5 and W1 (16 checks)**

The live run is what remains.
