import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, Volume2, Sparkles, Shield, Radio, PlayCircle, RefreshCw, Send, Palette, User } from 'lucide-react';
import { ApoloPersona } from '../types';
import { apoloAvatar } from '../assets';

interface ApoloVoiceAvatarProps {
  persona: ApoloPersona;
  assistantName?: string;
  customAvatarUrl?: string;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListen: () => void;
  statusText?: string;
  transcript?: string;
  lastSpeechResponse?: string;
  onReplaySpeech?: () => void;
  onQuickCommand?: (cmd: string) => void;
  isProcessing?: boolean;
  onNavigateToCustomizer?: () => void;
}

export const ApoloVoiceAvatar: React.FC<ApoloVoiceAvatarProps> = ({
  persona,
  assistantName = 'APOLO',
  customAvatarUrl,
  isListening,
  isSpeaking,
  onToggleListen,
  statusText = 'Pronto para ouvir',
  transcript = '',
  lastSpeechResponse = '',
  onReplaySpeech,
  onQuickCommand,
  isProcessing = false,
  onNavigateToCustomizer
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const QUICK_COMMAND_EXAMPLES = [
    { label: `🎙️ Olá ${assistantName}, quem é você?`, cmd: `Olá ${assistantName}, quem é você e como pode me ajudar?` },
    { label: '💡 Como funciona a fotossíntese?', cmd: 'Como funciona a fotossíntese? Me explique com clareza.' },
    { label: '🧮 Quanto é 45 * 12?', cmd: 'Quanto é 45 * 12?' },
    { label: '📚 Quem foi Albert Einstein?', cmd: 'Quem foi Albert Einstein e qual sua principal teoria?' },
    { label: '🕒 Que horas são?', cmd: 'Que horas são?' },
    { label: '📱 Abre o YouTube', cmd: 'Abre o YouTube' },
    { label: '✉️ Manda mensagem para Mariana', cmd: 'Manda uma mensagem para a Mariana Silva dizendo que chego às 9' },
    { label: '⏰ Alarme às 07:00', cmd: 'Cria um alarme para as 07:00' },
    { label: '📝 Lembrar de comprar café', cmd: 'Lembra-me de comprar café amanhã às 8h' },
    { label: '🔒 Bloquear WhatsApp', cmd: 'Bloqueia o aplicativo WhatsApp' },
    { label: '🎨 Criar avatar no Estúdio', cmd: 'Abre o estúdio de imagens para gerar um avatar' },
    { label: '😂 Me conte uma piada', cmd: 'Me conte uma piada engraçada' },
    { label: '📍 Onde está meu celular?', cmd: 'Onde está meu celular? Tocar alarme' },
  ];

  // Audio wave animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      step += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw dynamic audio frequency bars
      const bars = 40;
      const barWidth = width / bars;

      for (let i = 0; i < bars; i++) {
        let amplitude = 4;
        if (isSpeaking) {
          amplitude = Math.sin(step * 3.5 + i * 0.35) * 20 + Math.cos(step * 2.2 + i * 0.25) * 12;
        } else if (isListening) {
          amplitude = Math.sin(step * 4.5 + i * 0.45) * 16 + Math.random() * 10;
        } else if (isProcessing) {
          amplitude = Math.sin(step * 6 + i * 0.5) * 10;
        } else {
          amplitude = Math.sin(step + i * 0.2) * 5;
        }

        const barHeight = Math.max(3, Math.abs(amplitude));
        const x = i * barWidth;
        const y = centerY - barHeight / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isSpeaking) {
          gradient.addColorStop(0, '#38bdf8');
          gradient.addColorStop(1, '#818cf8');
        } else if (isListening) {
          gradient.addColorStop(0, '#f43f5e');
          gradient.addColorStop(1, '#fb7185');
        } else if (isProcessing) {
          gradient.addColorStop(0, '#a855f7');
          gradient.addColorStop(1, '#ec4899');
        } else {
          gradient.addColorStop(0, '#475569');
          gradient.addColorStop(1, '#334155');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 2, y, barWidth - 4, barHeight, 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, isProcessing]);

  const activeAvatarSrc = customAvatarUrl || persona.avatarImage || apoloAvatar;

  return (
    <div id="apolo-voice-avatar-card" className="relative flex flex-col items-center justify-center p-5 sm:p-6 bg-gradient-to-b from-slate-900/95 via-slate-900/70 to-slate-950/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Background glow orb */}
      <div 
        className={`absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700 ${
          isSpeaking 
            ? 'bg-cyan-400 opacity-60 scale-125' 
            : isListening 
            ? 'bg-rose-500 opacity-70 scale-125' 
            : isProcessing
            ? 'bg-purple-500 opacity-60 scale-110'
            : 'bg-indigo-500 opacity-30'
        }`}
      />

      {/* Top OS & Status Badges */}
      <div className="w-full flex items-center justify-between mb-3 z-10 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold tracking-wide">{assistantName} OS v3.8</span>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToCustomizer && (
            <button
              type="button"
              onClick={onNavigateToCustomizer}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/80 text-slate-300 hover:text-white border border-slate-700/60 text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Trocar Avatar ou Voz"
            >
              <Palette className="w-3 h-3 text-indigo-400" />
              <span>Trocar Avatar / Nome</span>
            </button>
          )}

          {isProcessing ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium animate-pulse shadow-sm">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processando...
            </span>
          ) : isSpeaking ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium animate-pulse shadow-sm">
              <Volume2 className="w-3.5 h-3.5" /> {assistantName} Falando
            </span>
          ) : isListening ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium animate-pulse shadow-sm">
              <Radio className="w-3.5 h-3.5 animate-spin" /> Microfone Ativo (Ouvindo...)
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Standby / Pronto
            </span>
          )}
        </div>
      </div>

      {/* Holographic Avatar Core with Character Image */}
      <div className="relative my-2 z-10 flex items-center justify-center">
        {/* Pulsing Concentric Outer Rings */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.25, 1] : isListening ? [1, 1.35, 1] : isProcessing ? [1, 1.15, 1] : [1, 1.05, 1],
            opacity: isSpeaking ? [0.4, 0.8, 0.4] : isListening ? [0.6, 1, 0.6] : [0.2, 0.4, 0.2]
          }}
          transition={{ repeat: Infinity, duration: isListening ? 1.2 : 2.5, ease: "easeInOut" }}
          className={`absolute w-52 h-52 sm:w-56 sm:h-56 rounded-full border border-dashed pointer-events-none ${
            isSpeaking ? 'border-cyan-400/60' : isListening ? 'border-rose-400/80' : isProcessing ? 'border-purple-400/60' : 'border-indigo-500/30'
          }`}
        />
        <motion.div
          animate={{
            rotate: 360
          }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className={`absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-dotted pointer-events-none ${
            isSpeaking ? 'border-indigo-400/70' : isListening ? 'border-rose-500/60' : 'border-slate-700'
          }`}
        />

        {/* Central Avatar Visual & Click-to-Speak Trigger */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleListen}
          className="relative cursor-pointer group"
          title={`Clique para falar com ${assistantName} por voz`}
        >
          {/* Avatar Image Frame */}
          <div
            className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 shadow-2xl transition-all duration-300 relative ${
              isListening
                ? 'border-rose-500 ring-4 ring-rose-400/50 shadow-rose-500/60'
                : isSpeaking
                ? 'border-cyan-400 ring-4 ring-cyan-400/50 shadow-cyan-500/50'
                : isProcessing
                ? 'border-purple-500 ring-4 ring-purple-400/40 shadow-purple-500/40'
                : 'border-indigo-500/80 ring-4 ring-indigo-500/20 shadow-indigo-600/40 group-hover:border-indigo-400'
            }`}
          >
            <img
              src={activeAvatarSrc}
              alt={`${assistantName} Avatar`}
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Speaking/Listening Overlay indicator */}
            <div
              className={`absolute inset-0 transition-opacity duration-300 flex items-end justify-center pb-2.5 ${
                isListening
                  ? 'bg-rose-950/40 opacity-100'
                  : isSpeaking
                  ? 'bg-cyan-950/30 opacity-100'
                  : isProcessing
                  ? 'bg-purple-950/40 opacity-100'
                  : 'bg-black/10 group-hover:bg-black/40'
              }`}
            >
              <div
                className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : isSpeaking
                    ? 'bg-cyan-600 text-white'
                    : isProcessing
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-slate-900/90 text-indigo-200 border border-indigo-500/40 group-hover:bg-indigo-600 group-hover:text-white'
                }`}
              >
                {isListening ? (
                  <>
                    <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-bounce" /> Ouvindo... (Clique p/ Enviar)
                  </>
                ) : isSpeaking ? (
                  <>
                    <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" /> Falando...
                  </>
                ) : isProcessing ? (
                  <>
                    <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Mic className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 group-hover:text-white" /> Falar com {assistantName}
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Waveform Canvas */}
      <div className="w-full max-w-sm h-10 my-1.5 z-10">
        <canvas ref={canvasRef} width={340} height={40} className="w-full h-full" />
      </div>

      {/* Persona Info & Spoken Speech Response Balloon */}
      <div className="w-full text-center z-10 space-y-2 mt-1 max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-1.5 text-xs text-indigo-300 font-semibold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {assistantName} • {persona.name}
        </div>

        {/* Live Assistant Spoken Response Balloon */}
        {lastSpeechResponse ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 bg-slate-950/90 border border-cyan-500/30 rounded-2xl text-xs sm:text-sm text-slate-100 text-left shadow-lg relative group"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-cyan-400" /> Resposta Vocal de {assistantName}:
              </span>
              {onReplaySpeech && (
                <button
                  onClick={onReplaySpeech}
                  className="px-2 py-0.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Ouvir resposta novamente"
                >
                  <PlayCircle className="w-3 h-3" /> Ouvir Novamente
                </button>
              )}
            </div>
            <p className="leading-relaxed font-medium">
              "{lastSpeechResponse}"
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-slate-400">
            {statusText}
          </p>
        )}

        {/* Live Voice Input Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2.5 bg-slate-950/80 border border-rose-500/30 rounded-xl text-xs text-rose-200 font-mono text-left shadow-inner"
          >
            <span className="text-[10px] uppercase tracking-wider text-rose-400 font-semibold block mb-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3 animate-spin" /> Voz Capturada:
            </span>
            "{transcript}"
          </motion.div>
        )}

        {/* Quick Command Suggestions Chips */}
        {onQuickCommand && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2 px-1">
              <span className="font-semibold uppercase tracking-wider text-indigo-400">Comandos Rápidos (Voz ou Toque):</span>
              <span className="text-slate-500 text-[10px]">Clique para executar</span>
            </div>
            <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto pr-1">
              {QUICK_COMMAND_EXAMPLES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickCommand(item.cmd)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-indigo-600/80 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-400/60 text-[11px] font-medium transition-all flex items-center gap-1 shadow-sm cursor-pointer active:scale-95"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
