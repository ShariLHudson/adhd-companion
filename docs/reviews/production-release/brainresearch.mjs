// Brain research continuity — signed-in journeys on the repair branch, with database checks.
// Account A carries the member's real research titles (incl. the two duplicate college runs and
// the mistaken "None of those…" run). Spark's language model is stubbed; Brain, routing, stores,
// account sync and the database are real.
import { launch, stubModel, login, send as rawSend, chatText, read, sleep, waitWorkspace, waitSynced, signOut } from './common.mjs';
import { execSync } from 'child_process';
import fs from 'fs';

const BASE = process.argv[2] || 'http://localhost:3103';
const results = [];
// The chat box can be off screen after a room opens: come back to the conversation first (reload).
async function send(page, text, wait) {
  const box = await page.$('[data-testid=companion-communication-input]');
  if (!box || !(await box.isVisible().catch(() => false))) { await page.reload({ waitUntil: 'load' }); await waitWorkspace(page); }
  return rawSend(page, text, wait);
}
const rec = (id, ok, detail) => { results.push({ id, ok, detail }); console.log(`${ok ? 'PASS' : 'FAIL'} ${id} ${JSON.stringify(detail).slice(0, 700)}`); };
const sql = (q) => execSync(`psql -h 127.0.0.1 -p 54322 -U postgres -At -F '|' -c ${JSON.stringify(q)}`, { env: { ...process.env, PGPASSWORD: 'postgres' } }).toString().trim();
const uid = (who) => sql(`select id from auth.users where email like '${who === 'A' ? 'member-a' : 'member-b'}@%'`);
const A = uid('A');
const dbCollections = () => {
  const raw = sql(`select payload->>'value' from public.companion_member_records where user_id='${A}' and domain='member_store' and record_id='companion-research-library-collections-v1'`);
  if (!raw) return [];
  const v = JSON.parse(raw); return (typeof v === 'string' ? JSON.parse(v) : v);
};
const dbMatters = () => sql(`select record_id||'|'||(payload->>'title')||'|'||coalesce((select string_agg(c->>'key', ',') from jsonb_array_elements(payload->'claims') c),'') from public.companion_member_records where user_id='${A}' and domain='brain_matter' and status='active'`).split('\n').filter(Boolean).map((l) => { const [id, title, keys] = l.split('|'); return { id, title, keys: keys ? keys.split(',') : [] }; });
const dbFocus = () => { const raw = sql(`select payload->>'focusMatterId' from public.companion_member_records where user_id='${A}' and domain='brain_member'`); return raw || null; };
const lastReply = async (p, asked) => {
  // A room may have opened over the conversation: come back to it (the conversation is kept).
  if (!(await p.$('[data-testid=welcome-home-chat-body]'))) { await sleep(1500); await p.reload({ waitUntil: 'load' }); await waitWorkspace(p); }
  const t = await chatText(p);
  const key = asked.length < 4 ? `\n${asked}\n` : asked.slice(0, 40);
  const i = t.lastIndexOf(key);
  return i >= 0 ? t.slice(i + (asked.length < 4 ? key.length : asked.length)).trim().slice(0, 600) : t.slice(-600);
};

// --- real titles from the account (2026-10-09), in the record shape Research saves ---
const seedTpl = JSON.parse(fs.readFileSync('/tmp/claude-0/mp/pw/research-seed.json', 'utf8'));
const colTpl = JSON.parse(seedTpl['companion-research-library-collections-v1'])[0];
const sesTpl = JSON.parse(seedTpl['companion-research-library-sessions-v1'])[0];
const REAL = [
  ['mv0xekyo', 'What should someone know about None of those. Open my research about g', '2026-10-09T12:12:50.208Z'],
  ['mv0voxu2', 'pros and cons of a 73 year old woman going back to college', '2026-10-09T11:24:54.218Z'],
  ['mv09iyyy', 'pros and cons of a 73 year old woman going back to college', '2026-10-09T01:04:24.202Z'],
  ['muygzgy8', 'What should someone know about sources 1 and 3 to make a good next dec', '2026-10-07T18:57:38.960Z'],
  ['mux3v3yq', 'Price the course', '2026-10-06T20:02:34.321Z'],
];
const cols = REAL.map(([k, title, at]) => ({ ...colTpl, id: `rcol_${k}`, title, topic: title, researchQuestion: title, createdAt: at, updatedAt: at, status: 'saved', matterId: undefined, inquiryId: `rin_${k}`, researchSessionIds: [`rs_${k}`] }));
// Like the account's real threads (1–13 turns each): a question and Spark's answer.
const turns = (k, title, at) => [
  { id: `rt_${k}_1`, role: 'user', content: title, createdAt: at },
  { id: `rt_${k}_2`, role: 'assistant', content: `What I found about ${title}.`, createdAt: at },
];
const sess = REAL.map(([k, title, at]) => ({ ...sesTpl, conversationTurns: turns(k, title, at), id: `rs_${k}`, title, primaryTopic: title, researchQuestion: title, currentQuestion: title, createdAt: at, updatedAt: at, lastOpenedAt: at, currentResearchCollectionId: `rcol_${k}`, inquiryId: `rin_${k}` }));
const seed = {
  'companion-research-library-collections-v1': JSON.stringify(cols),
  'companion-research-library-sessions-v1': JSON.stringify(sess),
};

const RENAME_ASKED = "Rename the research session I started a few minutesago (the one that begins 'What should someone know aout None of those') to 'AUDIT test - college at 73'.";
const BACK_TO_COLLEGE = "Let's go back to the college research I was just dong and pick up where I left off.";
const NONE_OF_THOSE = 'None of those. Open my research about going back tocollege at 73.';

const b = await launch();
const ctx = await b.newContext({ viewport: { width: 1400, height: 950 } });
const p = await ctx.newPage();
const log = [];
await stubModel(p, log, (last) => { console.log('MODEL after', results.map((r) => r.id).slice(-1)[0] || 'start', '|', last.slice(0, 80).replace(/\n/g, ' ')); return `Model reply to: ${last.slice(0, 50)}`; });
await login(p, BASE, 'A');
await p.evaluate((kv) => { for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v); }, seed);
await waitSynced(p);
await p.reload({ waitUntil: 'load' }); await waitWorkspace(p);
const before = dbCollections();
rec('B0 seed in account', before.length === 5, { titles: before.map((c) => c.title) });

// Work in focus: the dental proposal.
await send(p, 'I want to plan a Harbor Dental client workshop proposal', 7000);
await sleep(3000);
let ms = dbMatters();
const dental = ms.find((m) => /dental/i.test(m.title));
rec('B1 dental work in focus', Boolean(dental) && dbFocus() === dental?.id, { matters: ms.map((m) => m.title), focus: dbFocus() });

// 1 · Rename existing research (the audit's exact words).
await send(p, RENAME_ASKED, 6000);
let reply = await lastReply(p, RENAME_ASKED);
await waitSynced(p);
let after = dbCollections();
const renamed = after.find((c) => c.id === 'rcol_mv0xekyo');
ms = dbMatters();
rec('R1 rename research (UI + database)', /Renamed "What should someone know about None of those[^"]*" to "AUDIT test - college at 73"\. It's saved to your account\./.test(reply)
  && renamed?.title === 'AUDIT test - college at 73' && after.length === 5
  && !ms.find((m) => m.id === dental.id).keys.some((k) => k.startsWith('scope:') || k.startsWith('requirement:')), {
  reply, dbTitle: renamed?.title, count: after.length, dentalKeys: ms.find((m) => m.id === dental.id).keys });
const localTitle = JSON.parse((await read(p, 'companion-research-library-sessions-v1')) || '[]').find((s) => s.id === 'rs_mv0xekyo')?.title;
rec('R1b the thread carries the new name too', localTitle === 'AUDIT test - college at 73', { localTitle });

// 2 · Resume existing research (no new one).
await send(p, BACK_TO_COLLEGE, 7000);
reply = await lastReply(p, BACK_TO_COLLEGE);
const onScreen = await p.evaluate(() => document.body.innerText.includes('pros and cons of a 73 year old woman going back to college'));
after = dbCollections();
// After R1 the renamed record ("AUDIT test - college at 73") also says college: two different
// records fit, so Spark must ask — then the member's number opens exactly that one.
const askedBoth = /Which one should I open\?/.test(reply) && reply.includes('AUDIT test - college at 73') && reply.includes('pros and cons of a 73 year old woman going back to college');
await send(p, '2', 6000);
const pickReply = await lastReply(p, '2');
after = dbCollections();
rec('S1 "the college research" (now two different fits): asks, then opens the one picked; nothing new', askedBoth && /Opening your research "pros and cons of a 73 year old woman going back to college" from Oct 9\. Nothing new was started\./.test(pickReply) && after.length === 5, { reply, pickReply: pickReply.slice(0, 200), count: after.length });

// Reload and continue.
await p.reload({ waitUntil: 'load' }); await waitWorkspace(p);
const kept = (await chatText(p)).includes('AUDIT test - college at 73');
rec('L1 reload keeps the conversation', kept, { kept });

await send(p, NONE_OF_THOSE, 7000);
reply = await lastReply(p, NONE_OF_THOSE);
after = dbCollections();
rec('S2 "None of those. Open my research about…" opens it, nothing new', /^Opening your research "pros and cons/.test(reply) && after.length === 5 && !after.some((c) => /None of those\. Open my research about going back tocollege/.test(c.title)), { reply, count: after.length });

// 3 · Repeat the same request.
await p.reload({ waitUntil: 'load' }); await waitWorkspace(p);
await send(p, 'Research pros and cons of a 73 year old woman going back to college', 7000);
reply = await lastReply(p, 'Research pros and cons of a 73 year old woman going back to college');
await waitSynced(p);
after = dbCollections();
rec('P1 repeating the same research reopens it (no copy)', /You already have research on this from Oct 9 — I opened it instead of starting another copy/.test(reply) && after.length === 5, { reply, count: after.length });

// 4 · Switch between college and Harbor Dental work.
await p.reload({ waitUntil: 'load' }); await waitWorkspace(p);
await send(p, "Let's go back to the Harbor Dental proposal", 6000);
reply = await lastReply(p, "Let's go back to the Harbor Dental proposal");
rec('W1 back to the dental work', dbFocus() === dental.id, { reply: reply.slice(0, 200), focus: dbFocus() });
await send(p, 'Open my research about going back to college at 73', 7000);
reply = await lastReply(p, 'Open my research about going back to college at 73');
ms = dbMatters();
rec('W2 college research opens; dental work untouched; focus kept', /^Opening your research "pros and cons/.test(reply) && dbFocus() === dental.id
  && !ms.find((m) => m.id === dental.id).keys.some((k) => /^research/.test(k)), { reply: reply.slice(0, 160), focus: dbFocus(), dentalKeys: ms.find((m) => m.id === dental.id).keys });

// 3b · Research saved while the dental work is in focus (the Research room's own save → Brain).
const prop = await p.evaluate(async () => {
  const r = await fetch('/api/brain/propose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: 'research', proposals: [{ kind: 'research_finding', researchId: 'rcol_mv0voxu2', question: 'pros and cons of a 73 year old woman going back to college', summary: 'Free College for Seniors: States That Pay Your Tuition', sourceCount: 3, strength: 'moderate', sourced: true }] }) });
  return { status: r.status, body: await r.json().catch(() => null) };
});
ms = dbMatters();
const collegeMatter = ms.find((m) => m.keys.includes('research:rcol_mv0voxu2'));
rec('C1 college research files on its own work, never the dental work', prop.status === 200 && collegeMatter && collegeMatter.id !== dental.id && dbFocus() === dental.id
  && !ms.find((m) => m.id === dental.id).keys.some((k) => /^research/.test(k)), { prop, collegeMatter: collegeMatter?.title, focus: dbFocus() });

// 5 · Correct a mistaken work reference.
await p.reload({ waitUntil: 'load' }); await waitWorkspace(p);
await send(p, 'Go back to my podcast research', 6000);
reply = await lastReply(p, 'Go back to my podcast research');
const askedPick = /couldn't find saved research that matches "podcast", so nothing was opened and nothing new was started\. Is it one of these\?/.test(reply);
await send(p, '2', 6000);
reply = await lastReply(p, '2');
const picked = /^Opening your research "/.test(reply);
after = dbCollections();
rec('X1 a wrong reference starts nothing; picking from the list opens that one', askedPick && picked && after.length === 5, { askedPick, picked, tail: (await chatText(p)).slice(-260), count: after.length });

await send(p, "Rename the dental workshop proposal to 'Harbor Dental workshop 2026'", 6000);
reply = await lastReply(p, "Rename the dental workshop proposal to 'Harbor Dental workshop 2026'");
ms = dbMatters();
rec('X2 rename a piece of work (read back from the database)', /^Renamed ".*Harbor Dental[^"]*" to "Harbor Dental workshop 2026"\. It's saved\./.test(reply) && ms.find((m) => m.id === dental.id)?.title === 'Harbor Dental workshop 2026', { reply, dbTitle: ms.find((m) => m.id === dental.id)?.title });

// 6 · Ordinary-language visual request is not filed on the work in focus.
const beforeKeys = dbMatters().find((m) => m.id === dental.id).keys.length;
await send(p, 'Here is what I know: ADHD weakens executive function. Executive function includes working memory, motivation and environment.', 6000);
await send(p, 'Create a concept map from this information', 8000);
const trace = sql(`select payload->>'interpretation'||'|'||(payload->>'ops') from public.companion_member_records where user_id='${A}' and domain='brain_trace' and payload->>'inputPreview' like 'Create a concept map%' order by updated_at desc limit 1`);
const dentalAfter = dbMatters().find((m) => m.id === dental.id);
const footholdText = sql(`select coalesce(payload->'foothold'->>'lastAction','') from public.companion_member_records where user_id='${A}' and domain='brain_matter' and record_id='${dental.id}'`);
const visualShown = await p.evaluate(() => /concept map|Here's your visual|Visual Thinking|Loose Thinking/i.test(document.body.innerText));
rec('V1 concept map of pasted notes: not a task on the dental work', !/^work_task/.test(trace) && dentalAfter.keys.length === beforeKeys && !/concept map/i.test(footholdText), { trace, footholdText, visualShown, keysBefore: beforeKeys, keysAfter: dentalAfter.keys.length });

// 7 · Failed write: the account refuses the save → never "saved".
await p.reload({ waitUntil: 'load' }); await waitWorkspace(p);
await p.route('**/rest/v1/companion_member_records**', (route) => (['POST', 'PATCH'].includes(route.request().method()) ? route.fulfill({ status: 503, body: '{}' }) : route.continue()));
await send(p, "Rename my research about going back to college at 73 to 'College decision 2026'", 12000);
reply = await lastReply(p, "Rename my research about going back to college at 73 to 'College decision 2026'");
const dbTitleWhileFailing = dbCollections().find((c) => c.id === 'rcol_mv0voxu2')?.title;
rec('F1 failed save is not reported as saved', /hasn't reached your account yet, so it isn't saved everywhere/.test(reply) && !/saved to your account/.test(reply) && dbTitleWhileFailing === 'pros and cons of a 73 year old woman going back to college', { reply, dbTitleWhileFailing });
await p.unroute('**/rest/v1/companion_member_records**');
await waitSynced(p, 40000);
const dbTitleAfterRetry = dbCollections().find((c) => c.id === 'rcol_mv0voxu2')?.title;
rec('F2 the change reaches the account once it is reachable again', dbTitleAfterRetry === 'College decision 2026', { dbTitleAfterRetry });

// 8 · Account isolation (second authorized test account).
await signOut(p);
const p2 = await (await b.newContext({ viewport: { width: 1400, height: 950 } })).newPage();
await stubModel(p2, [], () => 'Noted.');
await login(p2, BASE, 'B');
await waitSynced(p2);
const bCols = JSON.parse((await read(p2, 'companion-research-library-collections-v1')) || '[]');
await send(p2, 'Open my research about going back to college at 73', 6000);
const bReply = await lastReply(p2, 'Open my research about going back to college at 73');
rec('I1 second account sees none of the first account\'s research', !bCols.some((c) => /college|AUDIT test|Harbor/i.test(c.title)) && !/Opening your research/.test(bReply), { bCount: bCols.length, bReply: bReply.slice(0, 200) });

const explores = log.filter((l) => /Help me explore this/.test(l.last)).length;
rec('N1 no research run was started by any resume, rename or repeat', explores === 0, { exploreModelCalls: explores, modelCalls: log.length });
fs.writeFileSync('/tmp/claude-0/mp/pw/brainresearch-results.json', JSON.stringify(results, null, 2));
console.log(`SUMMARY ${results.filter((r) => r.ok).length}/${results.length}`);
await b.close();
