import { supabase, isSupabaseConfigured } from './supabaseClient';

const BUCKET_NAME = 'lampiran-rt';

/**
 * Upload file bukti transaksi atau dokumen ke Supabase Storage
 * Mengembalikan URL publik berkas, atau null jika gagal
 */
export const uploadFileToSupabaseStorage = async (
  file: File,
  folder: 'bukti-kas' | 'dokumen-rt' = 'bukti-kas'
): Promise<{ url: string; path: string } | null> => {
  if (!isSupabaseConfigured() || !supabase) {
    return null;
  }

  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${folder}/${timestamp}_${cleanFileName}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Gagal upload ke Supabase Storage:', error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return {
      url: publicData.publicUrl,
      path: data.path,
    };
  } catch (err) {
    console.error('Error saat upload berkas ke storage:', err);
    return null;
  }
};

/**
 * Hapus file dari Supabase Storage
 */
export const deleteFileFromSupabaseStorage = async (filePath: string): Promise<boolean> => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.warn('Gagal menghapus file dari storage:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error hapus berkas storage:', err);
    return false;
  }
};
