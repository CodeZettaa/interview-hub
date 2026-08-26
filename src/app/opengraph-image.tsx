import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "CodeZetta Interview Hub";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const photoBuffer = await readFile(
    join(process.cwd(), "public/brand/founder.jpg"),
  );
  const photoSrc = `data:image/jpeg;base64,${photoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background:
            "linear-gradient(145deg, #070b12 0%, #0f1623 55%, #0b3d3a 100%)",
          color: "#e8eef6",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 48px 64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#0f766e",
                color: "#ecfeff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "-0.04em",
              }}
            >
              CZ
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                CodeZetta
              </div>
              <div style={{ fontSize: 18, color: "#93a4b8" }}>Interview Hub</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              maxWidth: 620,
            }}
          >
            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
              }}
            >
              Master Your Next Tech Interview.
            </div>
            <div style={{ fontSize: 24, color: "#93a4b8", lineHeight: 1.35 }}>
              1,100+ Frontend & Backend interview questions — from fundamentals
              to Tech Lead.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#2dd4bf",
              fontWeight: 600,
            }}
          >
            interview-hub.codezetta.dev
          </div>
        </div>

        <div
          style={{
            width: 460,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 56px 48px 0",
          }}
        >
          <div
            style={{
              width: 380,
              height: 520,
              borderRadius: 36,
              overflow: "hidden",
              display: "flex",
              border: "4px solid rgba(45, 212, 191, 0.35)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
            }}
          >
            <img
              src={photoSrc}
              alt=""
              width={380}
              height={520}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
