import { ImageResponse } from "next/og";

export const alt = "CodeZetta Interview Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(145deg, #070b12 0%, #0f1623 55%, #0b3d3a 100%)",
          color: "#e8eef6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#0f766e",
              color: "#ecfeff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            CZ
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>
              CodeZetta
            </div>
            <div style={{ fontSize: 20, color: "#93a4b8" }}>Interview Hub</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Master Your Next Tech Interview.
          </div>
          <div style={{ fontSize: 28, color: "#93a4b8", lineHeight: 1.35 }}>
            1,100+ Frontend & Backend interview questions — from fundamentals
            to Tech Lead.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            color: "#2dd4bf",
            fontWeight: 600,
          }}
        >
          interview-hub.codezetta.dev
        </div>
      </div>
    ),
    { ...size },
  );
}
