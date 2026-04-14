"use client";

import { useState, useRef, useEffect } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const hasPreview = project.href || project.previewImage;

  const screenYRef = useRef(0);

  function handleClick() {
    if (cardRef.current) {
      // Remember where the card was on screen before the toggle
      screenYRef.current = cardRef.current.getBoundingClientRect().top;
    }
    setExpanded(!expanded);
  }

  useEffect(() => {
    // After reflow, scroll so the card stays at the same screen position
    requestAnimationFrame(() => {
      if (cardRef.current) {
        const newScreenY = cardRef.current.getBoundingClientRect().top;
        const drift = newScreenY - screenYRef.current;
        if (Math.abs(drift) > 1) {
          window.scrollBy({ top: drift, behavior: "instant" });
        }
      }
    });
  }, [expanded]);

  return (
    <div
      ref={cardRef}
      className={`flex flex-col gap-1.5 p-4 bg-[#f8f8f8] rounded-xl transition-colors cursor-pointer ${
        expanded ? "col-span-full bg-[#f0f0f0]" : "hover:bg-[#f0f0f0]"
      }`}
      onClick={handleClick}
    >
      <div className="flex justify-between items-baseline">
        <span className="text-[0.95rem] font-semibold text-[#111]">{project.name}</span>
        <span className="text-[0.65rem] text-[#aaa]">{project.year}</span>
      </div>
      <p className="text-[0.75rem] leading-relaxed text-[#666] m-0">{project.description}</p>

      {/* Collapsed: small preview thumbnail + expand button */}
      {!expanded && hasPreview && (
        <div className="relative mt-auto pt-1.5 rounded-lg overflow-hidden bg-[#111] h-[100px]">
          {project.href && !project.previewImage ? (
            <iframe
              src={project.href}
              className="w-[250%] h-[250%] border-none scale-[0.4] origin-top-left pointer-events-none"
              title={`${project.name} preview`}
              tabIndex={-1}
            />
          ) : project.previewImage ? (
            <img src={project.previewImage} alt="" className="w-full h-full object-cover" />
          ) : null}
          <button
            className="absolute bottom-2 right-2 bg-black/50 text-white text-[0.55rem] font-medium px-2 py-1 rounded backdrop-blur-sm hover:bg-black/70 transition-colors pointer-events-none"
          >
            Expand
          </button>
        </div>
      )}

      {/* Collapsed: tech tags (only if no preview) */}
      {!expanded && !hasPreview && (
        <div className="flex flex-wrap gap-1 mt-0.5">
          {project.tech.map((t) => (
            <span key={t} className="text-[0.55rem] text-[#888] bg-black/[0.04] px-1.5 py-0.5 rounded">{t}</span>
          ))}
        </div>
      )}

      {/* Expanded: full preview */}
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
            <div className="flex items-center gap-3">
              <button
                className="text-[0.65rem] text-[#999] hover:text-[#111] transition-colors"
                onClick={() => setExpanded(false)}
              >
                Collapse
              </button>
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
        </div>
      )}
    </div>
  );
}
