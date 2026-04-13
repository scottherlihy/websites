"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./music.module.css";

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
  SC?: {
    Widget: {
      (iframe: HTMLIFrameElement): SCWidget;
      Events: Record<string, string>;
    };
  };
}

function shuffleIndex(exclude: number, max: number): number {
  let next = Math.floor(Math.random() * max);
  while (next === exclude && max > 1) {
    next = Math.floor(Math.random() * max);
  }
  return next;
}

export default function MusicPlayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SCWidget | null>(null);
  const animFrameRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [trackName, setTrackName] = useState("mk.gee");
  const [trackIndex, setTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const isPlayingRef = useRef(false);
  const progressRef = useRef(0);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { progressRef.current = progress; }, [progress]);

  // Randomize track on mount
  const didRandomize = useRef(false);
  useEffect(() => {
    if (!didRandomize.current) {
      didRandomize.current = true;
      setTrackIndex(Math.floor(Math.random() * MKGEE_TRACKS.length));
    }
  }, []);

  // Load SoundCloud Widget API
  useEffect(() => {
    if (document.getElementById("sc-widget-api")) return;
    const script = document.createElement("script");
    script.id = "sc-widget-api";
    script.src = "https://w.soundcloud.com/player/api.js";
    script.onload = () => initWidget();
    document.head.appendChild(script);
    if ((window as unknown as SCGlobal).SC) initWidget();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function initWidget() {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const scGlobal = window as unknown as SCGlobal;
    if (!scGlobal.SC?.Widget) return;

    const widget = scGlobal.SC.Widget(iframe);
    widgetRef.current = widget;

    widget.bind("ready" as string, () => {
      widget.setVolume(80);
      widget.play();
      widget.getCurrentSound((sound) => {
        if (sound?.title) setTrackName(sound.title);
      });
    });

    widget.bind("play" as string, () => {
      setIsPlaying(true);
      widget.getCurrentSound((sound) => {
        if (sound?.title) setTrackName(sound.title);
      });
    });

    widget.bind("pause" as string, () => setIsPlaying(false));
    widget.bind("finish" as string, () => handleNext());
    widget.bind("playProgress" as string, (e: unknown) => {
      const ev = e as { relativePosition: number };
      setProgress(ev.relativePosition ?? 0);
    });
  }

  const handlePlayPause = useCallback(() => {
    widgetRef.current?.toggle();
  }, []);

  const handleMute = useCallback(() => {
    if (!widgetRef.current) return;
    if (isMuted) {
      widgetRef.current.setVolume(80);
      setIsMuted(false);
    } else {
      widgetRef.current.setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted]);

  const handleNext = useCallback(() => {
    const next = shuffleIndex(trackIndex, MKGEE_TRACKS.length);
    setTrackIndex(next);
    setProgress(0);
    if (widgetRef.current) {
      widgetRef.current.load(MKGEE_TRACKS[next], {
        auto_play: true,
        show_artwork: false,
      });
    }
  }, [trackIndex]);

  // Animated sine wave visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let amplitude = 0;

    function draw() {
      if (!ctx || !canvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;
      const midY = h / 2;

      const targetAmp = isPlayingRef.current ? 1 : 0;
      amplitude += (targetAmp - amplitude) * 0.04;

      ctx.clearRect(0, 0, w, h);

      const accentColor =
        getComputedStyle(canvas)
          .getPropertyValue("--morning-accent")
          .trim() || "#00dc82";

      const waves = [
        { freq: 0.012, amp: 14, speed: 0.03, opacity: 0.5 },
        { freq: 0.02, amp: 10, speed: 0.02, opacity: 0.35 },
        { freq: 0.035, amp: 6, speed: 0.045, opacity: 0.2 },
        { freq: 0.006, amp: 16, speed: 0.015, opacity: 0.25 },
      ];

      for (const wave of waves) {
        ctx.beginPath();
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = wave.opacity * (0.2 + amplitude * 0.8);
        ctx.lineWidth = 1.5;

        for (let x = 0; x < w; x++) {
          const wobble =
            Math.sin(progressRef.current * Math.PI * 4 + x * 0.01) *
            4 *
            amplitude;
          const y =
            midY +
            Math.sin(x * wave.freq + time * wave.speed) *
              wave.amp *
              amplitude +
            wobble;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      if (amplitude < 0.05) {
        ctx.beginPath();
        ctx.strokeStyle = accentColor;
        ctx.globalAlpha = 0.1;
        ctx.lineWidth = 1;
        ctx.moveTo(0, midY);
        ctx.lineTo(w, midY);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      time++;
      animFrameRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const embedUrl = `https://w.soundcloud.com/player/?url=${encodeURIComponent(MKGEE_TRACKS[trackIndex])}&color=%2300dc82&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`;

  return (
    <div className={styles.musicStrip}>
      <iframe
        ref={iframeRef}
        className={styles.hiddenIframe}
        scrolling="no"
        frameBorder="no"
        allow="autoplay"
        src={embedUrl}
        title="SoundCloud Player"
      />

      <canvas ref={canvasRef} className={styles.bgVisualizer} />

      <div className={styles.inlineControls}>
        <div className={styles.buttons}>
          <button
            className={styles.controlBtn}
            onClick={handlePlayPause}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>
          <button
            className={styles.controlBtn}
            onClick={handleNext}
            aria-label="Next track"
          >
            ⏭
          </button>
          <button
            className={`${styles.controlBtn} ${isMuted ? styles.muted : ""}`}
            onClick={handleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>
        <div className={styles.trackInfo}>
          <span className={styles.trackName}>{trackName}</span>
          <span className={styles.trackArtist}>mk.gee</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
