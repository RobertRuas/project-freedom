/**
 * Proxy simples para streams Xtream (HLS).
 * Resolve problemas de CORS e Mixed Content no ambiente da Vercel.
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
        'User-Agent': 'Mozilla/5.0'
      }
    });

    if (!upstreamResponse.ok) {
      res.status(upstreamResponse.status).json({ error: 'Falha ao buscar stream.' });
      return;
    }

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const isPlaylist =
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('application/x-mpegURL') ||
      targetUrl.includes('.m3u8');

    res.setHeader('Access-Control-Allow-Origin', '*');

    if (isPlaylist) {
      const playlistText = await upstreamResponse.text();
      const baseUrl = new URL(targetUrl);

      const rewritten = playlistText
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) {
            return line;
          }

          let resolved;
          try {
            resolved = new URL(trimmed, baseUrl).toString();
          } catch {
            return line;
          }

          return `/api/xtream/stream?url=${encodeURIComponent(resolved)}`;
        })
        .join('\n');

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.status(200).send(rewritten);
      return;
    }

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.status(200).send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar proxy de stream.' });
  }
}
