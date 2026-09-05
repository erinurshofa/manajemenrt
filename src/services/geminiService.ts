/**
 * Layanan Asisten Cerdas AI RT Gasem Raya 02 (Google Gemini AI)
 * Melewati proxy backend aman (/api/gemini) agar API Key tidak pernah bocor ke sisi klien / browser.
 */

import { ProfilRt } from '../types';

export const getGeminiApiKey = (): string => {
  // Disembunyikan sepenuhnya dari client bundle; ditangani aman oleh server-side proxy
  return '';
};

export const isGeminiConfigured = (): boolean => {
  return true;
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
 * Kirim pertanyaan ke Gemini via proxy backend aman (/api/gemini)
 */
export async function askGeminiAssistant(
  prompt: string,
  history: ChatMessage[] = [],
  context?: AssistantContext
): Promise<string> {
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

  // Format pesan untuk Gemini
  const contents = [
    {
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\nPengguna bertanya: ${prompt}` }],
    },
  ];

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.warn('Gemini Proxy Error:', data.error);
      throw new Error(data.error.message || 'Gagal memproses respons dari Gemini AI.');
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) {
      throw new Error('Tidak ada respons teks yang dihasilkan.');
    }

    return reply.trim();
  } catch (err: any) {
    console.error('Error saat menghubungi Asisten AI:', err);
    throw new Error(err?.message || 'Gagal tersambung ke layanan Gemini AI. Pastikan server Vite aktif.');
  }
}
