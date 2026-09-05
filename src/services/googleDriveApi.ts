import { getAccessToken } from './googleDriveAuth';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  createdTime?: string;
  iconLink?: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  parents?: string[];
  shared?: boolean;
  owners?: Array<{
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  }>;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Google Drive. Silakan Masuk dengan Google terlebih dahulu.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * List files and folders from Google Drive
 */
export async function listDriveFiles(options?: {
  pageSize?: number;
  query?: string;
  folderId?: string;
  orderBy?: string;
}): Promise<DriveFile[]> {
  const headers = await getAuthHeader();
  const params = new URLSearchParams();

  params.append('pageSize', (options?.pageSize || 40).toString());
  params.append(
    'fields',
    'files(id, name, mimeType, size, modifiedTime, createdTime, iconLink, webViewLink, webContentLink, thumbnailLink, parents, shared, owners)'
  );
  params.append('orderBy', options?.orderBy || 'folder,modifiedTime desc');

  let q = 'trashed = false';
  if (options?.folderId) {
    q += ` and '${options.folderId}' in parents`;
  }
  if (options?.query && options.query.trim()) {
    const escaped = options.query.trim().replace(/'/g, "\\'");
    q += ` and name contains '${escaped}'`;
  }
  params.append('q', q);

  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, {
    headers,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal mengambil daftar file: status ${res.status}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Create a new folder on Google Drive
 */
export async function createDriveFolder(name: string, parentFolderId?: string): Promise<DriveFile> {
  const headers = await getAuthHeader();

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const res = await fetch(`${DRIVE_API_BASE}/files`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal membuat folder: status ${res.status}`);
  }

  return await res.json();
}

/**
 * Upload a file to Google Drive (Multipart upload)
 */
export async function uploadDriveFile(
  file: File | Blob,
  fileName: string,
  mimeType: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const headers = await getAuthHeader();

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name: fileName,
    mimeType: mimeType || 'application/octet-stream',
  };
  if (parentFolderId) {
    metadata.parents = [parentFolderId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  // Read file as binary/base64 or arraybuffer
  const fileArrayBuffer = await file.arrayBuffer();
  const fileBytes = new Uint8Array(fileArrayBuffer);

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}\r\n`;
  const mediaPartHeader = `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;

  // Construct multipart body using Blob
  const multipartBlob = new Blob(
    [metadataPart, mediaPartHeader, fileBytes, closeDelimiter],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const res = await fetch(
    `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size,webViewLink,webContentLink,modifiedTime`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBlob,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal mengunggah file: status ${res.status}`);
  }

  return await res.json();
}

/**
 * Upload JSON text file (e.g. backup or report)
 */
export async function uploadJsonToDrive(
  data: unknown,
  fileName: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  return uploadDriveFile(blob, fileName, 'application/json', parentFolderId);
}

/**
 * Upload CSV text file to Google Drive
 */
export async function uploadCsvToDrive(
  csvContent: string,
  fileName: string,
  parentFolderId?: string
): Promise<DriveFile> {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return uploadDriveFile(blob, fileName, 'text/csv', parentFolderId);
}

/**
 * Permanently delete or trash a file in Google Drive
 * NOTE: MUST only be called after explicit user confirmation!
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const headers = await getAuthHeader();

  const res = await fetch(`${DRIVE_API_BASE}/files/${fileId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok && res.status !== 204) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Gagal menghapus file dari Google Drive: status ${res.status}`);
  }
}

/**
 * Dapatkan ID Folder Khusus Google Drive dari .env jika pengguna mengaturnya
 */
export const getCustomFolderId = (): string => {
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.GOOGLE_DRIVE_FOLDER_ID?.trim() ||
        import.meta.env?.VITE_GOOGLE_DRIVE_FOLDER_ID?.trim())) ||
    ''
  );
};

/**
 * Dapatkan Email Service Account Google Drive dari .env jika pengguna mengaturnya
 */
export const getServiceAccountEmail = (): string => {
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim() ||
        import.meta.env?.VITE_GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim())) ||
    ''
  );
};

/**
 * Get or create "Sistem RT 02 Gasem Raya" default backup folder in user's Google Drive
 * Jika GOOGLE_DRIVE_FOLDER_ID diatur pada .env, fungsi langsung menggunakan folder ID tersebut.
 */
export async function getOrCreateRtFolder(): Promise<DriveFile> {
  const customFolderId = getCustomFolderId();
  if (customFolderId) {
    return {
      id: customFolderId,
      name: 'Folder Cadangan RT Gasem (Kustom)',
      mimeType: 'application/vnd.google-apps.folder',
    };
  }

  const folderName = 'Sistem RT 02 Gasem Raya';
  const existing = await listDriveFiles({
    query: folderName,
  });

  const found = existing.find(
    f => f.name === folderName && f.mimeType === 'application/vnd.google-apps.folder'
  );
  if (found) {
    return found;
  }

  return await createDriveFolder(folderName);
}
