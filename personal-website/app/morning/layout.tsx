import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./tailwind.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Good Morning | Scott Herlihy",
};

export const dynamic = "force-dynamic";

export default function MorningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Allowed hue ranges: gold 35-55, yellow 55-65, green 100-160, blue 200-240
  const ranges = [[35, 55], [55, 65], [100, 160], [200, 240]];
  const range = ranges[Math.floor(Math.random() * ranges.length)];
  const hue = range[0] + Math.floor(Math.random() * (range[1] - range[0]));

  return (
    <div
      className={`${spaceGrotesk.variable} font-[family-name:var(--font-space-grotesk)] min-h-screen`}
      style={{
        "--accent-hue": hue,
        background: "#0c1018",
        color: "#d0d7e2",
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
