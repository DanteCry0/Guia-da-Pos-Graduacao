import { test } from "node:test";
import assert from "node:assert/strict";
import { ascii, buildPixPayload, crc16, maxMessage, parseAmount } from "../src/lib/pix.ts";
import { qrPath } from "../src/lib/qr.ts";
import { LIVEPIX_URL, PIX_CITY, PIX_KEY, PIX_NAME } from "../src/config.ts";

/** Lê o BR Code como sequência de campos (id + tamanho + valor) e falha se algum tamanho não bater. */
function campos(texto: string) {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < texto.length) {
    const id = texto.slice(i, i + 2);
    const n = Number(texto.slice(i + 2, i + 4));
    assert.ok(Number.isInteger(n), `tamanho inválido no campo ${id}`);
    const valor = texto.slice(i + 4, i + 4 + n);
    assert.equal(valor.length, n, `campo ${id} cortado`);
    out[id] = valor;
    i += 4 + n;
  }
  return out;
}

test("crc16: vetor padrão CCITT-FALSE", () => assert.equal(crc16("123456789"), "29B1"));
test("crc16: exemplo do manual do BR Code do Banco Central", () => {
  const manual = "00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304";
  assert.equal(crc16(manual), "1D3D");
});

test("parseAmount aceita vírgula, ponto e R$, e recusa valores inválidos", () => {
  assert.equal(parseAmount("10"), "10.00");
  assert.equal(parseAmount("12,5"), "12.50");
  assert.equal(parseAmount("R$ 1.250,00"), "1250.00");
  assert.equal(parseAmount("0,01"), "0.01");
  assert.equal(parseAmount(""), "");
  for (const ruim of ["0", "abc", "-5", "1,234", "10,5,5"]) assert.equal(parseAmount(ruim), null, ruim);
});
test("ascii tira acentos e limita o tamanho", () => {
  assert.equal(ascii("Apoio ao PósGuia ☺", 50), "Apoio ao PosGuia");
  assert.equal(ascii("abcdef", 3), "abc");
});

test("payload do site: campos, CRC e valores corretos", () => {
  const p = buildPixPayload({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY, amount: "10.00", message: "Apoio ao PósGuia" });
  assert.equal(crc16(p.slice(0, -4)), p.slice(-4));
  const c = campos(p.slice(0, -8)); // tudo antes do campo 63 (CRC)
  assert.equal(c["00"], "01");
  assert.equal(c["53"], "986");
  assert.equal(c["54"], "10.00");
  assert.equal(c["58"], "BR");
  assert.equal(c["59"], "POSGUIA");
  assert.equal(c["60"], "BRASIL");
  const conta = campos(c["26"]);
  assert.equal(conta["00"], "br.gov.bcb.pix");
  assert.equal(conta["01"], PIX_KEY);
  assert.equal(conta["02"], "Apoio ao PosGuia");
  assert.equal(campos(c["62"])["05"], "***");
  assert.equal(p.slice(-8, -4), "6304");
});
test("payload sem valor não tem o campo 54; mensagem longa é cortada para caber", () => {
  const sem = buildPixPayload({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY });
  assert.equal(campos(sem.slice(0, -8))["54"], undefined);
  const longa = buildPixPayload({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY, message: "x".repeat(200) });
  const conta = campos(campos(longa.slice(0, -8))["26"]);
  assert.equal(conta["02"].length, maxMessage(PIX_KEY));
  assert.ok(campos(longa.slice(0, -8))["26"].length <= 99);
});
test("QR Code: gera matriz quadrada e caminho SVG", () => {
  const { size, d } = qrPath(buildPixPayload({ key: PIX_KEY, name: PIX_NAME, city: PIX_CITY, amount: "10.00", message: "Apoio" }));
  assert.ok(size >= 41 && size <= 73 && (size - 21) % 4 === 0, `tamanho estranho: ${size}`);
  assert.match(d, /^M\d+ \d+h\d+v1h-\d+z/);
});
test("config: chave Pix aleatória (UUID) e link do LivePix", () => {
  assert.match(PIX_KEY, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  assert.equal(LIVEPIX_URL, "https://livepix.gg/srvodkars");
});
