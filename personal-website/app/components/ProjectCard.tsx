"use client";

import { useState } from "react";
import Link from "next/link";

interface Project {
  name: string;
  description: string;
  preview: string;
  tech: string[];
  href: string | null;
  previewImage: string | null;
  year: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`flex flex-col gap-1.5 p-4 bg-[#f8f8f8] rounded-xl cursor-pointer transition-colors hover:bg-[#f0f0f0] ${
        expanded ? "col-span-full bg-[#f0f0f0]" : ""
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex justify-between items-baseline">
        <span className="text-[0.95rem] font-semibold text-[#111]">{project.name}</span>
        <span className="text-[0.65rem] text-[#aaa]">{project.year}</span>
      </div>
      <p className="text-[0.75rem] leading-relaxed text-[#666] m-0">{project.description}</p>

      {expanded && (
        <div className="flex flex-col gap-2.5 mt-1">
          <div className="rounded-lg overflow-hidden bg-[#111] aspect-video max-h-[450px]">
            {project.href && !project.previewImage ? (
              <iframe
                src={project.href}
                className="w-[166.67%] h-[166.67%] border-none scale-[0.6] origin-top-left pointer-events-auto"
                title={`${project.name} preview`}
              />
            ) : project.previewImage ? (
              <img src={project.previewImage} alt={`${project.name} preview`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#555] text-sm">Coming soon</div>
            )}
          </div>
          <div className="flex justify-between items-end">
            <div className="flex flex-wrap gap-1">
              {project.tech.map((t) => (
                <span key={t} className="text-[0.55rem] text-[#888] bg-black/[0.04] px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
            {project.href && (
              <Link
                href={project.href}
                className="text-[0.7rem] font-medium text-[#111] no-underline hover:underline shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                View project &rarr;
              </Link>
            )}
          </div>
        </div>
      )}

      {!expanded && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {project.tech.map((t) => (
            <span key={t} className="text-[0.55rem] text-[#888] bg-black/[0.04] px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
