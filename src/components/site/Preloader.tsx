import { useEffect, useState } from "react";
import { useSiteSettings } from "@/admin/store";

/**
 * Brand curtain shown once per browser session. It reveals the logo, draws a hairline and lifts away in
 * under a second and a half. There is no fake percentage counter, it is skipped for reduced-motion users
 * and a hard timeout guarantees it can never trap a visitor.
 */
export function Preloader() {
  const settings = useSiteSettings();
  const [leaving, setLeaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDismissed(true);
      return;
    }
    try {
      if (sessionStorage.getItem("avr_preloader_seen")) {
        setDismissed(true);
        return;
      }
    } catch {
      /* storage can be unavailable; show the curtain anyway */
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setLeaving(true), 1000));
    timers.push(
      setTimeout(() => {
        setDismissed(true);
        try {
          sessionStorage.setItem("avr_preloader_seen", "1");
        } catch {
          /* ignore */
        }
      }, 1700),
    );
    // Hard safety net.
    timers.push(setTimeout(() => setDismissed(true), 2400));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (dismissed) return null;

  return (
    <div
      aria-hidden="true"
      className={`avrasya-preloader fixed inset-0 z-[100] flex flex-col items-center justify-center bg-night transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
        leaving ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="relative flex w-full max-w-md flex-col items-center px-8">
        <img
          src={settings.websiteDesign?.["logoLight"] || "/images/avrasya-logo-pure-white.svg"}
          alt=""
          className="preloader-logo h-auto max-h-[14vh] w-[62vw] max-w-[360px] object-contain"
        />
        <span className="preloader-line mt-8 block h-px w-48 origin-left bg-brass-light" />
      </div>
    </div>
  );
}