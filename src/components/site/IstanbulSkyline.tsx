interface IstanbulSkylineProps {
  className?: string;
  opacity?: number;
}

/**
 * Authentic Istanbul Architectural Panorama
 * Exact silhouette derived from user reference:
 * - Sultanahmet (Blue Mosque) with 6 minarets & cascading domes
 * - Ayasofya (Hagia Sophia) with central Byzantine dome & buttresses
 * - Historic Imperial Gate / Ahmed III pavilion with conical spires
 * - The iconic Bosphorus Suspension Bridge with catenary cables & pylons
 * - Contemporary Istanbul Financial District (İşbank & Sapphire towers, Levent & Maslak high-rises)
 */
export function IstanbulSkyline({ className = "", opacity = 0.9 }: IstanbulSkylineProps) {
  return (
    <div className={`relative flex items-end justify-center w-full select-none pointer-events-none ${className}`}>
      <img
        src="/images/istanbul-skyline-trimmed.png"
        alt="Istanbul Architectural Panorama"
        className="w-full h-full object-contain object-bottom filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
        style={{ opacity }}
        loading="eager"
        decoding="sync"
      />
    </div>
  );
}

