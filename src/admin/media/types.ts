export type MediaCategory =
  | "all"
  | "properties"
  | "developments"
  | "marketing"
  | "brochures"
  | "brand";

export type StorageFileRecord = {
  id: string;
  bucket: string;
  path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  folder: string;
  created_at: string;
  public_url?: string | undefined;
  dimensions?:
    | {
        width: number;
        height: number;
      }
    | undefined;
};

export type MediaReferenceType =
  | "property_cover"
  | "property_gallery"
  | "property_floor_plan"
  | "cms_design";

export type MediaReference = {
  type: MediaReferenceType;
  id: string;
  name: string;
  details?: string | undefined;
};

export type MediaUsageCheckResult = {
  inUse: boolean;
  references: MediaReference[];
};
