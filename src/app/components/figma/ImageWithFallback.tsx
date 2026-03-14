import { useEffect, useState, type ImgHTMLAttributes } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function ImageWithFallback(props: ImgHTMLAttributes<HTMLImageElement>) {
  const [currentSrc, setCurrentSrc] = useState('');

  const handleError = () => {
    /**
     * Sem proxy/API: quando a URL remota falhar,
     * trocamos para o placeholder local embutido.
     */
    setCurrentSrc(ERROR_IMG_SRC);
  };

  const { src, alt, style, className, ...rest } = props;
  const normalizedSrc = typeof src === 'string' ? src.trim() : '';
  const safeSrc = normalizedSrc || ERROR_IMG_SRC;

  useEffect(() => {
    // Sempre que a URL muda, tentamos novamente a origem remota.
    setCurrentSrc(safeSrc);
  }, [safeSrc]);

  return (
    <img
      src={currentSrc || safeSrc}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={handleError}
      data-original-url={src}
    />
  );
}
