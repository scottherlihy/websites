import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "./components/nav/bottom-nav";
import { CustomExerciseProvider } from "./components/custom-exercise-provider";
import "./workout.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exercise Tracker",
  description: "Longevity-focused exercise programming and tracking",
};

export default function WorkoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`workout-scope ${geistSans.variable} ${geistMono.variable} min-h-full pb-20 antialiased`}>
      <CustomExerciseProvider>
        <main className="mx-auto max-w-lg px-4 py-6">{children}</main>
        <BottomNav />
      </CustomExerciseProvider>
    </div>
  );
}
