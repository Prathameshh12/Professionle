import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Professionle",
    short_name: "Professionle",
    description: "Ask yes/no questions, crack the case, name the job.",
    start_url: "/",
    display: "standalone",
    background_color: "#15181D",
    theme_color: "#15181D",
    icons: [
      // Both entries point at your existing single icon.png for now — functional,
      // just not pixel-crisp at every declared size. If you ever want sharper
      // home-screen icons, export true 192x192 and 512x512 PNGs from your
      // original logo source and swap the `src` values below.
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
  };
}