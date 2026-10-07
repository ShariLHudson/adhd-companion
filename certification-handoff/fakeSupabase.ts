/**
 * A small in-memory stand-in for the Supabase REST + Auth endpoints the
 * companion page calls from the browser (page harness only; never shipped).
 * Same request shapes as supabase-js; rows live in memory for one run.
 */
import type { Route } from "playwright";

type Row = Record<string, unknown>;

export function createFakeSupabase(userId: string) {
  const tables = new Map<string, Row[]>();
  const unhandled: string[] = [];
  const rows = (t: string) => {
    if (!tables.has(t)) tables.set(t, []);
    return tables.get(t)!;
  };
  const keyOf = (t: string, r: Row, onConflict: string | null) => {
    const cols = (onConflict ?? (t === "companion_member_records" ? "user_id,domain,record_id" : "id")).split(",");
    return cols.map((c) => String(r[c.trim()] ?? "")).join("|");
  };
  function matches(r: Row, params: URLSearchParams): boolean {
    for (const [k, v] of params) {
      if (["select", "order", "limit", "offset", "on_conflict", "columns"].includes(k)) continue;
      const [op, ...rest] = v.split(".");
      const val = rest.join(".");
      const cell = r[k];
      if (op === "eq" && String(cell) !== val) return false;
      if (op === "neq" && String(cell) === val) return false;
      if (op === "in") {
        const list = val.replace(/^\(|\)$/g, "").split(",").map((s) => s.replace(/^"|"$/g, ""));
        if (!list.includes(String(cell))) return false;
      }
      if (op === "is" && !(val === "null" ? cell == null : String(cell) === val)) return false;
      if ((op === "gt" || op === "gte" || op === "lt" || op === "lte") && cell != null) {
        const a = String(cell), b = val;
        if (op === "gt" && !(a > b)) return false;
        if (op === "gte" && !(a >= b)) return false;
        if (op === "lt" && !(a < b)) return false;
        if (op === "lte" && !(a <= b)) return false;
      }
    }
    return true;
  }
  function order(list: Row[], params: URLSearchParams): Row[] {
    const o = params.get("order");
    let out = [...list];
    if (o) {
      const [col, dir] = o.split(",")[0]!.split(".");
      out.sort((a, b) => String(a[col!] ?? "").localeCompare(String(b[col!] ?? "")) * (dir === "desc" ? -1 : 1));
    }
    const limit = Number(params.get("limit") ?? "0");
    return limit ? out.slice(0, limit) : out;
  }

  /** The account a request acts as: the bearer token's subject (row-level security, as in Supabase). */
  function callerOf(headers: Record<string, string>): string {
    const token = (headers["authorization"] ?? "").replace(/^Bearer\s+/i, "");
    return userOfToken(token) ?? userId;
  }
  const owned = (r: Row, caller: string) => !("user_id" in r) || r.user_id == null || r.user_id === caller;

  async function handle(route: Route) {
    const req = route.request();
    const url = new URL(req.url());
    const caller = callerOf(req.headers());
    const method = req.method();
    const accept = req.headers()["accept"] ?? "";
    const single = accept.includes("vnd.pgrst.object");
    const json = (status: number, body: unknown) =>
      route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
    if (method === "OPTIONS") {
      return route.fulfill({ status: 200, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "*", "access-control-allow-methods": "*" } });
    }
    if (url.pathname.startsWith("/auth/v1/user")) return json(200, { id: caller, aud: "authenticated", role: "authenticated", email: `${caller.slice(-4)}@example.test` });
    if (url.pathname.startsWith("/auth/v1/token")) return json(200, session(caller));
    if (url.pathname.startsWith("/auth/v1/logout")) return json(204, {});
    const m = url.pathname.match(/^\/rest\/v1\/([\w-]+)$/);
    if (!m) {
      unhandled.push(`${method} ${url.pathname}`);
      return json(200, null);
    }
    const table = m[1]!;
    if (table === "rpc") return json(200, null);
    const list = rows(table);
    if (method === "GET" || method === "HEAD") {
      const found = order(list.filter((r) => owned(r, caller) && matches(r, url.searchParams)), url.searchParams);
      if (single) return found.length === 1 ? json(200, found[0]) : json(406, { code: "PGRST116", message: "no rows" });
      return json(200, found);
    }
    if (method === "POST") {
      const body = JSON.parse(req.postData() ?? "null");
      const items: Row[] = Array.isArray(body) ? body : [body];
      const prefer = req.headers()["prefer"] ?? "";
      const upsert = prefer.includes("merge-duplicates") || prefer.includes("ignore-duplicates");
      const onConflict = url.searchParams.get("on_conflict");
      const now = new Date().toISOString();
      const out: Row[] = [];
      for (const it of items) {
        if (it.user_id != null && it.user_id !== caller) return json(403, { code: "42501", message: "row-level security" });
        const k = keyOf(table, it, onConflict);
        const idx = list.findIndex((r) => keyOf(table, r, onConflict) === k);
        const base = { id: it.id ?? crypto.randomUUID(), created_at: now, user_id: it.user_id ?? caller };
        if (idx >= 0 && !owned(list[idx]!, caller)) return json(403, { code: "42501", message: "row-level security" });
        if (idx >= 0 && upsert) {
          list[idx] = { ...list[idx], ...it, updated_at: it.updated_at ?? now };
          out.push(list[idx]!);
        } else if (idx >= 0) {
          return json(409, { code: "23505", message: "duplicate key" });
        } else {
          const row = { ...base, updated_at: now, ...it };
          list.push(row);
          out.push(row);
        }
      }
      return single ? json(201, out[0]) : json(201, out);
    }
    if (method === "PATCH") {
      const body = JSON.parse(req.postData() ?? "{}") as Row;
      const hit = list.filter((r) => owned(r, caller) && matches(r, url.searchParams));
      for (const r of hit) Object.assign(r, body, { updated_at: body.updated_at ?? new Date().toISOString() });
      return single ? (hit.length === 1 ? json(200, hit[0]) : json(406, { code: "PGRST116" })) : json(200, hit);
    }
    if (method === "DELETE") {
      const keep = list.filter((r) => !(owned(r, caller) && matches(r, url.searchParams)));
      tables.set(table, keep);
      return json(200, []);
    }
    unhandled.push(`${method} ${url.pathname}`);
    return json(200, null);
  }
  return { handle, tables, rows, unhandled };
}

export function fakeJwt(userId: string): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({ sub: userId, role: "authenticated", aud: "authenticated", exp: Math.floor(Date.now() / 1000) + 86400 })}.c2ln`;
}

/** The subject of a harness token (null when it is not one). */
export function userOfToken(token: string): string | null {
  const [, payload, sig] = token.split(".");
  if (!payload || sig !== "c2ln") return null;
  try {
    const sub = (JSON.parse(Buffer.from(payload, "base64url").toString()) as { sub?: string }).sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

export function session(userId: string) {
  return {
    access_token: fakeJwt(userId),
    refresh_token: "harness-refresh",
    token_type: "bearer",
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    user: { id: userId, aud: "authenticated", role: "authenticated", email: `${userId.slice(-4)}@example.test` },
  };
}
