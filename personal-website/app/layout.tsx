import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Scott Herlihy's Website",
  description: "A personal website built using Next.js",
  openGraph: {
    title: "Scott Herlihy's Website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body style={{ fontFamily: "var(--font-space-grotesk), -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
