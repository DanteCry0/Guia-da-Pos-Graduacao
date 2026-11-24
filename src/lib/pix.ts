// Pix "copia e cola" (BR Code estático do Banco Central). Testado em tests/pix.test.ts.
export type PixInput = {
  key: string;
  name: string;
  city: string;
  amount?: string;
  message?: string;
};

const tlv = (id: string, value: string) => id + String(value.length).padStart(2, "0") + value;

/** CRC16-CCITT (polinômio 0x1021, início 0xFFFF), exigido no fim do BR Code. */
export function crc16(text: string) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let b = 0; b < 8; b++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/** Texto seguro para o BR Code: sem acentos nem símbolos fora do ASCII. */
export const ascii = (s: string, max: number) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7e]/g, "")
    .trim()
    .slice(0, max);

/** O campo da conta Pix aceita até 99 caracteres: o que sobra depois da chave é o limite da mensagem. */
export const maxMessage = (key: string) => 99 - (4 + 14) - (4 + key.length) - 4;

/** "12,5" ou "12.50" vira "12.50"; vazio vira ""; valor inválido vira null. */
export function parseAmount(v: string): string | null {
  const t = v
    .trim()
    .replace(/^R\$\s*/i, "")
    .replace(/\s/g, "");
  if (!t) return "";
  const n = t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t;
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(n) || Number(n) < 0.01) return null;
  return Number(n).toFixed(2);
}

export function buildPixPayload({ key, name, city, amount, message }: PixInput) {
  const msg = message ? ascii(message, maxMessage(key)) : "";
  const conta = tlv("00", "br.gov.bcb.pix") + tlv("01", key) + (msg ? tlv("02", msg) : "");
  const corpo =
    tlv("00", "01") +
    tlv("01", "11") +
    tlv("26", conta) +
    tlv("52", "0000") +
    tlv("53", "986") +
    (amount ? tlv("54", amount) : "") +
    tlv("58", "BR") +
    tlv("59", ascii(name, 25).toUpperCase()) +
    tlv("60", ascii(city, 15).toUpperCase()) +
    tlv("62", tlv("05", "***")) +
    "6304";
  return corpo + crc16(corpo);
}
