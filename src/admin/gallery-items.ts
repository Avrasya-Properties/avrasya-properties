import type { GalleryItem } from "@/data/properties";

export type GalleryState = {
  galleryItems?: GalleryItem[] | undefined;
  galleryImages?: string[] | undefined;
  cover?: string | null | undefined;
};

export type GalleryResult = {
  galleryItems: GalleryItem[];
  galleryImages: string[];
  cover: string | null;
};

let counter = 0;
const newId = () => `img-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Normalise: one primary, contiguous sortOrder, legacy fields kept in sync. */
function finalize(items: GalleryItem[], preferredPrimaryId?: string): GalleryResult {
  let list = items.map((i) => ({ ...i }));
  const primaryId =
    (preferredPrimaryId && list.find((i) => i.id === preferredPrimaryId)?.id) ||
    list.find((i) => i.isPrimary)?.id ||
    list[0]?.id;
  list = list.map((i, idx) => ({ ...i, sortOrder: idx, isPrimary: i.id === primaryId }));
  const primary = list.find((i) => i.isPrimary);
  return {
    galleryItems: list,
    galleryImages: list.map((i) => i.url),
    cover: primary?.url ?? null,
  };
}

/** Existing items (sorted) or a migration of the legacy cover + galleryImages. */
export function ensureGalleryItems(state: GalleryState): GalleryItem[] {
  if (state.galleryItems && state.galleryItems.length > 0) {
    return [...state.galleryItems].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
  const urls = [
    ...new Set([state.cover, ...(state.galleryImages || [])].filter((u): u is string => !!u)),
  ];
  return urls.map((url, idx) => ({
    id: newId(),
    url,
    category: idx === 0 ? "Exterior" : "Interior",
    sortOrder: idx,
    isPrimary: url === (state.cover || urls[0]),
  }));
}

export function addGalleryItem(
  state: GalleryState,
  url: string,
  category: string = "Interior",
): GalleryResult {
  const items = ensureGalleryItems(state);
  return finalize([...items, { id: newId(), url, category, sortOrder: items.length }]);
}

export function removeGalleryItem(state: GalleryState, id: string): GalleryResult {
  return finalize(ensureGalleryItems(state).filter((i) => i.id !== id));
}

export function setPrimaryGalleryItem(state: GalleryState, id: string): GalleryResult {
  return finalize(ensureGalleryItems(state), id);
}

export function updateGalleryItem(
  state: GalleryState,
  id: string,
  patch: Partial<GalleryItem>,
): GalleryResult {
  const items = ensureGalleryItems(state).map((i) => (i.id === id ? { ...i, ...patch, id } : i));
  return finalize(items);
}

export function moveGalleryItem(state: GalleryState, from: number, to: number): GalleryResult {
  const items = ensureGalleryItems(state);
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return finalize(items);
  }
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved!);
  return finalize(items);
}

/** Set (or clear) the cover URL, keeping the gallery consistent. */
export function setCoverUrl(state: GalleryState, url: string | null): GalleryResult {
  const items = ensureGalleryItems(state);
  if (!url) return finalize(items);
  const existing = items.find((i) => i.url === url);
  if (existing) return finalize(items, existing.id);
  const id = newId();
  return finalize([...items, { id, url, category: "Exterior", sortOrder: items.length }], id);
}
