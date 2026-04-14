"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";

const MKGEE_TRACKS = [
  "https://soundcloud.com/mkgee/rockman",
  "https://soundcloud.com/mkgee/lonely-fight",
  "https://soundcloud.com/mkgee/alesis",
  "https://soundcloud.com/mkgee/dnm",
  "https://soundcloud.com/mkgee/new-low",
  "https://soundcloud.com/mkgee/riley-i",
  "https://soundcloud.com/mkgee/little-bit-more",
  "https://soundcloud.com/mkgee/breakthespell",
  "https://soundcloud.com/mkgee/i-want",
  "https://soundcloud.com/mkgee/dream-police",
];

interface SCWidget {
  bind(event: string, callback: (...args: unknown[]) => void): void;
  toggle(): void;
  play(): void;
  setVolume(vol: number): void;
  getCurrentSound(callback: (sound: { title: string }) => void): void;
  load(url: string, options?: Record<string, unknown>): void;
}

interface SCGlobal {
  SC?: { Widget: { (iframe: HTMLIFrameElement): SCWidget; Events: Record<string, string> } };
}

function shuffleIndex(exclude: number, max: number) {
  let next = Math.floor(Math.random() * max);
  while (next === exclude && max > 1) next = Math.floor(Math.random() * max);
  return next;
}

interface MusicState {
  isPlaying: boolean; isMuted: boolean; trackName: string; progress: number;
  handlePlayPause: () => void; handleNext: () => void; handleMute: () => void;
}

const MusicContext = createContext<MusicState | null>(null);

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackName, setTrackName] = useState("mk.gee");
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const didRandomize = useRef(false);
  useEffect(() => { if (!didRandomize.current) { didRandomize.current = true; setTrackIndex(Math.floor(Math.random() * MKGEE_TRACKS.length)); } }, []);

  useEffect(() => {
    if (document.getElementById("sc-widget-api")) return;
    const s = document.createElement("script"); s.id = "sc-widget-api"; s.src = "https://w.soundcloud.com/player/api.js";
    s.onload = () => initWidget(); document.head.appendChild(s);
    if ((window as unknown as SCGlobal).SC) initWidget();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initWidget() {
    const iframe = iframeRef.current; if (!iframe) return;
    const sc = (window as unknown as SCGlobal).SC; if (!sc?.Widget) return;
    const w = sc.Widget(iframe); widgetRef.current = w;
    w.bind("ready" as string, () => { w.setVolume(80); w.play(); w.getCurrentSound((s) => { if (s?.title) setTrackName(s.title); }); });
    w.bind("play" as string, () => { setIsPlaying(true); w.getCurrentSound((s) => { if (s?.title) setTrackName(s.title); }); });
    w.bind("pause" as string, () => setIsPlaying(false));
    w.bind("finish" as string, () => handleNext());
    w.bind("playProgress" as string, (e: unknown) => { setProgress((e as { relativePosition: number }).relativePosition ?? 0); });
  }

  const handlePlayPause = useCallback(() => { widgetRef.current?.toggle(); }, []);
  const handleMute = useCallback(() => {
    if (!widgetRef.current) return;
    if (isMuted) { widgetRef.current.setVolume(80); setIsMuted(false); } else { widgetRef.current.setVolume(0); setIsMuted(true); }
  }, [isMuted]);
  const handleNext = useCallback(() => {
    const next = shuffleIndex(trackIndex, MKGEE_TRACKS.length); setTrackIndex(next); setProgress(0);
    widgetRef.current?.load(MKGEE_TRACKS[next], { auto_play: true, show_artwork: false });
  }, [trackIndex]);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(MKGEE_TRACKS[trackIndex])}&color=%2300dc82&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;

  return (
    <MusicContext value={{ isPlaying, isMuted, trackName, progress, handlePlayPause, handleNext, handleMute }}>
      <iframe ref={iframeRef} className="absolute w-px h-px opacity-0 pointer-events-none" scrolling="no" frameBorder="no" allow="autoplay" src={embedUrl} title="SoundCloud Player" />
      {children}
    </MusicContext>
  );
}

export function MusicControlsBar() {
  const ctx = useContext(MusicContext);
  if (!ctx) return null;
  const { isPlaying, isMuted, trackName, progress, handlePlayPause, handleNext, handleMute } = ctx;
  const btn = "w-6 h-6 flex items-center justify-center rounded bg-[#1a2333] border-none text-[0.6rem] text-[#6a7d92] cursor-pointer transition-colors hover:text-[#d0d7e2]";

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex gap-1 shrink-0">
        <button className={btn} onClick={handlePlayPause}>{isPlaying ? "❚❚" : "▶"}</button>
        <button className={btn} onClick={handleNext}>⏭</button>
        <button className={`${btn} ${isMuted ? "opacity-50" : ""}`} onClick={handleMute}>{isMuted ? "🔇" : "🔊"}</button>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[0.6rem] font-semibold text-[#d0d7e2] truncate max-w-[120px]">{trackName}</span>
        <span className="text-[0.5rem] text-[#6a7d92]">mk.gee</span>
      </div>
      <div className="flex-1 h-0.5 bg-white/5 rounded-sm overflow-hidden min-w-[40px]">
        <div className="h-full rounded-sm transition-[width] duration-300 ease-linear" style={{ width: `${progress * 100}%`, background: `hsl(var(--accent-hue) 100% 50%)` }} />
      </div>
    </div>
  );
}

export function MusicWaveStrip() {
  const ctx = useContext(MusicContext);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const progressRef = useRef(0);

  useEffect(() => { isPlayingRef.current = ctx?.isPlaying ?? false; }, [ctx?.isPlaying]);
  useEffect(() => { progressRef.current = ctx?.progress ?? 0; }, [ctx?.progress]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const c = canvas.getContext("2d"); if (!c) return;
    let time = 0, amplitude = 0;

    function draw() {
      if (!c || !canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr; canvas.height = rect.height * dpr; c.scale(dpr, dpr);
      const w = rect.width, h = rect.height, midY = h / 2;
      const targetAmp = isPlayingRef.current ? 1 : 0;
      amplitude += (targetAmp - amplitude) * 0.04;
      c.clearRect(0, 0, w, h);

      // Read the accent hue from CSS variable
      const hue = getComputedStyle(canvas).getPropertyValue("--accent-hue").trim() || "200";
      const accentColor = `hsl(${hue} 100% 50%)`;

      for (const wave of [
        { freq: 0.012, amp: 14, speed: 0.03, opacity: 0.5 },
        { freq: 0.02, amp: 10, speed: 0.02, opacity: 0.35 },
        { freq: 0.035, amp: 6, speed: 0.045, opacity: 0.2 },
        { freq: 0.006, amp: 16, speed: 0.015, opacity: 0.25 },
      ]) {
        c.beginPath(); c.strokeStyle = accentColor;
        c.globalAlpha = wave.opacity * (0.2 + amplitude * 0.8); c.lineWidth = 1.5;
        for (let x = 0; x < w; x++) {
          const wobble = Math.sin(progressRef.current * Math.PI * 4 + x * 0.01) * 4 * amplitude;
          const y = midY + Math.sin(x * wave.freq + time * wave.speed) * wave.amp * amplitude + wobble;
          if (x === 0) c.moveTo(x, y); else c.lineTo(x, y);
        }
        c.stroke();
      }
      if (amplitude < 0.05) { c.beginPath(); c.strokeStyle = accentColor; c.globalAlpha = 0.1; c.lineWidth = 1; c.moveTo(0, midY); c.lineTo(w, midY); c.stroke(); }
      c.globalAlpha = 1; time++;
      animFrameRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div className="relative w-full h-14 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
    </div>
  );
}
