import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Sparkles, 
  Activity, 
  Crosshair, 
  Trophy, 
  Zap, 
  Flame, 
  Shield, 
  Terminal,
  Volume2,
  Radio,
  Eye,
  Power
} from 'lucide-react';
import { voiceService } from '../services/voice';
import { apoloAvatar } from '../assets';

interface GamerCoachModuleProps {
  isLiveMode?: boolean;
  apoloIsCalled?: boolean;
  onLiveModeChange?: (active: boolean) => void;
}

const REAL_TIME_TIPS: Record<string, string[]> = {
  fps: [
    'Mantenha a mira na altura da cabeça antes de virar cada ângulo.',
    'Pare de correr antes do primeiro disparo para recuperar precisão.',
    'Use cobertura e faça uma pausa curta antes de repetir o peek.',
    'Depois de uma eliminação, mude de posição para não ficar previsível.'
  ],
  moba: [
    'Olhe o minimapa antes de avançar e conte os inimigos desaparecidos.',
    'Priorize a próxima onda e só lute quando tiver vantagem de recursos.',
    'Guarde a habilidade de fuga até confirmar onde está o jungler.',
    'Converta uma eliminação em objetivo: torre, dragão ou visão.'
  ],
  battle: [
    'Mantenha cobertura entre você e a próxima zona segura.',
    'Evite trocar tiro sem necessidade; posição e informação valem mais.',
    'Recarregue e cure antes de entrar no próximo confronto.',
    'Depois de atirar, reposicione-se para não revelar seu padrão.'
  ],
  football: [
    'Abra linhas de passe antes de acelerar a jogada.',
    'Defenda controlando o espaço e não apenas perseguindo a bola.',
    'Varie o ritmo para tirar o adversário da posição.',
    'Após perder a bola, pressione por poucos segundos e recomponha.'
  ],
  generic: [
    'Observe o padrão do adversário antes de repetir a mesma jogada.',
    'Priorize informação, posicionamento e decisões simples.',
    'Faça uma pausa curta entre ações para não jogar no automático.',
    'Transforme cada erro em uma regra prática para a próxima tentativa.'
  ]
};

const getTipGroup = (game: string) => {
  const value = game.toLowerCase();
  if (/valorant|counter|cs|call of duty|apex|overwatch|rainbow|fps/.test(value)) return 'fps';
  if (/league|lol|dota|moba|mobile legends|wild rift/.test(value)) return 'moba';
  if (/free fire|pubg|fortnite|warzone|battle royale/.test(value)) return 'battle';
  if (/fifa|fc 2|efootball|football|futebol/.test(value)) return 'football';
  return 'generic';
};

export const GamerCoachModule: React.FC<GamerCoachModuleProps> = ({
  isLiveMode = false,
  apoloIsCalled = false,
  onLiveModeChange
}) => {
  const [selectedGame, setSelectedGame] = useState('Counter-Strike 2 / Valorant');
  const [gameSituation, setGameSituation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveTipIndex, setLiveTipIndex] = useState(0);
  const previousCallState = useRef(false);
  const [coachAdvice, setCoachAdvice] = useState<any>({
    game: 'Counter-Strike 2 / Valorant',
    advice: 'Posicione a mira sempre na altura da cabeça (crosshair placement) e utilize granadas de fumaça antes de avançar no bombsite.',
    keyTips: [
      'Controle o recuo nos primeiros 5 disparos',
      'Comunique a rotação do time adversário imediatamente',
      'Guarde a ultimate para rounds decisivos'
    ],
    strategy: 'Controle tático de meio de mapa com suporte de utilitários e rotação defensiva rápida.',
    targetFps: '240 FPS Estável',
    metaTier: 'S-Tier'
  });

  const handleCoachAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame.trim()) return;

    setIsAnalyzing(true);
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/game-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: selectedGame,
          currentSituation: gameSituation || 'Dicas de alta performance para vencer a partida'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const text = await res.text();
      if (!text || !text.trim()) {
        throw new Error('Empty response');
      }

      const data = JSON.parse(text);
      setCoachAdvice(data);
      voiceService.playChime('success');
      voiceService.speak(`Conselho Gamer APOLO: ${data.advice}`);
    } catch (err) {
      console.warn('Game coach fallback:', err);
      const fallbackAdvice = {
        game: selectedGame,
        advice: 'Mantenha a mira na altura da cabeça, controle os utilitários e comunique o avanço adversário.',
        keyTips: ['Ajuste a mira', 'Economize utilitários para o momento crucial', 'Mantenha boa comunicação'],
        strategy: 'Controle de mapa e rotação ágil.',
        targetFps: '144+ FPS Estável',
        metaTier: 'S-Tier'
      };
      setCoachAdvice(fallbackAdvice);
      voiceService.playChime('success');
      voiceService.speak(`Conselho Gamer APOLO: ${fallbackAdvice.advice}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSpeakAdvice = () => {
    if (!coachAdvice?.advice) return;
    voiceService.playChime('confirm');
    voiceService.speak(`Estratégia do Treinador APOLO para ${coachAdvice.game}: ${coachAdvice.advice}`);
  };

  const liveTips = REAL_TIME_TIPS[getTipGroup(selectedGame)];
  const liveTip = liveTips[liveTipIndex % liveTips.length];

  useEffect(() => {
    if (!isLiveMode) {
      setLiveTipIndex(0);
      previousCallState.current = false;
      return;
    }

    const timer = window.setInterval(() => {
      setLiveTipIndex((previous) => (previous + 1) % liveTips.length);
    }, 10000);

    return () => window.clearInterval(timer);
  }, [isLiveMode, selectedGame, liveTips.length]);

  useEffect(() => {
    if (isLiveMode && apoloIsCalled && !previousCallState.current) {
      voiceService.playChime('wake');
      voiceService.speak(`APOLO Gamer ativo. Dica rápida: ${liveTip}`);
    }
    previousCallState.current = apoloIsCalled;
  }, [apoloIsCalled, isLiveMode, liveTip]);

  const handleSpeakLiveTip = () => {
    voiceService.playChime('confirm');
    voiceService.speak(`Dica em tempo real para ${selectedGame}: ${liveTip}`);
  };

  return (
    <div id="gamer-coach-module" className="relative overflow-hidden bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {isLiveMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none overflow-hidden"
          aria-hidden="true"
        >
          <img
            src={apoloAvatar}
            alt=""
            className="absolute right-[-8%] top-1/2 h-[125%] w-auto -translate-y-1/2 object-cover opacity-[0.08] grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/10 via-violet-950/10 to-violet-950/40" />
        </motion.div>
      )}

      <div className="relative z-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Modo Assistente Gamer & Coach Tático</h2>
            <p className="text-xs text-slate-400">
              Análise de gameplay, estratégias por voz, FPS tracker e dicas em tempo real
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onLiveModeChange?.(!isLiveMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
              isLiveMode
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                : 'bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border-violet-500/30'
            }`}
            aria-pressed={isLiveMode}
          >
            {isLiveMode ? <Radio className="w-4 h-4 animate-pulse" /> : <Power className="w-4 h-4" />}
            {isLiveMode ? 'Sessão ao vivo ativa' : 'Ativar coach ao vivo'}
          </button>
          <button
            onClick={handleSpeakAdvice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/30 text-xs font-semibold transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Ouvir Dica
          </button>
        </div>
      </div>

      {isLiveMode && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border p-4 ${
            apoloIsCalled
              ? 'border-cyan-400/60 bg-cyan-500/15 shadow-lg shadow-cyan-950/30'
              : 'border-emerald-500/30 bg-emerald-500/10'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="relative shrink-0">
              <img src={apoloAvatar} alt="APOLO" className="h-12 w-12 rounded-full border-2 border-cyan-400/60 object-cover" />
              <span className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-slate-950 ${apoloIsCalled ? 'bg-cyan-300 animate-ping' : 'bg-emerald-400'}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                  <Eye className="h-3.5 w-3.5" /> APOLO Gamer ao vivo
                </span>
                <span className="text-[10px] font-mono text-slate-400">{apoloIsCalled ? 'CHAMADA DETECTADA' : 'MONITORANDO'}</span>
              </div>
              <p className="mt-1 text-xs font-medium leading-relaxed text-white">{liveTip}</p>
              <p className="mt-2 text-[10px] text-slate-400">Dicas rotativas por jogo. A página não lê a tela do jogo sem uma captura autorizada.</p>
            </div>
            <button onClick={handleSpeakLiveTip} className="rounded-lg p-2 text-cyan-300 hover:bg-cyan-400/15" title="Ouvir dica atual">
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input & Presets */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleCoachAnalyze} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Selecione ou digite o Jogo:
              </label>
              <input
                id="gamer-game-input"
                type="text"
                value={selectedGame}
                onChange={(e) => setSelectedGame(e.target.value)}
                placeholder="Ex: Valorant, Free Fire, FIFA / FC 26, League of Legends..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Situação Atual / Dúvida Tática:
              </label>
              <textarea
                id="gamer-situation-input"
                rows={3}
                value={gameSituation}
                onChange={(e) => setGameSituation(e.target.value)}
                placeholder="Ex: Estou a perder no lado atacante / Preciso de uma estratégia para virar o jogo..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-violet-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isAnalyzing ? 'Analisando Gameplay...' : 'Gerar Conselho Tático IA'}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2">
            {['Free Fire', 'FC 26 (FIFA)', 'League of Legends', 'Call of Duty Warzone', 'PUBG Mobile'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setSelectedGame(preset);
                  voiceService.playChime('click');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-violet-500 hover:text-white transition-colors cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Tactical Advice Board */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Relatório do Treinador • {coachAdvice?.game}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                {coachAdvice?.metaTier || 'S-Tier Strategy'}
              </span>
            </div>

            {/* Principal Advice */}
            <div className="p-4 rounded-xl bg-violet-600/10 border border-violet-500/30 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 block">
                Conselho Tático Principal:
              </span>
              <p className="text-xs text-white leading-relaxed font-medium">
                "{coachAdvice?.advice}"
              </p>
            </div>

            {/* Key Tips */}
            {coachAdvice?.keyTips && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Recomendações Práticas:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {coachAdvice.keyTips.map((tip: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 flex items-start gap-2">
                      <Crosshair className="w-3.5 h-3.5 text-violet-400 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strategy */}
            {coachAdvice?.strategy && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <strong className="text-slate-200 block mb-1">Visão de Jogo & Rotação:</strong>
                {coachAdvice.strategy}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-900">
            <span className="flex items-center gap-1 text-emerald-400 font-mono">
              <Activity className="w-3.5 h-3.5" /> Latência Otimizada
            </span>
            <span className="font-mono text-slate-400">
              Desempenho: {coachAdvice?.targetFps || '144 FPS'}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
