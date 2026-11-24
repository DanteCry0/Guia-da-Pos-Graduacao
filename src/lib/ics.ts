// Lembrete de calendário (.ics e Google Agenda) para o prazo de um edital. Testado em tests/ics.test.ts.
import { norm } from "./areas.ts";
import type { Call } from "./editais.ts";

const esc = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
const ymd = (iso: string) => iso.replace(/-/g, "");
const nextDay = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, "");
};
const stamp = (now: Date) =>
  now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const titulo = (c: Call) => `Último dia de inscrição: ${c.org} · ${c.name}`;
const slug = (c: Call) =>
  norm(`${c.org} ${c.name}`)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

/** Quebra a linha em até 75 bytes, como manda o formato iCalendar. */
function fold(line: string) {
  const enc = new TextEncoder();
  let out = "";
  let cur = "";
  let bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > 74) {
      out += cur + "\r\n ";
      cur = "";
      bytes = 1;
    }
    cur += ch;
    bytes += b;
  }
  return out + cur;
}

export function buildIcs(c: Call, now = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PosGuia//Editais//PT-BR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${ymd(c.end)}-${slug(c)}@posguia`,
    `DTSTAMP:${stamp(now)}`,
    `DTSTART;VALUE=DATE:${ymd(c.end)}`,
    `DTEND;VALUE=DATE:${nextDay(c.end)}`,
    `SUMMARY:${esc(titulo(c))}`,
    `DESCRIPTION:${esc(`${c.level}. ${c.detail}\nEdital: ${c.url}\nConfirme prazo e requisitos no edital oficial.`)}`,
    `URL:${c.url}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(`Inscrição vence em 3 dias: ${c.org} · ${c.name}`)}`,
    "TRIGGER:-P3D",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

export const icsFileName = (c: Call) => `edital-${slug(c)}.ics`;

export const googleCalendarUrl = (c: Call) =>
  "https://calendar.google.com/calendar/render?action=TEMPLATE" +
  `&text=${encodeURIComponent(titulo(c))}&dates=${ymd(c.end)}/${nextDay(c.end)}` +
  `&details=${encodeURIComponent(`${c.level}. ${c.detail}\nEdital: ${c.url}`)}`;
