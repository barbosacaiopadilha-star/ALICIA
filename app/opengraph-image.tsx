import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "AliCIA · Aliviar — A escolha do médico merece tanto cuidado quanto o tratamento";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Cartão gerado com os tokens da identidade (ink/gold/paper), sem assets
// externos — mesma abordagem do favicon em app/icon.svg.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          backgroundColor: "#17160F",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontStyle: "italic",
            color: "#A9824F",
          }}
        >
          AliCIA
        </div>
        <div
          style={{
            fontSize: 38,
            color: "#FDFCFA",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          A escolha do médico merece tanto cuidado quanto o tratamento
        </div>
        <div style={{ fontSize: 26, color: "#8B8678" }}>aliviar · curadoria médica</div>
      </div>
    ),
    size
  );
}
