import { useEffect, useState } from "react";

export type Prog = {
  n: string; ie: string; sg: string; uf: string; a: string; m: string; nota: number;
  t?: string; mu?: string; // tipo (Pública/Privada) e município, quando o arquivo da CAPES traz
  ga: string; sa: string; // grande área e subárea (área de avaliação), calculadas ao carregar
};

export const norm = (s: string) =>
  s
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

// Área de avaliação da CAPES -> grande área (o nome começa com a chave).
const GA_RULES: [string, string][] = [
  ["ciencia da computacao", "Ciências Exatas"], ["astronomia", "Ciências Exatas"], ["matematica", "Ciências Exatas"],
  ["quimica", "Ciências Exatas"], ["geociencias", "Ciências Exatas"], ["fisica", "Ciências Exatas"],
  ["engenharias", "Engenharias"], ["materiais", "Engenharias"],
  ["ciencias biologicas", "Ciências Biológicas"], ["biodiversidade", "Ciências Biológicas"],
  ["educacao fisica", "Saúde"], ["enfermagem", "Saúde"], ["farmacia", "Saúde"], ["medicina veterinaria", "Ciências Agrárias"],
  ["medicina", "Saúde"], ["nutricao", "Saúde"], ["odontologia", "Saúde"], ["saude coletiva", "Saúde"],
  ["fonoaudiologia", "Saúde"], ["fisioterapia", "Saúde"],
  ["ciencias agrarias", "Ciências Agrárias"], ["ciencia de alimentos", "Ciências Agrárias"], ["zootecnia", "Ciências Agrárias"],
  ["administracao", "Ciências Sociais Aplicadas"], ["arquitetura", "Ciências Sociais Aplicadas"], ["comunicacao", "Ciências Sociais Aplicadas"],
  ["direito", "Ciências Sociais Aplicadas"], ["economia", "Ciências Sociais Aplicadas"], ["planejamento urbano", "Ciências Sociais Aplicadas"],
  ["servico social", "Ciências Sociais Aplicadas"], ["turismo", "Ciências Sociais Aplicadas"],
  ["antropologia", "Ciências Humanas"], ["ciencia politica", "Ciências Humanas"], ["ciencias da religiao", "Ciências Humanas"],
  ["educacao", "Ciências Humanas"], ["ensino", "Ciências Humanas"], ["filosofia", "Ciências Humanas"], ["geografia", "Ciências Humanas"],
  ["historia", "Ciências Humanas"], ["psicologia", "Ciências Humanas"], ["sociologia", "Ciências Humanas"], ["teologia", "Ciências Humanas"],
  ["linguistica", "Linguística, Letras e Artes"], ["artes", "Linguística, Letras e Artes"], ["letras", "Linguística, Letras e Artes"],
  ["interdisciplinar", "Multidisciplinar"], ["biotecnologia", "Multidisciplinar"], ["ciencias ambientais", "Multidisciplinar"],
];
export const gaOf = (name: string): string | null => {
  const n = norm(name);
  return GA_RULES.find(([k]) => n.startsWith(k))?.[1] ?? null;
};

// Subáreas do catálogo manual -> nome da área de avaliação da CAPES (mesmo vocabulário nas duas listas).
const CANON: Record<string, string> = {
  Computação: "Ciência da Computação", Meteorologia: "Geociências", "Ciências Sociais": "Sociologia",
  Comunicação: "Comunicação e Informação", "Ciência da Informação": "Comunicação e Informação",
  "Relações Internacionais": "Ciência Política e Relações Internacionais", Linguística: "Linguística e Literatura",
  "Terapia Ocupacional": "Educação Física", "Engenharia Aeroespacial": "Engenharias III", "Engenharia Elétrica": "Engenharias IV",
  Administração: "Administração Pública e de Empresas, Ciências Contábeis e Turismo",
};
export const canonSub = (s: string) => CANON[s] ?? s;

const roman = (s: string) => s.replace(/\b(Iii|Ii|Iv)\b/g, (m) => m.toUpperCase());

let cache: Promise<Prog[]> | null = null;
const load = () =>
  (cache ??= fetch(import.meta.env.BASE_URL + "data/programas.json")
    .then((r) => r.json())
    .then((d) =>
      Array.isArray(d)
        ? (d as Omit<Prog, "ga" | "sa">[]).map((p) => ({ ...p, sa: roman(p.a), ga: gaOf(p.a) ?? "Multidisciplinar" }))
        : [],
    )
    .catch(() => []));

/** Programas da CAPES (carrega uma vez e compartilha). null = carregando. */
export function usePrograms() {
  const [data, setData] = useState<Prog[] | null>(null);
  useEffect(() => {
    load().then(setData);
  }, []);
  return data;
}

/** Programas da CAPES da grande área / subárea escolhida. */
export function relatedProgs(progs: Prog[], area: string, sub: string) {
  return progs.filter((p) => (!area || p.ga === area) && (!sub || norm(p.sa) === norm(sub)));
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
