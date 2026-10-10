export function IstanbulSkyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1440 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Subtle gold-to-emerald architectural gradient */}
        <linearGradient id="istanbulStroke" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="25%" stopColor="#D4AF37" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="75%" stopColor="#D4AF37" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id="istanbulFill" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B2228" stopOpacity="0" />
          <stop offset="100%" stopColor="#06161B" stopOpacity="0.4" />
        </linearGradient>
      </defs>

      {/* Atmospheric Silhouette Ground Fill */}
      <path
        d="M 0 215 
           L 0 185
           L 40 185 L 50 178 L 70 178 L 70 65 L 73 65 L 73 178 L 90 178 L 90 55 L 93 55 L 93 178
           L 105 178 Q 130 115 155 178
           L 170 178 L 170 55 L 173 55 L 173 178 L 190 178 L 190 65 L 193 65 L 193 185
           L 260 185 L 285 180 L 290 50 L 293 50 L 293 180 L 315 180 L 315 60 L 318 60 L 318 180
           L 325 180 Q 360 105 395 180
           L 410 180 L 410 60 L 413 60 L 413 180 L 435 180 L 435 50 L 438 50 L 438 185
           L 540 185 L 565 175 L 575 175 L 575 80 L 565 80 L 565 72 L 588 32 L 611 72 L 611 80 L 601 80 L 601 175
           L 670 175 L 710 185
           L 775 185 L 775 40 L 785 40 L 785 185
           L 880 185
           L 975 185 L 975 40 L 985 40 L 985 185
           L 1060 185 L 1090 185 L 1090 150 L 1100 150 L 1100 120 L 1095 120 L 1105 95 L 1115 120 L 1110 120 L 1110 150 L 1120 150 L 1120 185
           L 1180 185 L 1195 185 L 1195 90 L 1225 90 L 1225 185
           L 1245 185 L 1245 65 L 1275 65 L 1275 185
           L 1295 185 L 1295 45 L 1310 35 L 1325 45 L 1325 185
           L 1350 185 L 1350 75 L 1380 75 L 1380 185
           L 1400 185 L 1400 95 L 1440 95 L 1440 215 Z"
        fill="url(#istanbulFill)"
      />

      {/* Main Architectural Skyline Outlines */}
      <g stroke="url(#istanbulStroke)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Baseline Horizon / Water Edge */}
        <line x1="0" y1="205" x2="1440" y2="205" strokeWidth="1" strokeOpacity="0.4" />
        <line x1="60" y1="210" x2="340" y2="210" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="16 12" />
        <line x1="480" y1="210" x2="920" y2="210" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="20 16" />
        <line x1="1020" y1="210" x2="1380" y2="210" strokeWidth="0.75" strokeOpacity="0.25" strokeDasharray="16 12" />

        {/* 1. Sultanahmet / Blue Mosque Cluster */}
        {/* Minaret 1 */}
        <path d="M 68 205 L 70 65 L 71.5 52 L 73 65 L 75 205" />
        <line x1="68" y1="110" x2="75" y2="110" />
        <line x1="69" y1="145" x2="74" y2="145" />
        {/* Minaret 2 */}
        <path d="M 88 205 L 90 55 L 91.5 42 L 93 55 L 95 205" />
        <line x1="88" y1="100" x2="95" y2="100" />
        <line x1="89" y1="135" x2="94" y2="135" />
        {/* Cascading Domes */}
        <path d="M 98 185 L 105 175 Q 130 110 155 175 L 162 185" />
        <path d="M 112 185 Q 130 135 148 185" />
        <circle cx="130" cy="110" r="2" fill="#D4AF37" stroke="none" />
        {/* Minaret 3 */}
        <path d="M 168 205 L 170 55 L 171.5 42 L 173 55 L 175 205" />
        <line x1="168" y1="100" x2="175" y2="100" />
        <line x1="169" y1="135" x2="174" y2="135" />
        {/* Minaret 4 */}
        <path d="M 188 205 L 190 65 L 191.5 52 L 193 65 L 195 205" />
        <line x1="188" y1="110" x2="195" y2="110" />
        <line x1="189" y1="145" x2="194" y2="145" />

        {/* 2. Ayasofya (Hagia Sophia) */}
        {/* West Minarets */}
        <path d="M 288 205 L 290 50 L 291.5 38 L 293 50 L 295 205" />
        <line x1="288" y1="105" x2="295" y2="105" />
        <path d="M 313 205 L 315 62 L 316.5 50 L 318 62 L 320 205" />
        {/* Grand Byzantine Central Dome & Buttresses */}
        <path d="M 322 185 L 332 170 L 332 145 Q 360 98 388 145 L 388 170 L 398 185" />
        <path d="M 342 145 Q 360 118 378 145" />
        <path d="M 326 185 L 326 150 L 334 150" />
        <path d="M 394 185 L 394 150 L 386 150" />
        <circle cx="360" cy="98" r="2.2" fill="#D4AF37" stroke="none" />
        {/* East Minarets */}
        <path d="M 408 205 L 410 62 L 411.5 50 L 413 62 L 415 205" />
        <path d="M 433 205 L 435 50 L 436.5 38 L 438 50 L 440 205" />
        <line x1="433" y1="105" x2="440" y2="105" />

        {/* 3. Galata Tower on the Historic Ridge */}
        <path d="M 540 205 L 565 175 L 574 175 L 574 80 L 565 80 L 565 72 L 587.5 28 L 610 72 L 610 80 L 601 80 L 601 175 L 620 175 L 640 185" />
        {/* Galata Spire & Details */}
        <line x1="587.5" y1="28" x2="587.5" y2="20" />
        <circle cx="587.5" cy="20" r="1.5" fill="#D4AF37" stroke="none" />
        {/* Galata Arched Windows */}
        <path d="M 583 105 Q 587.5 100 592 105 L 592 118 L 583 118 Z" strokeWidth="0.9" />
        <path d="M 583 135 Q 587.5 130 592 135 L 592 148 L 583 148 Z" strokeWidth="0.9" />
        {/* Balcony Railing */}
        <line x1="565" y1="76" x2="610" y2="76" strokeWidth="0.8" strokeDasharray="3 2" />

        {/* 4. The Bosphorus Suspension Bridge */}
        {/* European Pylon */}
        <path d="M 770 205 L 773 38 L 778 38 L 781 205" />
        <path d="M 781 205 L 784 38 L 789 38 L 792 205" />
        <line x1="771" y1="80" x2="791" y2="80" strokeWidth="1.2" />
        <line x1="772" y1="125" x2="790" y2="125" strokeWidth="1.2" />
        <line x1="774" y1="38" x2="776" y2="28" strokeWidth="1.2" />
        <line x1="785" y1="38" x2="787" y2="28" strokeWidth="1.2" />

        {/* Asian Pylon */}
        <path d="M 970 205 L 973 38 L 978 38 L 981 205" />
        <path d="M 981 205 L 984 38 L 989 38 L 992 205" />
        <line x1="971" y1="80" x2="991" y2="80" strokeWidth="1.2" />
        <line x1="972" y1="125" x2="990" y2="125" strokeWidth="1.2" />
        <line x1="974" y1="38" x2="976" y2="28" strokeWidth="1.2" />
        <line x1="985" y1="38" x2="987" y2="28" strokeWidth="1.2" />

        {/* Suspension Road Deck */}
        <line x1="710" y1="145" x2="1050" y2="145" strokeWidth="1.8" />
        <line x1="710" y1="148" x2="1050" y2="148" strokeWidth="0.8" strokeDasharray="6 4" strokeOpacity="0.5" />

        {/* Main Suspension Cables (Catenary Curves) */}
        {/* Backstay West */}
        <path d="M 710 165 Q 740 100 776 38" strokeWidth="1.4" />
        {/* Main Center Span */}
        <path d="M 787 38 Q 881 142 975 38" strokeWidth="1.5" />
        {/* Backstay East */}
        <path d="M 986 38 Q 1020 100 1050 165" strokeWidth="1.4" />

        {/* Vertical Hanger Ropes */}
        <line x1="815" y1="65" x2="815" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="840" y1="92" x2="840" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="865" y1="118" x2="865" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="881" y1="135" x2="881" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="897" y1="118" x2="897" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="922" y1="92" x2="922" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />
        <line x1="947" y1="65" x2="947" y2="145" strokeWidth="0.6" strokeOpacity="0.5" />

        {/* 5. Kız Kulesi (Maiden's Tower) on Islet */}
        <path d="M 1080 205 L 1088 190 L 1125 190 L 1132 205" />
        <path d="M 1092 190 L 1092 155 L 1120 155 L 1120 190" />
        <path d="M 1099 155 L 1099 125 L 1113 125 L 1113 155" />
        <path d="M 1095 125 L 1106 98 L 1117 125 Z" />
        <line x1="1106" y1="98" x2="1106" y2="82" strokeWidth="1" />
        <circle cx="1106" cy="82" r="1.2" fill="#D4AF37" stroke="none" />

        {/* 6. Contemporary Financial District & Residential High-Rises */}
        {/* Tower 1 */}
        <path d="M 1195 205 L 1195 90 L 1222 90 L 1222 205" />
        <line x1="1204" y1="90" x2="1204" y2="205" strokeWidth="0.6" strokeOpacity="0.4" />
        <line x1="1213" y1="90" x2="1213" y2="205" strokeWidth="0.6" strokeOpacity="0.4" />
        {/* Stepped Tower 2 */}
        <path d="M 1235 205 L 1235 110 L 1245 110 L 1245 68 L 1268 68 L 1268 110 L 1276 110 L 1276 205" />
        {/* Pinnacle Tower 3 (Financial Center) */}
        <path d="M 1290 205 L 1290 62 L 1308 34 L 1324 62 L 1324 205" />
        <line x1="1308" y1="34" x2="1308" y2="18" strokeWidth="1" />
        <circle cx="1308" cy="18" r="1.5" fill="#D4AF37" stroke="none" />
        <line x1="1290" y1="100" x2="1324" y2="100" strokeWidth="0.6" strokeOpacity="0.4" />
        <line x1="1290" y1="140" x2="1324" y2="140" strokeWidth="0.6" strokeOpacity="0.4" />
        {/* Tower 4 */}
        <path d="M 1342 205 L 1342 80 L 1374 80 L 1374 205" />
        <line x1="1353" y1="80" x2="1353" y2="205" strokeWidth="0.6" strokeOpacity="0.4" />
        <line x1="1363" y1="80" x2="1363" y2="205" strokeWidth="0.6" strokeOpacity="0.4" />
        {/* Tower 5 */}
        <path d="M 1390 205 L 1390 102 L 1425 102 L 1425 205" />
      </g>
    </svg>
  );
}
