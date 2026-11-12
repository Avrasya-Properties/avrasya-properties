import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import React from "react";
import { PartnersSection } from "@/components/site/PartnersSection";
import { DEFAULT_PARTNERS, type PartnerItem } from "@/admin/demo";

afterEach(cleanup);

describe("Partners & References Section Component", () => {
  it("renders the heading and default partner logos", () => {
    render(<PartnersSection partners={DEFAULT_PARTNERS} />);

    expect(screen.getByText("Partners & References")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /references and partners/i })).toBeInTheDocument();

    // Check that logos are rendered with alt text
    const logos = screen.getAllByRole("img");
    expect(logos.length).toBeGreaterThanOrEqual(DEFAULT_PARTNERS.length);

    // Verify presence of specific partner names in alt tags
    expect(screen.getAllByAltText(/The Initiate Consultancy logo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/Tez Gayrimenkul logo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/Tezz Tercüme logo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/Merkad Turizm logo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByAltText(/Ryans logo/i).length).toBeGreaterThan(0);
  });

  it("filters out invisible partners", () => {
    const customPartners: PartnerItem[] = [
      {
        id: "p1",
        name: "Visible Partner",
        logo: "/images/partners/the-initiate.png",
        sortOrder: 1,
        is_visible: true,
      },
      {
        id: "p2",
        name: "Hidden Partner",
        logo: "/images/partners/ryans.png",
        sortOrder: 2,
        is_visible: false,
      },
    ];

    render(<PartnersSection partners={customPartners} />);

    expect(screen.getAllByAltText(/Visible Partner logo/i).length).toBeGreaterThan(0);
    expect(screen.queryByAltText(/Hidden Partner logo/i)).toBeNull();
  });

  it("renders website links for partners with valid URLs", () => {
    const customPartners: PartnerItem[] = [
      {
        id: "p1",
        name: "Partner With URL",
        logo: "/images/partners/the-initiate.png",
        website: "https://theinitiate.com",
        sortOrder: 1,
        is_visible: true,
      },
    ];

    render(<PartnersSection partners={customPartners} />);

    const link = screen.getAllByRole("link", { name: /Visit Partner With URL/i })[0];
    expect(link).toHaveAttribute("href", "https://theinitiate.com");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("returns null when no partners are visible", () => {
    const hiddenPartners: PartnerItem[] = [
      {
        id: "p1",
        name: "Hidden",
        logo: "/images/partners/the-initiate.png",
        sortOrder: 1,
        is_visible: false,
      },
    ];

    const { container } = render(<PartnersSection partners={hiddenPartners} />);
    expect(container.firstChild).toBeNull();
  });
});
