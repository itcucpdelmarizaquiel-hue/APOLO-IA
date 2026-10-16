import React from 'react';
import { ExternalLink, Search, Video, Youtube } from 'lucide-react';

export type ExternalPlatform = 'youtube' | 'tiktok';

interface ExternalPlatformPanelProps {
  platform: ExternalPlatform;
  query: string;
  onQueryChange: (query: string) => void;
}

const getPlatformUrl = (platform: ExternalPlatform, query: string) => {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return platform === 'youtube' ? 'https://www.youtube.com/' : 'https://www.tiktok.com/';
  }

  return platform === 'youtube'
    ? `https://www.youtube.com/results?search_query=${encodeURIComponent(trimmedQuery)}`
    : `https://www.tiktok.com/search?q=${encodeURIComponent(trimmedQuery)}`;
};

export const ExternalPlatformPanel: React.FC<ExternalPlatformPanelProps> = ({
  platform,
  query,
  onQueryChange
}) => {
  const isYouTube = platform === 'youtube';
  const title = isYouTube ? 'YouTube' : 'TikTok';
  const Icon = isYouTube ? Youtube : Video;
  const destinationUrl = getPlatformUrl(platform, query);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) return;
    window.open(destinationUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl sm:p-7">
      <header className="mb-6 flex items-start gap-3">
        <div className={`rounded-2xl border p-3 ${isYouTube ? 'border-red-500/30 bg-red-500/10 text-red-400' : 'border-slate-700 bg-slate-800 text-slate-200'}`}>
          <Icon aria-hidden="true" className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{title}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">
            Pesquise aqui e abra o conteúdo no aplicativo ou site {title}. O APOLO não reproduz nem controla conteúdo externo nesta página.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="sr-only" htmlFor={`external-search-${platform}`}>Pesquisar no {title}</label>
        <input
          id={`external-search-${platform}`}
          type="search"
          autoComplete="off"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={isYouTube ? 'Música, artista ou vídeo…' : 'Criador, som ou vídeo…'}
          className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={!query.trim()}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${isYouTube ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}
        >
          <Search aria-hidden="true" className="h-4 w-4" />
          Pesquisar
        </button>
      </form>

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-slate-400">
          {query.trim()
            ? `Pesquisa pronta: “${query.trim()}”.`
            : `Abra ${title} diretamente ou escreva uma pesquisa acima.`}
          {' '}Em telemóveis, o sistema pode abrir o aplicativo se estiver instalado.
        </p>
        <a
          href={destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-xs font-bold text-white transition-colors ${isYouTube ? 'bg-red-700 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-500'}`}
        >
          <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          {query.trim() ? `Abrir ${title}` : `Ir para ${title}`}
        </a>
      </div>

      {isYouTube && (
        <p className="mt-3 text-[11px] text-slate-500">
          Para continuar a ouvir enquanto usa outras secções do APOLO, importe um ficheiro de áudio no separador Música. A reprodução interna do YouTube requer uma integração própria.
        </p>
      )}
    </section>
  );
};
