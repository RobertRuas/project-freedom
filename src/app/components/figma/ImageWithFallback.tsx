import { useEffect, useState, type ImgHTMLAttributes } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [didError, setDidError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState('');

  const handleError = () => {
    // Sem proxy/API: quando falhar, mostramos placeholder local.
    setDidError(true);
  };

  const { src, alt, style, className, ...rest } = props;
  const normalizedSrc = typeof src === 'string' ? src.trim() : '';
  const safeSrc = normalizedSrc || ERROR_IMG_SRC;

  useEffect(() => {
    // Sempre que a URL muda, resetamos o estado de erro para tentar novamente.
    setDidError(false);
    setCurrentSrc(safeSrc);
  }, [safeSrc]);

  // Quando a imagem remota falha, mostramos um placeholder local embutido.
  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img src={ERROR_IMG_SRC} alt="Erro ao carregar imagem" {...rest} data-original-url={src} />
      </div>
    </div>
  ) : (
    <img
      src={currentSrc || safeSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
    />
  );
}
