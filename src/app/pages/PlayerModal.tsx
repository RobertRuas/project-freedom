import { useEffect, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { X } from 'lucide-react';
import Hls from 'hls.js';

export function PlayerModal() {
  const navigate = useNavigate();
  const { hash } = useParams();
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const title = searchParams.get('title') ?? 'Reprodução';
  const kind = searchParams.get('kind') ?? 'conteúdo';
  const sourceParam = searchParams.get('src');

  const safeHash = useMemo(() => hash ?? 'indisponivel', [hash]);
  const resolvedSource = useMemo(
    () => (sourceParam ? decodeURIComponent(sourceParam) : '/videos/sample.mp4'),
    [sourceParam]
  );
  const proxiedSource = useMemo(() => {
    if (!resolvedSource) return resolvedSource;
    if (!resolvedSource.includes('.m3u8')) return resolvedSource;
    return `/api/xtream/stream?url=${encodeURIComponent(resolvedSource)}`;
  }, [resolvedSource]);

  useEffect(() => {
    const container = containerRef.current;
    const video = videoRef.current;

    if (!container || !video) {
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

    const startPlayback = async () => {
      try {
        video.muted = false;
        await video.play();
        return;
      } catch {
        // Fallback para políticas de autoplay mais restritivas.
      }

      try {
        video.muted = true;
        await video.play();
      } catch {
        // Se falhar novamente, o usuário pode iniciar manualmente.
      }
    };

    void startPlayback();
    void requestFullscreen();
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    // Limpa instância anterior do HLS se existir.
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!resolvedSource) {
      return;
    }

    /**
     * Suporte a HLS (.m3u8):
     * - Safari toca nativamente.
     * - Outros navegadores usam hls.js.
     */
    const isHls = resolvedSource.includes('.m3u8');
    const canPlayHls = video.canPlayType('application/vnd.apple.mpegurl') !== '';

    if (isHls && !canPlayHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(proxiedSource);
      hls.attachMedia(video);
      hlsRef.current = hls;
    } else {
      video.src = proxiedSource;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [resolvedSource, proxiedSource]);

  const closePlayer = () => {
    /**
     * Fecha o player sem recarregar a aplicação.
     * Se não houver histórico interno suficiente, volta para a Home.
     */
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-[120] bg-black">
      <section className="w-screen h-screen bg-black relative">
        <header className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-6 py-3 bg-gradient-to-b from-black/85 to-transparent">
          <div>
            <p className="text-white text-sm md:text-base font-semibold">{decodeURIComponent(title)}</p>
            <p className="text-white/50 text-xs md:text-sm">{kind} • hash {safeHash}</p>
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

        {/* Player em tela cheia com autoplay. */}
        <div className="w-full h-full bg-black">
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
