import { useEffect, useState } from "react";
import { gaOf, roman } from "./lib/areas.ts";
import type { Prog } from "./lib/areas.ts";

export { canonSub, gaOf, norm, notaFor, relatedProgs } from "./lib/areas.ts";
export type { Prog } from "./lib/areas.ts";

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
