/**
 * Utilitas Kompresi Gambar & Penanganan Berkas Lampiran
 * Mengubah foto resolusi tinggi kamera HP (3-10MB) menjadi ukuran optimal (~50-100KB),
 * lalu mengunggahnya ke Supabase Storage atau fallback Base64 ringan.
 */

import { uploadFileToSupabaseStorage } from '../services/supabaseStorage';

export interface CompressedImageResult {
  url: string;
  isCloudStorage: boolean;
  fileSizeKb: number;
}

/**
 * Kompres file gambar menggunakan HTML5 Canvas
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<{ compressedBlob: Blob; dataUrl: string; sizeKb: number }> {
  // Jika bukan gambar (misal PDF), kembalikan langsung
  if (!file.type.startsWith('image/')) {
    const dataUrl = await fileToDataUrl(file);
    return {
      compressedBlob: file,
      dataUrl,
      sizeKb: Math.round(file.size / 1024),
    };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Hitung aspek rasio proporsional
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Canvas 2D context tidak tersedia.'));
      }

      // Gambar dengan smoothing berkualitas tinggi
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Konversi ke JPEG terkompresi
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      canvas.toBlob(
        blob => {
          if (!blob) return reject(new Error('Gagal mengompres gambar ke Blob.'));
          const sizeKb = Math.round(blob.size / 1024);
          resolve({ compressedBlob: blob, dataUrl, sizeKb });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Proses unggah cerdas:
 * 1. Kompres gambar
 * 2. Coba upload ke Supabase Storage (lampiran-rt)
 * 3. Jika storage offline/belum ada bucket, gunakan Base64 terkompresi yang aman dan ringan
 */
export async function processAndUploadAttachment(
  file: File,
  folder: 'bukti-kas' | 'dokumen-rt' = 'bukti-kas'
): Promise<CompressedImageResult> {
  try {
    const { compressedBlob, dataUrl, sizeKb } = await compressImageFile(file);

    // Buat file baru dari compressed blob untuk diunggah ke storage
    const compressedFile = new File([compressedBlob], file.name, {
      type: compressedBlob.type,
    });

    const storageUpload = await uploadFileToSupabaseStorage(compressedFile, folder);

    if (storageUpload && storageUpload.url) {
      return {
        url: storageUpload.url,
        isCloudStorage: true,
        fileSizeKb: sizeKb,
      };
    }

    // Fallback jika storage bucket belum siap: gunakan dataURL yang sudah terkompresi hemat
    return {
      url: dataUrl,
      isCloudStorage: false,
      fileSizeKb: sizeKb,
    };
  } catch (err) {
    console.warn('Gagal memproses lampiran dengan kompresi, menggunakan file asli:', err);
    const dataUrl = await fileToDataUrl(file);
    return {
      url: dataUrl,
      isCloudStorage: false,
      fileSizeKb: Math.round(file.size / 1024),
    };
  }
}
