"use client";

/**
 * Root layout failure UI. Must render its own <html>/<body>.
 * Do not reuse the Orchids ErrorReporter here — that message confused production users.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
          color: "#111",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, marginBottom: 8 }}>GiftVibes is temporarily unavailable</h1>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 20 }}>
            Please refresh the page. If this keeps happening, try again in a minute.
          </p>
          {error?.digest && (
            <p style={{ fontSize: 11, color: "#999", fontFamily: "monospace", marginBottom: 16 }}>
              Ref: {error.digest}
            </p>
          )}
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#124559",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </body>
    </html>
  );
}
