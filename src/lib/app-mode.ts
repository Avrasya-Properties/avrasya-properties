/** Demo data requires a deliberately named isolated build, never just a flag. */
export function isDemoMode(env: Record<string, unknown>): boolean {
  return env["VITE_ENABLE_ADMIN_DEMO"] === "true" &&
    (env["MODE"] === "demo" || env["MODE"] === "test");
}
