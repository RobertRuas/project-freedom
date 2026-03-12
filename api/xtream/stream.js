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
    /**
     * Encaminha cabeçalhos relevantes para vídeo progressivo (Range)
     * e usa User-Agent de navegador para reduzir bloqueios de edge/CDN.
     */
    const upstreamResponse = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: '*/*',
        ...(req.headers.range ? { Range: req.headers.range } : {})
      },
      redirect: 'follow'
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

      const rewriteUri = (uri) => {
        try {
          const resolved = new URL(uri, baseUrl).toString();
          return `/api/xtream/stream?url=${encodeURIComponent(resolved)}`;
        } catch {
          return uri;
        }
      };

      const rewritten = playlistText
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return line;
          }

          // Reescreve URIs em tags como EXT-X-KEY, EXT-X-MAP, EXT-X-MEDIA.
          if (trimmed.startsWith('#') && trimmed.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/g, (_match, uri) => `URI="${rewriteUri(uri)}"`);
          }

          if (trimmed.startsWith('#')) {
            return line;
          }

          return rewriteUri(trimmed);
        })
        .join('\n');

      res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
      res.status(200).send(rewritten);
      return;
    }

    // Repassa cabeçalhos importantes para manter compatibilidade com seek.
    const passthroughHeaders = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'cache-control',
      'etag',
      'last-modified'
    ];
    passthroughHeaders.forEach((headerName) => {
      const headerValue = upstreamResponse.headers.get(headerName);
      if (headerValue) {
        res.setHeader(headerName, headerValue);
      }
    });

    const buffer = Buffer.from(await upstreamResponse.arrayBuffer());
    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.status(upstreamResponse.status).send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao processar proxy de stream.' });
  }
}
