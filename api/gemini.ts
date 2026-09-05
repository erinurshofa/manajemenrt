/**
 * Vercel Serverless Function untuk Google Gemini AI Proxy
 * Terhubung ke: POST /api/gemini
 * Mengamankan GEMINI_API_KEY di sisi server Vercel agar tidak terekspos ke publik
 */

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: { message: 'Metode tidak diizinkan. Gunakan metode POST.' } });
    return;
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    res.status(500).json({
      error: {
        message: 'GEMINI_API_KEY belum dikonfigurasi di Environment Variables server Vercel.',
      },
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const { contents, generationConfig, model = 'gemini-2.5-flash' } = body;

  if (!contents || !Array.isArray(contents)) {
    res.status(400).json({ error: { message: 'Format payload salah: "contents" wajib disertakan.' } });
    return;
  }

  try {
    let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    let apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    });

    let data: any = await apiRes.json();

    // Fallback otomatis ke gemini-flash-latest jika model spesifik belum aktif/limit/404
    if (apiRes.status === 404 || data.error?.message?.includes('not found')) {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      apiRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      });
      data = await apiRes.json();
    }

    res.status(apiRes.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: { message: err?.message || 'Server proxy internal error' } });
  }
}
