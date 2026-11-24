// QR Code como caminho SVG (biblioteca uqr, MIT, em src/vendor).
import { encode } from "../vendor/uqr.mjs";

export function qrPath(text: string): { size: number; d: string } {
  const { data: m, size } = encode(text, { ecc: "M", border: 0 });
  let d = "";
  m.forEach((linha: boolean[], y: number) => {
    let x = 0;
    while (x < size) {
      if (!linha[x]) {
        x++;
        continue;
      }
      let w = 1;
      while (x + w < size && linha[x + w]) w++;
      d += `M${x} ${y}h${w}v1h-${w}z`;
      x += w;
    }
  });
  return { size, d };
}
