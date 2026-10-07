# Live certification handoff: One Brain candidate `b3bf1f997`

**For:** any agent or person whose machine can reach `*.vercel.app` and `weercszpdcxjxauxrhmj.supabase.co`, such as a local Claude Code session on the founder's computer. The certifying cloud session can't reach either host: its network policy refuses them.

## Hold steady

- **Candidate:** `ShariLHudson/adhd-business-companion-vs3`, branch `one-brain/convergence` @ `b3bf1f997fb9c182b923f33395f6f6dd8dc4eae3`.
  - Don't push to that branch, rebuild or redeploy.
  - If the branch head isn't `b3bf1f997` when you start, stop and report it.
- **Its preview:** Vercel deployment https://vercel.com/shari-hudsons-projects/adhd-business-companion-vs3/3kDuTSVDz8yhJcwuBFEgsqsYg6uw.
  - Open it and press **Visit**.
  - Use that host as `PAGE_HARNESS_BASE` (e.g. `https://adhd-business-companion-vs3-<hash>-shari-hudsons-projects.vercel.app`).
  - Check that the deployment's commit is `b3bf1f9`.
- **Production:** HOLD. Don't touch `main`.

## Run (about 25 minutes, unattended)

```bash
git clone https://github.com/ShariLHudson/adhd-business-companion-vs3 && cd adhd-business-companion-vs3
git checkout b3bf1f997fb9c182b923f33395f6f6dd8dc4eae3
npm ci && npx playwright install chromium
cp <this folder>/liveCertification.live.test.ts e2e-harness/
PAGE_HARNESS_LIVE=1 PAGE_HARNESS_BASE=https://<preview host> \
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
| X1 | Remove from Recent: the item leaves Continue; Undo is offered and brings it back |

Account persistence can be confirmed afterwards, read-only, in Supabase `companion_member_records` (domains `member_store`, `brain_matter`) for the test account's user id.

## Already verified at `b3bf1f997` (simulated: local production build of this exact commit, scripted model, fake Supabase)

The page harness (`pageJourney.harness.test.ts` + `fakeSupabase.ts` in this folder) has 12 tests and 132 per-step checks, all passing:

- course, proposal and event journeys
- build integrity
- continuity and second account
- Remove from Recent
- the five UI workflows: Board exit/resume, Board → Projects → Brainstorm, Projects help choices, section removal, Research save → return → reopen

The live run is what remains.
