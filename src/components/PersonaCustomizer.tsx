import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Sparkles, 
  Volume2, 
  Check, 
  Sliders, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Play, 
  RotateCcw, 
  UserCheck, 
  Radio, 
  Mic, 
  Shield, 
  Palette,
  Trash2,
  CheckCircle2,
  HelpCircle,
  Film,
  Zap,
  BookOpen,
  Heart
} from 'lucide-react';
import { ApoloPersona } from '../types';
import { INITIAL_PERSONAS, PRESET_AVATARS } from '../data/initialData';
import { voiceService } from '../services/voice';
import { apoloAvatar } from '../assets';

interface PersonaCustomizerProps {
  currentPersona: ApoloPersona;
  assistantName: string;
  customAvatarUrl: string;
  onSelectPersona: (persona: ApoloPersona) => void;
  onUpdateVoiceSettings: (pitch: number, rate: number) => void;
  onUpdateAssistantName: (name: string) => void;
  onUpdateCustomAvatar: (avatarUrl: string) => void;
  onNavigateToImageStudio?: () => void;
}

export const PersonaCustomizer: React.FC<PersonaCustomizerProps> = ({
  currentPersona,
  assistantName,
  customAvatarUrl,
  onSelectPersona,
  onUpdateVoiceSettings,
  onUpdateAssistantName,
  onUpdateCustomAvatar,
  onNavigateToImageStudio
}) => {
  const [activeTab, setActiveTab] = useState<'voices' | 'avatar_name' | 'browser_voices'>('voices');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingName, setEditingName] = useState<string>(assistantName || 'APOLO');
  const [nameSavedSuccess, setNameSavedSuccess] = useState<boolean>(false);
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [testCustomText, setTestCustomText] = useState<string>('');
  const [isPlayingSampleId, setIsPlayingSampleId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Available system voices
  const availableVoices = typeof window !== 'undefined' ? voiceService.getAvailableVoices() : [];

  const handleSaveName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onUpdateAssistantName(trimmed);
    setNameSavedSuccess(true);
    setTimeout(() => setNameSavedSuccess(false), 2500);

    voiceService.playChime('confirm');
    voiceService.speak(`Nome atualizado com sucesso! Agora você pode me chamar de ${trimmed}.`, {
      pitch: currentPersona.pitch,
      rate: currentPersona.rate,
      gender: currentPersona.gender
    });
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecione um arquivo de imagem válido (PNG, JPG, WebP ou GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onUpdateCustomAvatar(result);
        setAvatarUploadSuccess(true);
        setTimeout(() => setAvatarUploadSuccess(false), 3000);
        voiceService.playChime('success');
        voiceService.speak(`Novo avatar personalizado carregado com sucesso para ${assistantName || 'o assistente'}!`, {
          pitch: currentPersona.pitch,
          rate: currentPersona.rate,
          gender: currentPersona.gender
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleTestVoicePersona = (p: ApoloPersona, customPhrase?: string) => {
    setIsPlayingSampleId(p.id);
    voiceService.playChime('confirm');
    const phraseToSpeak = customPhrase || p.samplePhrase || p.soundGreeting || `Olá! Eu sou ${assistantName || p.name}. Como posso te ajudar hoje?`;
    
    voiceService.speak(phraseToSpeak, {
      pitch: p.pitch,
      rate: p.rate,
      gender: p.gender,
      voiceName: p.voiceName,
      onEnd: () => setIsPlayingSampleId(null),
      onError: () => setIsPlayingSampleId(null)
    });
  };

  const activeAvatarImage = customAvatarUrl || currentPersona.avatarImage || apoloAvatar;

  const filteredPersonas = categoryFilter === 'all' 
    ? INITIAL_PERSONAS 
    : INITIAL_PERSONAS.filter(p => p.category === categoryFilter);

  const NAME_SUGGESTIONS = ['APOLO', 'ADAM', 'JARVIS', 'ATHENA', 'CYBORG', 'LUNA', 'NEXUS', 'ORION', 'VORTEX', 'ZEUS'];

  return (
    <div id="persona-customizer-module" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-purple-600/20 border border-indigo-500/40 text-indigo-300 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Estúdio de Identidade, Voz & Avatar
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                Talkie IA Engine v3.8
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Personalize o nome, importe sua própria foto/avatar e escolha entre as novas vozes humanas e narrativas
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('voices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'voices'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" /> Galeria de Vozes ({INITIAL_PERSONAS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('avatar_name')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'avatar_name'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Avatar & Nome
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('browser_voices')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'browser_voices'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Calibragem Fina
          </button>
        </div>
      </div>

      {/* TAB 1: GALERIA DE VOZES */}
      {activeTab === 'voices' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'Todas as Vozes' },
                { id: 'tech', label: 'Tech & Cibernético' },
                { id: 'viral', label: 'Viral & Redes Sociais' },
                { id: 'cinema', label: 'Cinema Épico' },
                { id: 'audiobook', label: 'Audiobook & Doc' },
                { id: 'drama', label: 'Poético & Drama' },
                { id: 'story', label: 'Contos & Fantasia' },
                { id: 'human', label: 'Humanizadas' },
                { id: 'gaming', label: 'Gamer' },
                { id: 'executive', label: 'Executivo' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Voz Ativa: <strong className="text-indigo-400">{currentPersona.name}</strong>
            </div>
          </div>

          {/* Voice Personas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonas.map((p) => {
              const isSelected = currentPersona.id === p.id;
              const isPlaying = isPlayingSampleId === p.id;

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ y: -3 }}
                  onClick={() => {
                    onSelectPersona(p);
                    handleTestVoicePersona(p);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Badge & Audio Play Button */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl ${p.avatarGlow || 'bg-indigo-600'} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                        {p.gender === 'female' ? '♀' : '♂'}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white flex items-center gap-1">
                          {p.name}
                        </h4>
                        <span className="text-[10px] text-indigo-400 font-mono">
                          {p.gender === 'female' ? 'Voz Feminina' : 'Voz Masculina'} • {p.pitch}x pitch
                        </span>
                      </div>
                    </div>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Check className="w-3 h-3" /> Em Uso
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestVoicePersona(p);
                        }}
                        className={`p-1.5 rounded-lg border text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                          isPlaying 
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 animate-pulse'
                            : 'bg-slate-900 hover:bg-indigo-600 text-slate-300 hover:text-white border-slate-800'
                        }`}
                        title="Ouvir amostra de voz"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">Ouvir</span>
                      </button>
                    )}
                  </div>

                  {/* Description & Sample Phrase Quote */}
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                      {p.description}
                    </p>

                    {p.samplePhrase && (
                      <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80 text-[11px] text-indigo-200/90 italic font-sans flex items-start gap-1.5">
                        <span className="text-indigo-400 font-serif text-sm leading-none">“</span>
                        <span className="line-clamp-2">{p.samplePhrase}</span>
                        <span className="text-indigo-400 font-serif text-sm leading-none">”</span>
                      </div>
                    )}
                  </div>

                  {/* Footer Action Buttons */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestVoicePersona(p, p.samplePhrase);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3" /> Amostra do Áudio
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectPersona(p);
                        voiceService.playChime('confirm');
                        voiceService.speak(`Voz alterada para ${p.name}.`, { pitch: p.pitch, rate: p.rate, gender: p.gender });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white'
                      }`}
                    >
                      {isSelected ? '✓ Selecionada' : 'Ativar Voz'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AVATAR & NOME DO ASSISTENTE */}
      {activeTab === 'avatar_name' && (
        <div className="space-y-7">
          {/* Main Dual Setup Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Avatar Customizer & File Dropzone (7 Cols) */}
            <div className="lg:col-span-7 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-fuchsia-400" />
                  Trocar / Importar Avatar do Assistente
                </h3>
                {customAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateCustomAvatar('');
                      voiceService.playChime('alert');
                      voiceService.speak('Avatar restaurado para a versão padrão.');
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Restaurar Original
                  </button>
                )}
              </div>

              {/* Live Avatar Preview & Drag-and-Drop Area */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                {/* Active Avatar Frame with Ring */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/80 shadow-2xl ring-4 ring-indigo-500/20">
                    <img
                      src={activeAvatarImage}
                      alt="Avatar Atual"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-indigo-600 text-white shadow-md border border-slate-900">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Upload & Instructions */}
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <h4 className="text-xs font-bold text-slate-200">
                    {customAvatarUrl ? 'Avatar Personalizado Carregado' : 'Avatar Oficial APOLO'}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Importe qualquer foto ou ilustração do seu telemóvel/computador (PNG, JPG, WebP) ou escolha um modelo abaixo.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Importar Imagem do Dispositivo
                    </button>
                    {onNavigateToImageStudio && (
                      <button
                        type="button"
                        onClick={onNavigateToImageStudio}
                        className="px-3 py-1.5 rounded-xl bg-fuchsia-600/20 hover:bg-fuchsia-600/30 text-fuchsia-300 border border-fuchsia-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Gerar Avatar com IA
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-500/10'
                    : 'border-slate-800 hover:border-indigo-500/60 bg-slate-900/40'
                }`}
              >
                <Upload className="w-6 h-6 mx-auto text-indigo-400 mb-1" />
                <p className="text-xs text-slate-300 font-medium">
                  Arraste e solte uma imagem aqui ou clique para procurar no seu telemóvel/PC
                </p>
                <span className="text-[10px] text-slate-500">Suporta PNG, JPG, GIF e WebP</span>
              </div>

              {/* Preset Avatars Gallery */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300 block">
                  Ou escolha um dos avatares futuristas pré-definidos:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {PRESET_AVATARS.map((preset) => {
                    const isPresetActive = (customAvatarUrl || currentPersona.avatarImage) === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          onUpdateCustomAvatar(preset.url);
                          voiceService.playChime('confirm');
                          voiceService.speak(`Avatar alterado para o estilo ${preset.name}!`);
                        }}
                        className={`group relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                          isPresetActive
                            ? 'border-indigo-400 ring-2 ring-indigo-400/50 shadow-md'
                            : 'border-slate-800 hover:border-indigo-500/60'
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                          <span className="text-[8px] text-white font-semibold truncate w-full text-center">
                            {preset.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Custom Assistant Name (5 Cols) */}
            <div className="lg:col-span-5 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    Nome do Assistente
                  </h3>
                  {nameSavedSuccess && (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 animate-pulse">
                      <CheckCircle2 className="w-3 h-3" /> Salvo!
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Defina como você deseja chamar o seu assistente de inteligência artificial. Ele responderá pelo nome configurado!
                </p>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Nome Atual / Ativação por Voz:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="Ex: APOLO, ADAM, JARVIS, ATHENA..."
                      maxLength={25}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-bold tracking-wide focus:outline-none focus:border-indigo-500 transition-colors uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveName(editingName)}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      Salvar
                    </button>
                  </div>
                </div>

                {/* Quick Name Ideas */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    Sugestões Rápidas de Nomes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {NAME_SUGGESTIONS.map(name => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => {
                          setEditingName(name);
                          handleSaveName(name);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          assistantName === name
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Name Preview Voice Test Box */}
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> Teste Vocal de Apresentação:
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    voiceService.playChime('confirm');
                    voiceService.speak(`Olá! Meu nome é ${assistantName || editingName}, seu assistente de inteligência artificial. Como posso ajudar você agora?`, {
                      pitch: currentPersona.pitch,
                      rate: currentPersona.rate,
                      gender: currentPersona.gender
                    });
                  }}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Play className="w-3.5 h-3.5" /> Ouvir Apresentação: "Olá! Meu nome é {assistantName || editingName}..."
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CALIBRAGEM FINA DE FALA & VOZES DO SISTEMA */}
      {activeTab === 'browser_voices' && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-400" /> Calibragem Fina de Fala em Tempo Real
              </span>
              <button
                type="button"
                onClick={() => handleTestVoicePersona(currentPersona)}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" /> Ouvir Teste
              </button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">Tom / Frequência (Pitch):</span>
                  <span className="font-mono text-indigo-400 font-bold">{currentPersona.pitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={currentPersona.pitch}
                  onChange={(e) => onUpdateVoiceSettings(parseFloat(e.target.value), currentPersona.rate)}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.5x (Super Grave / Cinema)</span>
                  <span>1.0x (Padrão)</span>
                  <span>1.8x (Agudo / Fábulas)</span>
                </div>
              </div>

              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span className="font-semibold">Velocidade de Fala (Rate):</span>
                  <span className="font-mono text-indigo-400 font-bold">{currentPersona.rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.6"
                  step="0.05"
                  value={currentPersona.rate}
                  onChange={(e) => onUpdateVoiceSettings(currentPersona.pitch, parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0.6x (Solene / Lento)</span>
                  <span>1.0x (Normal)</span>
                  <span>1.6x (Viral / Rápido)</span>
                </div>
              </div>
            </div>

            {/* Custom Text Synthesizer Test */}
            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Falar Qualquer Texto Customizado com a Voz Selecionada:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={testCustomText}
                  onChange={(e) => setTestCustomText(e.target.value)}
                  placeholder="Digite qualquer frase para ouvir agora com esta voz..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (testCustomText.trim()) {
                      voiceService.playChime('confirm');
                      voiceService.speak(testCustomText, {
                        pitch: currentPersona.pitch,
                        rate: currentPersona.rate,
                        gender: currentPersona.gender
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" /> Falar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
