// Background reads and token refreshes never count as staff activity.
export const IDLE_LIMIT_MS = 10 * 60 * 1000;
const WARNING_MS = 60 * 1000;
let current: IdleSession | null = null;
export class IdleSession {
  private last: number;
  private busy = 0;
  private stopped = false;
  private timer: ReturnType<typeof setInterval>;
  private key: string;
  private workKey: string;
  constructor(private target: Window, userId: string, private expire: () => void, private warn: (seconds: number) => void, private now = () => Date.now(), private acceptsActivity = () => true) {
    this.key = `avrasya:admin-activity:${userId}`;
    this.workKey = `avrasya:admin-work:${userId}:`;
    this.last = this.read() || now();
    this.store();
    for (const name of ['pointerdown', 'keydown', 'input', 'change', 'wheel', 'touchstart']) target.addEventListener(name, this.activity, {capture: true, passive: true});
    target.addEventListener('storage', this.check);
    target.addEventListener('focus', this.check);
    target.document.addEventListener('visibilitychange', this.check);
    this.timer = setInterval(this.check, 1000);
    this.check();
  }
  private read() { try { const value = Number(this.target.localStorage.getItem(this.key)); return Number.isFinite(value) && value <= this.now() ? value : 0; } catch { return 0; } }
  private store() { try { this.target.localStorage.setItem(this.key, String(this.last)); } catch {} }
  private remoteBusy() {
    try { for (let i = 0; i < this.target.localStorage.length; i++) { const key = this.target.localStorage.key(i); if (key?.startsWith(this.workKey) && Number(this.target.localStorage.getItem(key)) > this.now()) return true; } } catch {}
    return false;
  }
  check = () => {
    if (this.stopped) return;
    this.last = Math.max(this.last, this.read());
    if (this.busy || this.remoteBusy()) { this.last = this.now(); this.store(); this.warn(0); return; }
    const remaining = IDLE_LIMIT_MS - (this.now() - this.last);
    if (remaining <= 0) { this.stop(); this.expire(); return; }
    this.warn(remaining <= WARNING_MS ? Math.ceil(remaining / 1000) : 0);
  };
  activity = () => {
    // Coming back to an expired background tab must not revive its session.
    this.check();
    if (!this.stopped && this.acceptsActivity()) { this.last = this.now(); this.store(); this.warn(0); }
  };
  work() {
    this.check();
    if (this.stopped) throw new Error("Your session ended. Sign in again before saving.");
    this.activity(); this.busy++;
    const key = this.workKey + crypto.randomUUID();
    const beat = () => { try { this.target.localStorage.setItem(key, String(this.now() + 15000)); } catch {} };
    beat(); const timer = setInterval(beat, 5000);
    let ended = false;
    return () => { if (ended) return; ended = true; clearInterval(timer); try { this.target.localStorage.removeItem(key); } catch {} this.last = this.now(); this.store(); this.busy--; this.activity(); };
  }
  stop() {
    this.stopped = true; clearInterval(this.timer);
    for (const name of ['pointerdown', 'keydown', 'input', 'change', 'wheel', 'touchstart']) this.target.removeEventListener(name, this.activity, true);
    this.target.removeEventListener('storage', this.check); this.target.removeEventListener('focus', this.check); this.target.document.removeEventListener('visibilitychange', this.check);
  }
}
export function freshAdminActivity(userId: string) { if (typeof window !== 'undefined') try { window.localStorage.setItem(`avrasya:admin-activity:${userId}`, String(Date.now())); } catch {} }
export function watchAdminActivity(userId: string, expire: () => void, warn: (seconds: number) => void) {
  const session = new IdleSession(window, userId, expire, warn, () => Date.now(), () => /^\/admin(?:\/|$)/.test(window.location.pathname)); current = session;
  return () => { session.stop(); if (current === session) current = null; };
}
export const beginAdminWork = () => current?.work() || (() => {});
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const url = String(input instanceof Request ? input.url : input);
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const mutation = method !== 'GET' && method !== 'HEAD' && /\/(rest|storage|functions)\/v1\//.test(url);
  const end = mutation ? beginAdminWork() : () => {};
  try { return await fetch(input, {...init, signal: init?.signal || AbortSignal.timeout(120000)}); } finally { end(); }
}
