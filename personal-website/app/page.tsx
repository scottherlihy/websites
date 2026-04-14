import Image from "next/image";
import ProjectCard from "./components/ProjectCard";

const PROJECTS = [
  {
    name: "Good Morning",
    description: "I think the future of AI-driven development is hyper customization. This is my morning dashboard I created to start my day. Yes it feels like MySpace 2.0 and I think that's cool.",
    preview: "",
    tech: ["Next.js 16", "Yahoo Finance", "Space Devs API", "SoundCloud"],
    href: "/morning",
    previewImage: null,
    year: "2026",
  },
  {
    name: "Realm",
    description: "Multi-tenant hotel operations platform with real-time room management and shift scheduling.",
    preview: "",
    tech: ["Next.js 15", "Supabase"],
    href: "https://realm-alpha-six.vercel.app/login",
    previewImage: null,
    year: "2026",
  },
  {
    name: "Gift of Gab",
    description: "Audio-first digital journaling app for parents with AI-powered transcription and tagging.",
    preview: "",
    tech: ["React Native", "Expo", "Supabase"],
    href: "https://www.giftofgab.app/",
    previewImage: null,
    year: "2026",
  },
  {
    name: "Click Clack",
    description: "Kid-friendly web app where keyboard smashing triggers dynamic animations and sound effects at 60fps.",
    preview: "",
    tech: ["Next.js", "PixiJS", "Web Audio API"],
    href: "https://click-clack-delta.vercel.app/",
    previewImage: null,
    year: "2026",
  },
  {
    name: "Workout Generator",
    description: "Custom workout generator and tracker tailored to evidence-based research on longevity and health.",
    preview: "",
    tech: ["Next.js", "Supabase"],
    href: "/workout",
    previewImage: null,
    year: "2026",
  },
  {
    name: "Robot Simulator",
    description: "A foray into robotics to experiment with planning algorithms while building walls with a robot fleet.",
    preview: "",
    tech: ["Rust", "TypeScript"],
    href: "https://robot-demo-wine.vercel.app/",
    previewImage: null,
    year: "2026",
  },
];

const EXPERIENCE = [
  { role: "Senior Software Engineer / Manager", company: "Regrow Ag", location: "Amsterdam", period: "Present", current: true },
  { role: "Software Engineer", company: "Belvedere Trading", location: "Chicago", period: "", current: false },
  { role: "Student", company: "University of Chicago", location: "Chicago", period: "", current: false },
];

export default function Home() {
  return (
    <div className="max-w-[720px] mx-auto px-6 py-12 flex flex-col gap-12">
      {/* Hero */}
      <header className="flex items-center gap-6 max-sm:flex-col max-sm:text-center">
        <Image
          priority
          src="/images/profile.jpg"
          className="rounded-full shrink-0"
          height={120}
          width={120}
          alt="Scott Herlihy"
        />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[1.6rem] font-bold text-[#111] m-0">Scott Herlihy</h1>
          <p className="text-[0.9rem] leading-relaxed text-[#555] m-0">
            Interested in space, robotics, crypto, and urban infrastructure.
            <br />
            Currently in Amsterdam, building at a climate ag tech startup.
          </p>
          <div className="flex gap-4 mt-1 max-sm:justify-center">
            <a href="https://github.com/scottherlihy" className="text-[0.8rem] text-[#888] no-underline hover:text-[#111]">GitHub</a>
          </div>
        </div>
      </header>

      {/* Projects */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[#999] m-0">Projects</h2>
        <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} project={project} />
          ))}
        </div>
      </section>

      {/* Experience */}
      <section className="flex flex-col gap-4">
        <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-[#999] m-0">Experience</h2>
        <div className="flex flex-col">
          {EXPERIENCE.map((exp, i) => (
            <div key={i} className="flex gap-4 py-3 relative">
              <div className="w-3 flex items-start justify-center pt-1.5 shrink-0 relative">
                <span className={`w-2 h-2 rounded-full ${exp.current ? "bg-[#111]" : "bg-[#ddd]"}`} />
                {i < EXPERIENCE.length - 1 && (
                  <span className="absolute top-[1.1rem] left-1/2 -translate-x-1/2 w-px bg-[#e5e5e5]" style={{ height: "calc(100% - 0.5rem)" }} />
                )}
              </div>
              <div className="flex flex-col gap-0.5 flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-[0.85rem] font-semibold text-[#111]">
                    {exp.role} <span className="font-normal text-[#666]">at {exp.company}</span>
                  </span>
                  <span className="text-[0.7rem] text-[#aaa]">{exp.period}</span>
                </div>
                <span className="text-[0.7rem] text-[#999]">{exp.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
