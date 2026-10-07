/**
 * Page harness: the real companion page (local `next dev`) in Chromium. The
 * page's /api/brain/* calls are served by the real route handlers with a
 * memory Brain store; the browser's Supabase calls by an in-memory stand-in;
 * only the token check and the model are replaced. Run on demand:
 *   PAGE_HARNESS=1 npx vitest run e2e-harness --testTimeout=900000
 */
import { mkdirSync } from "node:fs";

import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, it, onTestFailed, vi } from "vitest";

import { createMemoryBrainStore } from "@/lib/brain/store";

import { createFakeSupabase, session, userOfToken } from "./fakeSupabase";

const RUN = process.env.PAGE_HARNESS === "1";
const BASE = process.env.PAGE_HARNESS_BASE ?? "http://localhost:3000";
const SHOTS = process.env.PAGE_HARNESS_SHOTS ?? "/tmp/page-harness";
const USER = "00000000-0000-4000-8000-0000000000a1";
const SESSION = session(USER);
const TOKEN = SESSION.access_token;

let store = createMemoryBrainStore();
export const modelPrompts: Array<{ system: string; ask: string }> = [];

vi.mock("@/lib/supabase/companionServer", () => ({
  getCompanionSupabaseServer: () => ({
    auth: {
      getUser: async (t: string) => {
        const id = userOfToken(t);
        return id ? { data: { user: { id } }, error: null } : { data: { user: null }, error: { message: "invalid" } };
      },
    },
  }),
}));
vi.mock("@/lib/brain/server", async (orig) => {
  const real = (await orig()) as Record<string, unknown>;
  return { ...real, brainStoreForRequest: (_r: Request, id: string | null) => (id ? store : null) };
});
vi.mock("@/lib/brain/model", async (orig) => {
  const real = (await orig()) as Record<string, unknown>;
  return {
    ...real,
    createOpenAiBrainModel: (opts: { route: string }) => async (messages: Array<{ role: string; content: string }>) => {
      if (opts.route !== "brain/develop/section") return { ok: false, error: "model_key_missing", provider: null, latencyMs: 0 };
      const system = messages[0]!.content;
      const ask = messages[1]!.content;
      modelPrompts.push({ system, ask });
      const title = ask.match(/"(.+?)"/)?.[1] ?? "Section";
      const reqs = [...system.matchAll(/Requirement \(member said[^)]*\): (.+)/g)].map((x) => x[1]!);
      const body = [`## ${title}`, "", "A short, human, funny opening with a real takeaway.", ...reqs.map((r) => `- Built to: ${r}`), "", "**Your 5-minute action step:** pick one task and set a 5-minute timer."].join("\n");
      return { ok: true, text: body, provider: "harness", latencyMs: 5 };
    },
  };
});

export async function callRoute(path: string, method: string, headers: Record<string, string>, body: string | null) {
  const { NextRequest } = await import("next/server");
  const req = new NextRequest(`http://localhost${path}`, { method, headers, ...(body ? { body } : {}) });
  const mod = (await import(/* @vite-ignore */ `@/app${path.split("?")[0]}/route`)) as Record<string, (r: never) => Promise<Response>>;
  const res = await mod[method]!(req as never);
  return { status: res.status, text: await res.text(), contentType: res.headers.get("content-type") ?? "application/json" };
}

/**
 * The model behind the real chat route: the OpenAI HTTP call is answered here
 * (stream or JSON) from the scripted replies; the route itself — Brain context,
 * reply recording, wording — is the real one. Every system prompt is kept.
 */
export const chatSystems: string[] = [];
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "sk-harness-0123456789abcdefghij";
const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (!url.startsWith("https://api.openai.com/")) return realFetch(input as never, init);
  const body = JSON.parse(String(init?.body ?? "{}")) as { messages?: Array<{ role: string; content: string }>; stream?: boolean };
  const msgs = body.messages ?? [];
  chatSystems.push(msgs.find((m) => m.role === "system")?.content ?? "");
  const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content ?? "";
  // A quality-repair rewrite request gets the previous reply back (a real model rewrites its own reply).
  const previous = [...msgs].reverse().find((m) => m.role === "assistant")?.content ?? "";
  const text = /^Please rewrite your previous reply/i.test(lastUser) && previous ? previous : chatReply(lastUser);
  if (body.stream) {
    const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
    return new Response(sse, { status: 200, headers: { "content-type": "text/event-stream" } });
  }
  return new Response(JSON.stringify({ choices: [{ message: { content: text } }] }), { status: 200, headers: { "content-type": "application/json" } });
}) as typeof fetch;

export const PROPOSAL_OUTLINE = `Here's a proposal outline for the Acme rebrand:

1. Executive Summary
   - What Acme wants from the rebrand
   - The result we promise
2. Scope of Work
   - Brand audit and positioning
   - New visual identity
3. Timeline
   - Six weeks, three milestones
4. Investment
   - Fixed fee and payment schedule
5. Next Steps
   - Sign, kickoff call, first deliverable

Does this structure work for you?`;

let chatTurn = 0;
const GENERIC = ["Got it. Tell me a bit more about what you need.", "Okay — what would help most with that?", "Understood. Where would you like to start?", "Thanks. What's the most important part for you?"];
/** Per-journey canned model replies: the first pattern matching the member's text wins. */
export const scripted: Array<[RegExp, string]> = [];
function chatReply(userText: string): string {
  for (const [re, reply] of scripted) if (re.test(userText)) return reply;
  if (/outline/i.test(userText) && /proposal/i.test(userText)) return PROPOSAL_OUTLINE;
  chatTurn += 1;
  return GENERIC[chatTurn % GENERIC.length]!;
}

export type Harness = { page: Page; supa: ReturnType<typeof createFakeSupabase>; log: string[]; shot: (name: string) => Promise<void> };

export async function openPage(browser: Browser, supa: ReturnType<typeof createFakeSupabase>, log: string[], as: ReturnType<typeof session> = SESSION): Promise<Harness> {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Signed in as `as` on first load; after a sign-out the harness does not sign back in by itself.
  await context.addInitScript(([s]) => {
    try {
      if (document.cookie.includes("harness_signed_out=1")) return;
      if (!window.localStorage.getItem("companion-supabase-auth")) window.localStorage.setItem("companion-supabase-auth", s as string);
    } catch {}
  }, [JSON.stringify(as)]);
  await context.route(/stubref\.supabase\.co/, (r) => supa.handle(r));
  await context.route(/\/api\/brain\//, async (r) => {
    const req = r.request();
    const url = new URL(req.url());
    const out = await callRoute(url.pathname + url.search, req.method(), req.headers(), req.postData());
    log.push(`${req.method()} ${url.pathname} → ${out.status}`);
    await r.fulfill({ status: out.status, contentType: out.contentType, body: out.text });
  });
  await context.route(/\/api\/(?!brain\/)/, async (r) => {
    const url = new URL(r.request().url());
    // The app's own public sign-in settings come from the server (production builds read them at runtime).
    if (url.pathname === "/api/companion-auth/config") return r.continue();
    log.push(`(other) ${r.request().method()} ${url.pathname}`);
    await r.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "harness_offline" }) });
  });
  // Spark's chat reply: the real chat route (only the OpenAI call underneath is canned).
  await context.route(/\/api\/companion-chat(?:\?|$)/, async (r) => {
    const req = r.request();
    const url = new URL(req.url());
    const out = await callRoute(url.pathname, req.method(), req.headers(), req.postData());
    const sent = JSON.parse(req.postData() ?? "{}") as { messages?: Array<{ role: string; content: string }> };
    const lastUser = [...(sent.messages ?? [])].reverse().find((m) => m.role === "user")?.content ?? "";
    log.push(`(chat route) ${lastUser.slice(0, 50)} → ${out.status}`);
    await r.fulfill({ status: out.status, contentType: out.contentType, body: out.text });
  });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error" || m.text().startsWith("[brain-create-started]")) log.push(`[console] ${m.text().slice(0, 200)}`);
  });
  page.on("pageerror", (e) => log.push(`[pageerror] ${e.message.slice(0, 300)}`));
  mkdirSync(SHOTS, { recursive: true });
  return { page, supa, log, shot: async (name) => void (await page.screenshot({ path: `${SHOTS}/${name}.png`, fullPage: false })) };
}

const OUTLINE = `1. Introduction to ADHD in Business
   * Understanding ADHD: Common challenges and strengths
   * The impact of ADHD on entrepreneurship
2. Fun and Effective Strategies to Stay on Track
   * Time management techniques that work for ADHD
   * Creative ways to prioritize tasks and projects
3. Creating an Engaging Work Environment
   * Tips for designing a workspace that inspires focus and creativity
   * Incorporating fun elements into daily routines
4. Leveraging Strengths and Interests
   * Identifying personal strengths to enhance business success
   * Aligning business tasks with interests for increased motivation
5. Tools and Resources
   * Recommended apps and tools to aid productivity
   * Community and support resources for ADHD entrepreneurs
6. Wrap-up and Action Plan
   * Developing a personalized action plan for ongoing success
   * Setting up a support network for accountability
Does this outline resonate with you, or are there any specific areas you'd like to adjust or expand upon?`;
export const PROJECT_ID = "1791141639086-ntyago";

const authHeaders = { authorization: `Bearer ${TOKEN}`, "x-spark-device": "dev-harness-seed", "content-type": "application/json" };
export async function api(path: string, body?: unknown) {
  const out = await callRoute(path, body === undefined ? "GET" : "POST", authHeaders, body === undefined ? null : JSON.stringify(body));
  return { status: out.status, ...(JSON.parse(out.text) as Record<string, unknown>) };
}

/** The live account's shape (2026-10-05 18:50), rebuilt through the real routes. */
export async function seedLiveCourseAccount(supa: ReturnType<typeof createFakeSupabase>) {
  const turn = (text: string, last?: string) =>
    api("/api/brain/turn", { text, room: "home", recentMessages: last ? [{ role: "assistant", content: last }] : [] });
  const reply = (text: string, turnId: string | null) => api("/api/brain/reply", { turnId, reply: text, room: "home" });
  const t1 = await turn("I want to launch a course give me three price options as a numbered list $49 $59 and $79 and ask which one I want");
  const MENU = "Here are three price options for your course:\n\n1. $49\n2. $59\n3. $79\n\nWhich one would you like to choose?";
  await reply(MENU, (t1.turnId as string) ?? null);
  await turn("2", MENU);
  await turn("everything we write for the course needs to have an element of fun, humor, takeways, lessons, professionalism, out of the box ideas");
  await turn("everything we write needs to sound as human as possible, not ai written");
  await turn("every lesson needs a 5-minute action step");
  const [course] = (await store.listMatters(USER)).filter((m) => m.title === "Launch a course");
  const { commitBrainOps } = await import("@/lib/brain/commit");
  await commitBrainOps(store, [
    { op: "linkMatter", matterId: course!.id, kind: "project", id: PROJECT_ID },
    { op: "recordClaim", matterId: course!.id, claimId: "clm_recovered_1316_outline", key: "outline_candidate", value: OUTLINE, negative: false,
      provenance: { source: "legacy_record", turnId: null, room: "home", at: new Date().toISOString(), quote: "recovered from the member's copy of the 13:16 conversation" } },
  ], { memberId: USER, turnId: null, room: null, now: new Date().toISOString() });
  // The Board question as the live account has it (made before bf5101e9): its own Matter, in focus.
  await callRoute("/api/brain/propose", "POST", authHeaders, JSON.stringify({ room: "board", proposals: [{ kind: "work",
    title: "i don't know much about marketing my app, the best places to market/sell it, how much to sell it for, when to start telling people about it since it's not quite",
    statement: "i don't know much about marketing my app, the best places to market/sell it, how much to sell it for, when to start telling people about it since it's not quite ready for beta testing yet",
    links: [], commitment: false, focus: true, joinFocus: false, joinFocusIfRelated: false, neverCreate: false }] }));
  const { hashString } = await import("@/lib/memberSync/engine");
  const put = (recordId: string, value: unknown) => {
    const raw = JSON.stringify(value);
    supa.rows("companion_member_records").push({ id: crypto.randomUUID(), user_id: USER, domain: "member_store", record_id: recordId, status: "active",
      schema_version: 1, record_version: 1, payload: { format: "json", value, hash: hashString(raw), savedAt: new Date().toISOString() },
      created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
  };
  put("companion-projects-v1", [{ id: PROJECT_ID, goal: "I want to launch a course give me three price options as a numbered list $49 $59 and $79 and ask which one I want",
    name: "Launch a course", color: "#9a6fb0", goals: [], status: "in-progress", horizon: "now", archived: false,
    createdAt: "2026-10-04T19:20:39.086Z", updatedAt: "2026-10-05T15:25:14.126Z", nextAction: "Project structure", projectHomeRoomId: "writing-room" }]);
  return { courseId: course!.id };
}

describe.skipIf(!RUN)("page harness", () => {
  let browser: Browser;
  beforeAll(async () => {
    browser = await chromium.launch({ executablePath: process.env.PAGE_HARNESS_CHROMIUM ?? "/opt/pw-browsers/chromium" });
  });
  afterAll(async () => browser?.close());

  it("boots signed in", async () => {
    store = createMemoryBrainStore();
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    const seeded = await seedLiveCourseAccount(supa);
    console.log("seeded", seeded, (await store.listMatters(USER)).map((m) => `${m.id} ${m.title.slice(0, 30)} ${m.status}`));
    const h = await openPage(browser, supa, log);
    await h.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    const shown = await h.page.getByText("Continue Recent Work").first().waitFor({ timeout: 120_000 }).then(() => true, () => false);
    if (!shown) {
      await h.shot("00-boot-failed");
      console.log("BOOT BODY:", (await h.page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800));
      console.log("BOOT LOG:", log.filter((l) => !/404|shari-images/.test(l)).slice(-30).join("\n"));
      throw new Error("Welcome Home did not show");
    }
    await h.page.waitForTimeout(6_000);
    await h.shot("01-welcome-home");
    console.log(log.filter((l) => !/404|shari-images|503/.test(l)).join("\n"));
    console.log((await h.page.locator("body").innerText()).slice(0, 1500));
    console.log(log.join("\n"));
    // Reproduce the member's click: ⋯ on item 1 → Remove from Recent.
    log.length = 0;
    await h.page.getByTestId("global-daily-resume-menu-1").click();
    await h.page.waitForTimeout(1_000);
    await h.shot("02-menu-open");
    console.log("actions visible:", await h.page.getByTestId("global-daily-resume-actions-1").isVisible().catch(() => false));
    await h.page.getByTestId("global-daily-resume-actions-1").getByRole("button", { name: "Remove from Recent" }).click();
    await h.page.waitForTimeout(4_000);
    await h.shot("03-after-remove");
    console.log("after click log:", log.filter((l) => !/404|shari-images|503/.test(l)));
    const board = (await store.listMatters(USER)).find((m) => m.title.startsWith("i don't know"));
    console.log("board hiddenFromRecent:", board?.hiddenFromRecent);
    console.log((await h.page.getByTestId("global-daily-resume-list").innerText()).slice(0, 600));
    console.log("notice:", await h.page.getByTestId("global-daily-undo").innerText().catch(() => "(none)"));
    // Reload: still gone (read back from the account, not this tab's memory).
    await h.page.reload({ waitUntil: "domcontentloaded" });
    await h.page.getByTestId("global-daily-resume-list").waitFor({ timeout: 300_000 }).catch(() => undefined);
    await h.page.waitForTimeout(6_000);
    await h.shot("04-after-reload");
    console.log("after reload:", (await h.page.locator("body").innerText()).match(/Continue Recent Work[\s\S]{0,300}/)?.[0]);
    // A save that fails must say so where the member is looking.
    (store as unknown as { failNextWrites: number }).failNextWrites = 5;
    await h.page.getByTestId("global-daily-resume-menu-1").click().catch(() => undefined);
    await h.page.getByTestId("global-daily-resume-actions-1").getByRole("button", { name: "Remove from Recent" }).click().catch(() => undefined);
    await h.page.waitForTimeout(3_000);
    (store as unknown as { failNextWrites: number }).failNextWrites = 0;
    const n = h.page.getByTestId("global-daily-undo");
    console.log("failure notice:", await n.innerText().catch(() => "(none)"), "in view:", await n.evaluate((el) => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= window.innerHeight; }).catch(() => false));
    await h.shot("05-failure-visible");
    console.log("unhandled supabase:", supa.unhandled);
    console.log("tables:", [...supa.tables.keys()]);
    expect(true).toBe(true);
  });

  it("course: Continue → Project → conversation → confirm outline → lesson 1 → verified save → reopen from Project → reload", async () => {
    store = createMemoryBrainStore();
    modelPrompts.length = 0;
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    const { courseId } = await seedLiveCourseAccount(supa);
    // As the live account is now: the Board item off Recent, the course in focus.
    const board = (await store.listMatters(USER)).find((m) => m.title.startsWith("i don't know"))!;
    await api("/api/brain/work", { action: "remove_from_recent", matterId: board.id });
    await api("/api/brain/turn", { text: "Back to Launch a course", room: "home", recentMessages: [] });
    const h = await openPage(browser, supa, log);
    const { page } = h;
    const bodyText = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await page.getByTestId("global-daily-resume-list").waitFor({ timeout: 300_000 });
    await page.waitForTimeout(4_000);
    await h.shot("c01-continue");
    // 1. Return to the course from Continue: it has a Project, so its Project home opens.
    await page.getByTestId("global-daily-resume-item-1").click();
    await page.getByTestId("project-home-brain-work").waitFor({ timeout: 120_000 });
    await page.waitForTimeout(2_000);
    await h.shot("c02-project-home");
    console.log("PROJECT HOME:", (await page.getByTestId("project-home-brain-work").innerText()).replace(/\s+/g, " ").slice(0, 800));
    // 2. Pick up in conversation, then ask for lesson 1.
    await page.getByTestId("project-home-brain-resume").click();
    await page.waitForTimeout(4_000);
    await h.shot("c03-conversation");
    const composer = page.locator("textarea").first();
    await composer.waitFor({ timeout: 60_000 });
    const send = async (text: string) => {
      await composer.fill(text);
      await composer.press("Enter");
    };
    await send("Develop lesson 1 in Create using our approved outline and course requirements. Save it under Launch a course and give me a link to reopen it.");
    await page.getByText("Is this the outline you approved?").first().waitFor({ timeout: 120_000 });
    await page.waitForTimeout(1_500);
    await h.shot("c04-confirm-outline");
    const ask = await bodyText();
    console.log("CONFIRM SHOWN:", ask.match(/no approved outline[\s\S]{0,1400}/)?.[0]);
    expect(ask).toContain("1. Introduction to ADHD in Business");
    expect(ask).toContain("6. Wrap-up and Action Plan");
    expect(ask).not.toContain("Understanding the Course Topic");
    expect((await store.getMatter(USER, courseId))!.claims.some((c) => c.key === "approved_outline")).toBe(false);
    // 3. Confirm: saved as approved, lesson 1 is written into Create.
    await send("yes");
    // Create opens on the piece once it is verified saved.
    const opened = await page.getByText("WORKING DRAFT").first().waitFor({ timeout: 180_000 }).then(() => true, () => false);
    await page.waitForTimeout(2_000);
    await h.shot("c05-create-opened");
    const inCreate = await bodyText();
    console.log("CREATE OPENED:", opened, "| header:", inCreate.slice(0, 260));
    // Back to the conversation: the "Saved" message with its reopen link.
    await page.getByRole("button", { name: /Back/ }).first().click().catch(() => undefined);
    await page.waitForTimeout(3_000);
    await h.shot("c05b-chat");
    const after = await bodyText();
    console.log("CHAT AFTER YES:", after.match(/Saved as the approved outline[\s\S]{0,300}/)?.[0], "||", after.match(/Saved: [\s\S]{0,300}/)?.[0]);
    const m = (await store.getMatter(USER, courseId))!;
    const approved = m.claims.find((c) => c.key === "approved_outline" && c.status === "current");
    console.log("approved:", approved?.provenance.source, approved?.provenance.quote, "creation links:", m.links?.creation, "foothold:", m.foothold.nextStep, "|", m.foothold.lastAction);
    const rows = supa.rows("companion_creation_workspaces");
    console.log("create rows:", rows.map((r) => ({ id: r.id, title: (r as Record<string, unknown>).title, status: (r as Record<string, unknown>).status })));
    let linkHref = await page.getByRole("link", { name: /Reopen it in Create/ }).last().getAttribute("href", { timeout: 10_000 }).catch(() => null);
    console.log("reopen link:", linkHref);
    console.log("model prompts:", modelPrompts.length, "requirements in prompt:", modelPrompts.map((x) => (x.system.match(/Requirement \(member said/g) ?? []).length));
    expect(approved?.provenance.source).toBe("member_decision");
    // 4. Reopen from the Project.
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(20_000);
    await h.shot("c06a-home-load");
    const home = await bodyText();
    console.log("HOME LOAD:", home.slice(0, 1200));
    linkHref = await page.getByRole("link", { name: /Reopen it in Create/ }).last().getAttribute("href", { timeout: 10_000 }).catch(() => null);
    console.log("reopen href (from chat):", linkHref);
    console.log("HOME has saved msg:", /Saved: "Introduction to ADHD in Business"/.test(home), "link:", await page.getByRole("link", { name: /Reopen it in Create/ }).count());
    // 4. The reopen link from the conversation, then a reload of that exact link.
    const LESSON_MARK = "Built to: every lesson needs a 5-minute action step";
    await page.getByRole("link", { name: /Reopen it in Create/ }).last().click();
    await page.waitForTimeout(10_000);
    await h.shot("c07-reopen-link");
    const viaLink = await bodyText();
    console.log("REOPEN LINK → Create:", viaLink.slice(0, 200), "| lesson text:", viaLink.includes(LESSON_MARK), "| url:", page.url());
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(15_000);
    await h.shot("c08-reload-link");
    const afterReload = await bodyText();
    console.log("RELOAD on link:", afterReload.slice(0, 200), "| lesson text:", afterReload.includes(LESSON_MARK), "| url:", page.url());
    // The link on a fresh load (a new tab, another device, after a reload).
    if (linkHref) {
      await page.goto(`${BASE}${linkHref}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(15_000);
      await h.shot("c08b-link-fresh-load");
      const fresh = await bodyText();
      console.log("LINK FRESH LOAD:", fresh.slice(0, 120), "| lesson text:", fresh.includes(LESSON_MARK));
      expect(fresh).toContain(LESSON_MARK);
    }
    // 5. Reopen from the Project: Welcome Home → Continue → the course's Project → its Create material.
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(12_000);
    await page.locator("button", { hasText: /^Welcome Home/ }).first().click();
    await page.waitForTimeout(1_000);
    await h.shot("c08c-menu");
    await page.getByText("Build", { exact: true }).click();
    await page.waitForTimeout(1_000);
    await h.shot("c09-build-menu");
    console.log("BUILD MENU:", (await page.locator("body").innerText()).match(/Build[\s\S]{0,400}/)?.[0]?.replace(/\s+/g, " "));
    await page.getByText(/^Projects?$/).first().click();
    await page.waitForTimeout(4_000);
    await h.shot("c09b-projects");
    console.log("PROJECTS:", (await bodyText()).slice(0, 600));
    await page.mouse.move(640, 600);
    await page.mouse.wheel(0, 1500);
    await page.waitForTimeout(3_000);
    await h.shot("c09c-projects-scrolled");
    console.log("BUTTONS:", await page.locator("button, [role=button], a").evaluateAll((els) => els.map((e) => (e.getAttribute("data-testid") ?? "") + "|" + (e.textContent ?? "").replace(/\s+/g, " ").slice(0, 50)).filter((x) => /launch|project/i.test(x))));
    console.log("CARD IDS:", await page.locator('[data-testid^="project-home-card-"]').evaluateAll((els) => els.map((e) => `${e.getAttribute("data-testid")} ${(e.textContent ?? "").slice(0, 60)}`)));
    console.log("PROJECT STORE:", JSON.stringify(supa.rows("companion_member_records").filter((r) => (r as Record<string, unknown>).record_id === "companion-projects-v1").map((r) => (r as { payload: { value: unknown } }).payload.value)).slice(0, 600));
    await page.getByTestId(`library-primary-${PROJECT_ID}`).click();
    await page.getByTestId("project-home-brain-work").waitFor({ timeout: 60_000 });
    await page.waitForTimeout(2_000);
    await h.shot("c10-project-home");
    console.log("PROJECT HOME AFTER:", (await page.getByTestId("project-home-brain-work").innerText()).replace(/\s+/g, " ").slice(0, 900));
    await page.getByTestId("project-home-brain-materials").getByRole("button").first().click();
    await page.waitForTimeout(8_000);
    await h.shot("c11-create-from-project");
    const fromProject = await bodyText();
    console.log("FROM PROJECT:", fromProject.slice(0, 120), "| lesson text:", fromProject.includes(LESSON_MARK));
    expect(fromProject).toContain(LESSON_MARK);
    console.log(log.filter((l) => !/404|shari-images|503|state → 200|reconcile → 200/.test(l)).join("\n"));
    console.log("unhandled supabase:", supa.unhandled);
  });

  it("proposal: new work while the course is in focus → outline → approve → full proposal in Create → verified save → reopen link → course untouched", async () => {
    store = createMemoryBrainStore();
    modelPrompts.length = 0;
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    const { courseId } = await seedLiveCourseAccount(supa);
    const board = (await store.listMatters(USER)).find((m) => m.title.startsWith("i don't know"))!;
    await api("/api/brain/work", { action: "remove_from_recent", matterId: board.id });
    await api("/api/brain/turn", { text: "Back to Launch a course", room: "home", recentMessages: [] });
    const courseBefore = JSON.stringify((await store.getMatter(USER, courseId))!.decisions);
    const h = await openPage(browser, supa, log);
    const { page } = h;
    const bodyText = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    const composer = page.locator("textarea").first();
    await composer.waitFor({ timeout: 300_000 });
    await page.waitForTimeout(8_000);
    const send = async (text: string, wait: RegExp | string, ms = 90_000) => {
      await composer.fill(text);
      await composer.press("Enter");
      const ok = await page.getByText(wait).first().waitFor({ timeout: ms }).then(() => true, () => false);
      if (!ok) {
        await h.shot("p-failed");
        console.log("FAILED AT:", text, "| BODY:", (await bodyText()).slice(-1200));
        console.log(log.filter((l) => !/404|shari-images|503|state → 200|reconcile → 200|work-attachments|user-health/.test(l)).join("\n"));
        throw new Error(`no "${String(wait)}" after "${text}"`);
      }
      await page.waitForTimeout(2_500);
    };
    await send("I'm pitching Acme on a rebrand. Give me an outline for the client proposal first.", "Does this structure work for you?");
    console.log("AFTER NEW WORK:", (await bodyText()).slice(-300));
    await h.shot("p02-outline");
    await send("looks great", /approved|saved|outline/i);
    await h.shot("p03-approved");
    console.log("AFTER APPROVE:", (await bodyText()).slice(-400));
    await composer.fill("write the full proposal in Create");
    await composer.press("Enter");
    const opened = await page.getByText("WORKING DRAFT").first().waitFor({ timeout: 240_000 }).then(() => true, () => false);
    await page.waitForTimeout(2_000);
    await h.shot("p04-create");
    console.log("CREATE OPENED:", opened, (await bodyText()).slice(0, 200));
    const matters = await store.listMatters(USER);
    const proposal = matters.find((m) => /proposal/i.test(m.title));
    console.log("MATTERS:", matters.map((m) => `${m.title.slice(0, 40)} | ${m.status} | creation=${JSON.stringify(m.links?.creation ?? [])}`));
    console.log("PROPOSAL claims:", proposal?.claims.map((c) => `${c.key}:${c.provenance.source}`), "foothold:", proposal?.foothold.lastAction, "|", proposal?.foothold.nextStep);
    const rows = supa.rows("companion_creation_workspaces").map((r) => r as Record<string, unknown>);
    console.log("TRACES:", (await store.listTraces(USER)).slice(-8).map((t) => `${t.inputPreview?.slice(0, 50)} → ${t.interpretation} @${t.selectedMatterId} ops=${t.ops?.join(",")}`));
    console.log("CREATE ROWS:", rows.map((r) => `${r.id} ${r.title}`));
    console.log("section prompts:", modelPrompts.length, "course requirements in proposal prompts:", modelPrompts.filter((x) => /every lesson needs/.test(x.system)).length);
    expect(modelPrompts.some((x) => /every lesson needs/.test(x.system))).toBe(false);
    // The course is untouched by the proposal.
    expect(JSON.stringify((await store.getMatter(USER, courseId))!.decisions)).toBe(courseBefore);
    expect(proposal && proposal.id !== courseId).toBe(true);
    expect(proposal!.claims.some((c) => c.key === "approved_outline" && c.provenance.source === "member_decision")).toBe(true);
    // Reopen link, on a fresh load.
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(15_000);
    const href = await page.getByRole("link", { name: /Reopen it in Create/ }).last().getAttribute("href", { timeout: 15_000 }).catch(() => null);
    console.log("CHAT END:", (await bodyText()).slice(-500), "| href:", href);
    expect(href).toBeTruthy();
    await page.goto(`${BASE}${href}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(15_000);
    await h.shot("p05-link-fresh-load");
    const fresh = await bodyText();
    console.log("LINK FRESH LOAD:", fresh.slice(0, 200), "| has Executive Summary:", fresh.includes("Executive Summary"), "| has Next Steps:", fresh.includes("Next Steps"));
    expect(fresh).toContain("Executive Summary");
    console.log(log.filter((l) => !/404|shari-images|503|state → 200|reconcile → 200|work-attachments|user-health/.test(l)).join("\n"));
  });

  it("live conversation 2026-10-06 11:46: re-entry → 'yes lesson 1' … 'no' continues the waiting build; nothing erased; no repeats; no unrelated history", async () => {
    store = createMemoryBrainStore();
    modelPrompts.length = 0;
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    const { courseId } = await seedLiveCourseAccount(supa);
    const board = (await store.listMatters(USER)).find((m) => m.title.startsWith("i don't know"))!;
    await api("/api/brain/work", { action: "remove_from_recent", matterId: board.id });
    // As live: the lesson 1 request waiting on the outline, and a decision kept only as history.
    const { commitBrainOps } = await import("@/lib/brain/commit");
    await commitBrainOps(store, [{ op: "recordClaim", matterId: courseId, claimId: "clm_pending_live", key: "pending_develop",
      value: JSON.stringify({ label: "Document", noun: "course", part: 1, partName: "lesson 1" }), negative: false,
      provenance: { source: "member_statement", turnId: null, room: "home", at: new Date().toISOString(), quote: "Develop lesson 1 in Create using our approved outline and course requirements." } },
      { op: "saveFoothold", matterId: courseId, lastAction: "Recovered the 13:16 outline", nextStep: "Confirm the outline you approved, then write lesson 1", openQuestion: null }],
      { memberId: USER, turnId: null, room: null, now: new Date().toISOString() });
    const c0 = (await store.getMatter(USER, courseId))!;
    c0.decisions.push({ id: "dec_hist_brain", key: "choice", label: "Working on the brain configuration of the app", status: "superseded", offerId: null, optionId: null,
      provenance: { source: "member_decision", turnId: null, room: "home", at: new Date().toISOString(), quote: "1" }, supersedes: null, alternatives: [], supersededBy: null } as never);
    await store.putMatter(USER, c0, c0.version);
    const reqsBefore = (await store.getMatter(USER, courseId))!.claims.filter((c) => c.key.startsWith("requirement:")).map((c) => c.value);

    const h = await openPage(browser, supa, log);
    const { page } = h;
    const bodyText = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await page.getByTestId("global-daily-resume-list").waitFor({ timeout: 300_000 });
    await page.getByTestId("global-daily-resume-item-1").click();
    await page.getByTestId("project-home-brain-resume").waitFor({ timeout: 60_000 });
    await page.getByTestId("project-home-brain-resume").click();
    await page.waitForTimeout(5_000);
    const composer = page.locator("textarea").first();
    await composer.waitFor({ timeout: 60_000 });
    const reentry = await bodyText();
    console.log("RE-ENTRY:", reentry.slice(0, 400));
    expect(reentry).not.toMatch(/brain configuration/i);
    const transcript: string[] = [];
    const say = async (text: string) => {
      if (await page.getByText("WORKING DRAFT").first().isVisible().catch(() => false)) throw new Error(`Create opened before "${text}": a build ran without the member's yes`);
      const before = await page.locator("body").innerText();
      await composer.fill(text);
      await composer.press("Enter");
      await page.waitForFunction(([b, n]) => document.body.innerText.length > (b as string).length + (n as number) + 5, [before, text.length] as const, { timeout: 120_000 }).catch(() => undefined);
      await page.waitForTimeout(4_000);
      const now = await page.locator("body").innerText();
      transcript.push(`YOU: ${text}\nSPARK: ${now.slice(before.length).replace(text, "").replace(/\s+/g, " ").trim().slice(0, 600)}`);
    };
    for (const text of ["yes lesson 1", "need you to help me build the first lesson in detail", "it matters because i need to get it done", "adhd business people", "nothinig is in place yet", "no"]) {
      await say(text);
    }
    await h.shot("x01-after-live-turns");
    console.log("TRANSCRIPT:\n" + transcript.join("\n---\n"));
    const all = await bodyText();
    expect(all).not.toMatch(/Why does this matter right now/);
    expect(all).not.toMatch(/What topic do you want to cover/);
    const m = (await store.getMatter(USER, courseId))!;
    expect(m.claims.filter((c) => c.key.startsWith("requirement:") && c.status === "current").map((c) => c.value)).toEqual(reqsBefore);
    expect(m.claims.find((c) => c.key === "outline_candidate" && c.status === "current")?.value).toContain("Introduction to ADHD in Business");
    // The conversation as the account saved it (the same record traced live): no reply says a paragraph twice.
    await page.waitForTimeout(4_000);
    const saved = supa.rows("companion_member_records").find((r) => (r as Record<string, unknown>).record_id === "companion-conversation-v1") as { payload: { value: Array<{ role: string; content: string }> } } | undefined;
    const convo = saved?.payload.value ?? [];
    console.log("SAVED CONVERSATION:\n" + convo.map((x) => `${x.role === "user" ? "YOU" : "SPARK"}: ${x.content.replace(/\s+/g, " ").slice(0, 260)}`).join("\n"));
    expect(convo.filter((x) => x.role === "user").length).toBeGreaterThanOrEqual(6);
    for (const x of convo.filter((y) => y.role === "assistant")) {
      const paras = x.content.split(/\n\n+/).map((y) => y.trim()).filter(Boolean);
      expect(new Set(paras).size).toBe(paras.length);
    }
    // Then the member confirms: lesson 1 is built from the saved outline with the requirements.
    await composer.fill("Develop lesson 1 in Create using our approved outline and course requirements.");
    await composer.press("Enter");
    await page.getByText("Is this the outline you approved?").last().waitFor({ timeout: 120_000 });
    await page.waitForTimeout(2_000);
    await composer.fill("yes");
    await composer.press("Enter");
    const opened = await page.getByText("WORKING DRAFT").first().waitFor({ timeout: 240_000 }).then(() => true, () => false);
    await h.shot("x02-lesson-built");
    const after = (await store.getMatter(USER, courseId))!;
    console.log("BUILT:", opened, "| approved:", after.claims.find((c) => c.key === "approved_outline")?.provenance.source,
      "| pending left:", after.claims.filter((c) => c.key === "pending_develop" && c.status === "current").length,
      "| creation:", after.links?.creation, "| requirement lines in writer:", modelPrompts.map((x) => (x.system.match(/Requirement \(member said/g) ?? []).length),
      "| brain-config in writer:", modelPrompts.some((x) => /brain configuration/i.test(x.system)));
    expect(opened).toBe(true);
    expect(modelPrompts.some((x) => /brain configuration/i.test(x.system))).toBe(false);
    console.log(log.filter((l) => !/404|shari-images|503|state → 200|reconcile → 200|work-attachments|user-health/.test(l)).join("\n"));
  });

  type JourneySpec = {
    kind: string;
    start: string;
    titleRe: RegExp;
    brief: string;
    requirement: string;
    askChoices: string;
    choices: string;
    pick: string;
    picked: string;
    correction: string;
    corrected: string;
    recall: string;
    askOutline: string;
    outline: string;
    build: string;
    builtMark: string;
    project: string;
    related: string;
    board: string;
    research: string;
  };
  const JOURNEYS: JourneySpec[] = [
    {
      kind: "course", start: "I want to launch a course on ADHD-friendly productivity", titleRe: /course/i,
      brief: "it's for adhd business owners, and fun ways to get unstuck", requirement: "every lesson needs a 5-minute action step",
      askChoices: "give me three format options for the course", choices: "Here are three formats:\n\n1. Self-paced videos\n2. Live cohort\n3. Email course\n\nWhich one would you like?",
      pick: "2", picked: "Live cohort", correction: "actually no, the first", corrected: "Self-paced videos", recall: "what did we choose for the format?",
      askOutline: "give me an outline for the course", outline: "Here's a course outline:\n\n1. Why ADHD Brains Stall\n   - The real reasons\n   - What helps\n2. Tiny Systems\n   - Two-minute starts\n   - Visible lists\n3. Momentum\n   - Body doubling\n   - Rewards\n\nDoes this structure work for you?",
      build: "yes lesson 1", builtMark: "Why ADHD Brains Stall", project: "Course launch",
      related: "let's write a sales page for it", board: "Should our course launch in January or March?", research: "how do people price ADHD productivity courses",
    },
    {
      kind: "proposal", start: "I need to put together a client proposal for Acme's rebrand", titleRe: /proposal/i,
      brief: "it's for Acme's marketing director, and winning the rebrand project", requirement: "the proposal must stay under five pages",
      askChoices: "give me three pricing options for the proposal", choices: "Here are three pricing options:\n\n1. $4,000 flat\n2. $6,500 flat\n3. $9,000 with retainer\n\nWhich one would you like?",
      pick: "2", picked: "$6,500 flat", correction: "actually no, the third", corrected: "$9,000 with retainer", recall: "what did we choose for the pricing?",
      askOutline: "give me an outline for the proposal", outline: "Here's a proposal outline:\n\n1. Executive Summary\n   - What Acme wants\n2. Scope of Work\n   - Brand audit\n   - Visual identity\n3. Timeline\n   - Six weeks\n4. Investment\n   - Fee and payments\n\nDoes this structure work for you?",
      build: "yes", builtMark: "Executive Summary", project: "Acme proposal",
      related: "let's write a cover email for it", board: "Is the Acme proposal priced too high?", research: "typical rebrand project fees for small agencies",
    },
    {
      kind: "event", start: "I'm planning a spring retreat event for my clients", titleRe: /retreat/i,
      brief: "it's for my top 20 clients, and a calm weekend to plan their year", requirement: "the venue must be wheelchair accessible",
      askChoices: "give me three venue options for the retreat", choices: "Here are three venues:\n\n1. Lakeside lodge\n2. City hotel\n3. Ranch house\n\nWhich one would you like?",
      pick: "1", picked: "Lakeside lodge", correction: "actually no, the third", corrected: "Ranch house", recall: "what did we choose for the venue?",
      askOutline: "give me an outline for the event plan", outline: "Here's an event plan outline:\n\n1. Arrival Day\n   - Welcome dinner\n2. Planning Day\n   - Year map workshop\n   - Quiet hours\n3. Closing Morning\n   - Commitments circle\n\nDoes this structure work for you?",
      build: "write the full event plan in Create", builtMark: "Arrival Day", project: "Spring retreat",
      related: "let's write the invitation email for it", board: "Should we hold the retreat in March or April?", research: "wheelchair accessible retreat venues near Austin",
    },
  ];

  for (const J of JOURNEYS) {
    it(`journey (${J.kind}): brief → choose/correct/recall → short replies → outline → build → save → Project → interrupt → reload → resume; one reply and one save per turn`, async () => {
      store = createMemoryBrainStore();
      modelPrompts.length = 0;
      const supa = createFakeSupabase(USER);
      const log: string[] = [];
      const { hashString } = await import("@/lib/memberSync/engine");
      const projects = JOURNEYS.map((x, i) => ({ id: `proj-${x.kind}-${i}`, name: x.project, goal: "", color: "#1e4f4f", goals: [], status: "in-progress", horizon: "now", archived: false, createdAt: "2026-10-01T10:00:00.000Z", updatedAt: "2026-10-01T10:00:00.000Z", nextAction: "", projectHomeRoomId: "writing-room" }));
      supa.rows("companion_member_records").push({ id: crypto.randomUUID(), user_id: USER, domain: "member_store", record_id: "companion-projects-v1", status: "active", schema_version: 1, record_version: 1,
        payload: { format: "json", value: projects, hash: hashString(JSON.stringify(projects)), savedAt: new Date().toISOString() }, created_at: new Date().toISOString(), updatedAt: new Date().toISOString() });
      scripted.length = 0;
      scripted.push([new RegExp(J.askChoices.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), J.choices], [new RegExp(J.askOutline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), J.outline]);
      const results: Array<[string, boolean, string]> = [];
      const check = (name: string, ok: boolean, detail = "") => { results.push([name, ok, detail]); };
      onTestFailed(() => console.log(`\nJOURNEY ${J.kind} (stopped early):\n` + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n")));

      let h = await openPage(browser, supa, log);
      let page = h.page;
      const body = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
      await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
      let composer = page.locator("textarea").first();
      await composer.waitFor({ timeout: 300_000 });
      await page.waitForTimeout(6_000);
      const traces = async () => (await store.listTraces!(USER, 500)).length;
      let sends = 0;
      // The conversation's own box (the one beside Send). When a turn opened Create or a
      // room, go back to the conversation first, as the member would.
      const chatBox = () => page.getByRole("button", { name: "Send", exact: true }).first().locator("xpath=ancestor::*[.//textarea][1]//textarea").first();
      const ensureChat = async () => {
        if (await chatBox().isVisible().catch(() => false)) { composer = chatBox(); return; }
        await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
        await chatBox().waitFor({ timeout: 120_000 });
        composer = chatBox();
        await page.waitForTimeout(5_000);
      };
      const offersNow = async () => (await store.listMatters(USER)).reduce((n, m) => n + m.offers.length, 0);
      const say = async (text: string, waitFor?: RegExp | string) => {
        await ensureChat();
        const t0 = await traces();
        const o0 = await offersNow();
        const l0 = log.length;
        const before = await page.locator("body").innerText();
        await composer.fill(text);
        await composer.press("Enter");
        sends += 1;
        if (waitFor) await page.getByText(waitFor).last().waitFor({ timeout: 120_000 }).catch(() => undefined);
        else await page.waitForFunction(([b, n]) => document.body.innerText.length > (b as string).length + (n as number) + 5, [before, text.length] as const, { timeout: 90_000 }).catch(() => undefined);
        await page.waitForTimeout(3_000);
        const t1 = await traces();
        // "One committed turn": the Brain commits this turn once (it may write several related
        // records in that one commit); never twice, never none.
        if (t1 - t0 !== 1) check(`one committed Brain turn for "${text}"`, false, `${t1 - t0} committed turns`);
        // No duplicate effects: no claim saved twice, no second Create piece for the same work.
        const ws = await store.listMatters(USER);
        const dupClaims = ws.flatMap((m) => {
          const seen = new Set<string>();
          return m.claims.filter((c) => c.status === "current").filter((c) => { const k = `${c.key}\u0000${c.value}`; if (seen.has(k)) return true; seen.add(k); return false; }).map((c) => `${m.title}: ${c.key}`);
        });
        if (dupClaims.length) check(`no duplicate claims after "${text}"`, false, dupClaims.join(", "));
        const ids = supa.rows("companion_creation_workspaces").map((r) => String((r as Record<string, unknown>).id));
        if (new Set(ids).size !== ids.length) check(`no duplicate Create rows after "${text}"`, false, ids.join(","));
        // One owner: the Brain sees the turn once; a turn it answered is never also answered by chat.
        const turnLog = log.slice(l0);
        const brainCalls = turnLog.filter((l) => l.startsWith("POST /api/brain/turn")).length;
        const chatCalls = turnLog.filter((l) => l.startsWith("(chat route)") && !/Please rewrite/i.test(l)).length;
        const last = (await store.listTraces!(USER, 500)).sort((a, b) => a.at.localeCompare(b.at)).at(-1);
        const handledByBrain = Boolean(last?.handled);
        if (brainCalls !== 1 || (handledByBrain && chatCalls !== 0) || chatCalls > 1) {
          check(`one owner for "${text}"`, false, `brain=${brainCalls} chat=${chatCalls} handled=${handledByBrain} (${last?.interpretation})`);
        }
        const o1 = await offersNow();
        if (o1 - o0 > 1) {
          const all = (await store.listMatters(USER)).flatMap((m) => m.offers.map((o) => ({ ...o, mt: m.title })));
          const fresh = all.sort((a, b) => a.createdAt.localeCompare(b.createdAt)).slice(-(o1 - o0));
          check(`no duplicate offers for "${text}"`, false, `${o1 - o0} offers: ${fresh.map((o) => `${o.mt.slice(0, 20)}/${o.kind}/${o.decisionKey}/${o.createdTurnId}/${o.status}/${o.question.slice(0, 40)}`).join(" || ")}`);
        }
        // One reply for this turn: exactly one Spark message after it, never a paragraph twice.
        await page.waitForTimeout(1_500);
        const rec = supa.rows("companion_member_records").find((r) => (r as Record<string, unknown>).record_id === "companion-conversation-v1") as { payload: { value: Array<{ role: string; content: string }> } } | undefined;
        const c = rec?.payload.value ?? [];
        const at = c.map((x) => x.role === "user" && x.content.trim() === text.trim()).lastIndexOf(true);
        const after = at >= 0 ? c.slice(at + 1) : [];
        const paras = (after[0]?.content ?? "").split(/\n\n+/).map((x) => x.trim()).filter(Boolean);
        if (at < 0 || after.length !== 1 || after[0]!.role !== "assistant" || new Set(paras).size !== paras.length) {
          check(`one reply for "${text}"`, false, at < 0 ? "turn not in saved conversation" : `${after.length} replies: ${after.map((x) => x.content.replace(/\s+/g, " ").slice(0, 80)).join(" || ")}`);
        }
      };
      const work = async () => (await store.listMatters(USER)).find((m) => J.titleRe.test(m.title) && !m.mergedInto);

      // 1. Start the work, save its brief and a requirement.
      await say(J.start);
      const w0 = await work();
      check("work started (one Matter)", Boolean(w0), w0?.title ?? "none");
      await say(J.brief);
      await say(J.requirement);
      let w = (await work())!;
      check("purpose + audience saved", ["audience", "purpose"].every((k) => w.claims.some((c) => c.key === k)), w.claims.map((c) => c.key).join(","));
      check("requirement saved", w.claims.some((c) => c.key.startsWith("requirement:")), "");
      // 2. Choices: offer, pick, correct, recall.
      await say(J.askChoices, "Which one would you like?");
      await say(J.pick, J.picked);
      await say(J.correction, J.corrected);
      await say(J.recall);
      const recallText = await body();
      w = (await work())!;
      check("pick → correction kept one current decision", w.decisions.filter((d) => d.status === "current").map((d) => d.label).join("|") === J.corrected, w.decisions.map((d) => `${d.label}:${d.status}`).join(","));
      check("recall answered from records", recallText.lastIndexOf(J.corrected) > recallText.lastIndexOf(J.recall), "");
      // 3. Short replies and help: never a fresh intake, never requirements.
      await say("yes");
      await say("help me with the next step");
      const afterShort = await body();
      check("no fresh document interview", !/Why does this matter right now|What would you like this to accomplish/i.test(afterShort), "");
      w = (await work())!;
      check("short replies saved nothing new", w.claims.filter((c) => c.key.startsWith("requirement:")).length === 1, w.claims.map((c) => c.key).join(","));
      // 4. Related piece stays with the work.
      const before = (await store.listMatters(USER)).length;
      await say(J.related);
      check("related piece stays with the work", (await store.listMatters(USER)).length === before, (await store.listMatters(USER)).map((m) => m.title).join(" | "));
      // 4a. Type alone never splits work: a proposal FOR this work stays with it; one for a different client is new.
      if (J.kind === "course") {
        const n0 = (await store.listMatters(USER)).length;
        await say("write a proposal for this course");
        check("'a proposal for this course' stays with the course", (await store.listMatters(USER)).length === n0, (await store.listMatters(USER)).map((m) => m.title).join(" | "));
        await say("I need to write a proposal for a different client");
        const other = (await store.listMatters(USER)).find((m) => /proposal/i.test(m.title) && m.id !== w.id);
        check("'a proposal for a different client' is new work", Boolean(other) && (await store.listMatters(USER)).length === n0 + 1, (await store.listMatters(USER)).map((m) => m.title).join(" | "));
        await say(`Back to ${w.title}`);
        check("back on the course after the other proposal", (await store.getMemberState(USER))?.focusMatterId === w.id, "");
      }
      // 4c. Naming Claude/ChatGPT in ordinary chat is not an AI-tools question: the reply is the model's own.
      if (J.kind === "course") {
        scripted.unshift([/pasted this from ChatGPT/i, "Sure, paste it in and I'll tidy it up for the course."]);
        await say("I pasted this from ChatGPT earlier, can you tidy it up?", "paste it in and I'll tidy it up");
        const rec = supa.rows("companion_member_records").find((r) => (r as Record<string, unknown>).record_id === "companion-conversation-v1") as { payload: { value: Array<{ role: string; content: string }> } } | undefined;
        const lastReply = (rec?.payload.value ?? []).filter((x) => x.role === "assistant").at(-1)?.content ?? "";
        check("ChatGPT named in ordinary chat gets the ordinary reply", /paste it in and I'll tidy it up/.test(lastReply) && !/AI tools?|automation/i.test(lastReply), lastReply.slice(0, 120));
      }
      // 4b. An everyday errand mid-flow: never part of the work, never new work.
      const beforeErrand = (await store.listMatters(USER)).length;
      const claimsBefore = (await work())!.claims.length;
      await say("remind me to call the dentist tomorrow");
      check("errand stays out of the work", (await store.listMatters(USER)).length === beforeErrand && (await work())!.claims.length === claimsBefore, "");
      // 5. Outline → approve → build → verified save.
      await say(J.askOutline, "Does this structure work for you?");
      w = (await work())!;
      check("outline shown is saved and asked about (not approved)", w.claims.some((c) => c.key.startsWith("outline_candidate")) && !w.claims.some((c) => c.key === "approved_outline"), "");
      await say("looks great", "Saved as the approved outline");
      w = (await work())!;
      check("outline approved by the member (a yes to that saved version)", w.claims.some((c) => c.key === "approved_outline" && c.provenance.source === "member_decision"), "");
      await ensureChat();
      const t0b = await traces();
      await composer.fill(J.build);
      await composer.press("Enter");
      sends += 1;
      const opened = await page.getByText("WORKING DRAFT").first().waitFor({ timeout: 240_000 }).then(() => true, () => false);
      await page.waitForTimeout(2_000);
      await h.shot(`j-${J.kind}-built`);
      check(`one committed Brain turn for the build ("${J.build}")`, (await traces()) - t0b === 1, "");
      w = (await work())!;
      const rows = supa.rows("companion_creation_workspaces");
      check("material built, saved and linked", opened && (w.links?.creation?.length ?? 0) === 1 && rows.length === 1, `opened=${opened} links=${JSON.stringify(w.links?.creation)} rows=${rows.length}`);
      check("requirement used by the writer", modelPrompts.length > 0 && modelPrompts.every((x) => x.system.includes(J.requirement)), `${modelPrompts.length} prompts`);
      // 6. Board + Research handoffs (sent from the page, same endpoint and payload as the rooms).
      const propose = (room: string, proposal: Record<string, unknown>) =>
        page.evaluate(async ([r, p]) => (await fetch("/api/brain/propose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room: r, proposals: [p] }) })).json(), [room, proposal] as const);
      await propose("board", { kind: "work", title: J.board, statement: J.board, links: [{ kind: "board_session", id: `board-${J.kind}` }], commitment: false, focus: false, joinFocus: false, joinFocusIfRelated: true, neverCreate: true });
      await propose("research", { kind: "work", title: J.research, links: [{ kind: "research_collection", id: `rcol-${J.kind}` }], commitment: false, focus: true, joinFocus: true, joinFocusIfRelated: false, neverCreate: false });
      w = (await work())!;
      // Founder rule (2026-10-06, report §6 G): work joins only by an id it carries or an explicit choice —
      // a Board question without the work's id starts nothing and moves nothing.
      check("Board question with no work id: no new work, focus unchanged", (await store.listMatters(USER)).filter((m) => m.title === J.board).length === 0 && (await store.getMemberState(USER))?.focusMatterId === w.id, "");
      check("Research joined this work", (w.links?.research_collection ?? []).includes(`rcol-${J.kind}`), "");
      // 7. Interrupt with unrelated work, return.
      await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
      composer = page.locator("textarea").first();
      await composer.waitFor({ timeout: 120_000 });
      await page.waitForTimeout(5_000);
      await say("I also need to plan a podcast episode about focus");
      const pod = (await store.listMatters(USER)).find((m) => /podcast/i.test(m.title));
      check("unrelated work kept separate", Boolean(pod) && !pod!.claims.length && pod!.id !== w.id, pod?.title ?? "none");
      await say(`Back to ${w.title}`);
      check("returned to the work", (await store.getMemberState(USER))?.focusMatterId === w.id, "");
      // 8. Another device: reload fresh, Continue → move into its Project → Project home → reopen material.
      h = await openPage(browser, supa, log);
      page = h.page;
      await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
      // The member's conversation comes back on the other device; New Chat then shows Continue.
      const intro = page.getByRole("button", { name: "Continue to Welcome Home" });
      await Promise.race([intro.waitFor({ timeout: 300_000 }), page.locator("textarea").first().waitFor({ timeout: 300_000 })]).catch(() => undefined);
      if (await intro.isVisible().catch(() => false)) await intro.click();
      await page.waitForTimeout(8_000);
      check("conversation restored on the other device", (await body()).includes(`Back to ${w.title}`), "");
      await page.getByRole("button", { name: "New Chat" }).first().click();
      await page.getByTestId("global-daily-resume-list").waitFor({ timeout: 300_000 });
      await page.waitForTimeout(3_000);
      const list = (await page.getByTestId("global-daily-resume-list").innerText()).replace(/\s+/g, " ");
      check("Continue lists the work first, the podcast separately, once each", list.startsWith("1.") && list.includes(w.title) && list.split(w.title).length === 2 && /podcast/i.test(list), list.slice(0, 200));
      await page.getByTestId("global-daily-resume-menu-1").click();
      await page.getByTestId("global-daily-resume-actions-1").getByRole("button", { name: "Move to Project" }).click();
      await page.getByTestId("global-daily-resume-actions-1").getByRole("button", { name: J.project }).click();
      await page.waitForTimeout(3_000);
      w = (await work())!;
      check("moved into its Project (one Project)", (w.links?.project ?? []).length === 1, JSON.stringify(w.links?.project));
      await page.getByTestId("global-daily-resume-item-1").click();
      const home = await page.getByTestId("project-home-brain-work").waitFor({ timeout: 60_000 }).then(() => true, () => false);
      await page.waitForTimeout(2_000);
      const homeText = home ? (await page.getByTestId("project-home-brain-work").innerText()).replace(/\s+/g, " ") : "";
      check("Project home shows decision + requirement", homeText.includes(J.corrected) && homeText.includes(J.requirement), homeText.slice(0, 300));
      if (home) await page.getByTestId("project-home-brain-materials").getByRole("button").first().click().catch(() => undefined);
      await page.waitForTimeout(8_000);
      await h.shot(`j-${J.kind}-from-project`);
      check("material reopens from the Project", (await body()).includes(J.builtMark), "");
      // 9. Resume in conversation on this device.
      await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
      composer = page.locator("textarea").first();
      await composer.waitFor({ timeout: 120_000 });
      await page.waitForTimeout(5_000);
      await say("Where were we?");
      const resumed = await body();
      check("resume names the work and its decision, not unrelated history", resumed.includes(w.title) && resumed.includes(J.corrected) && !/podcast|brain configuration/i.test(resumed.slice(resumed.lastIndexOf("Where were we?"))), resumed.slice(resumed.lastIndexOf("Where were we?"), resumed.lastIndexOf("Where were we?") + 300));
      // 10. One reply per submitted turn (the account's saved conversation).
      const saved = supa.rows("companion_member_records").find((r) => (r as Record<string, unknown>).record_id === "companion-conversation-v1") as { payload: { value: Array<{ role: string; content: string }> } } | undefined;
      const convo = saved?.payload.value ?? [];
      const doubles = convo.filter((x, i) => x.role === "assistant" && convo[i - 1]?.role === "assistant").length;
      const repeats = convo.filter((x) => x.role === "assistant" && new Set(x.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean)).size !== x.content.split(/\n\n+/).map((p) => p.trim()).filter(Boolean).length).length;
      check("one reply per turn (no stacked or repeated replies)", doubles === 0 && repeats === 0, `doubles=${doubles} repeats=${repeats} msgs=${convo.length}`);
      check("separate work did not borrow this work's records", !(await store.listMatters(USER)).some((m) => m.id !== w.id && m.claims.some((c) => c.value === J.requirement)), "");

      console.log(`\nJOURNEY ${J.kind}:\n` + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n"));
      if (results.some(([, ok]) => !ok)) {
        console.log("TRACES:\n" + (await store.listTraces!(USER, 500)).sort((a, b) => a.at.localeCompare(b.at)).map((t) => `${t.inputPreview?.slice(0, 60)} → ${t.interpretation}${t.handled ? " [handled]" : ""} ops=${(t.ops ?? []).join(",")}`).join("\n"));
        console.log("CONVO:\n" + convo.map((x) => `${x.role === "user" ? "YOU" : "SPARK"}: ${x.content.replace(/\s+/g, " ").slice(0, 160)}`).join("\n"));
      }
      if (results.some(([, ok]) => !ok)) console.log(log.filter((l) => !/404|shari-images|503|state → 200|reconcile → 200|work-attachments|user-health|signals/.test(l)).slice(-40).join("\n"));
      expect(results.filter(([, ok]) => !ok).map(([n]) => n)).toEqual([]);
    });
  }

  it("probe: 'yes' after a Brain-answered turn", async () => {
    store = createMemoryBrainStore();
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    scripted.length = 0;
    scripted.push([/format options/i, "Here are three formats:\n\n1. Self-paced videos\n2. Live cohort\n3. Email course\n\nWhich one would you like?"]);
    const h = await openPage(browser, supa, log);
    const { page } = h;
    const all: string[] = [];
    page.on("console", (m) => all.push(`[${m.type()}] ${m.text().slice(0, 300)}`));
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    const first = page.getByRole("button", { name: "Continue to Welcome Home" });
    await Promise.race([first.waitFor({ timeout: 300_000 }), page.locator("textarea").first().waitFor({ timeout: 300_000 })]).catch(() => undefined);
    if (await first.isVisible().catch(() => false)) await first.click();
    const composer = page.locator("textarea").first();
    await composer.waitFor({ timeout: 300_000 });
    await page.waitForTimeout(5_000);
    const probeTurns = (process.env.PROBE_TURNS ?? "I want to launch a course on ADHD-friendly productivity|give me three format options for the course|2|what did we choose for the format?").split("|");
    const probeLast = process.env.PROBE_LAST ?? "yes";
    for (const t of probeTurns) {
      await composer.fill(t); await composer.press("Enter"); await page.waitForTimeout(7_000);
    }
    all.length = 0;
    await composer.fill(probeLast); await composer.press("Enter"); await page.waitForTimeout(8_000);
    console.log("YES TURN CONSOLE:\n" + all.filter((l) => !/preload|404|Failed to load/.test(l)).join("\n"));
    console.log("BODY END:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(-500));
    if (process.env.PROBE_RELOAD === "1") {
      const h2 = await openPage(browser, supa, log);
      await h2.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
      await h2.page.locator("textarea").first().waitFor({ timeout: 300_000 }).catch(() => undefined);
      await h2.page.waitForTimeout(15_000);
      await h2.shot("probe-reload");
      console.log("RELOAD BODY:", (await h2.page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1500));
      const intro = h2.page.getByRole("button", { name: "Continue to Welcome Home" });
      if (await intro.isVisible().catch(() => false)) await intro.click();
      await h2.page.waitForTimeout(10_000);
      await h2.shot("probe-reload-2");
      console.log("AFTER INTRO BODY:", (await h2.page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1500));
      await h2.page.getByRole("button", { name: "New Chat" }).first().click().catch((e) => console.log("no New Chat", String(e).slice(0, 100)));
      await h2.page.waitForTimeout(10_000);
      console.log("AFTER NEW CHAT BODY:", (await h2.page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 1500));
    }
  });

  it("continuity on the combined build: reload, new tab, sign-out → sign-in keep the member's conversation; a second account sees none of it", async () => {
    store = createMemoryBrainStore();
    const USER_B = "00000000-0000-4000-8000-0000000000b2";
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    scripted.length = 0;
    scripted.push([/PINEAPPLE-7/, "Noted: PINEAPPLE-7 is saved in our conversation."], [/MANGO-3/, "Noted: MANGO-3."]);
    const results: Array<[string, boolean, string]> = [];
    const check = (name: string, ok: boolean, detail = "") => { results.push([name, ok, detail]); };
    onTestFailed(() => console.log("CONTINUITY (stopped early):\n" + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n")));
    const boot = async (page: Page) => {
      const intro = page.getByRole("button", { name: "Continue to Welcome Home" });
      await Promise.race([intro.waitFor({ timeout: 300_000 }), page.locator("textarea").first().waitFor({ timeout: 300_000 })]).catch(() => undefined);
      if (await intro.isVisible().catch(() => false)) await intro.click();
      await page.waitForTimeout(8_000);
    };
    const box = (page: Page) => page.getByRole("button", { name: "Send", exact: true }).first().locator("xpath=ancestor::*[.//textarea][1]//textarea").first();
    const text = async (page: Page) => (await page.locator("body").innerText()).replace(/\s+/g, " ");
    const send = async (page: Page, t: string, until: string) => {
      await box(page).fill(t);
      await box(page).press("Enter");
      await page.getByText(until).last().waitFor({ timeout: 120_000 }).catch(() => undefined);
      await page.waitForTimeout(3_000);
    };

    // Account A talks, then reloads, opens a new tab, signs out and back in.
    const a = await openPage(browser, supa, log);
    await a.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await boot(a.page);
    await send(a.page, "please remember the code PINEAPPLE-7 for me", "Noted: PINEAPPLE-7");
    check("A: reply shown", (await text(a.page)).includes("Noted: PINEAPPLE-7"), "");
    await a.page.reload({ waitUntil: "domcontentloaded" });
    await boot(a.page);
    check("A: conversation after reload", (await text(a.page)).includes("Noted: PINEAPPLE-7"), (await text(a.page)).slice(0, 200));
    const tab = await a.page.context().newPage();
    await tab.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
    await boot(tab);
    check("A: conversation in a new tab", (await text(tab)).includes("Noted: PINEAPPLE-7"), (await text(tab)).slice(0, 200));
    await tab.close();

    // Sign out through the app's own account control.
    let signedOut = false;
    const logout = () => a.page.locator("button, [role=menuitem], a").filter({ hasText: /^\s*(log ?out|sign out)\s*$/i }).first();
    const clickIf = async (loc: ReturnType<Page["locator"]>) => {
      if (!(await loc.isVisible().catch(() => false))) return false;
      await loc.click().catch(() => undefined);
      await a.page.waitForTimeout(2_000);
      return true;
    };
    await clickIf(a.page.locator("button").filter({ hasText: /^\s*[A-Z0-9]\s*▼?\s*$/ }).last());
    await a.shot("continuity-account-menu");
    console.log("ACCOUNT MENU:", (await text(a.page)).slice(-600));
    if (!(await logout().isVisible().catch(() => false))) {
      await clickIf(a.page.locator("button, [role=menuitem], a").filter({ hasText: /^\s*(settings|my profile|profile|your account)\s*$/i }).first());
    }
    if (await logout().isVisible().catch(() => false)) {
      await logout().click();
      signedOut = true;
    } else {
      const names = await a.page.locator("button, [role=menuitem], a").allInnerTexts();
      console.log("SIGN-OUT CONTROL NOT FOUND; controls:", names.map((n) => n.replace(/\s+/g, " ").slice(0, 30)).filter(Boolean).join(" | ").slice(0, 2000));
    }
    check("A: signed out through the app's Log out", signedOut, "");
    await a.page.waitForTimeout(6_000);
    console.log("AFTER SIGN OUT:", a.page.url(), (await text(a.page)).slice(0, 300), "| auth keys:", await a.page.evaluate(() => Object.keys(window.localStorage).filter((k) => /auth|supabase|sb-/i.test(k)).join(",")));
    const atLogin = /\/companion\/login/.test(a.page.url()) && !(await text(a.page)).includes("PINEAPPLE-7");
    check("A: Sign Out lands on sign-in with no session left", atLogin && !(await a.page.evaluate(() => Object.keys(window.localStorage).some((k) => /supabase-auth|sb-.*auth/i.test(k)))), a.page.url());
    // Sign-out clears storage, so the harness marks "stay signed out" afterwards.
    await a.page.context().addCookies([{ name: "harness_signed_out", value: "1", url: BASE }]);
    await a.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
    await a.page.waitForTimeout(12_000);
    const outView = await text(a.page);
    console.log("AFTER RELOAD SIGNED OUT:", a.page.url(), "| auth keys:", await a.page.evaluate(() => Object.keys(window.localStorage).filter((k) => /auth|supabase|sb-/i.test(k)).join(",")));
    check("A: signed out, reopening /companion shows none of the conversation", !outView.includes("PINEAPPLE-7"), `${a.page.url()} ${outView.slice(0, 160)}`);
    // Sign back in (simulated: the harness restores A's session; the password form is not exercised here).
    await a.page.context().clearCookies();
    await a.page.evaluate((sess) => window.localStorage.setItem("companion-supabase-auth", sess), JSON.stringify(SESSION));
    await a.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
    await boot(a.page);
    check("A: conversation back after sign-in", (await text(a.page)).includes("Noted: PINEAPPLE-7"), (await text(a.page)).slice(0, 200));

    // Account B on the same database: none of A's conversation, records or work.
    const b = await openPage(browser, supa, log, session(USER_B));
    await b.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await boot(b.page);
    check("B: sees none of A's conversation", !(await text(b.page)).includes("PINEAPPLE-7"), "");
    await send(b.page, "please remember MANGO-3", "Noted: MANGO-3");
    const rows = supa.rows("companion_member_records") as Array<Record<string, unknown>>;
    const convoOf = (u: string) => JSON.stringify(rows.filter((r) => r.user_id === u && r.record_id === "companion-conversation-v1"));
    check("B: own saved conversation, separate from A's", convoOf(USER_B).includes("MANGO-3") && !convoOf(USER_B).includes("PINEAPPLE-7") && !convoOf(USER).includes("MANGO-3"), "");
    await b.page.reload({ waitUntil: "domcontentloaded" });
    await boot(b.page);
    const bView = await text(b.page);
    check("B: after reload, own conversation only", bView.includes("Noted: MANGO-3") && !bView.includes("PINEAPPLE-7"), bView.slice(0, 200));
    await a.page.reload({ waitUntil: "domcontentloaded" });
    await boot(a.page);
    const aView = await text(a.page);
    check("A: still own conversation only", aView.includes("Noted: PINEAPPLE-7") && !aView.includes("MANGO-3"), aView.slice(0, 200));
    check("Brain records kept per account", (await store.listMatters(USER_B)).every((m) => !/PINEAPPLE/.test(JSON.stringify(m))), "");
    console.log("CONTINUITY:\n" + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n"));
    expect(results.filter(([, ok]) => !ok).map(([n]) => n)).toEqual([]);
  });

  it("Remove from Recent (R1): the item leaves Continue, stays gone after reload on another device, and Undo brings it back", async () => {
    store = createMemoryBrainStore();
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    scripted.length = 0;
    const results: Array<[string, boolean, string]> = [];
    const check = (name: string, ok: boolean, detail = "") => { results.push([name, ok, detail]); };
    onTestFailed(() => console.log("REMOVE (stopped early):\n" + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n")));
    const boot = async (page: Page) => {
      const intro = page.getByRole("button", { name: "Continue to Welcome Home" });
      await Promise.race([intro.waitFor({ timeout: 300_000 }), page.locator("textarea").first().waitFor({ timeout: 300_000 })]).catch(() => undefined);
      if (await intro.isVisible().catch(() => false)) await intro.click();
      await page.waitForTimeout(8_000);
    };
    const box = (page: Page) => page.getByRole("button", { name: "Send", exact: true }).first().locator("xpath=ancestor::*[.//textarea][1]//textarea").first();
    const send = async (page: Page, t: string) => { await box(page).fill(t); await box(page).press("Enter"); await page.waitForTimeout(9_000); };
    const listText = async (page: Page) => (await page.getByTestId("global-daily-resume-list").innerText().catch(() => "")).replace(/\s+/g, " ");
    const toContinue = async (page: Page) => {
      if (!(await page.getByTestId("global-daily-resume-list").isVisible().catch(() => false))) {
        await page.getByRole("button", { name: "New Chat" }).first().click();
      }
      const shown = await page.getByTestId("global-daily-resume-list").waitFor({ timeout: 120_000 }).then(() => true, () => false);
      if (!shown) {
        await page.screenshot({ path: `${SHOTS}/remove-no-continue.png` });
        console.log("NO CONTINUE LIST:", (await page.locator("body").innerText()).replace(/\s+/g, " ").slice(0, 800), "| matters:", (await store.listMatters(USER)).map((m) => `${m.title}${m.hiddenFromRecent ? " (hidden)" : ""}`).join(" | "));
        throw new Error("Continue list not shown");
      }
      await page.waitForTimeout(3_000);
    };
    const indexOf = async (page: Page, re: RegExp) => {
      for (let i = 1; i <= 8; i += 1) {
        const t = await page.getByTestId(`global-daily-resume-item-${i}`).innerText().catch(() => null);
        if (t == null) return -1;
        if (re.test(t)) return i;
      }
      return -1;
    };

    const a = await openPage(browser, supa, log);
    await a.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await boot(a.page);
    await send(a.page, "I want to launch a course on ADHD-friendly productivity");
    await send(a.page, "I also need to plan a podcast episode about focus");
    // Continue is on today's Welcome card: open it on a fresh browser (New Chat in the same tab keeps the card closed for today).
    const a2 = await openPage(browser, supa, log);
    await a2.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await boot(a2.page);
    a.page = a2.page;
    await toContinue(a.page);
    const before = await listText(a.page);
    check("Continue lists both pieces of work", /course/i.test(before) && /podcast/i.test(before), before.slice(0, 200));
    const n = await indexOf(a.page, /podcast/i);
    await a.page.getByTestId(`global-daily-resume-menu-${n}`).click();
    await a.page.getByTestId(`global-daily-resume-actions-${n}`).getByRole("button", { name: "Remove from Recent" }).click();
    await a.page.waitForTimeout(4_000);
    const after = await listText(a.page);
    check("Remove from Recent: the podcast leaves Continue", !/podcast/i.test(after) && /course/i.test(after), after.slice(0, 200));
    check("an Undo notice is shown", await a.page.getByTestId("global-daily-undo").isVisible().catch(() => false), "");
    const pod = (await store.listMatters(USER)).find((m) => /podcast/i.test(m.title));
    check("saved on the account (hidden from Recent, not deleted)", pod?.hiddenFromRecent === true, JSON.stringify(pod?.hiddenFromRecent));

    const b = await openPage(browser, supa, log);
    await b.page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    await boot(b.page);
    await toContinue(b.page);
    const other = await listText(b.page);
    check("still gone on another device after reload", !/podcast/i.test(other) && /course/i.test(other), other.slice(0, 200));

    // Undo on a second removal brings it back.
    const c = await indexOf(b.page, /course/i);
    await b.page.getByTestId(`global-daily-resume-menu-${c}`).click();
    await b.page.getByTestId(`global-daily-resume-actions-${c}`).getByRole("button", { name: "Remove from Recent" }).click();
    await b.page.waitForTimeout(4_000);
    check("second removal: the course leaves Continue", !/course/i.test(await listText(b.page)), "");
    await b.page.getByTestId("global-daily-undo").getByRole("button", { name: "Undo" }).click();
    await b.page.waitForTimeout(4_000);
    check("Undo brings the course back", /course/i.test(await listText(b.page)), (await listText(b.page)).slice(0, 200));
    const course = (await store.listMatters(USER)).find((m) => /course/i.test(m.title));
    check("Undo saved on the account", course?.hiddenFromRecent !== true, "");
    console.log("REMOVE:\n" + results.map(([n2, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n2}${ok || !d ? "" : `  — ${d}`}`).join("\n"));
    expect(results.filter(([, ok]) => !ok).map(([n2]) => n2)).toEqual([]);
  });

  it("five workflows through the UI: Board exit/resume; Board → Projects → Brainstorm; Projects help choices; section removal; Research save → return → reopen", async () => {
    store = createMemoryBrainStore();
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    const { hashString } = await import("@/lib/memberSync/engine");
    const PROJECT = { id: "proj-five-1", name: "Course launch", goal: "Launch the ADHD productivity course", color: "#1e4f4f", goals: [], status: "in-progress", horizon: "now", archived: false, createdAt: "2026-10-01T10:00:00.000Z", updatedAt: "2026-10-01T10:00:00.000Z", nextAction: "", projectHomeRoomId: "writing-room" };
    supa.rows("companion_member_records").push({ id: crypto.randomUUID(), user_id: USER, domain: "member_store", record_id: "companion-projects-v1", status: "active", schema_version: 1, record_version: 1,
      payload: { format: "json", value: [PROJECT], hash: hashString(JSON.stringify([PROJECT])), savedAt: new Date().toISOString() }, created_at: new Date().toISOString(), updatedAt: new Date().toISOString() });
    scripted.length = 0;
    scripted.push(
      [/brainstorm some ideas/i, "BRAINSTORM-OK: here are five launch ideas for Course launch: 1. a free mini-lesson 2. a live Q&A 3. a waitlist bonus 4. a partner webinar 5. a 3-day challenge. Which one appeals to you?"],
      [/newsletter/i, "NEWSLETTER-OK: try 'The Focus Fix' or 'Tiny Wins Weekly'."],
      [/Course launch/i, "RESEARCH-OK: course launches that work for ADHD audiences usually pair a short free lesson with a live session; pricing between $49 and $99 converts best for first launches, and a waitlist two weeks ahead lifts sales."],
    );
    const results: Array<[string, boolean, string]> = [];
    const check = (name: string, ok: boolean, detail = "") => { results.push([name, ok, detail]); };
    const print = (title: string) => console.log(`${title}\n` + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n"));
    onTestFailed(() => print("FIVE (stopped early):"));
    const h = await openPage(browser, supa, log);
    const page = h.page;
    const text = async () => (await page.locator("body").innerText()).replace(/\s+/g, " ");
    const tid = (id: string) => page.getByTestId(id).first();
    const visible = (id: string, ms = 60_000) => tid(id).waitFor({ timeout: ms }).then(() => true, () => false);
    const menu = async (section: string, dest: string) => {
      await page.locator("[data-testid=estate-room-experience-menu] button.estate-room-experience-menu__trigger").filter({ visible: true }).first().click();
      await page.waitForTimeout(800);
      await tid(`estate-room-menu-section-${section}`).click();
      await page.waitForTimeout(800);
      await tid(`estate-open-${dest}`).click();
      await page.waitForTimeout(4_000);
    };
    const home = async () => {
      await page.locator("[data-testid=estate-room-experience-menu] button.estate-room-experience-menu__trigger").filter({ visible: true }).first().click();
      await page.waitForTimeout(800);
      await tid("estate-return-to-welcome-home-first").click();
      await page.waitForTimeout(4_000);
    };
    const openProject = async () => {
      if (await tid("project-home-detail").isVisible().catch(() => false)) return true;
      await menu("build", "projects");
      const gallery = await visible("project-homes-gallery");
      const card = page.getByTestId(`library-primary-${PROJECT.id}`).first();
      if (!(await card.isVisible().catch(() => false))) {
        await h.shot("five-gallery");
        console.log("GALLERY:", gallery, (await text()).slice(0, 1200), "| testids:", (await page.locator("[data-testid]").evaluateAll((els) => els.map((e) => e.getAttribute("data-testid")).filter((x) => /library|project|active-work/.test(x ?? "")))).slice(0, 40).join(","));
      }
      await card.click({ timeout: 15_000 });
      return visible("project-home-detail");
    };
    const chatBox = () => page.getByRole("button", { name: "Send", exact: true }).first().locator("xpath=ancestor::*[.//textarea][1]//textarea").first();
    const INTAKE = /What decision are you considering|Why does it matter now|What options are you considering|What concerns do you already have/;

    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    const intro = page.getByRole("button", { name: "Continue to Welcome Home" });
    await Promise.race([intro.waitFor({ timeout: 300_000 }), page.locator("textarea").first().waitFor({ timeout: 300_000 })]).catch(() => undefined);
    if (await intro.isVisible().catch(() => false)) await intro.click();
    await page.waitForTimeout(8_000);

    // 1. Board: start a question, leave mid-review, chat normally, come back and resume.
    await menu("get-advice", "boardroom");
    if (!(await page.locator("[data-testid=boardroom-entrance-input] textarea").isVisible().catch(() => false))) await tid("boardroom-talk-to-board").click().catch(() => undefined);
    await page.locator("[data-testid=boardroom-entrance-input] textarea").first().fill("Should our course launch in January or March?");
    await page.locator("[data-testid=boardroom-entrance-input]").getByRole("button", { name: "Send" }).first().click();
    check("Board: the question opens the review", await visible("board-director-intake-review"), "");
    await h.shot("five-1-board-review");
    await home();
    await chatBox().fill("any ideas for a newsletter name?");
    await chatBox().press("Enter");
    await page.getByText("NEWSLETTER-OK").last().waitFor({ timeout: 90_000 }).catch(() => undefined);
    await page.waitForTimeout(3_000);
    const chat = await text();
    check("Board: after leaving, ordinary chat gets the ordinary reply", chat.includes("NEWSLETTER-OK"), chat.slice(-200));
    check("Board: the unfinished review does not take over chat", !INTAKE.test(chat.slice(chat.lastIndexOf("newsletter name"))), chat.slice(-200));
    await menu("get-advice", "boardroom");
    check("Board: returning offers the unfinished discussion", await visible("boardroom-resume-discussion-card"), (await text()).slice(0, 200));
    await tid("boardroom-resume-discussion").click().catch(() => undefined);
    const resumed = await visible("board-director-intake-review");
    check("Board: Resume reopens the same question", resumed && (await tid("board-director-intake-review").innerText()).includes("January or March"), "");
    await tid("board-director-intake-begin").click().catch(() => undefined);
    check("Board: the discussion runs to advice", await visible("board-director-discussion-result", 120_000), "");
    await h.shot("five-1-board-advice");

    // 2+4. Board → Projects → Ask for Help choices → Brainstorm (stays on this project).
    check("Board → Projects: the project opens", await openProject(), "");
    await tid("project-home-ask-for-help").click();
    check("Projects help: the chooser opens for this project", await visible("project-help-chooser") && (await tid("project-help-subject").innerText()).includes("Course launch"), "");
    const choices = await page.locator("[data-testid^=project-help-choice-]").allInnerTexts();
    check("Projects help: all seven choices", ["Explain this", "Break it into smaller steps", "Research it", "Brainstorm ideas", "Compare options", "Get Board perspectives"].every((c) => choices.some((x) => x.includes(c))) && choices.some((x) => /Something else/.test(x)), choices.join(" | "));
    const turns0 = log.filter((l) => l.startsWith("POST /api/brain/turn")).length;
    await tid("project-help-choice-brainstorm").click();
    await page.getByText("BRAINSTORM-OK").last().waitFor({ timeout: 120_000 }).catch(() => undefined);
    await page.waitForTimeout(4_000);
    const bs = await text();
    check("Brainstorm: the ideas reply is shown", bs.includes("BRAINSTORM-OK"), bs.slice(-200));
    check("Brainstorm: no Board intake captured the help turn", !INTAKE.test(bs.slice(bs.lastIndexOf("BRAINSTORM-OK") - 400)), "");
    const focus = (await store.getMemberState(USER))?.focusMatterId;
    const fm = focus ? await store.getMatter(USER, focus) : null;
    check("Brainstorm: the help turn is about this project (work in focus carries its id)", Boolean(fm?.links?.project?.includes(PROJECT.id)), JSON.stringify(fm?.links));
    check("Brainstorm: one Brain turn for the help", log.filter((l) => l.startsWith("POST /api/brain/turn")).length - turns0 === 1, String(log.filter((l) => l.startsWith("POST /api/brain/turn")).length - turns0));
    await h.shot("five-2-brainstorm");

    // 3. Section removal asks what happens to its tasks.
    await openProject();
    await tid("project-home-see-the-project").click();
    check("Sections: the project's structure shows", await visible("project-home-breakdown"), "");
    await tid("project-section-input").fill("Marketing");
    await tid("project-add-section").click();
    await page.waitForTimeout(1_500);
    const sections = tid("project-sections");
    if (!(await sections.getByRole("button", { name: "+ Task", exact: true }).isVisible().catch(() => false))) {
      await sections.getByRole("button", { name: /Marketing/ }).first().click().catch(() => undefined);
      await page.waitForTimeout(800);
    }
    await sections.getByRole("button", { name: "+ Task", exact: true }).first().click();
    await sections.getByPlaceholder("Task", { exact: true }).first().fill("Write the launch email");
    await sections.getByRole("button", { name: "Add", exact: true }).first().click();
    await page.waitForTimeout(1_500);
    await tid("project-remove-section").click();
    const dlg = await visible("remove-section-dialog", 15_000) ? (await tid("remove-section-dialog").innerText()).replace(/\s+/g, " ") : "";
    check("Sections: removing asks what happens to its 1 task", /1 task/.test(dlg) && /What should happen to them\?/.test(dlg), dlg.slice(0, 200));
    await tid("remove-section-keep-tasks").click();
    await page.waitForTimeout(2_000);
    const after = (await tid("project-home-breakdown").innerText().catch(() => "")).replace(/\s+/g, " ");
    check("Sections: the section is gone and its task is kept in the Inbox", !/Marketing/.test(after.replace(/Write the launch email/, "")) && (await tid("project-inbox").innerText().catch(() => "")).includes("Write the launch email"), after.slice(0, 200));
    await h.shot("five-3-section-removed");

    // 5. Research from the project → answer saved → back → Reopen the exact research.
    await openProject();
    await tid("project-home-research").click();
    check("Research: opens for the project", await visible("research-library-panel"), "");
    await page.getByText("RESEARCH-OK").last().waitFor({ timeout: 120_000 }).catch(() => undefined);
    await page.waitForTimeout(4_000);
    check("Research: the answer is shown", (await text()).includes("RESEARCH-OK"), "");
    await h.shot("five-5-research");
    await tid("research-back-to-project").click().catch(() => undefined);
    check("Research: Back returns to the project", await visible("project-home-detail"), "");
    check("Research: the project lists it under Saved research", await visible("project-home-saved-research", 20_000), "");
    const chats0 = log.filter((l) => l.startsWith("(chat route)")).length;
    await tid("project-home-saved-research-reopen").click().catch(() => undefined);
    const reopened = await visible("research-library-panel");
    await page.waitForTimeout(4_000);
    const rv = await text();
    check("Research: Reopen opens that exact research (its answer, no 'couldn't find')", reopened && rv.includes("RESEARCH-OK") && !/couldn't find that saved research/i.test(rv), rv.slice(0, 200));
    check("Research: Reopen starts no new research (no model call)", log.filter((l) => l.startsWith("(chat route)")).length === chats0, String(log.filter((l) => l.startsWith("(chat route)")).length - chats0));
    await h.shot("five-5-reopened");

    print("FIVE:");
    expect(results.filter(([, ok]) => !ok).map(([n]) => n)).toEqual([]);
  });

  it("build integrity: changed outline needs fresh approval; 'keep writing' resumes the piece; a repeated send never makes another piece", async () => {
    store = createMemoryBrainStore();
    modelPrompts.length = 0;
    const supa = createFakeSupabase(USER);
    const log: string[] = [];
    const A = "Here's a course outline:\n\n1. Why ADHD Brains Stall\n   - The real reasons\n2. Tiny Systems\n   - Two-minute starts\n3. Momentum\n   - Body doubling\n\nDoes this structure work for you?";
    const B = "Here's a new course outline:\n\n1. Why ADHD Brains Stall\n   - The real reasons\n2. Tiny Systems\n   - Two-minute starts\n3. Your Toolkit\n   - Apps that help\n\nDoes this structure work for you?";
    scripted.length = 0;
    scripted.push([/new outline/i, B], [/outline for the course/i, A]);
    const results: Array<[string, boolean, string]> = [];
    const check = (n: string, ok: boolean, d = "") => results.push([n, ok, d]);
    const h = await openPage(browser, supa, log);
    const { page } = h;
    await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded", timeout: 600_000 });
    const first = page.getByRole("button", { name: "Continue to Welcome Home" });
    await Promise.race([first.waitFor({ timeout: 300_000 }), page.locator("textarea").first().waitFor({ timeout: 300_000 })]).catch(() => undefined);
    if (await first.isVisible().catch(() => false)) await first.click();
    const chatBox = () => page.getByRole("button", { name: "Send", exact: true }).first().locator("xpath=ancestor::*[.//textarea][1]//textarea").first();
    const ensureChat = async () => {
      if (await chatBox().isVisible().catch(() => false)) return;
      await page.goto(`${BASE}/companion`, { waitUntil: "domcontentloaded" });
      await chatBox().waitFor({ timeout: 120_000 });
      await page.waitForTimeout(5_000);
    };
    await ensureChat();
    const traces = async () => (await store.listTraces!(USER, 500)).length;
    const say = async (text: string, waitFor?: RegExp | string, ms = 6_000) => {
      await ensureChat();
      await chatBox().fill(text);
      await chatBox().press("Enter");
      if (waitFor) await page.getByText(waitFor).last().waitFor({ timeout: 180_000 }).catch(() => undefined);
      await page.waitForTimeout(ms);
    };
    const course = async () => (await store.listMatters(USER)).find((m) => /course/i.test(m.title))!;
    const rows = () => supa.rows("companion_creation_workspaces").length;
    await say("I want to launch a course on ADHD-friendly productivity");
    await say("give me an outline for the course", "Does this structure work for you?");
    await say("looks great", "Saved as the approved outline");
    const approvedA = (await course()).claims.find((c) => c.key === "approved_outline" && c.status === "current");
    await say("yes lesson 1", "WORKING DRAFT", 4_000);
    const pieceP = (await course()).links?.creation?.at(-1);
    check("lesson 1 built into one piece", rows() === 1 && Boolean(pieceP), `rows=${rows()}`);
    // Repeated send: the same build request twice, back to back.
    await ensureChat();
    const t0 = await traces();
    await chatBox().fill("write the full course in Create");
    await chatBox().press("Enter");
    await page.waitForTimeout(150);
    if (await chatBox().isVisible().catch(() => false)) { await chatBox().fill("write the full course in Create"); await chatBox().press("Enter"); }
    await page.getByText("WORKING DRAFT").first().waitFor({ timeout: 240_000 }).catch(() => undefined);
    await page.waitForTimeout(8_000);
    check("repeated send is one Brain turn", (await traces()) - t0 === 1, `${(await traces()) - t0} traces`);
    check("repeated send never makes another piece", rows() === 1 && (await course()).links?.creation?.length === 1, `rows=${rows()} links=${JSON.stringify((await course()).links?.creation)}`);
    // Changed outline: shown, not approved; building asks for fresh approval.
    await say("give me a new outline for the course", "Your Toolkit");
    await say("write the full course in Create", /different from the one you approved/);
    const afterAsk = (await course()).claims.filter((c) => c.key === "approved_outline" && c.status === "current");
    check("changed outline is not approved by a build request", afterAsk.length === 1 && afterAsk[0]!.id === approvedA?.id, "");
    check("the confirmation shows the new outline", (await page.locator("body").innerText()).includes("Your Toolkit"), "");
    // Meanwhile "keep writing" resumes the existing piece (from the outline it was started from).
    await say("keep writing", undefined, 10_000);
    check("'keep writing' resumes the existing piece", rows() === 1 && (await course()).links?.creation?.length === 1, `rows=${rows()}`);
    // A fresh yes to the new outline: saved as approved, and a new piece from it.
    await say("write the full course in Create", /different from the one you approved/);
    await say("yes", "WORKING DRAFT", 8_000);
    const now = (await course()).claims.filter((c) => c.key === "approved_outline" && c.status === "current");
    check("fresh yes approves the new outline", now.length === 1 && now[0]!.value.includes("Your Toolkit") && now[0]!.provenance.quote === "yes", now.map((c) => c.value.slice(0, 40)).join("|"));
    check("the new outline gets its own piece; the old piece is untouched", rows() === 2, `rows=${rows()}`);
    console.log("\nBUILD INTEGRITY:\n" + results.map(([n, ok, d]) => `${ok ? "PASS" : "FAIL"}  ${n}${ok || !d ? "" : `  — ${d}`}`).join("\n"));
    if (results.some(([, ok]) => !ok)) console.log("TRACES:\n" + (await store.listTraces!(USER, 500)).sort((a, b) => a.at.localeCompare(b.at)).map((t) => `${t.inputPreview?.slice(0, 50)} → ${t.interpretation}${t.handled ? " [h]" : ""}`).join("\n"));
    expect(results.filter(([, ok]) => !ok).map(([n]) => n)).toEqual([]);
  });
});
