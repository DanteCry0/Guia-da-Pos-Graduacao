import { useEffect, useState } from "react";

export type Prog = { n: string; ie: string; sg: string; uf: string; a: string; m: string; nota: number };

export const norm = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

let cache: Promise<Prog[]> | null = null;
const load = () =>
  (cache ??= fetch(import.meta.env.BASE_URL + "data/programas.json")
    .then((r) => r.json())
    .then((d) => (Array.isArray(d) ? (d as Prog[]) : []))
    .catch(() => []));

/** Programas da CAPES (carrega uma vez e compartilha). null = carregando. */
export function usePrograms() {
  const [data, setData] = useState<Prog[] | null>(null);
  useEffect(() => {
    load().then(setData);
  }, []);
  return data;
}

// Subárea do nosso catálogo -> trechos do nome da área de avaliação da CAPES ("=" exige nome igual).
const HINTS: Record<string, string[]> = {
  Direito: ["=direito"],
  Computação: ["ciencia da computacao"],
  Meteorologia: ["geociencias", "ciencias ambientais"],
  Educação: ["=educacao", "=ensino"],
  "Ciências Sociais": ["=sociologia", "antropologia", "ciencia politica"],
  Comunicação: ["comunicacao e informacao"],
  "Ciência da Informação": ["comunicacao e informacao"],
  "Relações Internacionais": ["relacoes internacionais"],
  Linguística: ["linguistica e literatura"],
  "Terapia Ocupacional": ["educacao fisica"],
  "Engenharia Aeroespacial": ["engenharias"],
  "Engenharia Elétrica": ["engenharias iv"],
  Engenharia: ["engenharias"],
  Administração: ["administracao"],
};

/** Programas da CAPES cuja área de avaliação corresponde à área/subárea escolhida. */
export function relatedProgs(progs: Prog[], area: string, sub: string, courses: { area: string; subarea: string }[]) {
  const subs = sub ? [sub] : [...new Set(courses.filter((c) => c.area === area).map((c) => c.subarea))];
  const hints = subs.flatMap((s) => HINTS[s] ?? [norm(s)]);
  return progs.filter((p) => {
    const a = norm(p.a);
    return hints.some((h) => (h.startsWith("=") ? a === h.slice(1) : a.includes(h)));
  });
}

const base = (s: string) => norm(s.replace(/\(.*?\)/g, "")).trim();

/** Nota CAPES de um curso do catálogo: casa pela sigla da instituição e pelo nome do programa. */
export function notaFor(name: string, levels: string, sigla: string, progs: Prog[] | null): string | null {
  if (!progs || !/[MD]/.test(levels)) return null;
  const notas = progs.filter((p) => norm(p.sg) === norm(sigla) && base(p.n) === base(name)).map((p) => p.nota);
  if (!notas.length) return null;
  const lo = Math.min(...notas);
  const hi = Math.max(...notas);
  return lo === hi ? String(lo) : `${lo}–${hi}`;
}
