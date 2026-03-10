import { ContentList } from '../components/ContentList';
import { CatalogPageHeader } from '../components/CatalogPageHeader';
import {
  entertainmentListContentWithHash,
  newsListContentWithHash,
  sportsListContentWithHash,
} from '../data/content';
import { useCatalogViewMode } from '../hooks/useCatalogViewMode';

export function LiveTV() {
  const { viewMode, toggleViewMode } = useCatalogViewMode('catalog-view:live-tv');

  return (
    <div>
      <CatalogPageHeader title="TV ao Vivo" viewMode={viewMode} onToggleViewMode={toggleViewMode} />

      {/* Cada bloco representa uma trilha editorial da TV ao vivo. */}
      <ContentList title="Notícias" content={newsListContentWithHash} viewMode={viewMode} />
      <ContentList title="Entretenimento" content={entertainmentListContentWithHash} viewMode={viewMode} />
      <ContentList title="Esportes" content={sportsListContentWithHash} viewMode={viewMode} />
    </div>
  );
}
