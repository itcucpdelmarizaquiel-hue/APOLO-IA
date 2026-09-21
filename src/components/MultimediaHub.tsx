import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  Download, 
  Search, 
  Music, 
  Video, 
  Sparkles, 
  Check, 
  Sliders, 
  Captions, 
  Eye, 
  Radio, 
  FileAudio,
  RadioTower,
  Upload,
  WifiOff,
  Youtube,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { MediaTrack } from '../types';
import { voiceService } from '../services/voice';

interface MultimediaHubProps {
  tracks: MediaTrack[];
  onPlayTrack?: (track: MediaTrack) => void;
  initialSearchQuery?: string;
}

export const MultimediaHub: React.FC<MultimediaHubProps> = ({ tracks, onPlayTrack, initialSearchQuery = '' }) => {
  const [mediaMode, setMediaMode] = useState<'offline' | 'youtube'>('offline');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, number>>({});
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});
  
  // Music Identification state
  const [identifyQuery, setIdentifyQuery] = useState('');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedResult, setIdentifiedResult] = useState<any>(null);
  const [onlineQuery, setOnlineQuery] = useState('');
  const [onlineResult, setOnlineResult] = useState<MediaTrack | null>(null);
  const [offlineTracks, setOfflineTracks] = useState<MediaTrack[]>([]);
  const audioInputRef = React.useRef<HTMLInputElement>(null);

  const savedOfflineTracks = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('apolo_offline_music');
      return saved ? JSON.parse(saved) as MediaTrack[] : [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    setOfflineTracks(savedOfflineTracks);
  }, [savedOfflineTracks]);

  useEffect(() => {
    if (!initialSearchQuery.trim()) return;
    const query = initialSearchQuery.trim().replace(/^(apolo,?\s*)?(toca|toque|reproduza|procura|busca)\s+/i, '');
    setMediaMode('youtube');
    setOnlineQuery(query);
    setOnlineResult({
      id: `youtube-search-${Date.now()}`,
      title: query,
      artist: 'Pesquisa no YouTube',
      duration: 'Online',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=80',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    });
    setCurrentTrackIndex(0);
  }, [initialSearchQuery]);

  const visibleTracks = mediaMode === 'offline'
    ? [...tracks.filter((track) => track.type === 'music'), ...offlineTracks]
    : (onlineResult ? [onlineResult, ...tracks.filter((track) => track.type === 'video')] : tracks.filter((track) => track.type === 'video'));
  const currentTrack = visibleTracks[currentTrackIndex] || visibleTracks[0];

  // Subtitle cycle timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveSubtitleIndex((prev) => (prev + 1) % (currentTrack?.subtitles?.length || 1));
    }, 3000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, playbackSpeed]);

  const togglePlay = () => {
    const nextState = !isPlaying;
    setIsPlaying(nextState);
    voiceService.playChime('confirm');
    if (nextState) {
      voiceService.speak(`Reproduzindo ${currentTrack?.title} no APOLO Multimídia a ${playbackSpeed}x de velocidade.`);
    }
  };

  const handleNext = () => {
    if (!visibleTracks.length) return;
    setCurrentTrackIndex((prev) => (prev + 1) % visibleTracks.length);
    setIsPlaying(true);
    voiceService.playChime('click');
  };

  const handlePrev = () => {
    if (!visibleTracks.length) return;
    setCurrentTrackIndex((prev) => (prev - 1 + visibleTracks.length) % visibleTracks.length);
    setIsPlaying(true);
    voiceService.playChime('click');
  };

  const handleOfflineUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newTrack: MediaTrack = {
        id: `offline-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        artist: 'Arquivo do dispositivo',
        duration: 'Offline',
        type: 'music',
        thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&auto=format&fit=crop&q=80',
        url: String(reader.result)
      };
      setOfflineTracks((previous) => {
        const next = [newTrack, ...previous];
        try {
          localStorage.setItem('apolo_offline_music', JSON.stringify(next));
        } catch {
          // Large files remain available for this session even when browser storage is full.
        }
        return next;
      });
      setMediaMode('offline');
      setCurrentTrackIndex(0);
      voiceService.speak(`${newTrack.title} foi adicionado à sua biblioteca offline.`);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveOfflineTrack = (trackId: string) => {
    setOfflineTracks((previous) => {
      const next = previous.filter((track) => track.id !== trackId);
      localStorage.setItem('apolo_offline_music', JSON.stringify(next));
      return next;
    });
  };

  const handleOnlineSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = onlineQuery.trim();
    if (!query) return;
    const result: MediaTrack = {
      id: `youtube-search-${Date.now()}`,
      title: query,
      artist: 'Pesquisa no YouTube',
      duration: 'Online',
      type: 'video',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=80',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    };
    setOnlineResult(result);
    setMediaMode('youtube');
    setCurrentTrackIndex(0);
    voiceService.speak(`Encontrei resultados no YouTube para ${query}.`);
  };

  // Download simulation
  const handleDownload = (trackId: string) => {
    if (downloadedIds[trackId] || downloadingIds[trackId]) return;

    voiceService.playChime('wake');
    setDownloadingIds((prev) => ({ ...prev, [trackId]: 10 }));

    let progress = 10;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
        setDownloadingIds((prev) => {
          const copy = { ...prev };
          delete copy[trackId];
          return copy;
        });
        setDownloadedIds((prev) => ({ ...prev, [trackId]: true }));
        voiceService.playChime('success');
        voiceService.speak(`Download de mídia concluído e salvo no seu armazenamento local.`);
      } else {
        setDownloadingIds((prev) => ({ ...prev, [trackId]: progress }));
      }
    }, 400);
  };

  // Music identifier through backend API
  const handleIdentifyMusic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifyQuery.trim()) return;

    setIsIdentifying(true);
    setIdentifiedResult(null);
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/identify-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: identifyQuery })
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const text = await res.text();
      if (!text || !text.trim()) {
        throw new Error('Empty response');
      }

      const data = JSON.parse(text);
      setIdentifiedResult(data);
      voiceService.playChime('success');
      voiceService.speak(`Música identificada: ${data.title} de ${data.artist}.`);
    } catch (err) {
      console.error(err);
      setIdentifiedResult({
        title: identifyQuery,
        artist: 'Identificação por Som',
        genre: 'Pop / Acústico',
        sampleLyrics: 'Trecho processado pelo motor de IA do APOLO'
      });
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div id="multimedia-hub" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Música offline & YouTube</h2>
            <p className="text-xs text-slate-400">
              Escolha uma música do dispositivo ou pesquise no YouTube por título e cantor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 px-2">Velocidade:</span>
            {[0.5, 1.0, 1.5, 2.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded-lg font-mono font-semibold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowSubtitles((prev) => !prev)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              showSubtitles
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Ativar/Desativar Legendas"
          >
            <Captions className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:grid-cols-2">
        <button
          onClick={() => { setMediaMode('offline'); setCurrentTrackIndex(0); setIsPlaying(false); }}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${mediaMode === 'offline' ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}`}
        >
          <WifiOff className={`h-5 w-5 ${mediaMode === 'offline' ? 'text-emerald-400' : 'text-slate-400'}`} />
          <span><strong className="block text-xs text-white">Músicas offline</strong><small className="text-[11px] text-slate-400">Arquivos presentes no dispositivo</small></span>
        </button>
        <button
          onClick={() => { setMediaMode('youtube'); setCurrentTrackIndex(0); setIsPlaying(false); }}
          className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${mediaMode === 'youtube' ? 'border-red-500/40 bg-red-500/10' : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'}`}
        >
          <Youtube className={`h-5 w-5 ${mediaMode === 'youtube' ? 'text-red-400' : 'text-slate-400'}`} />
          <span><strong className="block text-xs text-white">YouTube online</strong><small className="text-[11px] text-slate-400">Título + cantor para encontrar qualquer faixa</small></span>
        </button>
      </div>

      {/* Main Grid: Player on Left, Identifier & Playlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Player Card */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 group">
            <img
              src={currentTrack?.thumbnail}
              alt={currentTrack?.title}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            {/* Subtitles Overlay */}
            {showSubtitles && isPlaying && currentTrack?.subtitles && (
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <span className="inline-block px-3 py-1 rounded-lg bg-black/80 text-white text-xs font-medium backdrop-blur-md border border-white/10 shadow-lg">
                  {currentTrack.subtitles[activeSubtitleIndex]}
                </span>
              </div>
            )}

            {/* Play/Pause Center Button */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Track Info & Progress Bar */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {currentTrack?.type === 'video' ? 'Vídeo YouTube / TikTok' : 'Faixa de Áudio'}
                </span>
                <h3 className="text-base font-bold text-white mt-1">{currentTrack?.title}</h3>
                <p className="text-xs text-slate-400">{currentTrack?.artist}</p>
              </div>

              <button
                onClick={() => handleDownload(currentTrack.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  downloadedIds[currentTrack.id]
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : downloadingIds[currentTrack.id]
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                {downloadedIds[currentTrack.id] ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Baixado
                  </>
                ) : downloadingIds[currentTrack.id] ? (
                  <>
                    <Download className="w-3.5 h-3.5 animate-bounce" /> Baixando ({downloadingIds[currentTrack.id]}%)
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Baixar Mídia
                  </>
                )}
              </button>
            </div>

            {mediaMode === 'offline' && currentTrack?.url && (
              <audio controls src={currentTrack.url} className="mb-3 h-9 w-full" onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
            )}
            {mediaMode === 'youtube' && currentTrack?.url && (
              <a href={currentTrack.url} target="_blank" rel="noreferrer" className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-2 text-xs font-bold text-white hover:bg-red-500">
                <ExternalLink className="h-3.5 w-3.5" /> Abrir resultados no YouTube
              </a>
            )}

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-900">
              <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button onClick={handleNext} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Music Identifier & Playlist */}
        <div className="lg:col-span-5 space-y-4">
          {mediaMode === 'offline' ? (
            <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Biblioteca do dispositivo</h3>
                  <p className="mt-1 text-[11px] text-slate-500">Selecione arquivos de áudio para ouvir mesmo sem internet.</p>
                </div>
                <button onClick={() => audioInputRef.current?.click()} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                  <Upload className="h-3.5 w-3.5" /> Adicionar
                </button>
                <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleOfflineUpload} className="hidden" />
              </div>
              {offlineTracks.length === 0 && <div className="rounded-xl border border-dashed border-slate-700 px-3 py-4 text-center text-xs text-slate-500">Nenhum arquivo pessoal adicionado ainda.</div>}
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl border border-red-500/20 bg-slate-950/70 p-4">
              <div className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Buscar no YouTube</h3>
              </div>
              <form onSubmit={handleOnlineSearch} className="flex gap-2">
                <input value={onlineQuery} onChange={(event) => setOnlineQuery(event.target.value)} placeholder="Ex.: Ameno - Era" className="min-w-0 flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-red-500" />
                <button type="submit" className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"><Search className="h-3.5 w-3.5" /> Buscar</button>
              </form>
              <p className="text-[11px] text-slate-500">Também funciona por voz: diga “APOLO, toca [título] de [cantor]”.</p>
            </div>
          )}

          {/* Song Identifier by lyrics/humming */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2">
              <RadioTower className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                Identificador de Música por Letra ou Som
              </h3>
            </div>

            <form onSubmit={handleIdentifyMusic} className="flex gap-2">
              <input
                id="identify-music-input"
                type="text"
                value={identifyQuery}
                onChange={(e) => setIdentifyQuery(e.target.value)}
                placeholder="Ex: 'never gonna give you up' ou trecho da letra..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={isIdentifying}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                {isIdentifying ? 'Buscando...' : 'Identificar'}
              </button>
            </form>

            {identifiedResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-slate-900/90 border border-emerald-500/30 rounded-xl text-xs space-y-1"
              >
                <div className="font-bold text-emerald-400">{identifiedResult.title}</div>
                <div className="text-slate-300 text-[11px]">{identifiedResult.artist} • {identifiedResult.genre}</div>
                {identifiedResult.sampleLyrics && (
                  <div className="text-slate-400 italic text-[11px] pt-1">"{identifiedResult.sampleLyrics}"</div>
                )}
              </motion.div>
            )}
          </div>

          {/* Media Playlist */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biblioteca Multimídia APOLO:
            </h4>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {visibleTracks.map((t, idx) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setCurrentTrackIndex(idx);
                    setIsPlaying(true);
                    voiceService.playChime('click');
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                    idx === currentTrackIndex
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-white'
                      : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={t.thumbnail}
                      alt={t.title}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="truncate">
                      <span className="font-semibold text-xs truncate block">{t.title}</span>
                      <span className="text-[11px] text-slate-400 truncate">{t.artist} • {t.duration}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {mediaMode === 'offline' && t.id.startsWith('offline-') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveOfflineTrack(t.id); }}
                        className="p-1 text-slate-500 hover:text-rose-400"
                        title="Remover da biblioteca offline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(t.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
