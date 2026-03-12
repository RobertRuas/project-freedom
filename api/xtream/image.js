/**
 * Proxy simples para imagens remotas do Xtream.
 * Resolve bloqueios comuns de CORS, hotlink e mixed content.
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  const rawUrl = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!rawUrl) {
    res.status(400).json({ error: 'Parametro url ausente.' });
    return;
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(String(rawUrl));
  } catch {
    res.status(400).json({ error: 'Parametro url invalido.' });
    return;
  }

  if (!/^https?:\/\//i.test(targetUrl)) {
    res.status(400).json({ error: 'URL precisa iniciar com http ou https.' });
    return;
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        Referer: ''
      }
    });

    if (!upstreamResponse.ok) {
      res.status(upstreamResponse.status).json({ error: 'Falha ao buscar imagem.' });
      return;
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    res.setHeader('Content-Type', contentType);
    res.status(200).send(buffer);
  } catch {
    res.status(500).json({ error: 'Erro ao processar proxy de imagem.' });
  }
}
