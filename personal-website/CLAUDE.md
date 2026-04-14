@AGENTS.md

# Design Principles

These rules were derived from a design critique of AI-generated UI patterns. Follow them strictly when writing CSS or creating UI components.

## Color: No homogenous goo
- Follow the **70/20/10 rule**: 70% neutral backgrounds, 20% complementary text tones, 10% accent color.
- Neutrals should be truly neutral (desaturated grays or warm/cool tinted grays) — never tinted with the accent hue.
- The accent color should appear in **3-5 places max** on a page. Every other element uses neutrals.
- Use a **staircase of 4-5 solid gray values** for elevation/depth instead of borders or transparency.

## No glassmorphism
- No semi-transparent backgrounds (`rgba(255,255,255,0.04)` cards).
- No frosted glass, no backdrop-blur, no glow box-shadows.
- Use solid background colors at different elevation steps to separate elements.

## No unnecessary borders
- Whitespace and background color differences separate elements — not borders.
- If two things look distinct through spacing and value contrast, a border adds nothing.
- Exception: very intentional accent borders (e.g. a left-border indicator on the "next launch" card).

## No emojis as icons
- Never use emoji for UI elements (weather, controls, indicators).
- Use SVG icons or text. Emoji looks unprofessional and inconsistent across platforms.

## No decorative gradients or shadows
- No linear-gradient text fills. No glow filters on SVGs. No gradient bar fills.
- Shadows only where they serve a spatial purpose (e.g. a dropdown). Never decorative.
- A solid accent-colored bar communicates the same data as a gradient bar with less visual noise.

## Typography over color for hierarchy
- Use **font size and weight** to create visual hierarchy — not accent color.
- Panel/section titles: small, light weight, muted gray. Let the content below be visually dominant.
- Reserve color for semantic meaning: green/red for positive/negative, accent for the 3-5 intentional spots.

## Data ink ratio
- In charts and data visualizations, every pixel of color should represent data.
- No gradient fills under line charts. No glow filters. Just the line.
- Thin, minimal bars (4px) for ranked data like odds. Width is the data — decoration is not.

## Animations: purposeful only
- No entrance animations on page load (no grow-in bars, no fade-in cards).
- No hover glow effects on every card.
- Animations are for: countdown timers, music visualizers, interactive transitions (card flip), and the sun arc.

## No cards-in-cards nesting
- Avoid wrapping a card inside a panel inside a section. Flatten the hierarchy.
- If a card is inside a panel, the card background should be one elevation step above the panel — not a bordered box.

# Tech Stack
- Next.js 16 (App Router, TypeScript, CSS Modules)
- Font: Space Grotesk (loaded in root layout)
- No Tailwind. No component libraries. Hand-written CSS Modules.
- Stock data: Yahoo Finance (free, no API key)
- Weather: Open-Meteo (free, no API key)
- Launches: Space Devs Launch Library 2 (free, no API key)
- Music: SoundCloud widget API (free embed)
