import { describe, expect, it } from "vitest";
import {
  addGalleryItem,
  ensureGalleryItems,
  moveGalleryItem,
  removeGalleryItem,
  setPrimaryGalleryItem,
  setCoverUrl,
  updateGalleryItem,
} from "./gallery-items";

describe("gallery-items helpers", () => {
  it("migrates legacy cover + galleryImages into items with one primary", () => {
    const items = ensureGalleryItems({ cover: "/b.jpg", galleryImages: ["/a.jpg", "/b.jpg"] });
    expect(items.map((i) => i.url)).toEqual(["/b.jpg", "/a.jpg"]);
    expect(items.filter((i) => i.isPrimary)).toHaveLength(1);
    expect(items[0]!.isPrimary).toBe(true);
  });

  it("returns existing galleryItems sorted without duplicating", () => {
    const items = ensureGalleryItems({
      galleryItems: [
        { id: "2", url: "/2.jpg", category: "Interior", sortOrder: 1 },
        { id: "1", url: "/1.jpg", category: "Exterior", sortOrder: 0, isPrimary: true },
      ],
    });
    expect(items.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("addGalleryItem syncs galleryImages and cover", () => {
    const r = addGalleryItem({}, "/x.jpg");
    expect(r.galleryItems).toHaveLength(1);
    expect(r.cover).toBe("/x.jpg");
    expect(r.galleryImages).toEqual(["/x.jpg"]);
    const r2 = addGalleryItem(r, "/y.jpg");
    expect(r2.galleryItems).toHaveLength(2);
    expect(r2.cover).toBe("/x.jpg");
  });

  it("setPrimary changes the cover everywhere", () => {
    let r = addGalleryItem({}, "/x.jpg");
    r = addGalleryItem(r, "/y.jpg");
    r = setPrimaryGalleryItem(r, r.galleryItems[1]!.id);
    expect(r.cover).toBe("/y.jpg");
    expect(r.galleryItems.filter((i) => i.isPrimary)).toHaveLength(1);
  });

  it("removing the primary promotes the next image; removing all clears cover", () => {
    let r = addGalleryItem({}, "/x.jpg");
    r = addGalleryItem(r, "/y.jpg");
    r = removeGalleryItem(r, r.galleryItems[0]!.id);
    expect(r.cover).toBe("/y.jpg");
    r = removeGalleryItem(r, r.galleryItems[0]!.id);
    expect(r.cover).toBeNull();
    expect(r.galleryImages).toEqual([]);
  });

  it("moveGalleryItem reorders and renumbers sortOrder", () => {
    let r = addGalleryItem({}, "/1.jpg");
    r = addGalleryItem(r, "/2.jpg");
    r = addGalleryItem(r, "/3.jpg");
    r = moveGalleryItem(r, 2, 0);
    expect(r.galleryItems.map((i) => i.url)).toEqual(["/3.jpg", "/1.jpg", "/2.jpg"]);
    expect(r.galleryItems.map((i) => i.sortOrder)).toEqual([0, 1, 2]);
  });

  it("updateGalleryItem edits category, caption and alt", () => {
    let r = addGalleryItem({}, "/1.jpg");
    r = updateGalleryItem(r, r.galleryItems[0]!.id, {
      category: "Kitchen",
      caption: "Open kitchen",
      alt: "Kitchen",
    });
    expect(r.galleryItems[0]).toMatchObject({ category: "Kitchen", caption: "Open kitchen" });
  });

  it("setCoverUrl adds an unknown url and makes it primary", () => {
    let r = addGalleryItem({}, "/1.jpg");
    r = setCoverUrl(r, "/new.jpg");
    expect(r.cover).toBe("/new.jpg");
    expect(r.galleryItems.some((i) => i.url === "/new.jpg" && i.isPrimary)).toBe(true);
    r = setCoverUrl(r, null);
    expect(r.cover).toBe("/new.jpg"); // clearing never drops the current primary
  });
});
