import { test } from "node:test";
import assert from "node:assert/strict";
import { buildIcs, googleCalendarUrl, icsFileName } from "../src/lib/ics.ts";
import { reportEditalMailto, suggestEditalMailto } from "../src/lib/contato.ts";
import type { Call } from "../src/lib/editais.ts";

const c = (end: string): Call => ({ name: "Engenharia Elétrica; Computação, Aplicada", org: "UFMA", level: "Mestrado e Doutorado", area: "Engenharias", end, detail: "45 vagas de mestrado.", url: "https://exemplo.org/edital?a=1&b=2" });

test("ics: evento de dia inteiro no último dia, com alerta de 3 dias", () => {
  const ics = buildIcs(c("2026-11-23"), new Date(Date.UTC(2026, 10, 20, 12)));
  assert.match(ics, /DTSTART;VALUE=DATE:20261123\r\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20261124\r\n/);
  assert.match(ics, /DTSTAMP:20261120T120000Z\r\n/);
  assert.match(ics, /TRIGGER:-P3D/);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR") && ics.trimEnd().endsWith("END:VCALENDAR"));
});
test("ics: o dia seguinte vira o mês e o ano corretamente", () => {
  assert.match(buildIcs(c("2026-12-31")), /DTEND;VALUE=DATE:20270101/);
});
test("ics: escapa vírgula e ponto e vírgula e respeita 75 bytes por linha", () => {
  const ics = buildIcs(c("2026-11-23"));
  assert.ok(ics.replace(/\r\n /g, "").includes("Engenharia Elétrica\\; Computação\\, Aplicada")); // desfaz a quebra de linha antes de comparar
  for (const linha of ics.split("\r\n")) assert.ok(new TextEncoder().encode(linha).length <= 75, `linha longa: ${linha}`);
});
test("ics: nome de arquivo e link do Google Agenda", () => {
  assert.equal(icsFileName(c("2026-11-23")), "edital-ufma-engenharia-eletrica-computacao-aplicada.ics");
  const g = googleCalendarUrl(c("2026-11-23"));
  assert.ok(g.startsWith("https://calendar.google.com/calendar/render?action=TEMPLATE"));
  assert.ok(g.includes("dates=20261123/20261124"));
});
test("e-mail: reporte e sugestão saem preenchidos para o endereço certo", () => {
  const r = reportEditalMailto("a@b.com", c("2026-11-23"), "https://site/?aba=editais");
  assert.ok(r.startsWith("mailto:a@b.com?subject="));
  assert.ok(decodeURIComponent(r).includes("[PósGuia] Corrigir edital: UFMA"));
  assert.ok(decodeURIComponent(r).includes("2026-11-23"));
  assert.ok(decodeURIComponent(suggestEditalMailto("a@b.com", "https://site")).includes("Sugestão de edital"));
});
