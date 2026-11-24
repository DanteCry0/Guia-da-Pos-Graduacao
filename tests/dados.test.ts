import { test } from "node:test";
import assert from "node:assert/strict";
import { courses, institutions } from "../src/data/cursos.ts";

test("catálogo: instituições com site e tipo válidos", () => {
  for (const [k, [nome, uf, tipo, url]] of Object.entries(institutions)) {
    assert.ok(nome && /^[A-Z]{2}$/.test(uf), `${k}: nome ou UF inválidos`);
    assert.ok(tipo === "Pública" || tipo === "Privada", `${k}: tipo inválido`);
    assert.match(url, /^https:\/\//, `${k}: site precisa de https://`);
  }
});
test("catálogo: cursos com instituição existente, níveis válidos e chaves únicas", () => {
  const chaves = new Set<string>();
  for (const c of courses) {
    assert.ok(institutions[c.institution], `${c.name}: instituição "${c.institution}" não existe`);
    assert.match(c.levels, /^[MDEB]+$/, `${c.name}: níveis inválidos`);
    assert.ok(c.area && c.subarea, `${c.name}: sem área ou subárea`);
    if (c.link) assert.match(c.link, /^https:\/\//, `${c.name}: link precisa de https://`);
    assert.ok(!chaves.has(c.key), `${c.name}: chave duplicada`);
    chaves.add(c.key);
  }
});
