/**
 * Layanan Asisten Cerdas AI RT Gasem Raya 02 (Google Gemini AI)
 * Menggunakan model Gemini 2.5 Flash yang cepat, cerdas, dan responsif.
 */

import { ProfilRt } from '../types';

export const getGeminiApiKey = (): string => {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    (typeof import.meta !== 'undefined' && import.meta.env?.GEMINI_API_KEY) ||
    ''
  );
};

export const isGeminiConfigured = (): boolean => {
  return Boolean(getGeminiApiKey().trim());
};

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
}

export interface AssistantContext {
  profilRt: ProfilRt;
  totalWarga?: number;
  totalKk?: number;
  saldoKas?: number;
}

/**
 * Kirim pertanyaan ke Gemini 2.5 Flash dengan konteks resmi RT Gasem Raya
 */
export async function askGeminiAssistant(
  prompt: string,
  history: ChatMessage[] = [],
  context?: AssistantContext
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Kunci API Gemini (VITE_GEMINI_API_KEY) belum dikonfigurasi pada berkas .env.');
  }

  const p = context?.profilRt;
  const systemInstruction = `Anda adalah "Asisten Pintar Gasem Raya RT 02", asisten virtual resmi untuk rukun tetangga:
- Wilayah: RT ${p?.nomorRt || '02'} / RW ${p?.nomorRw || '04'} Gasem Raya
- Kelurahan: ${p?.desaKelurahan || 'Tlogosari Wetan'}, Kecamatan: ${p?.kecamatan || 'Pedurungan'}
- Kota: ${p?.kotaKabupaten || 'Kota Semarang'}, Kode Pos: ${p?.kodePos || '50196'}
- Ketua RT: ${p?.namaKetuaRt || 'Bpk. Ahmad Sucipto'}
- Sekretaris: ${p?.namaSekretaris || 'Bpk. Budi Santoso'}
- Bendahara: ${p?.namaBendahara || 'Ibu Siti Rahmawati'}
- Kontak Sekretariat: ${p?.nomorKontak || '0812-3456-7890'}
- Statistik Saat Ini: ${context?.totalWarga || 0} Warga terdata, ${context?.totalKk || 0} Kartu Keluarga.

Tugas Anda:
1. Membantu warga dan pengurus seputar administrasi RT, tata tertib lingkungan (portal malam jam 23.00, lapor tamu 1x24 jam, iuran kas, kerja bakti).
2. Menjelaskan syarat pengurusan surat pengantar RT (SKCK, KTP baru, surat pindah, izin keramaian, surat kematian/kelahiran).
3. Membantu pengurus membuat draf pengumuman/surat edaran RT resmi, sopan, dan rapi.
4. Bersikap sangat ramah, santun, berbahasa Indonesia yang baik, lugas, dan solutif.
5. Jika ada pertanyaan di luar topik RT atau hal sensitif, jawab dengan bijak dan arahkan kembali ke ketertiban lingkungan.`;

  // Format pesan riwayat untuk Gemini
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nPengguna bertanya: ${prompt}` }],
    },
  ];

  // Gunakan gemini-2.5-flash atau fallback ke gemini-1.5-flash
  const model = 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.warn('Gemini API Error:', data.error);
      // Fallback ke model 1.5 jika model 2.5 mengalami limit
      if (model.includes('2.5')) {
        return await fallbackGemini15(prompt, systemInstruction, apiKey);
      }
      throw new Error(data.error.message || 'Gagal memproses respons dari Gemini AI.');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Tidak ada respons teks yang dihasilkan.');
    }

    return reply.trim();
  } catch (err: any) {
    console.error('Error saat menghubungi Gemini AI:', err);
    throw new Error(err?.message || 'Gagal tersambung ke layanan Gemini AI.');
  }
}

async function fallbackGemini15(
  prompt: string,
  systemInstruction: string,
  apiKey: string
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nPertanyaan: ${prompt}` }] }],
    }),
  });
  const data = await response.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    'Mohon maaf, asisten AI sedang sibuk. Silakan coba beberapa saat lagi.'
  );
}
