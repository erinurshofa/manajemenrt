/**
 * Vercel Serverless Function untuk Google Gemini AI Proxy
 * Terhubung ke: POST /api/gemini
 * Mengamankan GEMINI_API_KEY di sisi server Vercel agar tidak terekspos ke publik
 */

export const config = {
  maxDuration: 30,
};

export default async function handler(req: any, res: any) {
  // Set CORS headers
  const setCors = () => {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
      );
    }
  };

  const sendJson = (status: number, data: any) => {
    setCors();
    if (res && typeof res.status === 'function') {
      return res.status(status).json(data);
    }
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  };

  setCors();

  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  if (req.method !== 'POST') {
    return sendJson(405, { error: { message: 'Metode tidak diizinkan. Gunakan metode POST.' } });
  }

  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    '';

  if (!apiKey) {
    return sendJson(500, {
      error: {
        message: 'GEMINI_API_KEY belum dikonfigurasi di Environment Variables server Vercel.',
      },
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  } else if (!body && typeof req.json === 'function') {
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  }
  body = body || {};

  const { contents, generationConfig, model = 'gemini-2.5-flash' } = body;

  if (!contents || !Array.isArray(contents)) {
    return sendJson(400, { error: { message: 'Format payload salah: "contents" wajib disertakan.' } });
  }

  try {
    let targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    let apiRes = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
    });

    const isJson = apiRes.headers.get('content-type')?.includes('application/json');
    let data: any = isJson ? await apiRes.json().catch(() => ({})) : {};

    // Fallback otomatis ke gemini-flash-latest jika model spesifik belum aktif/limit/404
    if (apiRes.status === 404 || data.error?.message?.includes('not found')) {
      targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      apiRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents, generationConfig }),
      });
      const isFallbackJson = apiRes.headers.get('content-type')?.includes('application/json');
      data = isFallbackJson ? await apiRes.json().catch(() => ({})) : {};
    }

    return sendJson(apiRes.status, data);
  } catch (err: any) {
    return sendJson(500, { error: { message: err?.message || 'Server proxy internal error' } });
  }
}
