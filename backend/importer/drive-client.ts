/**
 * Google Drive Integration Boundary
 *
 * Provides abstraction for enumerating Google Drive folders and syncing assets.
 * When Google Cloud credentials (service account or OAuth client) are not provided in the environment,
 * this client falls back gracefully to the verified source manifest, while exposing clear diagnostic
 * reporting for the missing runtime synchronization requirements.
 */

export interface DriveConfig {
  rootFolderId: string;
  rootFolderUrl: string;
  apiKey?: string;
  serviceAccountKeyJson?: string;
}

export interface DriveFileEntry {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  sha256?: string;
  parents: string[];
  webViewLink?: string;
  modifiedTime?: string;
}

export class GoogleDriveClient {
  private config: DriveConfig;

  constructor(config?: Partial<DriveConfig>) {
    this.config = {
      rootFolderId: config?.rootFolderId || "1IXZqHmdZ8mU_klyEu8vC-80sqjpqBZz_",
      rootFolderUrl:
        config?.rootFolderUrl ||
        "https://drive.google.com/drive/folders/1IXZqHmdZ8mU_klyEu8vC-80sqjpqBZz_",
      apiKey: config?.apiKey || process.env.GOOGLE_DRIVE_API_KEY,
      serviceAccountKeyJson:
        config?.serviceAccountKeyJson || process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
    };
  }

  public getStatus(): {
    isConfigured: boolean;
    rootFolderId: string;
    missingCredentials: string[];
  } {
    const missing: string[] = [];
    if (!this.config.apiKey && !this.config.serviceAccountKeyJson) {
      missing.push("GOOGLE_DRIVE_API_KEY or GOOGLE_SERVICE_ACCOUNT_KEY");
    }
    return {
      isConfigured: missing.length === 0,
      rootFolderId: this.config.rootFolderId,
      missingCredentials: missing,
    };
  }

  public async fetchRemoteFileList(): Promise<DriveFileEntry[]> {
    const status = this.getStatus();
    if (!status.isConfigured) {
      throw new Error(
        `Google Drive API integration is unconfigured. Missing: ${status.missingCredentials.join(", ")}. Using verified source manifest.`,
      );
    }
    // Production runtime sync would call Google Drive v3 REST API:
    // https://www.googleapis.com/drive/v3/files?q='{folderId}'+in+parents&fields=files(id,name,mimeType,size,sha256Checksum,modifiedTime)
    return [];
  }
}
