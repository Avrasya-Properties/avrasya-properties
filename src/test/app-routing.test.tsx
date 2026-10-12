import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).toBe("/");
  });
  it("keeps Contact separate from the homepage",()=>{
    const router=createRouter({routeTree,context:{queryClient:new QueryClient()}});
    expect(router.matchRoutes("/contact").at(-1)?.routeId).toBe("/contact");
  });
  it("registers property details, management and account recovery",()=>{
    const router=createRouter({routeTree,context:{queryClient:new QueryClient()}});
    expect(router.matchRoutes("/properties/example").at(-1)?.routeId).toBe("/properties/$slug");
    expect(router.matchRoutes("/calculator").at(-1)?.routeId).toBe("/calculator");
    expect(router.matchRoutes("/admin/manage").at(-1)?.routeId).toBe("/admin/manage");
    expect(router.matchRoutes("/admin/recover").at(-1)?.routeId).toBe("/admin/recover");
  });
});
