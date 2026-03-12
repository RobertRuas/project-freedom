import { useEffect, useState } from 'react';
import {
  listContinueWatching,
  PLAYBACK_PROGRESS_EVENT,
  type PlaybackProgressRow
} from '../utils/playbackState';

/**
 * Hook simples para carregar itens de "continuar assistindo" do cache local.
 * Os dados são mantidos no navegador para sobreviver a reload.
 */
export function useContinueWatching() {
  const [items, setItems] = useState<PlaybackProgressRow[]>([]);

  useEffect(() => {
    const refresh = () => {
      setItems(listContinueWatching());
    };

    refresh();
    window.addEventListener(PLAYBACK_PROGRESS_EVENT, refresh);
    window.addEventListener('storage', refresh);

    return () => {
      window.removeEventListener(PLAYBACK_PROGRESS_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return items;
}
