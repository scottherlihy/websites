import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import styles from "./morning.module.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Good Morning | Scott Herlihy",
  description: "A personal morning dashboard",
};

export const dynamic = "force-dynamic";

export default function MorningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hue = Math.floor(Math.random() * 360);

  return (
    <div
      className={`${spaceGrotesk.variable} ${styles.theme}`}
      style={{ "--morning-hue": hue } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
