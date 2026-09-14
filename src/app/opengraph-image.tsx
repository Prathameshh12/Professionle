import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Professionle — guess the profession";

export default async function OpengraphImage() {
  const iconData = await readFile(join(process.cwd(), "public/icon.png"));
  const iconSrc = `data:image/png;base64,${iconData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#15181D",
          padding: "80px 100px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
          <img
            src={iconSrc}
            width={72}
            height={72}
            style={{ width: 72, height: 72, borderRadius: 16, marginRight: 24 }}
          />
          <div style={{ display: "flex", color: "#C9A876", fontSize: 30, letterSpacing: 4 }}>
            CASE FILE
          </div>
        </div>
        <div
          style={{
            display: "flex",
            color: "#EDE6D8",
            fontSize: 84,
            fontWeight: 700,
            marginBottom: 24,
          }}
        >
          Professionle
        </div>
        <div style={{ display: "flex", color: "#C9BFA9", fontSize: 34, maxWidth: 850 }}>
          Someone&apos;s been assigned a job. Ask yes-or-no questions until you work out what it
          is.
        </div>
      </div>
    ),
    { ...size }
  );
}