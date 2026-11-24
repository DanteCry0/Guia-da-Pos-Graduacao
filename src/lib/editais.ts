// Regras dos editais (status e prazo), testadas em tests/editais.test.ts.
import editais from "../data/editais.json" with { type: "json" };

export type Call = {
  name: string;
  org: string;
  level: string;
  area: string;
  start?: string;
  end: string;
  detail: string;
  url: string;
  fonte?: string;
};

// Os editais ficam em src/data/editais.json (fácil de editar).
export const calls = editais as unknown as Call[];

export const callAreas = [...new Set(calls.map((c) => c.area))].sort();

export const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d} ${months[Number(m) - 1]} ${y}`;
};
export const parseDay = (iso: string, endOfDay = false) => {
  const [y, m, d] = iso.split("-").map(Number);
  return endOfDay ? new Date(y, m - 1, d, 23, 59, 59) : new Date(y, m - 1, d);
};
export type CallStatus = "ab" | "prog" | "enc";
export const statusOrder: Record<CallStatus, number> = { ab: 0, prog: 1, enc: 2 };
export function callState(c: Call, now: Date) {
  const end = parseDay(c.end, true);
  const status: CallStatus = c.start && now < parseDay(c.start) ? "prog" : now > end ? "enc" : "ab";
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = Math.round((parseDay(c.end).getTime() - today.getTime()) / 864e5);
  return { status, days, soon: status === "ab" && days <= 7 };
}
