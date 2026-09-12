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
  title: "Professionle - Guess the Profession",
  description: "Ask yes/no questions, crack the case, name the job.",
  icons: {
    icon: "/icon.png",
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
