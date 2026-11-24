import { test } from "node:test";
import assert from "node:assert/strict";
import { canonSub, gaOf, notaFor, relatedProgs, roman } from "../src/lib/areas.ts";
import type { Prog } from "../src/lib/areas.ts";

const p = (n: string, sg: string, a: string, nota: number): Prog => ({ n, ie: "Instituição " + sg, sg, uf: "SP", a, m: "Acadêmico", nota, ga: gaOf(a) ?? "Multidisciplinar", sa: roman(a) });
const progs = [p("Direito", "USP", "Direito", 6), p("Direito", "USP", "Direito", 5), p("Ciência da Computação", "UFMG", "Ciência da Computação", 7), p("Educação Física", "UFX", "Educação Física", 4), p("Educação", "UFBA", "Educação", 5)];

test("gaOf agrupa áreas de avaliação em grandes áreas", () => {
  assert.equal(gaOf("Ciência da Computação"), "Ciências Exatas");
  assert.equal(gaOf("Educação Física"), "Saúde");
  assert.equal(gaOf("Educação"), "Ciências Humanas");
  assert.equal(gaOf("Medicina Veterinária"), "Ciências Agrárias");
  assert.equal(gaOf("Engenharias IV"), "Engenharias");
  assert.equal(gaOf("Área nova"), null);
});
test("canonSub usa os nomes da CAPES", () => {
  assert.equal(canonSub("Computação"), "Ciência da Computação");
  assert.equal(canonSub("Direito"), "Direito");
});
test("roman ajusta numerais romanos", () => assert.equal(roman("Medicina Ii / Engenharias Iv"), "Medicina II / Engenharias IV"));
test("notaFor: nota única, intervalo e sem correspondência", () => {
  assert.equal(notaFor("Ciência da Computação (CIn)", "MD", "UFMG", progs), "7");
  assert.equal(notaFor("Direito (Faculdade de Direito)", "MD", "USP", progs), "5–6");
  assert.equal(notaFor("Física", "MD", "USP", progs), null);
  assert.equal(notaFor("Direito", "B", "USP", progs), null);
  assert.equal(notaFor("Direito", "MD", "USP", null), null);
});
test("relatedProgs filtra por grande área e subárea sem misturar Educação com Educação Física", () => {
  assert.deepEqual(relatedProgs(progs, "Ciências Humanas", "Educação").map((x) => x.sg), ["UFBA"]);
  assert.equal(relatedProgs(progs, "Saúde", "").length, 1);
  assert.equal(relatedProgs(progs, "", "").length, progs.length);
});
