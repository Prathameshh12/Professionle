import type { Metadata } from "next";
import { Courier_Prime, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const caseFont = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-case",
});

const bodyFont = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://professionle.vercel.app"), // update if your domain ever changes
  title: "Professionle - Guess the Profession",
  description: "Ask yes/no questions, crack the case, name the job.",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Professionle",
    description:
      "Someone's been assigned a job. Ask yes-or-no questions until you work out what it is.",
    siteName: "Professionle",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Professionle",
    description:
      "Someone's been assigned a job. Ask yes-or-no questions until you work out what it is.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${caseFont.variable} ${bodyFont.variable} bg-ink text-paper font-body antialiased`}>
        {children}
      </body>
    </html>
  );
}
