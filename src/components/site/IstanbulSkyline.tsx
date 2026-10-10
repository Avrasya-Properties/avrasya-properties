import skyline from "@/assets/istanbul-skyline-transparent.png";

interface IstanbulSkylineProps {
  className?: string;
  opacity?: number;
}

/** Transparent, tightly cropped skyline: the image baseline is its bottom edge. */
export function IstanbulSkyline({ className = "", opacity = 1 }: IstanbulSkylineProps) {
  return (
    <div className={`relative flex items-end justify-center w-full select-none pointer-events-none ${className}`}>
      <img
        src={skyline}
        alt="Istanbul Architectural Panorama"
        className="w-full h-auto block"
        style={{ opacity }}
        loading="eager"
        decoding="sync"
        width={1558}
        height={260}
      />
    </div>
  );
}


