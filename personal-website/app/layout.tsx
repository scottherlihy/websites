import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
