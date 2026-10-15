import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";

const state = vi.hoisted(() => ({
  properties: [] as unknown[],
  isPending: false,
  isError: false,
  refetch: vi.fn(),
  page:null as null|{published:boolean;title:string;sections:{title:string;content_json:Record<string,unknown>}[]},
}));
vi.mock("@/lib/supabase",()=>({DEMO_MODE:false}));
vi.mock("@/data/live", () => ({ useCatalogue: () => state,useManagedPage:()=>({data:state.page,isError:false}) }));
vi.mock("@/admin/store", () => ({
  useSiteSettings: () => ({
    heroHeadline: "Find your place in Istanbul.",
    heroSubtitle: "Independent advice for your next move.",
    eyebrowText: "Istanbul · Türkiye",
    cbiThresholdUsd: 400000,
  }),
}));
vi.mock("@/hooks/useLiveContact", () => ({
  useWhatsAppLink: () => () => "https://wa.me/905459248042",
}));
vi.mock("@/hooks/usePreferences", () => ({
  useCurrency: () => ["USD"],
  useShortlist: () => ({ isSaved: () => false, toggle: vi.fn() }),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: unknown) => ({ options }),
  useNavigate: () => vi.fn(),
  Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/site/Chrome", () => ({
  Logo: () => null,
  CtaBand: () => <a href="/contact">Talk to our team</a>,
}));
vi.mock("@/components/site/BosphorusNavigator", () => ({
  BosphorusNavigator: () => <section>Explore Istanbul districts</section>,
}));
vi.mock("@/components/site/AcquisitionCalculator", () => ({
  AcquisitionCalculator: () => <section>Estimate purchase costs</section>,
}));
vi.mock("@/components/site/PropertyCard", () => ({
  PropertyCard: () => <article>Published property card</article>,
}));
vi.mock("@/components/site/Motion", () => ({
  Tilt: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Marquee: () => null,
  MotionRoot: () => null,
}));
import { Route } from "@/routes/index";
const Home = Route.options.component as ComponentType;
afterEach(cleanup);
beforeEach(() => {
  state.properties = [];
  state.page=null;
  state.isPending = false;
  state.isError = false;
  state.refetch.mockClear();
});
describe("Homepage remains the homepage", () => {
  it("shows published managed homepage sections and preserves property search",()=>{state.page={published:true,title:"Managed introduction",sections:[{title:"Our approach",content_json:{paragraphs:["A real managed paragraph."]}}]};render(<Home/>);expect(screen.getByText("A real managed paragraph.")).toBeInTheDocument();expect(screen.getByRole("heading",{level:1})).toHaveTextContent("Find your place in Istanbul.");expect(screen.getByRole("button",{name:"Search Listings"})).toBeInTheDocument();});
  it("does not show unpublished managed homepage sections",()=>{state.page={published:false,title:"Draft",sections:[{title:"Hidden",content_json:{paragraphs:["Unpublished draft text"]}}]};render(<Home/>);expect(screen.queryByText("Unpublished draft text")).toBeNull();});

  it("keeps the main hero, search and sections when no listings are published", () => {
    const { container } = render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Find your place in Istanbul.",
    );
    expect(screen.getByRole("button", { name: "Search Listings" })).toBeInTheDocument();
    expect(screen.getByText("No properties match your filter criteria")).toBeInTheDocument();
    expect(screen.getByText("Explore Istanbul districts")).toBeInTheDocument();
    expect(container.querySelector('input[autocomplete="name"]')).toBeNull();
  });
  it("loads the collection inside the main page instead of replacing the whole page", () => {
    state.isPending = true;
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Find your place in Istanbul.",
    );
    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });
  it("retains the homepage and offers a real retry when the collection request fails", () => {
    state.isError = true;
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Find your place in Istanbul.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(state.refetch).toHaveBeenCalledOnce();
  });
});
