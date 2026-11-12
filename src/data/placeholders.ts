/**
 * Centralized Placeholder Image Registry
 * ----------------------------------------------------------------------------
 * All redesign sections (Hero, About 3D Arc Gallery, Services Timeline,
 * Dark Projects Showcase, and Footer) pull their image assets from this file.
 *
 * When final production photography is ready, simply replace the `customSrc`
 * field (or `src`) for any slot below. Until then, each slot renders a
 * purpose-built architectural SVG placeholder matched to its exact aspect
 * ratio and visual tone.
 */

export interface PlaceholderSlot {
  id: string;
  section: "hero" | "about" | "services" | "projects" | "footer" | "locations" | "properties";
  label: string;
  dimensions: string;
  aspectRatio: string;
  alt: string;
  /** Set this to a final image URL (e.g. "/images/...") when ready to replace the placeholder */
  customSrc?: string;
  /** Built-in SVG data URI placeholder */
  placeholderSrc: string;
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Generates an architectural facade / elevation placeholder SVG
 */
function createArchitecturalPlaceholderSvg(opts: {
  width: number;
  height: number;
  slotCode: string;
  title: string;
  skyTop: string;
  skyBottom: string;
  buildingPrimary: string;
  buildingSecondary: string;
  accent: string;
  variant?: "tower" | "elevation" | "courtyard" | "perspective" | "minimal";
}): string {
  const {
    width,
    height,
    slotCode,
    title,
    skyTop,
    skyBottom,
    buildingPrimary,
    buildingSecondary,
    accent,
    variant = "elevation",
  } = opts;

  const cx = Math.round(width / 2);
  const cy = Math.round(height / 2);

  let geometry = "";
  if (variant === "perspective") {
    geometry = `
      <!-- Symmetrical upward-looking architectural colonnade -->
      <polygon points="0,0 ${Math.round(width * 0.42)},0 ${Math.round(width * 0.3)},${height} 0,${height}" fill="${buildingPrimary}" />
      <polygon points="${width},0 ${Math.round(width * 0.58)},0 ${Math.round(width * 0.7)},${height} ${width},${height}" fill="${buildingSecondary}" />
      <line x1="${Math.round(width * 0.42)}" y1="0" x2="${Math.round(width * 0.3)}" y2="${height}" stroke="${accent}" stroke-width="3" stroke-opacity="0.55" />
      <line x1="${Math.round(width * 0.58)}" y1="0" x2="${Math.round(width * 0.7)}" y2="${height}" stroke="${accent}" stroke-width="3" stroke-opacity="0.55" />
      <!-- Cantilevered ribs -->
      <polygon points="0,${Math.round(height * 0.18)} ${Math.round(width * 0.39)},${Math.round(height * 0.24)} ${Math.round(width * 0.37)},${Math.round(height * 0.34)} 0,${Math.round(height * 0.3)}" fill="${accent}" fill-opacity="0.28" />
      <polygon points="${width},${Math.round(height * 0.18)} ${Math.round(width * 0.61)},${Math.round(height * 0.24)} ${Math.round(width * 0.63)},${Math.round(height * 0.34)} ${width},${Math.round(height * 0.3)}" fill="${accent}" fill-opacity="0.28" />
      <polygon points="0,${Math.round(height * 0.48)} ${Math.round(width * 0.35)},${Math.round(height * 0.52)} ${Math.round(width * 0.33)},${Math.round(height * 0.62)} 0,${Math.round(height * 0.58)}" fill="${accent}" fill-opacity="0.22" />
      <polygon points="${width},${Math.round(height * 0.48)} ${Math.round(width * 0.65)},${Math.round(height * 0.52)} ${Math.round(width * 0.67)},${Math.round(height * 0.62)} ${width},${Math.round(height * 0.58)}" fill="${accent}" fill-opacity="0.22" />
    `;
  } else if (variant === "courtyard") {
    geometry = `
      <!-- Two-tone architectural wall & arched portal -->
      <rect x="0" y="0" width="${cx}" height="${height}" fill="${buildingPrimary}" />
      <rect x="${cx}" y="0" width="${cx}" height="${height}" fill="${buildingSecondary}" />
      <!-- Arched doorway -->
      <path d="M ${cx - 110} ${height} L ${cx - 110} ${cy + 40} A 110 110 0 0 1 ${cx + 110} ${cy + 40} L ${cx + 110} ${height} Z" fill="#18222d" stroke="${accent}" stroke-width="4" />
      <path d="M ${cx - 82} ${height} L ${cx - 82} ${cy + 55} A 82 82 0 0 1 ${cx + 82} ${cy + 55} L ${cx + 82} ${height} Z" fill="#22313f" />
      <!-- Architectural shadow / canopy -->
      <circle cx="${cx + 20}" cy="${cy - 80}" r="140" fill="${accent}" fill-opacity="0.35" />
      <circle cx="${cx - 40}" cy="${cy - 60}" r="110" fill="${buildingPrimary}" fill-opacity="0.5" />
    `;
  } else {
    geometry = `
      <!-- Stepped modern Mediterranean architectural volumes -->
      <rect x="${Math.round(width * 0.14)}" y="${Math.round(height * 0.24)}" width="${Math.round(width * 0.44)}" height="${Math.round(height * 0.76)}" rx="4" fill="${buildingPrimary}" />
      <rect x="${Math.round(width * 0.48)}" y="${Math.round(height * 0.38)}" width="${Math.round(width * 0.38)}" height="${Math.round(height * 0.62)}" rx="4" fill="${buildingSecondary}" />
      <!-- Recessed windows -->
      <rect x="${Math.round(width * 0.24)}" y="${Math.round(height * 0.36)}" width="${Math.round(width * 0.12)}" height="${Math.round(height * 0.2)}" rx="2" fill="#16222f" fill-opacity="0.75" />
      <rect x="${Math.round(width * 0.24)}" y="${Math.round(height * 0.62)}" width="${Math.round(width * 0.12)}" height="${Math.round(height * 0.22)}" rx="2" fill="#16222f" fill-opacity="0.75" />
      <rect x="${Math.round(width * 0.6)}" y="${Math.round(height * 0.48)}" width="${Math.round(width * 0.14)}" height="${Math.round(height * 0.22)}" rx="2" fill="#16222f" fill-opacity="0.75" />
      <!-- Accent cornice & balustrade -->
      <rect x="${Math.round(width * 0.12)}" y="${Math.round(height * 0.23)}" width="${Math.round(width * 0.48)}" height="6" fill="${accent}" />
      <line x1="${Math.round(width * 0.46)}" y1="${Math.round(height * 0.6)}" x2="${Math.round(width * 0.86)}" y2="${Math.round(height * 0.6)}" stroke="${accent}" stroke-width="3" stroke-opacity="0.7" />
    `;
  }

  return svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${skyTop}" />
          <stop offset="100%" stop-color="${skyBottom}" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" stroke-width="0.75" stroke-opacity="0.1" />
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#sky)" />
      <rect width="${width}" height="${height}" fill="url(#grid)" />
      ${geometry}
      <!-- Subtle placeholder badge -->
      <g transform="translate(16, 16)">
        <rect width="168" height="26" rx="13" fill="#0e0e0c" fill-opacity="0.55" />
        <text x="12" y="17" fill="#ffffff" fill-opacity="0.9" font-family="Inter, sans-serif" font-size="10" font-weight="600" letter-spacing="1.2">
          ${slotCode} · ${width}×${height}
        </text>
      </g>
      <text x="18" y="${height - 16}" fill="#ffffff" fill-opacity="0.75" font-family="Inter, sans-serif" font-size="11" font-weight="500" letter-spacing="0.5">
        ${title}
      </text>
    </svg>
  `);
}

/**
 * Hero Central Tower + Evening Cityscape Cutout SVG (Image 1)
 * Transparent upper canvas so the white inner card behind the headline remains clean,
 * while the glass tower rises up into the center and merges with the dusk cityscape below.
 */
const HERO_TOWER_CITYSCAPE_SVG = svgToDataUri(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 1440" width="2560" height="1440">
    <defs>
      <linearGradient id="duskGlow" x1="0" y1="0.55" x2="0" y2="1">
        <stop offset="0%" stop-color="#dfe9f6" stop-opacity="0" />
        <stop offset="28%" stop-color="#c3d4ec" stop-opacity="0.65" />
        <stop offset="52%" stop-color="#5d78a3" stop-opacity="0.92" />
        <stop offset="100%" stop-color="#182030" stop-opacity="1" />
      </linearGradient>
      <linearGradient id="towerGlassLeft" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#5a82b8" />
        <stop offset="45%" stop-color="#3d6194" />
        <stop offset="100%" stop-color="#1e2d44" />
      </linearGradient>
      <linearGradient id="towerGlassRight" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#8cb3e2" />
        <stop offset="50%" stop-color="#567aab" />
        <stop offset="100%" stop-color="#283952" />
      </linearGradient>
      <linearGradient id="warmWindow" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ffdfa8" stop-opacity="0.88" />
        <stop offset="100%" stop-color="#f3a953" stop-opacity="0.65" />
      </linearGradient>
    </defs>

    <!-- Lower horizon dusk atmosphere -->
    <rect x="0" y="760" width="2560" height="680" fill="url(#duskGlow)" />

    <!-- Distant city skyline silhouette -->
    <g fill="#2b3952" opacity="0.85">
      <rect x="0" y="960" width="180" height="480" />
      <rect x="160" y="930" width="150" height="510" />
      <rect x="290" y="975" width="210" height="465" />
      <rect x="480" y="940" width="170" height="500" />
      <rect x="630" y="965" width="190" height="475" />
      <rect x="800" y="925" width="220" height="515" />
      <rect x="1540" y="935" width="210" height="505" />
      <rect x="1730" y="965" width="185" height="475" />
      <rect x="1900" y="920" width="195" height="520" />
      <rect x="2080" y="950" width="220" height="490" />
      <rect x="2280" y="935" width="280" height="505" />
    </g>

    <!-- Midground classical European/Istanbul low-rise blocks with warm windows -->
    <g>
      <!-- Left quarter blocks -->
      <rect x="40" y="1030" width="310" height="330" rx="3" fill="#3a3538" />
      <rect x="380" y="1060" width="330" height="300" rx="3" fill="#463e3f" />
      <rect x="740" y="1040" width="270" height="320" rx="3" fill="#373338" />
      <!-- Right quarter blocks -->
      <rect x="1550" y="1045" width="290" height="315" rx="3" fill="#3d373b" />
      <rect x="1870" y="1060" width="340" height="300" rx="3" fill="#483f40" />
      <rect x="2240" y="1030" width="280" height="330" rx="3" fill="#383337" />

      <!-- Warm evening window grids on mid-rise buildings -->
      <g fill="#f6c177" fill-opacity="0.65">
        <rect x="75" y="1070" width="22" height="18" /><rect x="115" y="1070" width="22" height="18" /><rect x="195" y="1070" width="22" height="18" /><rect x="235" y="1070" width="22" height="18" />
        <rect x="75" y="1115" width="22" height="18" /><rect x="155" y="1115" width="22" height="18" /><rect x="235" y="1115" width="22" height="18" /><rect x="275" y="1115" width="22" height="18" />
        <rect x="415" y="1095" width="24" height="18" /><rect x="460" y="1095" width="24" height="18" /><rect x="550" y="1095" width="24" height="18" /><rect x="640" y="1095" width="24" height="18" />
        <rect x="415" y="1140" width="24" height="18" /><rect x="505" y="1140" width="24" height="18" /><rect x="595" y="1140" width="24" height="18" /><rect x="640" y="1140" width="24" height="18" />
        <rect x="775" y="1080" width="20" height="18" /><rect x="820" y="1080" width="20" height="18" /><rect x="910" y="1080" width="20" height="18" /><rect x="955" y="1080" width="20" height="18" />
        <rect x="1590" y="1085" width="22" height="18" /><rect x="1640" y="1085" width="22" height="18" /><rect x="1740" y="1085" width="22" height="18" /><rect x="1790" y="1085" width="22" height="18" />
        <rect x="1590" y="1135" width="22" height="18" /><rect x="1690" y="1135" width="22" height="18" /><rect x="1740" y="1135" width="22" height="18" />
        <rect x="1910" y="1095" width="24" height="18" /><rect x="1960" y="1095" width="24" height="18" /><rect x="2060" y="1095" width="24" height="18" /><rect x="2110" y="1095" width="24" height="18" />
        <rect x="1910" y="1145" width="24" height="18" /><rect x="2010" y="1145" width="24" height="18" /><rect x="2110" y="1145" width="24" height="18" />
      </g>
    </g>

    <!-- Boulevard light trails -->
    <path d="M 0 1320 L 980 1440 L 1060 1440 L 0 1295 Z" fill="#e86f52" fill-opacity="0.35" />
    <path d="M 2560 1330 L 1640 1440 L 1560 1440 L 2560 1300 Z" fill="#f6c177" fill-opacity="0.35" />

    <!-- Rooftop botanical crown on the central tower -->
    <g fill="#3a4d2c">
      <circle cx="1175" cy="245" r="34" />
      <circle cx="1215" cy="232" r="40" fill="#4a5f38" />
      <circle cx="1265" cy="222" r="44" fill="#354827" />
      <circle cx="1318" cy="215" r="48" fill="#4f663c" />
      <circle cx="1368" cy="230" r="38" fill="#3a4d2c" />
      <circle cx="1140" cy="260" r="28" fill="#4f663c" />
    </g>

    <!-- Central Architectural Glass Tower (rises from y=235 to 1440) -->
    <!-- Left main prism -->
    <polygon points="1090,265 1305,225 1305,1420 1090,1400" fill="url(#towerGlassLeft)" />
    <!-- Right main prism -->
    <polygon points="1305,225 1475,260 1475,1400 1305,1420" fill="url(#towerGlassRight)" />

    <!-- Warm interior residential lighting bands inside the tower -->
    <g fill="url(#warmWindow)">
      <rect x="1115" y="310" width="165" height="24" rx="2" />
      <rect x="1325" y="310" width="125" height="24" rx="2" />
      <rect x="1115" y="365" width="110" height="24" rx="2" />
      <rect x="1325" y="365" width="130" height="24" rx="2" />
      <rect x="1115" y="420" width="165" height="24" rx="2" />
      <rect x="1115" y="475" width="140" height="24" rx="2" />
      <rect x="1325" y="475" width="120" height="24" rx="2" />
      <rect x="1115" y="530" width="165" height="24" rx="2" />
      <rect x="1325" y="530" width="130" height="24" rx="2" />
      <rect x="1115" y="585" width="125" height="24" rx="2" />
      <rect x="1325" y="585" width="110" height="24" rx="2" />
      <rect x="1115" y="640" width="165" height="24" rx="2" />
      <rect x="1325" y="640" width="130" height="24" rx="2" />
      <rect x="1115" y="695" width="150" height="24" rx="2" />
      <rect x="1325" y="695" width="125" height="24" rx="2" />
      <rect x="1115" y="750" width="165" height="24" rx="2" />
      <rect x="1325" y="750" width="130" height="24" rx="2" />
      <rect x="1115" y="805" width="165" height="24" rx="2" />
      <rect x="1325" y="805" width="125" height="24" rx="2" />
      <rect x="1115" y="860" width="155" height="24" rx="2" />
      <rect x="1325" y="860" width="130" height="24" rx="2" />
      <rect x="1115" y="915" width="165" height="24" rx="2" />
      <rect x="1325" y="915" width="125" height="24" rx="2" />
      <rect x="1115" y="970" width="165" height="24" rx="2" />
      <rect x="1325" y="970" width="130" height="24" rx="2" />
      <rect x="1115" y="1025" width="165" height="24" rx="2" />
      <rect x="1325" y="1025" width="130" height="24" rx="2" />
      <rect x="1115" y="1080" width="165" height="24" rx="2" />
      <rect x="1325" y="1080" width="125" height="24" rx="2" />
      <rect x="1115" y="1135" width="165" height="24" rx="2" />
      <rect x="1325" y="1135" width="130" height="24" rx="2" />
      <rect x="1115" y="1190" width="165" height="24" rx="2" />
      <rect x="1325" y="1190" width="130" height="24" rx="2" />
      <rect x="1115" y="1245" width="165" height="24" rx="2" />
      <rect x="1325" y="1245" width="130" height="24" rx="2" />
    </g>

    <!-- Vertical architectural mullions on the tower -->
    <g stroke="#dce8f7" stroke-opacity="0.55" stroke-width="2">
      <line x1="1130" y1="258" x2="1130" y2="1405" />
      <line x1="1175" y1="250" x2="1175" y2="1408" />
      <line x1="1220" y1="242" x2="1220" y2="1412" />
      <line x1="1265" y1="234" x2="1265" y2="1416" />
      <line x1="1305" y1="225" x2="1305" y2="1420" stroke-width="4" stroke-opacity="0.85" />
      <line x1="1348" y1="234" x2="1348" y2="1415" />
      <line x1="1390" y1="243" x2="1390" y2="1410" />
      <line x1="1432" y1="252" x2="1432" y2="1405" />
    </g>

    <!-- Street-level canopy trees around tower base -->
    <g fill="#1f3124">
      <circle cx="960" cy="1365" r="55" />
      <circle cx="1030" cy="1380" r="65" />
      <circle cx="1510" cy="1375" r="62" />
      <circle cx="1585" cy="1365" r="54" />
    </g>
  </svg>
`);

const HERO_SHOWREEL_THUMB_SVG = createArchitecturalPlaceholderSvg({
  width: 240,
  height: 240,
  slotCode: "REEL",
  title: "Showreel",
  skyTop: "#133c8c",
  skyBottom: "#5d89c8",
  buildingPrimary: "#2e4b78",
  buildingSecondary: "#4c72a8",
  accent: "#ffdfa8",
  variant: "elevation",
});

export const PLACEHOLDER_IMAGES = {
  hero: {
    towerSkyline: {
      id: "hero-tower-skyline",
      section: "hero",
      label: "Hero Luxury Residential Complex (Extended)",
      dimensions: "1024 × 512",
      aspectRatio: "2 / 1",
      alt: "Avrasya luxury residential complex with lush gardens and street frontage",
      customSrc: "/images/hero-building-avrasya.png",
      placeholderSrc: HERO_TOWER_CITYSCAPE_SVG,
    } satisfies PlaceholderSlot,
    showreelThumb: {
      id: "hero-showreel-thumb",
      section: "hero",
      label: "Showreel Circular Thumbnail",
      dimensions: "240 × 240",
      aspectRatio: "1 / 1",
      alt: "Watch Avrasya architectural showreel",
      placeholderSrc: HERO_SHOWREEL_THUMB_SVG,
    } satisfies PlaceholderSlot,
  },

  aboutArcGallery: [
    {
      id: "about-arc-01",
      section: "about",
      label: "Arc Gallery Card 01",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 01",
      customSrc: "https://framerusercontent.com/images/EfGZ3Fu5TiQDizhW8JDd8PhL5A.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-01",
        title: "Bosphorus Facade Study I",
        skyTop: "#d45745",
        skyBottom: "#e88873",
        buildingPrimary: "#b92b27",
        buildingSecondary: "#3a3f47",
        accent: "#f7d08a",
        variant: "elevation",
      }),
    },
    {
      id: "about-arc-02",
      section: "about",
      label: "Arc Gallery Card 02",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 02",
      customSrc: "https://framerusercontent.com/images/Zd97lFlvKGPiO5hgqVxmC64fko.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-02",
        title: "Bebek Terraced Residence",
        skyTop: "#4f818c",
        skyBottom: "#82aeb5",
        buildingPrimary: "#d94126",
        buildingSecondary: "#e9963e",
        accent: "#fff1d0",
        variant: "elevation",
      }),
    },
    {
      id: "about-arc-03",
      section: "about",
      label: "Arc Gallery Card 03",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 03",
      customSrc: "https://framerusercontent.com/images/FnVYdoD4iZyt8jlCHZAQwUrPo1s.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-03",
        title: "Galata Heritage Corner",
        skyTop: "#2758a5",
        skyBottom: "#5383cc",
        buildingPrimary: "#b51d3a",
        buildingSecondary: "#e03a62",
        accent: "#f8e9d2",
        variant: "elevation",
      }),
    },
    {
      id: "about-arc-04",
      section: "about",
      label: "Arc Gallery Card 04",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 04",
      customSrc: "https://framerusercontent.com/images/vJNECGniIXp2RLsNhy6kGFHSoY.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-04",
        title: "Nişantaşı Modernist Tower",
        skyTop: "#0e83b0",
        skyBottom: "#4cb5d6",
        buildingPrimary: "#d63215",
        buildingSecondary: "#f09319",
        accent: "#faebd7",
        variant: "elevation",
      }),
    },
    {
      id: "about-arc-05",
      section: "about",
      label: "Arc Gallery Card 05",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 05",
      customSrc: "https://framerusercontent.com/images/KxY8QlZXDBmCwGkqNQeN9vnP18.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-05",
        title: "Kandilli Waterfront Villa",
        skyTop: "#8da7be",
        skyBottom: "#d6c5b3",
        buildingPrimary: "#9e1915",
        buildingSecondary: "#2c353d",
        accent: "#ffcf78",
        variant: "elevation",
      }),
    },
    {
      id: "about-arc-06",
      section: "about",
      label: "Arc Gallery Card 06",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 06",
      customSrc: "https://framerusercontent.com/images/twzhTXyV5b8tirGdVjDk4jalgI.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-06",
        title: "Yalıkavak Cantilever Pavilion",
        skyTop: "#d4d7dc",
        skyBottom: "#eaedf0",
        buildingPrimary: "#c72411",
        buildingSecondary: "#8a1609",
        accent: "#1f2d3d",
        variant: "elevation",
      }),
    },
    {
      id: "about-arc-07",
      section: "about",
      label: "Arc Gallery Card 07",
      dimensions: "260 × 370",
      aspectRatio: "260 / 370",
      alt: "Architectural elevation 07",
      customSrc: "https://framerusercontent.com/images/1DPTLzUFF0BlzEDnIS2nmTteCQ.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 520,
        height: 740,
        slotCode: "ARC-07",
        title: "Sarıyer Coastal Sanctuary",
        skyTop: "#c84b3c",
        skyBottom: "#dd7769",
        buildingPrimary: "#8f1d18",
        buildingSecondary: "#323c47",
        accent: "#f4d398",
        variant: "elevation",
      }),
    },
  ] satisfies PlaceholderSlot[],

  servicesTimeline: [
    {
      id: "service-timeline-01",
      section: "services",
      label: "Service 01 Placeholder",
      dimensions: "465 × 280",
      aspectRatio: "465 / 280",
      alt: "01 — Portfolio Strategy & Acquisition Advisory",
      customSrc: "https://framerusercontent.com/images/CLmCsdh7AwPcBQ3vC46NXF6xx1I.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 930,
        height: 560,
        slotCode: "SVC-01",
        title: "01 · Acquisition Strategy & Consultation",
        skyTop: "#0099db",
        skyBottom: "#4cc3f2",
        buildingPrimary: "#007bb8",
        buildingSecondary: "#046194",
        accent: "#e01e26",
        variant: "elevation",
      }),
    },
    {
      id: "service-timeline-02",
      section: "services",
      label: "Service 02 Placeholder",
      dimensions: "465 × 280",
      aspectRatio: "465 / 280",
      alt: "02 — Independent Valuation & Technical Due Diligence",
      customSrc: "https://framerusercontent.com/images/USomtnNx14oYfAnxeOJ8hrr0A.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 930,
        height: 560,
        slotCode: "SVC-02",
        title: "02 · Reliable Partnership & Due Diligence",
        skyTop: "#0084d1",
        skyBottom: "#38a8eb",
        buildingPrimary: "#0d5c9e",
        buildingSecondary: "#e5a000",
        accent: "#c9161d",
        variant: "elevation",
      }),
    },
    {
      id: "service-timeline-03",
      section: "services",
      label: "Service 03 Placeholder",
      dimensions: "465 × 280",
      aspectRatio: "465 / 280",
      alt: "03 — Title Deed (Tapu) & Legal Structuring",
      customSrc: "https://framerusercontent.com/images/T4e0Xpo4pW6qftc9WUaOHuqi1Ts.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 930,
        height: 560,
        slotCode: "SVC-03",
        title: "03 · Precision Execution & Legal Conveyancing",
        skyTop: "#2b7cc9",
        skyBottom: "#6ca9e0",
        buildingPrimary: "#0e589e",
        buildingSecondary: "#093d73",
        accent: "#9e5a24",
        variant: "elevation",
      }),
    },
    {
      id: "service-timeline-04",
      section: "services",
      label: "Service 04 Placeholder",
      dimensions: "465 × 280",
      aspectRatio: "465 / 280",
      alt: "04 — Citizenship by Investment Filing",
      customSrc: "https://framerusercontent.com/images/vmH3L7TXM8SCAdRPveilcXSYUU.png",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 930,
        height: 560,
        slotCode: "SVC-04",
        title: "04 · Built on Integrity & Regulatory Compliance",
        skyTop: "#2799b8",
        skyBottom: "#6dc4db",
        buildingPrimary: "#e08700",
        buildingSecondary: "#b86800",
        accent: "#163832",
        variant: "elevation",
      }),
    },
    {
      id: "service-timeline-05",
      section: "services",
      label: "Service 05 Placeholder",
      dimensions: "465 × 280",
      aspectRatio: "465 / 280",
      alt: "05 — Architectural Design & Turnkey Interiors",
      customSrc: "https://framerusercontent.com/images/B2M54hVabRSe3CMSxEJb5pYVlJs.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 930,
        height: 560,
        slotCode: "SVC-05",
        title: "05 · Modern Architectural & Interior Curation",
        skyTop: "#1a6fb0",
        skyBottom: "#5ba4db",
        buildingPrimary: "#124e82",
        buildingSecondary: "#d96b27",
        accent: "#ffffff",
        variant: "elevation",
      }),
    },
    {
      id: "service-timeline-06",
      section: "services",
      label: "Service 06 Placeholder",
      dimensions: "465 × 280",
      aspectRatio: "465 / 280",
      alt: "06 — Ongoing Asset, Yield & Rental Stewardship",
      customSrc: "https://framerusercontent.com/images/ZhJhV3gSPlTtS9AvPePLsIAjHn0.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 930,
        height: 560,
        slotCode: "SVC-06",
        title: "06 · Long-Term Asset & Yield Management",
        skyTop: "#0f548c",
        skyBottom: "#4287bf",
        buildingPrimary: "#c94a1a",
        buildingSecondary: "#1c3b57",
        accent: "#f5c26b",
        variant: "elevation",
      }),
    },
  ] satisfies PlaceholderSlot[],

  projectsShowcase: [
    {
      id: "project-showcase-01",
      section: "projects",
      label: "Project Showcase 01",
      dimensions: "1920 × 1080",
      aspectRatio: "16 / 9",
      alt: "The Oakline Residence",
      customSrc: "https://framerusercontent.com/images/hv1aKcrAeS1rhkbwOsFcMxP7U3Q.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1920,
        height: 1080,
        slotCode: "PRJ-01",
        title: "01 · Signature Residence Showcase Placeholder",
        skyTop: "#d9460f",
        skyBottom: "#8f2506",
        buildingPrimary: "#c73c0a",
        buildingSecondary: "#e89505",
        accent: "#ff2a00",
        variant: "courtyard",
      }),
    },
    {
      id: "project-showcase-02",
      section: "projects",
      label: "Project Showcase 02",
      dimensions: "1920 × 1080",
      aspectRatio: "16 / 9",
      alt: "Northgate Business Center",
      customSrc: "https://framerusercontent.com/images/xevJGKRPeH22KjENIyu8Sy6tNzk.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1920,
        height: 1080,
        slotCode: "PRJ-02",
        title: "02 · Waterfront Estate Showcase Placeholder",
        skyTop: "#133c8c",
        skyBottom: "#0c1d42",
        buildingPrimary: "#1d447a",
        buildingSecondary: "#b84a1c",
        accent: "#f5b041",
        variant: "courtyard",
      }),
    },
    {
      id: "project-showcase-03",
      section: "projects",
      label: "Project Showcase 03",
      dimensions: "1920 × 1080",
      aspectRatio: "16 / 9",
      alt: "Riverside Heights",
      customSrc: "https://framerusercontent.com/images/Mnl9zaClpgnVwkPzz8clV1t6PI.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1920,
        height: 1080,
        slotCode: "PRJ-03",
        title: "03 · Aegean Peninsula Villa Showcase Placeholder",
        skyTop: "#0e6b8a",
        skyBottom: "#073445",
        buildingPrimary: "#135870",
        buildingSecondary: "#d46a28",
        accent: "#f7dc6f",
        variant: "courtyard",
      }),
    },
    {
      id: "project-showcase-04",
      section: "projects",
      label: "Project Showcase 04",
      dimensions: "1920 × 1080",
      aspectRatio: "16 / 9",
      alt: "Grandstone Pavilion",
      customSrc: "https://framerusercontent.com/images/m34knIAc4MRg7b8M1lqd5gQ.jpg",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1920,
        height: 1080,
        slotCode: "PRJ-04",
        title: "04 · Landmark Pavilion Showcase Placeholder",
        skyTop: "#1a2530",
        skyBottom: "#0e151c",
        buildingPrimary: "#2d3748",
        buildingSecondary: "#c5a059",
        accent: "#e2e8f0",
        variant: "elevation",
      }),
    },
  ] satisfies PlaceholderSlot[],

  footer: {
    ctaBackdrop: {
      id: "footer-cta-backdrop",
      section: "footer",
      label: "Pre-Footer CTA Architectural Backdrop",
      dimensions: "2752 × 1500",
      aspectRatio: "2752 / 1500",
      alt: "Ready to build something exceptional architectural perspective placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1920,
        height: 1040,
        slotCode: "FTR-CTA",
        title: "Pre-Footer Architectural Colonnade Placeholder",
        skyTop: "#adb8c4",
        skyBottom: "#56616b",
        buildingPrimary: "#8f1512",
        buildingSecondary: "#700f0d",
        accent: "#e02b24",
        variant: "perspective",
      }),
    } satisfies PlaceholderSlot,
    featureCard: {
      id: "footer-feature-card",
      section: "footer",
      label: "Footer Brand Card Image",
      dimensions: "247 × 206",
      aspectRatio: "247 / 206",
      alt: "Avrasya architectural signature card placeholder",
      customSrc: "/images/media_1794439693005_f3c5cce1.png",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 494,
        height: 412,
        slotCode: "FTR-CARD",
        title: "Avrasya Signature",
        skyTop: "#07191e",
        skyBottom: "#133c8c",
        buildingPrimary: "#1f2d3d",
        buildingSecondary: "#b08d44",
        accent: "#f7e8d0",
        variant: "elevation",
      }),
    } satisfies PlaceholderSlot,
  },

  aboutPage: {
    storyPortrait: {
      id: "about-story-portrait",
      section: "about",
      label: "About Page · Our Story Portrait",
      dimensions: "1195 × 1593",
      aspectRatio: "1195 / 1593",
      alt: "Avrasya Properties Istanbul architectural sanctuary placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 960,
        height: 1280,
        slotCode: "ABT-STORY",
        title: "Avrasya Story · Bosphorus Sanctuary",
        skyTop: "#07191e",
        skyBottom: "#133c8c",
        buildingPrimary: "#1f2d3d",
        buildingSecondary: "#b08d44",
        accent: "#e6c786",
        variant: "courtyard",
      }),
    } satisfies PlaceholderSlot,
    approachPortrait: {
      id: "about-approach-portrait",
      section: "about",
      label: "About Page · Our Approach Portrait",
      dimensions: "614 × 894",
      aspectRatio: "614 / 894",
      alt: "Avrasya Properties in-house legal & architectural due diligence placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 760,
        height: 1100,
        slotCode: "ABT-APPROACH",
        title: "Our Approach · Legal & Technical Precision",
        skyTop: "#0e2942",
        skyBottom: "#1f4e78",
        buildingPrimary: "#163552",
        buildingSecondary: "#c5a059",
        accent: "#f7e8d0",
        variant: "elevation",
      }),
    } satisfies PlaceholderSlot,
    expertiseCards: [
      {
        id: "about-expertise-01",
        section: "about",
        label: "Expertise 01 · In-House Legal Due Diligence",
        dimensions: "736 × 1104",
        aspectRatio: "2 / 3",
        alt: "In-House Attorney Title Deed & Legal Structuring placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 1104,
          slotCode: "EXP-01",
          title: "01 · In-House Legal Due Diligence",
          skyTop: "#07191e",
          skyBottom: "#133c8c",
          buildingPrimary: "#1a3352",
          buildingSecondary: "#b08d44",
          accent: "#f3dfb6",
          variant: "elevation",
        }),
      },
      {
        id: "about-expertise-02",
        section: "about",
        label: "Expertise 02 · Turkish Citizenship by Investment",
        dimensions: "736 × 1104",
        aspectRatio: "2 / 3",
        alt: "Turkish Citizenship by Investment Advisory placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 1104,
          slotCode: "EXP-02",
          title: "02 · Citizenship & Residency Advisory",
          skyTop: "#122b40",
          skyBottom: "#2a577a",
          buildingPrimary: "#b08d44",
          buildingSecondary: "#1f2d3d",
          accent: "#ffffff",
          variant: "courtyard",
        }),
      },
      {
        id: "about-expertise-03",
        section: "about",
        label: "Expertise 03 · Turnkey Asset & Yield Stewardship",
        dimensions: "736 × 1104",
        aspectRatio: "2 / 3",
        alt: "Turnkey Interiors & Long-Term Rental Management placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 1104,
          slotCode: "EXP-03",
          title: "03 · Turnkey Asset Management",
          skyTop: "#133c8c",
          skyBottom: "#3d6ca8",
          buildingPrimary: "#1c3654",
          buildingSecondary: "#c5a059",
          accent: "#ffdfa8",
          variant: "perspective",
        }),
      },
    ] satisfies PlaceholderSlot[],
    teamMembers: [
      {
        id: "about-team-01",
        section: "about",
        label: "Team Member 01 Placeholder",
        dimensions: "736 × 736",
        aspectRatio: "1 / 1",
        alt: "Managing Director & Senior Property Advisor portrait placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 736,
          slotCode: "TEAM-01",
          title: "Managing Partner · Senior Advisor",
          skyTop: "#07191e",
          skyBottom: "#1f2d3d",
          buildingPrimary: "#133c8c",
          buildingSecondary: "#b08d44",
          accent: "#f7e8d0",
          variant: "elevation",
        }),
      },
      {
        id: "about-team-02",
        section: "about",
        label: "Team Member 02 Placeholder",
        dimensions: "736 × 736",
        aspectRatio: "1 / 1",
        alt: "In-House Attorney & Head of Conveyancing portrait placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 736,
          slotCode: "TEAM-02",
          title: "In-House Attorney · Legal Counsel",
          skyTop: "#133c8c",
          skyBottom: "#07191e",
          buildingPrimary: "#b08d44",
          buildingSecondary: "#1f2d3d",
          accent: "#ffffff",
          variant: "courtyard",
        }),
      },
      {
        id: "about-team-03",
        section: "about",
        label: "Team Member 03 Placeholder",
        dimensions: "736 × 736",
        aspectRatio: "1 / 1",
        alt: "Head of International Client Relations portrait placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 736,
          slotCode: "TEAM-03",
          title: "Director · International Desk",
          skyTop: "#18314a",
          skyBottom: "#0c1c2c",
          buildingPrimary: "#24476b",
          buildingSecondary: "#c5a059",
          accent: "#f7e8d0",
          variant: "elevation",
        }),
      },
      {
        id: "about-team-04",
        section: "about",
        label: "Team Member 04 Placeholder",
        dimensions: "736 × 736",
        aspectRatio: "1 / 1",
        alt: "Portfolio Valuation & Handover Specialist portrait placeholder",
        placeholderSrc: createArchitecturalPlaceholderSvg({
          width: 736,
          height: 736,
          slotCode: "TEAM-04",
          title: "Head of Valuation & Handover",
          skyTop: "#1f2d3d",
          skyBottom: "#07191e",
          buildingPrimary: "#133c8c",
          buildingSecondary: "#9e7a32",
          accent: "#ffdfa8",
          variant: "perspective",
        }),
      },
    ] satisfies PlaceholderSlot[],
  },

  locationsPage: [
    {
      id: "location-region-01",
      section: "locations",
      label: "Region 01 · Istanbul Portrait",
      dimensions: "1240 × 1520",
      aspectRatio: "620 / 760",
      alt: "Istanbul Bosphorus & Financial Corridor architectural placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1240,
        height: 1520,
        slotCode: "LOC-01 · ISTANBUL",
        title: "01 · Istanbul — Bosphorus, Maslak & Ataşehir",
        skyTop: "#07191e",
        skyBottom: "#133c8c",
        buildingPrimary: "#1f2d3d",
        buildingSecondary: "#b08d44",
        accent: "#ffdfa8",
        variant: "elevation",
      }),
    },
    {
      id: "location-region-02",
      section: "locations",
      label: "Region 02 · Bodrum Portrait",
      dimensions: "1240 × 1520",
      aspectRatio: "620 / 760",
      alt: "Bodrum Yalıkavak & Aegean Peninsula architectural placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1240,
        height: 1520,
        slotCode: "LOC-02 · BODRUM",
        title: "02 · Bodrum — Yalıkavak, Türkbükü & Göltürkbükü",
        skyTop: "#0e587a",
        skyBottom: "#429bbd",
        buildingPrimary: "#d8d2c5",
        buildingSecondary: "#b08d44",
        accent: "#07191e",
        variant: "courtyard",
      }),
    },
    {
      id: "location-region-03",
      section: "locations",
      label: "Region 03 · Antalya Portrait",
      dimensions: "1240 × 1520",
      aspectRatio: "620 / 760",
      alt: "Antalya Mediterranean Riviera architectural placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1240,
        height: 1520,
        slotCode: "LOC-03 · ANTALYA",
        title: "03 · Antalya — Konyaaltı, Lara & Kaş",
        skyTop: "#133c8c",
        skyBottom: "#4b83c4",
        buildingPrimary: "#1f3a5c",
        buildingSecondary: "#c5a059",
        accent: "#f7e8d0",
        variant: "perspective",
      }),
    },
    {
      id: "location-region-04",
      section: "locations",
      label: "Region 04 · Sakarya & Sapanca Portrait",
      dimensions: "1240 × 1520",
      aspectRatio: "620 / 760",
      alt: "Sakarya & Sapanca Lake Villas architectural placeholder",
      placeholderSrc: createArchitecturalPlaceholderSvg({
        width: 1240,
        height: 1520,
        slotCode: "LOC-04 · SAKARYA",
        title: "04 · Sakarya & Sapanca — Lakefront Sanctuary Estates",
        skyTop: "#163832",
        skyBottom: "#2e6156",
        buildingPrimary: "#1f2d3d",
        buildingSecondary: "#b08d44",
        accent: "#e8d5b0",
        variant: "elevation",
      }),
    },
  ] satisfies PlaceholderSlot[],
};

export function resolvePlaceholderSrc(slot: PlaceholderSlot): string {
  return slot.customSrc && slot.customSrc.trim().length > 0 ? slot.customSrc : slot.placeholderSrc;
}
