import { useMemo } from 'react';
import { useXtreamCatalog } from '../api';

export function SettingsPage() {
  const { loading, error, liveList } = useXtreamCatalog();
  /**
   * Variáveis de ambiente necessárias para o Xtream.
   * Como a aplicação é Vite, todas precisam do prefixo VITE_.
   */
  const envItems = [
    { key: 'VITE_XTREAM_SERVER_URL', value: import.meta.env.VITE_XTREAM_SERVER_URL || '' },
    { key: 'VITE_XTREAM_USERNAME', value: import.meta.env.VITE_XTREAM_USERNAME || '' },
    { key: 'VITE_XTREAM_PASSWORD', value: import.meta.env.VITE_XTREAM_PASSWORD || '' },
    { key: 'VITE_XTREAM_TIMEOUT_MS', value: import.meta.env.VITE_XTREAM_TIMEOUT_MS || '' },
    { key: 'VITE_XTREAM_CACHE_TTL_MS', value: import.meta.env.VITE_XTREAM_CACHE_TTL_MS || '' }
  ];

  /**
   * Seleciona um canal de exemplo para depuração.
   * Usamos o primeiro item disponível.
   */
  const sampleChannel = useMemo(() => liveList[0], [liveList]);

  return (
    <div>
      <h1 className="text-white text-2xl md:text-3xl font-semibold mb-4">Configurações</h1>

      {/* Bloco único com impressão das variáveis de ambiente. */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
        <h2 className="text-white/80 text-sm uppercase tracking-[0.2em] mb-3">
          Variáveis de Ambiente
        </h2>

        <div className="space-y-2">
          {envItems.map((item) => (
            <div
              key={item.key}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2"
            >
              <span className="text-white/70 text-xs md:text-sm">{item.key}</span>
              <span className="text-white text-xs md:text-sm break-all">
                {String(item.value || '-')}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Debug de retorno do Xtream: canal de exemplo. */}
      <section className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6 mt-6">
        <h2 className="text-white/80 text-sm uppercase tracking-[0.2em] mb-3">
          Canal de TV para Teste
        </h2>

        {loading && <p className="text-white/60 text-sm">Carregando canais...</p>}
        {error && <p className="text-red-400 text-sm whitespace-pre-line">Erro: {error}</p>}
        {!loading && !error && (
          <div className="space-y-2">
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-white/60 text-xs mb-1">Nome do canal</p>
              <p className="text-white text-sm break-all">{sampleChannel?.title || '-'}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <p className="text-white/60 text-xs mb-1">URL do stream</p>
              <p className="text-white text-sm break-all">{sampleChannel?.playUrl || '-'}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
