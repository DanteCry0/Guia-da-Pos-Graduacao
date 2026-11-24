import { useEffect, useState } from "react";
import { gaOf, levelsOf, roman } from "./lib/areas.ts";
import type { Prog } from "./lib/areas.ts";

export { canonSub, gaOf, levelsOf, lvText, norm, notaFor, relatedProgs } from "./lib/areas.ts";
export type { Prog } from "./lib/areas.ts";

let cache: Promise<Prog[]> | null = null;
const load = () =>
  (cache ??= fetch(import.meta.env.BASE_URL + "data/programas.json")
    .then((r) => r.json())
    .then((d) =>
      Array.isArray(d)
        ? (d as Omit<Prog, "ga" | "sa" | "lv" | "prof">[]).map((p) => ({ ...p, sa: roman(p.a), ga: gaOf(p.a) ?? "Multidisciplinar", ...levelsOf(p.nv, p.m) }))
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

export type Meta = { geradoEm: string; fonte: string; anoBase: string; total: number };
let metaCache: Promise<Meta | null> | null = null;
const loadMeta = () =>
  (metaCache ??= fetch(import.meta.env.BASE_URL + "data/programas-meta.json")
    .then((r) => r.json())
    .then((d) => (d && typeof d.geradoEm === "string" ? (d as Meta) : null))
    .catch(() => null));

/** Data e ano-base da lista de programas (null se o arquivo ainda não existe). */
export function useProgramMeta() {
  const [meta, setMeta] = useState<Meta | null>(null);
  useEffect(() => {
    loadMeta().then(setMeta);
  }, []);
  return meta;
}
