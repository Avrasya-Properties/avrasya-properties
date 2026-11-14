---
name: Avrasya Properties
description: Curated Turkish Luxury Real Estate & Citizenship by Investment Advisory
colors:
  primary: "#163038"
  primary-foreground: "#FFFFFF"
  neutral-bg: "#F9F8F5"
  neutral-surface: "#F7F6F2"
  card: "#FFFFFF"
  brass: "#C5A059"
  brass-light: "#E5C378"
  emerald: "#10785F"
  night: "#0E2228"
  border: "#DEE0DD"
  muted-foreground: "#5C6F73"
  glow: "#2DD4BF"
typography:
  display:
    fontFamily: "Cormorant Garamond, Newsreader, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 500
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cormorant Garamond, Newsreader, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "2px"
  md: "4px"
  lg: "6px"
  xl: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.night}"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-brass:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  card-default:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "24px"
---

# Design System: Avrasya Properties

## Overview

**Creative North Star: "The Architectural Sanctuary"**

Avrasya Properties exists at the intersection of high-capital investment advisory and bespoke architectural curation. The design language rejects the frantic, high-density listing grids common to transactional real estate portals. Instead, it assumes the pacing, restraint, and tactile authority of an architectural monograph printed on heavy ivory stock.

Surfaces lead with deliberate white space, structural proportion, and quiet confidence. Deep Anatolian forest petrol (`#163038`) grounds the canvas, warmed by an organic limestone ivory backdrop (`#F9F8F5`), polished brass metallic rules (`#C5A059`), and rare Bosphorus cyan-emerald light (`#10785F` / `#2DD4BF`). Contrast is sharp and unambiguous; typography pairs the lyricism of classical book publishing with the cold precision of Scandinavian sans-serif body copy.

**Key Characteristics:**

- **Architectural Stillness**: Flat surfaces at rest, hairline divider rules, and minimal tonal layering rather than floating blur clouds.
- **Bespoke Craftsmanship**: Oversized classical serif numerals (`numeral`), gold eyebrow marks, and gold sweep button interactions.
- **Dual Cultural Authority**: Seamless bilingual and bidirectional layout structure honoring both Western Latin typography and Right-to-Left Arabic/Persian scripts (`Cairo` / `Vazirmatn`).

## Colors

The palette draws from Istanbul's maritime geography and Anatolian stone heritage: deep maritime petrol, warm limestone ivory, muted sage-slate, and brushed Byzantine brass.

### Primary

- **Deep Forest Petrol** (`#163038`): The dominant anchor. Used for primary buttons, deep hero headers, dark background bands, and authoritative typography.

### Secondary

- **Metallic Luxury Brass** (`#C5A059`): The signature accent. Used sparingly for eyebrow indicators, active tabs, timeline nodes, focus rings, and hover states.
- **Bosphorus Emerald** (`#10785F`): The vibrant Turkish maritime tone used for citizenship eligibility badges, verified legal seals, and organic depth accents.

### Tertiary

- **Cyan Glow Accent** (`#2DD4BF`): Used exclusively for live interactive map pins, radar pulses, and key navigational focal points.
- **Night Overlay** (`#0E2228`): Deepest dark petrol shade used for video overlays, backdrops, and hero masks.

### Neutral

- **Warm Ivory Canvas** (`#F9F8F5`): The primary site canvas background. Provides warmth and human tactility, avoiding harsh bleached monitor whites.
- **Navbar Cream Tint** (`#F7F6F2`): Tonal secondary layer for navbars, secondary buttons, and subtle card backplates.
- **Pure White** (`#FFFFFF`): Reserved for elevated property cards, modals, and crisp contrast containers.
- **Muted Petrol-Slate** (`#5C6F73`): Sub-labels, secondary metadata, and long-form descriptive copy.
- **Soft Sage-Gray Border** (`#DEE0DD`): Hairline dividers, subtle card borders, and inactive form outlines.

### Named Rules

**The Rarity Rule.** Brass (`#C5A059`) and Cyan Glow (`#2DD4BF`) must never occupy more than 8% of any viewport. Their rarity conveys value; widespread use degenerates into decorative noise.

**The Contrast Floor Rule.** All text on ivory (`#F9F8F5`) must maintain a minimum 4.5:1 WCAG AA contrast ratio. Muted copy must not drop below `#5C6F73`. Gold accents on ivory canvas must remain structural (borders, lines, icons) or use the darker olive-brass variant (`#989681`) if carrying legibility weight.

## Typography

**Display Font:** Cormorant Garamond (with Newsreader, Georgia, serif fallback)  
**Body Font:** Manrope (with system-ui, sans-serif fallback)  
**RTL Script Font:** Cairo & Vazirmatn

**Character:** The pairing of an incisive, high-contrast humanist display serif with a crisp, geometric sans-serif delivers an immediate sense of verified institutional advisory wrapped in classical luxury.

### Hierarchy

- **Display Hero** (500 weight, 5rem / 80px desktop, clamp(2rem, 8.5vw, 2.75rem) mobile, 1.02 line-height, -0.025em letter-spacing): Hero statement headlines and major section openings.
- **Headline** (500 weight, 3rem / 48px desktop, 2.1rem mobile, 1.1 line-height, -0.015em letter-spacing): Section titles, property names, and milestone headers.
- **Title / Card Header** (600 weight, 1.25rem / 20px, 1.3 line-height, -0.01em letter-spacing): Property card titles, modal titles, and feature group headers.
- **Numeral Punctuation** (400 weight, 2.5rem–4.5rem, 0.9 line-height, lining-nums): Oversized editorial numbering for statistics, steps (`01`, `02`), and financial figures.
- **Body** (400 weight, 0.9375rem / 15px, 1.6 line-height, 65ch max-width): Editorial prose, legal disclosures, and advisory descriptions.
- **Eyebrow / Kicker** (600 weight, 0.72rem / 11.5px, 0.12em letter-spacing, uppercase): Category pre-headers, micro-tags, and status indicators.

### Named Rules

**The Lining Figures Rule.** All statistical numbers, prices, square-meter figures, and dates must render with `font-variant-numeric: lining-nums tabular-nums` to ensure exact typographic alignment across property comparison matrices.

## Layout

The spatial model relies on strict architectural alignment, asymmetric balance, and generous breathing margins.

- **Container Constraints**: Maximum width of `80rem` (`1280px`) centered with responsive inline gutters (`1rem` / `16px` on mobile, `2rem` / `32px` on desktop).
- **Vertical Spacing Rhythm**: Standard section padding is `5rem` (`80px`) on desktop and `2.5rem` (`40px`) on mobile.
- **Asymmetric Golden Ratio**: Dual-column narrative layouts allocate 38% to the sticky editorial thesis and 62% to the interactive dossier or showcase cards.
- **Snap Rail Mobile Adaptation**: Horizontal multi-column desktop grids collapse to touch-friendly snap rails (`.snap-rail`) on mobile devices, preventing cramped vertical stacking.

## Elevation & Depth

Surfaces are architectural and flat by default. Depth is expressed through tonal transitions (`#F9F8F5` to `#FFFFFF` to `#163038`) and razor-sharp hairline borders (`1px solid #DEE0DD`) rather than muddy drop shadows.

### Shadow Vocabulary

- **Card Rest**: Zero elevation. Flat on canvas with `1px solid var(--border)` boundary.
- **Card Hover** (`card-elevate`): `box-shadow: 0 18px 40px -26px rgba(7, 25, 30, 0.35); border-color: color-mix(in oklab, var(--brass) 55%, transparent);` Subtle upward translation (-2px) with controlled diffused depth.
- **Modal & Dossier Depth**: `box-shadow: 0 24px 64px -16px rgba(7, 25, 30, 0.45); backdrop-filter: blur(16px);` Clean spatial isolation.

### Named Rules

**The Flat-By-Default Rule.** No card or panel carries an ambient drop shadow at rest. Depth is strictly an active state response to user hover, focus, or modal presentation.

## Shapes

- **Corners**: Restrained architectural rounding (`4px` / `0.25rem` standard). Pill-shaped elements (`rounded-full`) are strictly reserved for status badges, tag chips, and circular playback buttons.
- **Dividers**: Crisp 1px hairline rules (`rule-t`, `rule-b`).
- **Aspect Ratios**: Architectural photography adheres strictly to `16:9` (panoramas), `4:3` (residence exteriors), or `1:1` (detail vignettes).

## Components

### Buttons

- **Shape**: Subtle corner radius (`var(--radius)`: `4px`), uppercase tracking (`0.06em`), 44px minimum touch target height.
- **Primary Button** (`.btn-primary`): Deep forest petrol background (`#163038`), white text. On hover, swept with a smooth brass underlay (`var(--brass)`).
- **Outline Button** (`.btn-outline`): Pure white or transparent background, 1px `#DEE0DD` border, petrol text. Shifts to `#F7F6F2` on hover.
- **Light Button** (`.btn-light`): Pure white background on dark sections, petrol text.

### Chips & Badges

- **Status Badges**: Pill-shaped (`rounded-full`), `12px` font size, `500` weight.
- **Citizenship Ready**: Emerald background tint (`rgba(16, 120, 95, 0.1)`), emerald text (`#10785F`), 1px emerald border.

### Property Cards

- **Structure**: Flat white container (`#FFFFFF`), 1px border (`#DEE0DD`), smooth image zoom container on hover (`scale(1.04)` over 900ms ease).
- **Information Architecture**: Micro eyebrow (`Zeytinburnu · Istanbul`), high-contrast title, tabular price (`From $1,079,000`), and dual CTAs (Inquire + Details).

### Form Fields & Inputs

- **Base Style**: Minimum `44px` height (`field`), 1px solid border (`#DEE0DD`), `16px` font size on touch devices to prevent mobile iOS auto-zoom.
- **Focus State**: 2px ring in brass (`#C5A059`) with 2px offset.

### Navigation Header

- **Floating Pill Bar**: Ivory/cream glassmorphic surface (`backdrop-blur-md`), 1px border, centered links with growing brass baseline indicators (`nav-link`).

## Do's and Don'ts

### Do:

- **Do** maintain a strict 44px minimum interactive target height for all buttons, select boxes, and clickable items on touch viewports.
- **Do** preserve the dual-font hierarchy: Cormorant Garamond exclusively for Display/Headline/Numeral; Manrope for titles, body copy, and interface labels.
- **Do** respect user motion preferences by ensuring all GSAP and CSS animations collapse cleanly under `@media (prefers-reduced-motion: reduce)`.
- **Do** verify that all property square-meter metrics clearly differentiate between Gross and Net areas.
- **Do** format all monetary amounts with currency codes and thousand separators (`$1,079,000`).

### Don't:

- **Don't** use heavy saturated primary colors (e.g. bright blue, standard purple, neon greens) anywhere on public surfaces.
- **Don't** apply AI-slop tropes such as `border-l-4` side-tab card accents, bouncing floating badges, or fake pulsating live dots.
- **Don't** load overused generic fonts (Geist, Inter, Roboto) as the primary brand display faces.
- **Don't** allow interactive text or badges to overlap with floating controls or "Keep Scrolling" indicators on smaller desktop screens.
- **Don't** use drop shadows at rest on static cards or content panels.
