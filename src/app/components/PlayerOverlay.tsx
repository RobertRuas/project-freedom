import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Loader2, X } from 'lucide-react';
import Hls from 'hls.js';
import { clearPlayerModalSearch } from '../utils/playerModalSearch';
import { getProgressByContent, savePlaybackProgress, type PlaybackType } from '../utils/playbackState';
import { getPlayerQueue } from '../utils/playerQueue';

/**
 * Modal global do player.
 * Ele é controlado por query string para evitar desmontar a página pai.
 */
export function PlayerOverlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const lastProgressSaveAtRef = useRef(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [loadingLabel, setLoadingLabel] = useState('Preparando reprodução...');
  const [sourceAttemptIndex, setSourceAttemptIndex] = useState(0);

  const isOpen = searchParams.get('player') === '1';
  const queueKey = searchParams.get('queueKey');
  const queueIndex = Math.max(0, Number.parseInt(String(searchParams.get('queueIndex') || '0'), 10) || 0);
  const queueItems = useMemo(() => getPlayerQueue(queueKey), [queueKey]);
  const queueItem = queueItems[queueIndex];
  const contentId = String(queueItem?.contentId || searchParams.get('contentId') || '').trim();
  const title = queueItem?.title || searchParams.get('title') || 'Reprodução';
  const kind = queueItem?.kind || searchParams.get('kind') || 'conteúdo';
  const sourceParam = queueItem?.src || searchParams.get('src');
  const imageUrl = queueItem?.imageUrl || searchParams.get('imageUrl') || undefined;
  const streamType: PlaybackType = useMemo(() => {
    const typeParam = String(searchParams.get('streamType') || '').toLowerCase();
    if (typeParam === 'live' || typeParam === 'vod' || typeParam === 'series') {
      return typeParam;
    }

    const normalizedKind = String(kind || '').toLowerCase();
    if (normalizedKind.includes('canal')) return 'live';
    if (normalizedKind.includes('episodio') || normalizedKind.includes('série') || normalizedKind.includes('serie')) return 'series';
    return 'vod';
  }, [searchParams, kind]);
  const resolvedSource = useMemo(() => {
    if (sourceParam) {
      // URLSearchParams já entrega string decodificada.
      return sourceParam;
    }

    return '/videos/sample.mp4';
  }, [sourceParam]);
  const sourceCandidates = useMemo(() => {
    const normalized = String(resolvedSource || '').trim();
    if (!normalized) return [] as string[];

    const candidates = [normalized];
    const [withoutQuery, query = ''] = normalized.split('?');
    const querySuffix = query ? `?${query}` : '';
    const queryJoiner = query ? '&' : '?';
    const cacheBustSuffix = `${queryJoiner}retry=${Date.now()}`;

    if (/\.mp4($|\?)/i.test(normalized)) {
      candidates.push(withoutQuery.replace(/\.mp4$/i, '.m3u8') + querySuffix);
    } else if (/\.m3u8($|\?)/i.test(normalized)) {
      candidates.push(withoutQuery.replace(/\.m3u8$/i, '.mp4') + querySuffix);
    }

    // Última tentativa: reaplica a URL original com cache-bust para evitar edge cache ruim.
    candidates.push(`${normalized}${cacheBustSuffix}`);

    return Array.from(new Set(candidates.filter(Boolean)));
  }, [resolvedSource]);
  const activeSource = sourceCandidates[sourceAttemptIndex] || resolvedSource;
  const proxiedSource = useMemo(() => {
    const normalized = String(activeSource || '').trim();
    if (!normalized) return normalized;

    // URLs locais (assets) não precisam de proxy.
    const isRemoteHttp = /^https?:\/\//i.test(normalized);
    if (!isRemoteHttp) {
      return normalized;
    }

    /**
     * Episódios de série precisam passar pelo proxy para contornar
     * bloqueios de CORS/Cloudflare no navegador.
     * Também mantemos proxy para HLS em qualquer tipo.
     */
    const mustProxy = streamType === 'series' || /\.m3u8($|\?)/i.test(normalized);
    if (!mustProxy) {
      return normalized;
    }

    return `/api/xtream/stream?url=${encodeURIComponent(normalized)}`;
  }, [activeSource, streamType]);
  const resumeProgress = useMemo(() => {
    if (!contentId) {
      return null;
    }
    return getProgressByContent(streamType, contentId);
  }, [contentId, streamType]);

  useEffect(() => {
    setSourceAttemptIndex(0);
  }, [resolvedSource]);

  const tryNextSourceCandidate = () => {
    if (sourceAttemptIndex + 1 >= sourceCandidates.length) {
      setIsBuffering(true);
      setLoadingLabel('Falha ao carregar stream.');
      return false;
    }

    setIsBuffering(true);
    setLoadingLabel('Tentando formato alternativo...');
    setSourceAttemptIndex((current) => current + 1);
    return true;
  };

  /**
   * Persiste progresso local da reprodução.
   * Mantemos o cache no browser para permitir "continuar assistindo".
   */
  const pushProgress = (force = false) => {
    const video = videoRef.current;

    if (!video || !contentId) {
      return;
    }

    const now = Date.now();
    if (!force && now - lastProgressSaveAtRef.current < 10000) {
      return;
    }

    const duration = Number(video.duration);
    const position = Number(video.currentTime) || 0;
    if (!Number.isFinite(duration) || duration <= 0 || position <= 0) {
      return;
    }

    lastProgressSaveAtRef.current = now;
    savePlaybackProgress({
      type: streamType,
      contentId,
      title: String(title || ''),
      imageUrl,
      playUrl: activeSource,
      routeHash: contentId,
      durationSeconds: Math.floor(duration),
      positionSeconds: Math.floor(position)
    });
  };

  /**
   * Tenta tocar automaticamente já com áudio ativo.
   * Em navegadores mais restritivos, o usuário pode usar o controle do vídeo.
   */
  const startPlaybackWithSound = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.defaultMuted = false;
    video.muted = false;
    video.volume = 1;

    try {
      await video.play();
    } catch {
      // Em algumas plataformas o autoplay com áudio pode ser bloqueado.
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const requestFullscreen = async () => {
      try {
        const element = container as HTMLDivElement & {
          webkitRequestFullscreen?: () => Promise<void> | void;
        };

        if (typeof element.requestFullscreen === 'function') {
          await element.requestFullscreen();
          return;
        }

        if (typeof element.webkitRequestFullscreen === 'function') {
          element.webkitRequestFullscreen();
        }
      } catch {
        // Algumas plataformas bloqueiam fullscreen automático.
      }
    };

    void requestFullscreen();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const video = videoRef.current;

    if (!video) {
      return;
    }

    // Limpa instância anterior do HLS se existir.
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!activeSource) {
      return;
    }

    lastProgressSaveAtRef.current = 0;
    setIsBuffering(true);
    setLoadingLabel('Iniciando download do conteúdo...');

    const isHls = /\.m3u8($|\?)/i.test(proxiedSource);
    const canPlayHls = video.canPlayType('application/vnd.apple.mpegurl') !== '';

    if (isHls && !canPlayHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data?.fatal) {
          if (!tryNextSourceCandidate()) {
            setIsBuffering(true);
            setLoadingLabel('Falha ao carregar stream.');
          }
        }
      });
      hls.loadSource(proxiedSource);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else {
      video.src = proxiedSource;
    }

    const onCanPlay = () => {
      void startPlaybackWithSound();
    };
    const onLoadedMetadata = () => {
      const videoDuration = Number(video.duration);
      const savedPosition = Number(resumeProgress?.positionSeconds || 0);
      const seekTarget = Math.max(0, savedPosition - 2);

      /**
       * Só retomamos quando existe progresso útil e ainda há conteúdo pela frente.
       */
      if (
        Number.isFinite(videoDuration) &&
        videoDuration > 0 &&
        seekTarget > 10 &&
        seekTarget < videoDuration - 5
      ) {
        video.currentTime = seekTarget;
      }
    };
    const onTimeUpdate = () => {
      pushProgress(false);
    };
    const onPause = () => {
      pushProgress(true);
    };
    const onLoadStart = () => {
      setIsBuffering(true);
      setLoadingLabel('Baixando dados do stream...');
    };
    const onWaiting = () => {
      setIsBuffering(true);
      setLoadingLabel('Carregando mais dados...');
    };
    const onStalled = () => {
      setIsBuffering(true);
      setLoadingLabel('Conexão lenta. Aguardando...');
    };
    const onPlaying = () => {
      setIsBuffering(false);
    };
    const onCanPlayThrough = () => {
      setIsBuffering(false);
    };
    const onError = () => {
      if (!tryNextSourceCandidate()) {
        setIsBuffering(true);
        setLoadingLabel('Falha ao carregar stream.');
      }
    };
    const onEnded = () => {
      openNextInQueue();
    };

    video.addEventListener('canplay', onCanPlay, { once: true });
    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplaythrough', onCanPlayThrough);
    video.addEventListener('error', onError);
    video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    if (video.readyState >= 3) {
      void startPlaybackWithSound();
    }

    return () => {
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplaythrough', onCanPlayThrough);
      video.removeEventListener('error', onError);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      pushProgress(true);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, activeSource, proxiedSource, resumeProgress?.positionSeconds, queueIndex, queueItems.length, sourceAttemptIndex, sourceCandidates.length]);

  if (!isOpen) {
    return null;
  }

  const closePlayer = () => {
    pushProgress(true);
    const nextSearch = clearPlayerModalSearch(location.search);

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch ? `?${nextSearch}` : ''
      },
      { replace: true }
    );
  };

  const openNextInQueue = () => {
    if (!queueItem || queueIndex + 1 >= queueItems.length) {
      pushProgress(true);
      return;
    }

    pushProgress(true);

    const nextItem = queueItems[queueIndex + 1];
    const nextSearchParams = new URLSearchParams(location.search);

    nextSearchParams.set('player', '1');
    nextSearchParams.set('contentId', nextItem.contentId);
    nextSearchParams.set('title', nextItem.title);
    nextSearchParams.set('kind', nextItem.kind);
    nextSearchParams.set('src', nextItem.src);
    nextSearchParams.set('streamType', nextItem.streamType);
    if (nextItem.imageUrl) {
      nextSearchParams.set('imageUrl', nextItem.imageUrl);
    } else {
      nextSearchParams.delete('imageUrl');
    }
    if (queueKey) {
      nextSearchParams.set('queueKey', queueKey);
      nextSearchParams.set('queueIndex', String(queueIndex + 1));
    }

    navigate(
      {
        pathname: location.pathname,
        search: `?${nextSearchParams.toString()}`
      },
      { replace: true }
    );
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[120] bg-black">
      <section className="w-screen h-screen bg-black relative">
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 bg-gradient-to-b from-black/85 to-transparent">
          <div>
            <p className="text-white text-sm md:text-base font-semibold">{decodeURIComponent(title)}</p>
            <p className="text-white/50 text-xs md:text-sm">{kind} • id {contentId || 'indisponivel'}</p>
          </div>

          <button
            type="button"
            aria-label="Fechar player"
            onClick={closePlayer}
            className="rounded-md bg-white/10 hover:bg-white/20 text-white p-2"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="w-full h-full bg-black">
          {isBuffering && (
            <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-white/85">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs md:text-sm">{loadingLabel}</span>
              </div>
            </div>
          )}
          <video
            ref={videoRef}
            className="w-full h-full"
            controls
            preload="metadata"
            autoPlay
            playsInline
            src={proxiedSource}
          />
        </div>
      </section>
    </div>
  );
}
