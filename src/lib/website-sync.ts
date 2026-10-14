import { publicSupabase, supabase } from "./supabase";

// Safe public revision signals contain no client data or draft payloads.
export const WEBSITE_CHANGED = "avrasya:website-changed";
const CHANNEL = "avrasya-website-changes";
const REALTIME_TOPIC = "public-website-sync";
const KEY = "avrasya-website-revision";

export function websiteChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WEBSITE_CHANGED));
  try {
    localStorage.setItem(KEY, crypto.randomUUID());
  } catch {}
  if (typeof BroadcastChannel !== "undefined") {
    try {
      const channel = new BroadcastChannel(CHANNEL);
      channel.postMessage("refresh");
      channel.close();
    } catch {}
  }
  try {
    const rt = supabase.channel(REALTIME_TOPIC);
    rt.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void rt.send({
          type: "broadcast",
          event: "revision",
          payload: { t: Date.now() },
        }).then(() => {
          void supabase.removeChannel(rt);
        }).catch(() => {
          void supabase.removeChannel(rt);
        });
      }
    });
  } catch {}
}

export function watchWebsiteChanges(refresh: () => void) {
  if (typeof window === "undefined") return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  const debouncedRefresh = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      refresh();
    }, 150);
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY) debouncedRefresh();
  };
  const onFocus = () => {
    debouncedRefresh();
  };

  window.addEventListener(WEBSITE_CHANGED, debouncedRefresh);
  window.addEventListener("storage", onStorage);
  window.addEventListener("focus", onFocus);

  const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
  if (channel) channel.onmessage = () => debouncedRefresh();

  let rtChannel: ReturnType<typeof publicSupabase.channel> | null = null;
  try {
    rtChannel = publicSupabase
      .channel(REALTIME_TOPIC)
      .on("broadcast", { event: "revision" }, () => debouncedRefresh())
      .subscribe();
  } catch {}

  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener(WEBSITE_CHANGED, debouncedRefresh);
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("focus", onFocus);
    channel?.close();
    if (rtChannel) {
      void publicSupabase.removeChannel(rtChannel);
    }
  };
}

export const PUBLIC_QUERY_KEYS = new Set([
  "published-catalogue",
  "site-settings",
  "website-page",
  "catalogue-documents",
  "services",
  "faqs",
]);
