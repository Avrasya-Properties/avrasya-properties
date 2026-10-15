import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Centralized safe mock for admin store that uses real public-enquiry at runtime
vi.mock("@/admin/store", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/admin/store")>();
  const mod = await vi.importActual<typeof import("@/lib/public-enquiry")>("@/lib/public-enquiry");
  return {
    ...actual,
    recordPublicEnquiry: mod.submitPublicEnquiry,
  };
});

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
