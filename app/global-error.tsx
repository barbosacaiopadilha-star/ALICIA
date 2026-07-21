"use client";

// Cobre falhas no próprio layout raiz; substitui o layout, então precisa
// renderizar html/body e não depende do CSS global.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          background: "#FDFCFA",
          color: "#17160F",
          fontFamily: "Georgia, 'Times New Roman', serif",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.9rem", fontWeight: 400, margin: 0 }}>
          Algo não saiu como esperado
        </h1>
        <p style={{ maxWidth: "42rem", color: "#524E43", margin: 0 }}>
          Ocorreu um erro inesperado. Tente novamente em instantes.
        </p>
        {error.digest ? (
          <p style={{ fontSize: "0.75rem", color: "#8B8678", margin: 0 }}>
            Código do incidente: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            border: "1px solid #A9824F",
            background: "transparent",
            color: "#17160F",
            padding: "1rem 2rem",
            fontSize: "0.9rem",
            cursor: "pointer",
          }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
