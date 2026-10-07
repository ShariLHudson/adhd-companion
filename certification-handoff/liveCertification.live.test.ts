/**
 * LIVE certification of One Brain candidate b3bf1f997 on its deployed preview.
 * Real sign-in, real Supabase, real model. Nothing is stubbed. Read-mostly:
 * it creates a little test work on the account it signs in as.
 *
 * Copy this file into e2e-harness/ of a checkout of EXACTLY b3bf1f997
 * (git checkout b3bf1f997fb9c182b923f33395f6f6dd8dc4eae3), npm ci, then:
 *
 *   PAGE_HARNESS_LIVE=1 PAGE_HARNESS_BASE=https://<preview host for b3bf1f997> \
 *   PAGE_HARNESS_EMAIL=<test account A> PAGE_HARNESS_PASSWORD=<…> \
 *   PAGE_HARNESS_EMAIL_B=<test account B> PAGE_HARNESS_PASSWORD_B=<…> \
 *   [VERCEL_AUTOMATION_BYPASS_SECRET=<…>] \
 *   [PAGE_HARNESS_STORAGE_STATE=/path/state.json   # an authorized browser sign-in instead of A's password]
 *   [PAGE_HARNESS_CHROMIUM=/path/to/chromium]
 *   npx vitest run e2e-harness/liveCertification.live.test.ts --testTimeout=3600000 --hookTimeout=300000
 *
 * Prints a PASS/FAIL table per checklist ID and saves screenshots to PAGE_HARNESS_SHOTS (default ./live-shots).
 * Never paste passwords into a chat; set them as environment variables.
 */
import { mkdirSync } from "node:fs";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const RUN = process.env.PAGE_HARNESS_LIVE === "1";
const BASE = (process.env.PAGE_HARNESS_BASE ?? "").replace(/\/$/, "");
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET ?? "";
const SHOTS = process.env.PAGE_HARNESS_SHOTS ?? "./live-shots";
const STAMP = new Date().toISOString().slice(5, 16).replace(/[-:T]/g, "");
const results: Array<[string, string, boolean, string]> = [];
const check = (id: string, name: string, ok: boolean, d = "") => results.push([id, name, ok, d]);
const INTAKE = /What decision are you considering|Why does it matter now|What options are you considering|What concerns do you already have/;

type Session = { access_token: string; refresh_token: string; expires_in?: number; token_type?: string; user?: unknown };
async function signIn(email: string, password: string): Promise<Session> {
  const res = await fetch(`${BASE}/api/companion-auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(BYPASS ? { "x-vercel-protection-bypass": BYPASS } : {}) },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as { ok?: boolean; session?: Session; error?: string };
  if (!data.ok || !data.session) throw new Error(`sign-in failed for ${email.replace(/(.).*@/, "$1…@")}: ${data.error ?? res.status}`);
  return data.session;
}

async function contextFor(browser: Browser, who: "A" | "B"): Promise<BrowserContext> {
  const headers = BYPASS ? { extraHTTPHeaders: { "x-vercel-protection-bypass": BYPASS, "x-vercel-set-bypass-cookie": "true" } } : {};
  if (who === "A" && process.env.PAGE_HARNESS_STORAGE_STATE) {
    return browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: process.env.PAGE_HARNESS_STORAGE_STATE, ...headers });
  }
  const email = who === "A" ? process.env.PAGE_HARNESS_EMAIL! : process.env.PAGE_HARNESS_EMAIL_B!;
  const password = who === "A" ? process.env.PAGE_HARNESS_PASSWORD! : process.env.PAGE_HARNESS_PASSWORD_B!;
  const session = await signIn(email, password);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...headers });
  await ctx.addInitScript(([s]) => {
    try {
      if (document.cookie.includes("live_signed_out=1")) return;
      if (!window.localStorage.getItem("companion-supabase-auth")) window.localStorage.setItem("companion-supabase-auth", s as string);
    } catch {}
  }, [JSON.stringify({ ...session, token_type: "bearer", expires_at: Math.floor(Date.now() / 1000) + (session.expires_in ?? 3600) })]);
  return ctx;
}

const text = async (p: Page) => (await p.locator("body").innerText()).replace(/\s+/g, " ");
const tid = (p: Page, id: string) => p.getByTestId(id).first();
const visible = (p: Page, id: string, ms = 90_000) => tid(p, id).waitFor({ timeout: ms }).then(() => true, () => false);
const shot = (p: Page, name: string) => p.screenshot({ path: `${SHOTS}/${name}.png` }).catch(() => undefined);
async function boot(p: Page) {
  await p.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 180_000 });
  const intro = p.getByRole("button", { name: "Continue to Welcome Home" });
  await Promise.race([intro.waitFor({ timeout: 120_000 }), p.locator("textarea").first().waitFor({ timeout: 120_000 })]).catch(() => undefined);
  if (await intro.isVisible().catch(() => false)) await intro.click();
  await p.waitForTimeout(8_000);
}
const chatBox = (p: Page) => p.getByRole("button", { name: "Send", exact: true }).first().locator("xpath=ancestor::*[.//textarea][1]//textarea").first();
/** Send one turn and wait for Spark's reply to settle (real model). Returns only what appeared after it. */
async function say(p: Page, t: string, settleMs = 25_000) {
  const before = await text(p);
  await chatBox(p).fill(t);
  await chatBox(p).press("Enter");
  await p.waitForTimeout(settleMs);
  const now = await text(p);
  const at = now.lastIndexOf(t);
  return at >= 0 ? now.slice(at + t.length) : now.slice(before.length);
}
async function menu(p: Page, section: string, dest: string) {
  await p.locator("[data-testid=estate-room-experience-menu] button.estate-room-experience-menu__trigger").filter({ visible: true }).first().click();
  await p.waitForTimeout(800);
  await tid(p, `estate-room-menu-section-${section}`).click();
  await p.waitForTimeout(800);
  await tid(p, `estate-open-${dest}`).click();
  await p.waitForTimeout(5_000);
}
async function goHome(p: Page) {
  await p.locator("[data-testid=estate-room-experience-menu] button.estate-room-experience-menu__trigger").filter({ visible: true }).first().click();
  await p.waitForTimeout(800);
  await tid(p, "estate-return-to-welcome-home-first").click();
  await p.waitForTimeout(5_000);
}

describe.skipIf(!RUN)("LIVE certification — candidate b3bf1f997", () => {
  let browser: Browser;
  beforeAll(async () => {
    if (!BASE) throw new Error("PAGE_HARNESS_BASE is required (the preview host of b3bf1f997)");
    mkdirSync(SHOTS, { recursive: true });
    browser = await chromium.launch(process.env.PAGE_HARNESS_CHROMIUM ? { executablePath: process.env.PAGE_HARNESS_CHROMIUM } : {});
  });
  afterAll(async () => {
    console.log(`\nLIVE RESULTS (${BASE}, ${new Date().toISOString()})\n` + results.map(([id, n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${id}  ${n}${ok || !d ? "" : `  — ${d.slice(0, 240)}`}`).join("\n"));
    await browser?.close();
  });

  it("C1 conversation recovery: reload, new tab, sign-out → sign-in", async () => {
    const ctx = await contextFor(browser, "A");
    const p = await ctx.newPage();
    await boot(p);
    const code = `PINEAPPLE-${STAMP}`;
    await say(p, `please remember the code ${code} for me`, 20_000);
    await p.reload({ waitUntil: "domcontentloaded" });
    await p.waitForTimeout(12_000);
    check("C1", "conversation after reload", (await text(p)).includes(code));
    const tab = await ctx.newPage();
    await boot(tab);
    check("C1", "conversation in a new tab", (await text(tab)).includes(code));
    await tab.close();
    await p.locator("button").filter({ hasText: /^\s*[A-Z0-9]\s*▼?\s*$/ }).last().click().catch(() => undefined);
    await p.waitForTimeout(2_000);
    const out = p.locator("button, [role=menuitem], a").filter({ hasText: /^\s*(log ?out|sign out)\s*$/i }).first();
    const could = await out.isVisible().catch(() => false);
    if (could) await out.click();
    await p.waitForTimeout(8_000);
    check("C1", "Sign Out lands on sign-in with no session", could && /\/companion\/login/.test(p.url()), p.url());
    if (!process.env.PAGE_HARNESS_STORAGE_STATE) {
      await ctx.addCookies([{ name: "live_signed_out", value: "1", url: BASE }]);
      await p.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
      await p.waitForTimeout(12_000);
      check("C1", "signed out shows none of the conversation", !(await text(p)).includes(code));
      // Real sign-in through the form.
      await ctx.clearCookies();
      await p.goto(`${BASE}/companion/login`, { waitUntil: "domcontentloaded" });
      await p.locator('input[type="email"], input[autocomplete="email"], input[name*="email" i]').first().fill(process.env.PAGE_HARNESS_EMAIL!);
      await p.locator('input[type="password"]').first().fill(process.env.PAGE_HARNESS_PASSWORD!);
      await p.getByRole("button", { name: /^\s*sign in\s*$/i }).last().click();
      await p.waitForTimeout(20_000);
      const intro = p.getByRole("button", { name: "Continue to Welcome Home" });
      if (await intro.isVisible().catch(() => false)) await intro.click();
      await p.waitForTimeout(6_000);
      check("C1", "signed back in (real form): conversation is back", (await text(p)).includes(code), p.url());
    }
    await shot(p, "C1");
    if (process.env.PAGE_HARNESS_EMAIL_B) {
      const b = await (await contextFor(browser, "B")).newPage();
      await boot(b);
      check("C2", "account B sees none of A's conversation", !(await text(b)).includes(code));
      await shot(b, "C2");
    }
    await ctx.close();
  });

  it("J1–J5 course: choose → correct → recall → outline in chat → approve → lesson 1 in Create → reopen", async () => {
    const p = await (await contextFor(browser, "A")).newPage();
    await boot(p);
    const course = `ADHD-friendly productivity course ${STAMP}`;
    await say(p, `I want to launch a ${course}`);
    await say(p, "it's for ADHD business owners, and fun ways to get unstuck");
    await say(p, "every lesson needs a 5-minute action step");
    await say(p, "give me three format options for the course as a numbered list and ask which one I want");
    await say(p, "2");
    await say(p, "actually no, the first");
    const recall = await say(p, "what did we choose for the format?");
    check("J1", "recall answers from the saved decision", recall.length > 20 && !/Why does this matter right now/i.test(recall), recall.slice(0, 200));
    const outline = await say(p, "give me an outline for the course with 3 lessons", 35_000);
    check("J2", "the outline appears in chat (not Create's search)", /1\.|Lesson 1|Module 1/i.test(outline) && !(await tid(p, "create-estate-entrance").isVisible().catch(() => false)), outline.slice(0, 200));
    const approved = await say(p, "looks great");
    check("J2", "'looks great' approves that outline", /approved/i.test(approved), approved.slice(0, 200));
    await say(p, "yes lesson 1", 10_000);
    const opened = await p.getByText(/WORKING DRAFT/i).first().waitFor({ timeout: 240_000 }).then(() => true, () => false);
    await p.waitForTimeout(5_000);
    check("J3", "lesson 1 is written and opened in Create", opened);
    check("J3", "the requirement is in the lesson", /5-minute|five-minute/i.test(await text(p)));
    await shot(p, "J3");
    const saved = await text(p);
    check("J3", "Spark says it is saved (verified read-back)", /Saved: |saved in Create/i.test(saved));
  });

  it("B1 Board exit/resume; P3 Board → Projects → Brainstorm; P2 help choices; P1 section removal; R1 Research save → reopen", async () => {
    const p = await (await contextFor(browser, "A")).newPage();
    await boot(p);
    // B1
    await menu(p, "get-advice", "boardroom");
    if (!(await p.locator("[data-testid=boardroom-entrance-input] textarea").isVisible().catch(() => false))) await tid(p, "boardroom-talk-to-board").click().catch(() => undefined);
    await p.locator("[data-testid=boardroom-entrance-input] textarea").first().fill(`Should our course launch in January or March? (${STAMP})`);
    await p.locator("[data-testid=boardroom-entrance-input]").getByRole("button", { name: "Send" }).first().click();
    check("B1", "the question opens the review", await visible(p, "board-director-intake-review"));
    await goHome(p);
    const chat = await say(p, "any ideas for a newsletter name?");
    check("B1", "after leaving, chat is ordinary (no Board intake)", chat.length > 10 && !INTAKE.test(chat), chat.slice(0, 200));
    await menu(p, "get-advice", "boardroom");
    check("B1", "returning offers the unfinished discussion", await visible(p, "boardroom-resume-discussion-card", 30_000));
    await tid(p, "boardroom-resume-discussion").click().catch(() => undefined);
    check("B1", "Resume reopens the same question", (await visible(p, "board-director-intake-review")) && (await tid(p, "board-director-intake-review").innerText()).includes(STAMP));
    await tid(p, "board-director-intake-begin").click().catch(() => undefined);
    check("B1", "the discussion runs to advice", await visible(p, "board-director-discussion-result", 240_000));
    await shot(p, "B1");
    // P3/P2: Board → Projects → Ask for Help → Brainstorm (needs a project on the account; creates none).
    await menu(p, "build", "projects");
    const card = p.locator("[data-testid^=library-primary-]").first();
    const hasProject = await card.isVisible({ timeout: 30_000 }).catch(() => false);
    check("P3", "Board → Projects opens the Projects room with a project", hasProject, "the account has no project; create one, then rerun");
    if (!hasProject) return;
    await card.click();
    await visible(p, "project-home-detail");
    const projectName = (await tid(p, "project-home-detail").innerText()).split("\n")[0]!.trim();
    await tid(p, "project-home-ask-for-help").click();
    const choices = await p.locator("[data-testid^=project-help-choice-]").allInnerTexts();
    check("P2", "Ask for Help shows the seven choices for this project", choices.length === 7 && (await tid(p, "project-help-subject").innerText()).length > 5, choices.join(" | "));
    await tid(p, "project-help-choice-brainstorm").click();
    await p.waitForTimeout(40_000);
    const bs = await text(p);
    const tail = bs.slice(Math.max(0, bs.lastIndexOf("brainstorm")));
    check("P3", "Brainstorm gives ideas about this project (no Board intake)", tail.length > 80 && !INTAKE.test(tail), tail.slice(0, 200));
    await shot(p, "P3");
    // P1: section removal (adds a section + task, then removes it, keeping the task in the Inbox).
    await menu(p, "build", "projects");
    await card.click();
    await visible(p, "project-home-detail");
    await tid(p, "project-home-see-the-project").click();
    const sectionName = `Live check ${STAMP}`;
    if (await visible(p, "project-home-breakdown", 20_000)) {
      await tid(p, "project-section-input").fill(sectionName);
      await tid(p, "project-add-section").click();
      await p.waitForTimeout(2_000);
      const sections = tid(p, "project-sections");
      if (!(await sections.getByRole("button", { name: "+ Task", exact: true }).last().isVisible().catch(() => false))) {
        await sections.getByRole("button", { name: new RegExp(sectionName) }).first().click().catch(() => undefined);
        await p.waitForTimeout(800);
      }
      await sections.getByRole("button", { name: "+ Task", exact: true }).last().click();
      await sections.getByPlaceholder("Task", { exact: true }).first().fill(`Live task ${STAMP}`);
      await sections.getByRole("button", { name: "Add", exact: true }).first().click();
      await p.waitForTimeout(2_000);
      await tid(p, "project-remove-section").click();
      const dlg = (await visible(p, "remove-section-dialog", 15_000)) ? await tid(p, "remove-section-dialog").innerText() : "";
      check("P1", "removing a section asks what happens to its tasks", /What should happen to them\?/.test(dlg), dlg.slice(0, 200));
      await tid(p, "remove-section-keep-tasks").click().catch(() => undefined);
      await p.waitForTimeout(2_000);
      check("P1", "the task is kept in the Inbox", (await tid(p, "project-inbox").innerText().catch(() => "")).includes(`Live task ${STAMP}`));
      await p.reload({ waitUntil: "domcontentloaded" });
      await p.waitForTimeout(10_000);
      await shot(p, "P1");
    } else check("P1", "project structure shows", false, "this project has no linked structure");
    // R1: Research from the project → Back → Saved research → Reopen.
    await menu(p, "build", "projects");
    await card.click();
    await visible(p, "project-home-detail");
    await tid(p, "project-home-research").click();
    check("R1", "Research opens for the project", await visible(p, "research-library-panel"));
    await p.waitForTimeout(60_000);
    const answer = (await tid(p, "research-library-conversation").innerText().catch(() => "")).replace(/\s+/g, " ");
    check("R1", "a real research answer is shown", answer.length > 200, answer.slice(0, 120));
    await tid(p, "research-back-to-project").click().catch(() => undefined);
    check("R1", "Back returns to the project and lists Saved research", (await visible(p, "project-home-detail")) && (await visible(p, "project-home-saved-research", 30_000)));
    await tid(p, "project-home-saved-research-reopen").click().catch(() => undefined);
    await p.waitForTimeout(10_000);
    const again = (await tid(p, "research-library-conversation").innerText().catch(() => "")).replace(/\s+/g, " ");
    check("R1", "Reopen opens that exact research", again.includes(answer.slice(40, 120)) && !/couldn't find that saved research/i.test(await text(p)), again.slice(0, 120));
    await shot(p, "R1");
    void projectName;
  });

  it("X1 Remove from Recent on the account (the live failure)", async () => {
    const p = await (await contextFor(browser, "A")).newPage();
    await boot(p);
    if (!(await tid(p, "global-daily-resume-list").isVisible().catch(() => false))) await p.getByRole("button", { name: "New Chat" }).first().click().catch(() => undefined);
    const list = await visible(p, "global-daily-resume-list", 60_000);
    check("X1", "Continue list shows", list);
    if (!list) return;
    const first = (await tid(p, "global-daily-resume-item-1").innerText()).split("\n")[0]!.trim();
    await tid(p, "global-daily-resume-menu-1").click();
    await tid(p, "global-daily-resume-actions-1").getByRole("button", { name: "Remove from Recent" }).click();
    await p.waitForTimeout(5_000);
    check("X1", "the item leaves Continue", !(await tid(p, "global-daily-resume-list").innerText().catch(() => "")).includes(first), first);
    const undo = tid(p, "global-daily-undo").getByRole("button", { name: "Undo" });
    check("X1", "Undo is offered", await undo.isVisible().catch(() => false));
    await undo.click().catch(() => undefined);
    await p.waitForTimeout(5_000);
    check("X1", "Undo brings it back", (await tid(p, "global-daily-resume-list").innerText().catch(() => "")).includes(first));
    await shot(p, "X1");
  });

  it("summary", () => {
    expect(results.filter(([, , ok]) => !ok).map(([id, n]) => `${id} ${n}`)).toEqual([]);
  });
});
