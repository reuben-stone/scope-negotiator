import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Scope Negotiator — Product Scoping System",
  description:
    "Turn ambitious product ideas and feature requests into credible, human-approved scope. AI proposes. You decide.",
  openGraph: {
    title: "Scope Negotiator",
    description:
      "Turn ambitious product ideas into credible, human-approved scope. AI proposes. You decide.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Scope Negotiator — Product Scoping System",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scope Negotiator",
    description:
      "Turn ambitious product ideas into credible, human-approved scope. AI proposes. You decide.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
