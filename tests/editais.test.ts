import { test } from "node:test";
import assert from "node:assert/strict";
import editais from "../src/data/editais.json" with { type: "json" };
import { callState, daysSince, fmtDate, isStale } from "../src/lib/editais.ts";
import type { Call } from "../src/lib/editais.ts";

const call = (start: string | undefined, end: string): Call => ({ name: "x", org: "y", level: "Mestrado", area: "z", start, end, detail: "", url: "https://exemplo.org" });
const dia = (m: number, d: number, h = 12) => new Date(2026, m - 1, d, h, 0, 0);

test("edital que vence em 7 dias está aberto e em destaque", () => {
  const r = callState(call("2026-11-01", "2026-11-23"), dia(11, 16));
  assert.deepEqual([r.status, r.days, r.soon], ["ab", 7, true]);
});
test("edital que vence em 8 dias não tem destaque", () => {
  const r = callState(call("2026-11-01", "2026-11-24"), dia(11, 16));
  assert.deepEqual([r.status, r.days, r.soon], ["ab", 8, false]);
});
test("no último dia (até 23:59) ainda está aberto; depois, encerrado", () => {
  assert.equal(callState(call("2026-11-01", "2026-11-23"), dia(11, 23, 23)).status, "ab");
  assert.equal(callState(call("2026-11-01", "2026-11-23"), dia(11, 24, 0)).status, "enc");
});
test("antes do início é programado", () => {
  assert.equal(callState(call("2026-12-09", "2027-01-22"), dia(11, 16)).status, "prog");
});
test("sem data de início, considera aberto até o fim", () => {
  assert.equal(callState(call(undefined, "2026-12-04"), dia(11, 16)).status, "ab");
});
test("fmtDate formata em português", () => {
  assert.equal(fmtDate("2026-11-03"), "03 nov 2026");
});

test("encerrado há mais de 30 dias fica oculto; até 30 dias, não", () => {
  assert.equal(isStale(call("2026-09-01", "2026-10-20"), dia(11, 23)), true);
  assert.equal(isStale(call("2026-09-01", "2026-10-24"), dia(11, 23)), false);
  assert.equal(isStale(call("2026-11-01", "2026-12-04"), dia(11, 23)), false);
});
test("daysSince conta dias de calendário", () => {
  assert.equal(daysSince("2026-11-16", dia(11, 23, 23)), 7);
});

test("dados: todos os editais têm os campos e datas válidas", () => {
  const vistos = new Set<string>();
  for (const e of editais as Call[]) {
    const nome = `${e.org} · ${e.name}`;
    for (const k of ["name", "org", "level", "area", "detail", "url"] as const) assert.ok(e[k]?.trim(), `${nome}: campo "${k}" vazio`);
    assert.match(e.url, /^https:\/\//, `${nome}: link precisa começar com https://`);
    const datas = [e.start, e.end].filter(Boolean) as string[];
    for (const d of datas) {
      assert.match(d, /^\d{4}-\d{2}-\d{2}$/, `${nome}: data "${d}" fora do formato AAAA-MM-DD`);
      const [y, m, dd] = d.split("-").map(Number);
      const real = new Date(y, m - 1, dd);
      assert.ok(real.getFullYear() === y && real.getMonth() === m - 1 && real.getDate() === dd, `${nome}: data "${d}" não existe`);
    }
    if (e.verificado) assert.match(e.verificado, /^\d{4}-\d{2}-\d{2}$/, `${nome}: "verificado" fora do formato`);
    if (e.start) assert.ok(e.start <= e.end, `${nome}: início depois do fim`);
    const chave = `${nome}|${e.end}`;
    assert.ok(!vistos.has(chave), `${nome}: edital duplicado`);
    vistos.add(chave);
  }
});
