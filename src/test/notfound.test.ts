import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

const root = resolve(__dirname, "../..");
const rootRoute = readFileSync(resolve(root, "src/routes/__root.tsx"), "utf8");

describe("404 page", () => {
  it("does not match any real page for an unknown path", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const last = router.matchRoutes("/definitely-not-a-page-xyz").at(-1);
    expect(last?.routeId).not.toBe("/");
  });

  it("registers a styled notFoundComponent with the illustration and nav buttons", () => {
    expect(rootRoute).toContain("notFoundComponent: NotFoundComponent");
    expect(rootRoute).toContain("/images/media_1794440389807_5dfb60a4.png");
    expect(rootRoute).toContain("star-bg");
  });

  it("ships the 404 illustration in /public", () => {
    expect(existsSync(resolve(root, "public/images/media_1794440389807_5dfb60a4.png"))).toBe(true);
  });

  it("ships the new footer image referenced by the footer", () => {
    expect(existsSync(resolve(root, "public/images/media_1794439693005_f3c5cce1.png"))).toBe(true);
  });
});
