/**
 * Layanan Asisten Cerdas AI RT Gasem Raya 02 (Google Gemini AI)
 * Melewati proxy backend aman (/api/gemini) agar API Key tidak pernah bocor ke sisi klien / browser.
 */

import { ProfilRt } from '../types';

export const getGeminiApiKey = (): string => {
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.GEMINI_API_KEY?.trim() || import.meta.env?.VITE_GEMINI_API_KEY?.trim())) ||
    ''
  );
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
 * Kirim pertanyaan ke Gemini via proxy backend aman (/api/gemini) dengan fallback langsung
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

  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 1000,
  };

  let proxyErrorMessage = '';

  // 1. Coba lewat proxy backend (/api/gemini)
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.5-flash',
        contents,
        generationConfig,
      }),
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      if (!data.error) {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) return reply.trim();
      } else {
        console.warn('Gemini Proxy Warning:', data.error);
        proxyErrorMessage = data.error?.message || '';
      }
    } else {
      console.warn(`Proxy /api/gemini tidak mengembalikan JSON valid (status ${response.status}). Mencoba fallback langsung...`);
    }
  } catch (proxyErr: any) {
    console.warn('Proxy /api/gemini tidak dapat dihubungi:', proxyErr?.message);
    proxyErrorMessage = proxyErr?.message || '';
  }

  // 2. Fallback: Panggilan langsung Google Gemini API dari browser jika API Key tersedia
  const clientApiKey = getGeminiApiKey();
  if (clientApiKey) {
    try {
      let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${clientApiKey}`;
      let directRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      });

      let directData: any = await directRes.json();

      // Fallback otomatis jika model 2.5 belum aktif ke model flash-latest
      if (directRes.status === 404 || directData.error?.message?.includes('not found')) {
        targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${clientApiKey}`;
        directRes = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig }),
        });
        directData = await directRes.json();
      }

      if (directData.candidates?.[0]?.content?.parts?.[0]?.text) {
        return directData.candidates[0].content.parts[0].text.trim();
      }

      if (directData.error?.message) {
        throw new Error(directData.error.message);
      }
    } catch (directErr: any) {
      console.error('Error saat menghubungi Google Gemini API secara langsung:', directErr);
      throw new Error(directErr?.message || 'Gagal tersambung ke Google Gemini API.');
    }
  }

  // Jika proxy gagal dan tidak ada direct key
  throw new Error(
    proxyErrorMessage ||
      'Layanan Gemini AI tidak dapat diakses. Jika dihosting di Vercel, pastikan GEMINI_API_KEY telah diatur di Settings > Environment Variables Vercel.'
  );
}
