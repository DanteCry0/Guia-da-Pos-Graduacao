import { useMemo, useState } from "react";
import { LIVEPIX_URL, PIX_CITY, PIX_KEY, PIX_NAME } from "./config.ts";
import { buildPixPayload, maxMessage, parseAmount } from "./lib/pix.ts";
import { qrPath } from "./lib/qr.ts";

const PRESETS = ["5", "10", "20", "50"];
const brl = (v: string) =>
  Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Apoio() {
  const [amount, setAmount] = useState("10");
  const [message, setMessage] = useState("Apoio ao PosGuia");
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState("");
  const parsed = parseAmount(amount);
  const payload = useMemo(
    () =>
      buildPixPayload({
        key: PIX_KEY,
        name: PIX_NAME,
        city: PIX_CITY,
        amount: parsed ?? "",
        message,
      }),
    [parsed, message],
  );
  const qr = useMemo(
    () => (show && parsed !== null ? qrPath(payload) : null),
    [show, parsed, payload],
  );

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copie:", text);
    }
    setCopied(what);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="apoio">
      <p>
        O PósGuia é gratuito e feito de forma independente. Se ele ajudou você, qualquer valor ajuda
        a manter o site no ar e os dados atualizados. É totalmente opcional, e o apoio não
        influencia o Quiz nem a ordem das listas.
      </p>
      <p>
        <a
          className="more-btn apoio-btn"
          href={LIVEPIX_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Apoiar pelo LivePix
        </a>
      </p>

      <h3>Ou use o Pix</h3>
      <div className="apoio-valores" role="group" aria-label="Valores sugeridos">
        {PRESETS.map((v) => (
          <button
            type="button"
            key={v}
            className={amount === v ? "quiz-opt on" : "quiz-opt"}
            aria-pressed={amount === v}
            onClick={() => setAmount(v)}
          >
            R$ {v}
          </button>
        ))}
      </div>
      <div className="apoio-campos">
        <label className="select-wrap">
          <span>Valor (R$)</span>
          <div>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Ex.: 15,00"
              aria-invalid={parsed === null}
            />
          </div>
        </label>
        <label className="select-wrap">
          <span>Mensagem (opcional, sem acentos)</span>
          <div>
            <input
              value={message}
              maxLength={maxMessage(PIX_KEY)}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </label>
      </div>
      {parsed === null && (
        <p className="apoio-erro" role="alert">
          Informe um valor válido, a partir de R$ 0,01 (ex.: 10 ou 12,50).
        </p>
      )}
      <p className="apoio-linha">
        <button
          type="button"
          className="more-btn"
          disabled={parsed === null}
          onClick={() => setShow(!show)}
        >
          {show ? "Ocultar QR Code" : "Gerar Pix com este valor"}
        </button>
      </p>

      {qr && parsed && (
        <div className="pix-box">
          <svg
            className="pix-qr"
            viewBox={`-4 -4 ${qr.size + 8} ${qr.size + 8}`}
            role="img"
            aria-label={`QR Code do Pix${parsed ? ` de ${brl(parsed)}` : ""}`}
            shapeRendering="crispEdges"
          >
            <rect x="-4" y="-4" width={qr.size + 8} height={qr.size + 8} fill="#fff" />
            <path d={qr.d} fill="#000" />
          </svg>
          <div className="pix-dados">
            <p>
              <strong>{brl(parsed)}</strong>
              {message ? ` · ${message}` : ""}
            </p>
            <label htmlFor="pix-copia">Pix copia e cola</label>
            <textarea
              id="pix-copia"
              readOnly
              value={payload}
              rows={5}
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="apoio-linha">
              <button type="button" className="more-btn" onClick={() => copy(payload, "codigo")}>
                {copied === "codigo" ? "Copiado!" : "Copiar Pix copia e cola"}
              </button>
              <button type="button" className="link-btn" onClick={() => copy(PIX_KEY, "chave")}>
                {copied === "chave" ? "Chave copiada!" : "Copiar só a chave"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="apoio-chave">
        Chave Pix (aleatória): <code>{PIX_KEY}</code>{" "}
        {!qr && (
          <button type="button" className="link-btn" onClick={() => copy(PIX_KEY, "chave")}>
            {copied === "chave" ? "Chave copiada!" : "Copiar só a chave"}
          </button>
        )}
      </p>
      <p aria-live="polite" className="sr-only">
        {copied ? "Copiado para a área de transferência" : ""}
      </p>
    </div>
  );
}
