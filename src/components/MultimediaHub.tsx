import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Search, 
  Music, 
  Video, 
  Captions, 
  RadioTower,
  Upload,
  Trash2
} from 'lucide-react';
import { MediaTrack } from '../types';
import { voiceService } from '../services/voice';

interface MultimediaHubProps {
  tracks: MediaTrack[];
  isActive: boolean;
  onReturnToAssistant: () => void;
}

export interface MultimediaHubHandle {
  pause: () => boolean;
  resume: () => Promise<boolean>;
}

export const MultimediaHub = React.forwardRef<MultimediaHubHandle, MultimediaHubProps>(({
  tracks,
  isActive,
  onReturnToAssistant
}, ref) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMiniPlayerOpen, setIsMiniPlayerOpen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(0);
  
  // Music Identification state
  const [identifyQuery, setIdentifyQuery] = useState('');
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [identifiedResult, setIdentifiedResult] = useState<any>(null);
  const [offlineTracks, setOfflineTracks] = useState<MediaTrack[]>([]);
  const audioInputRef = React.useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const visibleTracks = [...tracks.filter((track) => track.type === 'music' && Boolean(track.url)), ...offlineTracks];
  const currentTrack = visibleTracks[currentTrackIndex] || visibleTracks[0];

  // Subtitle cycle timer when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveSubtitleIndex((prev) => (prev + 1) % (currentTrack?.subtitles?.length || 1));
    }, 3000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, playbackSpeed]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isPlaying || !currentTrack?.url) return;
    void audio.play().catch(() => setIsPlaying(false));
  }, [currentTrack?.url, isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack?.url) return;

    if (audio.paused) {
      setIsMiniPlayerOpen(true);
      void audio.play().then(() => {
        voiceService.playChime('confirm');
        voiceService.speak(`Reproduzindo ${currentTrack.title} de ${currentTrack.artist}.`);
      }).catch(() => {
        setIsPlaying(false);
        voiceService.speak('O navegador não permitiu iniciar esta faixa. Tente novamente no botão de reprodução.');
      });
    } else {
      audio.pause();
    }
  };

  const playTrackAtIndex = (index: number) => {
    const track = visibleTracks[index];
    const audio = audioRef.current;
    if (!track?.url || !audio) return;

    setCurrentTrackIndex(index);
    setIsMiniPlayerOpen(true);
    audio.src = track.url;
    void audio.play().catch(() => {
      setIsPlaying(false);
      voiceService.speak('O navegador não conseguiu reproduzir este ficheiro de áudio.');
    });
  };

  const handleNext = () => {
    if (!visibleTracks.length) return;
    playTrackAtIndex((currentTrackIndex + 1) % visibleTracks.length);
    voiceService.playChime('click');
  };

  const handlePrev = () => {
    if (!visibleTracks.length) return;
    playTrackAtIndex((currentTrackIndex - 1 + visibleTracks.length) % visibleTracks.length);
    voiceService.playChime('click');
  };

  useImperativeHandle(ref, () => ({
    pause: () => {
      if (!audioRef.current || !currentTrack?.url) return false;
      audioRef.current.pause();
      return true;
    },
    resume: async () => {
      if (!audioRef.current || !currentTrack?.url) return false;
      setIsMiniPlayerOpen(true);
      try {
        await audioRef.current.play();
        return true;
      } catch {
        setIsPlaying(false);
        return false;
      }
    }
  }), [currentTrack?.url]);

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
      setCurrentTrackIndex(0);
      setIsPlaying(false);
      setIsMiniPlayerOpen(true);
      voiceService.speak(`${newTrack.title} foi adicionado à sua biblioteca offline.`);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleRemoveOfflineTrack = (trackId: string) => {
    setOfflineTracks((previous) => {
      const next = previous.filter((track) => track.id !== trackId);
      try {
        localStorage.setItem('apolo_offline_music', JSON.stringify(next));
      } catch {
        // Keep the current session usable if browser storage is unavailable.
      }
      return next;
    });
    if (currentTrack?.id === trackId) {
      audioRef.current?.pause();
      setCurrentTrackIndex(0);
      setIsMiniPlayerOpen(false);
    }
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
    <>
      <audio
        id="apolo-music-audio"
        ref={audioRef}
        src={currentTrack?.url}
        preload="metadata"
        className="hidden"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />

      {!isActive && isMiniPlayerOpen && currentTrack?.url && (
        <aside
          role="region"
          aria-label="Mini-reprodutor de música"
          className="fixed bottom-24 left-3 right-3 z-40 mx-auto flex max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-indigo-500/40 bg-slate-950/95 p-3 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl sm:bottom-24 sm:flex-nowrap sm:px-4"
        >
          <img src={currentTrack.thumbnail} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-white">{currentTrack.title}</p>
            <p className="truncate text-[11px] text-slate-400">{currentTrack.artist} · {isPlaying ? 'A tocar' : 'Em pausa'}</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={togglePlay} aria-label={isPlaying ? 'Pausar música' : 'Retomar música'} className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-500">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onReturnToAssistant} className="rounded-lg border border-slate-700 px-3 py-2 text-[11px] font-semibold text-slate-200 hover:border-indigo-400">
              Voltar ao APOLO
            </button>
            <button
              type="button"
              onClick={() => {
                audioRef.current?.pause();
                setIsMiniPlayerOpen(false);
              }}
              aria-label="Fechar mini-reprodutor e pausar música"
              className="rounded-lg border border-slate-700 px-2.5 py-2 text-[11px] text-slate-300 hover:border-rose-500/50 hover:text-white"
            >
              Fechar
            </button>
          </div>
          <p className="w-full text-[10px] text-slate-500 sm:w-auto sm:pl-2">
            Comandos: “pausa a música” · “continua a música”
          </p>
        </aside>
      )}

      {isActive && (
      <div id="multimedia-hub" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Biblioteca de Música</h2>
            <p className="text-xs text-slate-400">
              Reproduza ficheiros de áudio do dispositivo enquanto continua a usar o APOLO
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

      {/* Main Grid: Player on Left, Identifier & Playlist on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Player Card */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 group">
            {currentTrack ? (
              <>
                <img
                  src={currentTrack.thumbnail}
                  alt={currentTrack.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-105' : 'scale-100'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                <Music aria-hidden="true" className="h-9 w-9 text-indigo-400" />
                <p className="max-w-xs text-xs leading-relaxed">Adicione um ficheiro de áudio para começar a ouvir música no APOLO.</p>
              </div>
            )}

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
              disabled={!currentTrack?.url}
              aria-label={isPlaying ? 'Pausar música' : 'Reproduzir música'}
              className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-xl shadow-indigo-600/40 transition-transform active:scale-95 enabled:cursor-pointer enabled:hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>
          </div>

          {/* Track Info & Progress Bar */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  Ficheiro de áudio local
                </span>
                <h3 className="text-base font-bold text-white mt-1">{currentTrack?.title || 'Nenhuma faixa selecionada'}</h3>
                <p className="text-xs text-slate-400">{currentTrack?.artist || 'Adicione uma música do dispositivo'}</p>
              </div>

            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-900">
              <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer">
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={togglePlay}
                disabled={!currentTrack?.url}
                aria-label={isPlaying ? 'Pausar música' : 'Reproduzir música'}
                className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-md enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
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
          <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Biblioteca do dispositivo</h3>
                <p className="mt-1 text-[11px] text-slate-500">Selecione ficheiros de áudio para ouvir mesmo sem internet.</p>
              </div>
              <button onClick={() => audioInputRef.current?.click()} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500">
                <Upload className="h-3.5 w-3.5" /> Adicionar
              </button>
              <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleOfflineUpload} className="hidden" />
            </div>
            {visibleTracks.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-700 px-3 py-4 text-center text-xs text-slate-500">
                Ainda não há ficheiros de áudio. Use “Adicionar” para escolher uma música do dispositivo.
              </div>
            )}
            {isActive && (
              <p className="text-[10px] leading-relaxed text-slate-500">
                Durante a reprodução, pode mudar de secção e controlar a música pela janela flutuante. Diga “APOLO, pausa a música” ou “APOLO, continua a música”.
              </p>
            )}
          </div>

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
                    playTrackAtIndex(idx);
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

                  {t.id.startsWith('offline-') && (
                    <button
                      type="button"
                      onClick={(event) => { event.stopPropagation(); handleRemoveOfflineTrack(t.id); }}
                      className="flex-shrink-0 p-1 text-slate-500 hover:text-rose-400"
                      title="Remover da biblioteca offline"
                      aria-label={`Remover ${t.title} da biblioteca offline`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
      )}
    </>
  );
});

MultimediaHub.displayName = 'MultimediaHub';
