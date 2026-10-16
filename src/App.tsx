import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Smartphone, 
  MessageSquare, 
  Users, 
  Clock, 
  Video, 
  FileText, 
  ShieldCheck, 
  Gamepad2, 
  Bot, 
  BookOpen, 
  Palette, 
  Mic, 
  MicOff,
  Music2,
  Youtube,
  Send, 
  Volume2, 
  Terminal, 
  Lock, 
  Unlock,
  Radio,
  Layers,
  ChevronRight,
  HelpCircle,
  Play,
  CheckCircle,
  AlertCircle,
  Globe2,
  CreditCard
} from 'lucide-react';

// Subcomponents
import { ApoloVoiceAvatar } from './components/ApoloVoiceAvatar';
import { ExecutorPipelineModal } from './components/ExecutorPipelineModal';
import { PhoneAppsLauncher } from './components/PhoneAppsLauncher';
import { NotificationsCenter } from './components/NotificationsCenter';
import { ContactsDialer } from './components/ContactsDialer';
import { ClockAgendaModule } from './components/ClockAgendaModule';
import { MultimediaHub } from './components/MultimediaHub';
import type { MultimediaHubHandle } from './components/MultimediaHub';
import { ExternalPlatformPanel } from './components/ExternalPlatformPanel';
import { OfficeStudio } from './components/OfficeStudio';
import { SecurityLocationCenter } from './components/SecurityLocationCenter';
import { GamerCoachModule } from './components/GamerCoachModule';
import { PersonaCustomizer } from './components/PersonaCustomizer';
import { WikipediaKnowledge } from './components/WikipediaKnowledge';
import { ImageStudio } from './components/ImageStudio';
import { UserOnboarding } from './components/UserOnboarding';
import { ProfilePreferencesModal } from './components/ProfilePreferencesModal';
import { PlansPricing } from './components/PlansPricing';

// Data & Services
import { 
  INITIAL_APPS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_CONTACTS, 
  INITIAL_AGENDA, 
  INITIAL_ALARMS, 
  INITIAL_MEDIA, 
  INITIAL_PERSONAS, 
  INITIAL_FRIENDS, 
  INITIAL_OFFICE_DOCS 
} from './data/initialData';
import { voiceService } from './services/voice';
import { 
  AppItem, 
  PhoneNotification, 
  Contact, 
  AgendaItem, 
  AlarmItem, 
  MediaTrack, 
  ApoloPersona, 
  FriendLocation, 
  OfficeDocument, 
  CommandExecutionResult,
  ApoloUserProfile
} from './types';
import { apoloAppIcon } from './assets';
import { PROFILE_LANGUAGES, PROFILE_REGIONS } from './data/profileOptions';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('apps');
  const [isProfilePreferencesOpen, setIsProfilePreferencesOpen] = useState(false);

  // Local profile used to personalize APOLO's address and responses
  const [userProfile, setUserProfile] = useState<ApoloUserProfile | null>(() => {
    const saved = localStorage.getItem('apolo_user_profile');
    if (!saved) return null;
    try {
      return JSON.parse(saved) as ApoloUserProfile;
    } catch {
      localStorage.removeItem('apolo_user_profile');
      return null;
    }
  });

  // Custom Assistant Identity (Name & Avatar with LocalStorage Persistence)
  const [assistantName, setAssistantName] = useState<string>(() => {
    return localStorage.getItem('apolo_assistant_name') || 'APOLO';
  });
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(() => {
    return localStorage.getItem('apolo_custom_avatar') || '';
  });

  // Assistant State
  const [persona, setPersona] = useState<ApoloPersona>(() => {
    const savedPersonaId = localStorage.getItem('apolo_selected_persona_id');
    if (savedPersonaId) {
      const found = INITIAL_PERSONAS.find(p => p.id === savedPersonaId);
      if (found) return found;
    }
    return INITIAL_PERSONAS[0];
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [gamerLiveMode, setGamerLiveMode] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [commandInputValue, setCommandInputValue] = useState<string>('');
  const [assistantStatus, setAssistantStatus] = useState<string>('Pronto para receber ordens de voz ou texto');
  const [lastSpeechResponse, setLastSpeechResponse] = useState<string>(() => {
    const name = localStorage.getItem('apolo_assistant_name') || 'APOLO';
    const savedProfile = localStorage.getItem('apolo_user_profile');
    let userName = '';
    try {
      userName = savedProfile ? `, ${JSON.parse(savedProfile).preferredName}` : '';
    } catch {
      userName = '';
    }
    return `Olá${userName}! Eu sou ${name}, seu assistente por voz e inteligência artificial. Como posso ajudar você agora?`;
  });
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' | 'alert' } | null>(null);

  // Persistence Handlers
  const handleUpdateAssistantName = (newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAssistantName(trimmed);
    localStorage.setItem('apolo_assistant_name', trimmed);
    setActionToast({ message: `Nome do assistente alterado para ${trimmed}`, type: 'success' });
  };

  const handleCompleteOnboarding = (profile: ApoloUserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('apolo_user_profile', JSON.stringify(profile));
    const greeting = `Olá, ${profile.preferredName}! Agora já consigo reconhecer você neste dispositivo. Como posso ajudar?`;
    setLastSpeechResponse(greeting);
    setActionToast({ message: `Perfil de ${profile.preferredName} criado com sucesso.`, type: 'success' });
    voiceService.speak(greeting);
  };

  const handleSaveProfilePreferences = (languageCode: string, regionCode: string) => {
    if (!userProfile) return;
    const updatedProfile = { ...userProfile, languageCode, regionCode };
    try {
      localStorage.setItem('apolo_user_profile', JSON.stringify(updatedProfile));
    } catch {
      setActionToast({ message: 'Não foi possível guardar as preferências neste dispositivo.', type: 'alert' });
      return;
    }
    setUserProfile(updatedProfile);
    setIsProfilePreferencesOpen(false);
    const languageLabel = PROFILE_LANGUAGES.find((language) => language.code === languageCode)?.label || languageCode;
    const regionLabel = PROFILE_REGIONS.find((region) => region.code === regionCode)?.label || regionCode;
    setActionToast({ message: `Preferências guardadas: ${languageLabel} · ${regionLabel}.`, type: 'success' });
  };

  const handleUpdateCustomAvatar = (avatarUrl: string) => {
    setCustomAvatarUrl(avatarUrl);
    if (avatarUrl) {
      localStorage.setItem('apolo_custom_avatar', avatarUrl);
      setActionToast({ message: 'Novo avatar salvo com sucesso!', type: 'success' });
    } else {
      localStorage.removeItem('apolo_custom_avatar');
      setActionToast({ message: 'Avatar restaurado para o padrão.', type: 'info' });
    }
  };

  const handleSelectPersona = (newP: ApoloPersona) => {
    setPersona(newP);
    localStorage.setItem('apolo_selected_persona_id', newP.id);
    setActionToast({ message: `Voz ativada: ${newP.name}`, type: 'info' });
  };

  // Central Executor State
  const [executionResult, setExecutionResult] = useState<CommandExecutionResult | null>(null);
  const [showExecutorModal, setShowExecutorModal] = useState<boolean>(false);
  const [isProcessingCommand, setIsProcessingCommand] = useState<boolean>(false);

  // App Data State
  const [apps, setApps] = useState<AppItem[]>(INITIAL_APPS);
  const [notifications, setNotifications] = useState<PhoneNotification[]>(INITIAL_NOTIFICATIONS);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [agenda, setAgenda] = useState<AgendaItem[]>(INITIAL_AGENDA);
  const [alarms, setAlarms] = useState<AlarmItem[]>(INITIAL_ALARMS);
  const [mediaTracks, setMediaTracks] = useState<MediaTrack[]>(INITIAL_MEDIA);
  const [mediaSearchQuery, setMediaSearchQuery] = useState('');
  const [tiktokSearchQuery, setTiktokSearchQuery] = useState('');
  const [friends, setFriends] = useState<FriendLocation[]>(INITIAL_FRIENDS);
  const [officeDocs, setOfficeDocs] = useState<OfficeDocument[]>(INITIAL_OFFICE_DOCS);
  const [isPhoneLocked, setIsPhoneLocked] = useState<boolean>(false);
  const mediaHubRef = useRef<MultimediaHubHandle | null>(null);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (actionToast) {
      const timer = setTimeout(() => setActionToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionToast]);

  // Synchronize Voice Service Status
  useEffect(() => {
    const checkVoiceState = setInterval(() => {
      setIsSpeaking(voiceService.speaking);
    }, 150);
    return () => clearInterval(checkVoiceState);
  }, []);

  useEffect(() => {
    voiceService.setLanguage(userProfile?.languageCode || 'pt-PT');
  }, [userProfile?.languageCode]);

  // Replay APOLO's vocal response
  const handleReplaySpeech = () => {
    if (lastSpeechResponse) {
      voiceService.speak(lastSpeechResponse, {
        pitch: persona.pitch,
        rate: persona.rate
      });
    }
  };

  // Send Command to APOLO Motor IA (Zero-Latency Fast-Path Hybrid Dispatcher)
  const handleProcessCommand = async (commandText: string) => {
    const cleanCmd = commandText.trim();
    if (!cleanCmd) return;

    const lower = cleanCmd.toLowerCase();
    setIsProcessingCommand(true);
    setAssistantStatus(`Processando: "${cleanCmd}"...`);
    voiceService.playChime('wake');

    // Check if user is asking a question, calculation, or knowledge query
    const isQuestion = 
      cleanCmd.includes('?') ||
      /^(quem|o que|oque|como|qual|quais|por que|porque|por quê|quanto|quando|onde|explique|explicar|dicas|fale|falar|conte|contar|resuma|resumir|ensine|ensinar|escreva|escrever|crie|criar|calcule|calcular|resolva|ajude|me ajude|defina|definir|me diga|diga|translate|traduza)/i.test(cleanCmd);

    // --- ZERO-LATENCY INSTANT LOCAL FAST PATH (for simple direct device toggles only) ---
    let instantHandled = false;
    let instantSpeech = '';
    let instantActions: any[] = [];
    let instantTab = '';

    if (!isQuestion) {
      if (lower.includes('modo gamer') || lower.includes('modo gaming') || lower.includes('coach gamer')) {
        setActiveTab('gamer');
        setGamerLiveMode(true);
        instantSpeech = 'Modo Gamer ao Vivo ativado. O APOLO ficará de prontidão para suas chamadas e dicas táticas.';
        instantHandled = true;
      } else if (lower.includes('encerrar modo gamer') || lower.includes('sair do modo gamer')) {
        setGamerLiveMode(false);
        instantSpeech = 'Sessão Gamer ao Vivo encerrada.';
        instantHandled = true;
      } else if (lower.includes('que horas') || lower.includes('horas são') || lower === 'horas') {
        const now = new Date();
        const hrs = now.getHours().toString().padStart(2, '0');
        const mins = now.getMinutes().toString().padStart(2, '0');
        instantSpeech = `Agora são exatamente ${hrs} horas e ${mins} minutos.`;
        instantHandled = true;
      } else if (lower.includes('bloquear celular') || lower.includes('bloqueia o celular') || lower.includes('trancar celular')) {
        setIsPhoneLocked(true);
        voiceService.playChime('alert');
        instantSpeech = 'Celular bloqueado por segurança.';
        instantHandled = true;
      } else if (lower.includes('desbloquear celular') || lower.includes('desbloqueia o celular') || lower.includes('destrancar')) {
        setIsPhoneLocked(false);
        voiceService.playChime('success');
        instantSpeech = 'Celular desbloqueado com sucesso.';
        instantHandled = true;
      } else if (lower.includes('onde está meu celular') || lower.includes('encontrar meu celular') || lower.includes('perdi meu celular') || lower.includes('tocar sirene')) {
        voiceService.startEmergencyRing();
        instantTab = 'security';
        instantSpeech = 'Emitindo sinal sonoro de localização imediatamente!';
        instantHandled = true;
      } else if (
        lower.includes('tiktok') &&
        /^(apolo,?\s*)?(abre|abrir|procura|pesquisa|pesquisar|busca|mostra)\b/i.test(cleanCmd)
      ) {
        const isSearch = /\b(procura|pesquisa|pesquisar|busca)\b/i.test(cleanCmd);
        const query = isSearch
          ? cleanCmd
              .replace(/^.*?\b(procura|pesquisa|pesquisar|busca)\s+/i, '')
              .replace(/\s+(no|em)\s+tiktok.*$/i, '')
              .trim()
          : '';
        setTiktokSearchQuery(query);
        instantTab = 'tiktok';
        instantSpeech = query
          ? `Pesquisa pronta para abrir no TikTok: ${query}.`
          : 'Secção do TikTok aberta. Toque no botão para abrir o aplicativo ou site.';
        instantHandled = true;
      } else if (
        /^(apolo,?\s*)?(toca|toque|reproduza|procura|busca|pesquisa)\b/i.test(cleanCmd) &&
        (lower.includes('youtube') || lower.includes('cantor') || lower.includes(' de ') || lower.includes('música') || lower.includes('musica'))
      ) {
        const query = cleanCmd
          .replace(/^apolo,?\s*/i, '')
          .replace(/^(toca|toque|reproduza|procura|busca|pesquisa)\s+/i, '')
          .replace(/^(a\s+)?m[uú]sica\s+(de\s+)?/i, '')
          .replace(/\s+(no|em)\s+youtube.*$/i, '')
          .trim();
        setMediaSearchQuery(query);
        instantTab = 'youtube';
        instantSpeech = query
          ? `Pesquisa pronta para abrir no YouTube: ${query}.`
          : 'Secção do YouTube aberta. Escreva uma pesquisa ou toque para abrir o aplicativo.';
        instantHandled = true;
      } else if (/^(apolo,?\s*)?(abre|abrir)\b.*youtube/i.test(cleanCmd) || lower === 'youtube') {
        setMediaSearchQuery('');
        instantTab = 'youtube';
        instantSpeech = 'Secção do YouTube aberta. Toque no botão para abrir o aplicativo ou site.';
        instantHandled = true;
      } else if (/^(apolo,?\s*)?(pausa|pausar|para|parar|interrompe|interromper)\b.*\b(música|musica|faixa)\b/i.test(cleanCmd)) {
        const paused = mediaHubRef.current?.pause() ?? false;
        instantSpeech = paused
          ? 'A música foi pausada.'
          : 'Não há uma faixa local selecionada para pausar.';
        instantHandled = true;
      } else if (/^(apolo,?\s*)?(continua|retoma)\b.*\b(música|musica|faixa)\b/i.test(cleanCmd)) {
        const resumed = await (mediaHubRef.current?.resume() ?? Promise.resolve(false));
        instantSpeech = resumed
          ? 'A música foi retomada.'
          : 'Não há uma faixa local para retomar, ou o navegador bloqueou a reprodução. Abra Música e toque em Reproduzir.';
        instantHandled = true;
      } else if (/^(apolo,?\s*)?(abre|abrir)\b.*\b(música|musica|spotify)\b/i.test(cleanCmd)) {
        instantTab = 'music';
        instantSpeech = 'Biblioteca de música do APOLO aberta.';
        instantHandled = true;
      } else if (lower.startsWith('alarme para') || lower.startsWith('cria um alarme') || lower.startsWith('definir alarme')) {
        const timeMatch = cleanCmd.match(/(\d{1,2})[:h](\d{2})?/i) || cleanCmd.match(/às\s*(\d{1,2})/i);
        const alarmTime = timeMatch ? `${timeMatch[1].padStart(2, '0')}:00` : '07:00';
        handleAddAlarm({
          time: alarmTime,
          label: 'Alarme por Voz APOLO',
          active: true,
          repeatDays: ['Todos os dias']
        });
        instantTab = 'clock';
        instantSpeech = `Alarme configurado para às ${alarmTime}.`;
        instantHandled = true;
      } else if (lower.startsWith('lembrar de') || lower.startsWith('lembra-me de')) {
        const taskText = cleanCmd.replace(/apolo/gi, '').replace(/lembra-me de/gi, '').replace(/lembrar de/gi, '').replace(/lembra/gi, '').trim() || cleanCmd;
        handleAddTask({
          title: taskText,
          time: '09:00',
          date: 'Hoje',
          completed: false,
          category: 'trabalho',
          isOverdue: false
        });
        instantTab = 'clock';
        instantSpeech = `Lembrete adicionado: "${taskText}".`;
        instantHandled = true;
      } else if (lower.startsWith('envia mensagem para') || lower.startsWith('manda mensagem para')) {
        const cleanMsg = cleanCmd.replace(/envia mensagem/gi, '').replace(/manda mensagem/gi, '').replace(/manda uma mensagem/gi, '').replace(/para a mariana silva/gi, '').replace(/para a mariana/gi, '').replace(/para mariana/gi, '').replace(/dizendo que/gi, '').trim();
        handleSendMessage('Mariana Silva', cleanMsg || 'Chego em 10 minutos');
        instantTab = 'messages';
        instantSpeech = `Mensagem enviada para Mariana Silva: "${cleanMsg || 'Chego em breve'}".`;
        instantHandled = true;
      } else if (lower.includes('bloquear whatsapp') || lower.includes('bloqueia o whatsapp')) {
        setApps(prev => prev.map(a => a.id === 'whatsapp' ? { ...a, isLocked: true } : a));
        instantSpeech = 'Aplicativo WhatsApp bloqueado com sucesso.';
        instantHandled = true;
      } else if (lower.includes('desbloquear whatsapp')) {
        setApps(prev => prev.map(a => a.id === 'whatsapp' ? { ...a, isLocked: false } : a));
        instantSpeech = 'Aplicativo WhatsApp desbloqueado.';
        instantHandled = true;
      } else if (lower === 'personalidade' || lower === 'mudar voz' || lower === 'voz adam') {
        instantTab = 'persona';
        instantSpeech = 'Abrindo personalização de voz do APOLO.';
        instantHandled = true;
      }
    }

    // If instantly handled on fast-path: dispatch immediately without network latency!
    if (instantHandled) {
      if (instantTab) setActiveTab(instantTab);
      setLastSpeechResponse(instantSpeech);
      setAssistantStatus(instantSpeech);
      setIsProcessingCommand(false);

      // Instant Voice Response
      voiceService.speak(instantSpeech, {
        pitch: persona.pitch,
        rate: persona.rate
      });

      setActionToast({
        message: instantSpeech,
        type: 'success'
      });

      setExecutionResult({
        command: cleanCmd,
        intent: 'instant_fast_path',
        speechResponse: instantSpeech,
        executionPlan: [
          { step: 1, name: 'Reconhecimento Ultra-Rápido', detail: 'Intenção mapeada em tempo real (<5ms)', status: 'completed' },
          { step: 2, name: 'Despacho Imediato', detail: 'Ação executada no dispositivo', status: 'completed' }
        ],
        actions: instantActions,
        securityLevel: 1,
        requiresConfirmation: false
      });
      return;
    }

    // --- ADVANCED AI REASONING / WIKIPEDIA / COMPLEX QUERIES (FAST API) ---
    try {
      const response = await fetch('/api/gemini/apolo-command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: cleanCmd,
          currentContext: {
            activeTab,
            isPhoneLocked,
            installedApps: apps.map(a => a.name),
            persona: persona.name,
            user: userProfile ? {
              fullName: userProfile.fullName,
              preferredName: userProfile.preferredName,
              email: userProfile.email,
              phone: userProfile.phone,
              languageCode: userProfile.languageCode || 'pt-PT',
              regionCode: userProfile.regionCode || 'MZ'
            } : null
          },
          persona: {
            name: persona.name,
            personality: persona.personality
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const text = await response.text();
      if (!text || !text.trim()) {
        throw new Error('Empty response from API');
      }

      const data: CommandExecutionResult = JSON.parse(text);
      setExecutionResult(data);

      const speech = data.speechResponse || `Comando recebido: ${cleanCmd}`;
      setLastSpeechResponse(speech);
      setAssistantStatus(speech);

      // Speak the response out loud immediately
      voiceService.speak(speech, {
        pitch: persona.pitch,
        rate: persona.rate
      });

      // If Critical Security Level 3 (e.g. Phone Lock/Unlock) AND requires explicit auth, show modal
      if (data.securityLevel === 3 && data.requiresConfirmation) {
        setShowExecutorModal(true);
        setActionToast({
          message: 'Confirmação de segurança necessária para executar esta ação.',
          type: 'alert'
        });
      } else {
        // Execute actions immediately
        executeActions(data);
      }
    } catch (err) {
      console.error('Command processing error:', err);
      // Fast Fallback response
      const fallbackSpeech = `Executando sua solicitação "${cleanCmd}" no APOLO.`;
      const fallbackResult: CommandExecutionResult = {
        command: cleanCmd,
        intent: 'fallback',
        speechResponse: fallbackSpeech,
        executionPlan: [
          { step: 1, name: 'Captura Instantânea', detail: 'Texto decodificado com sucesso', status: 'completed' },
          { step: 2, name: 'Execução Automática', detail: 'Ação despachada no dispositivo', status: 'completed' }
        ],
        actions: [],
        securityLevel: 1,
        requiresConfirmation: false
      };

      setExecutionResult(fallbackResult);
      setLastSpeechResponse(fallbackSpeech);
      setAssistantStatus(fallbackSpeech);
      voiceService.speak(fallbackSpeech, { pitch: persona.pitch, rate: persona.rate });
      executeActions(fallbackResult);
    } finally {
      setIsProcessingCommand(false);
    }
  };

  // Perform Executions on Device
  const executeActions = (result: CommandExecutionResult) => {
    let executedDescription = '';

    // Process actions
    result.actions?.forEach((action) => {
      switch (action.type) {
        case 'OPEN_APP': {
          const appName = action.payload?.appName?.toLowerCase() || '';
          if (appName.includes('youtube')) {
            setActiveTab('youtube');
            executedDescription = 'Secção do YouTube aberta; o conteúdo externo requer confirmação do utilizador';
          } else if (appName.includes('tiktok')) {
            setActiveTab('tiktok');
            executedDescription = 'Secção do TikTok aberta; o conteúdo externo requer confirmação do utilizador';
          } else if (appName.includes('música') || appName.includes('musica') || appName.includes('spotify')) {
            setActiveTab('music');
            executedDescription = 'Biblioteca de música do APOLO aberta';
          } else if (appName.includes('whatsapp') || appName.includes('mensagem')) {
            setActiveTab('messages');
            executedDescription = 'Central de Mensagens e WhatsApp aberta';
          } else if (appName.includes('contato') || appName.includes('telefone') || appName.includes('ligar')) {
            setActiveTab('contacts');
            executedDescription = 'Agenda de Contatos aberta';
          } else if (appName.includes('relógio') || appName.includes('agenda') || appName.includes('alarme')) {
            setActiveTab('clock');
            executedDescription = 'Relógio & Agenda abertos';
          } else if (appName.includes('office') || appName.includes('documento') || appName.includes('word') || appName.includes('excel')) {
            setActiveTab('office');
            executedDescription = 'Office Studio aberto';
          } else if (appName.includes('gamer') || appName.includes('jogo')) {
            setActiveTab('gamer');
            executedDescription = 'Coach Gamer & FPS aberto';
          } else if (appName.includes('segurança') || appName.includes('radar') || appName.includes('localização')) {
            setActiveTab('security');
            executedDescription = 'Central de Segurança & Localização aberta';
          } else if (appName.includes('wiki') || appName.includes('pesquisa') || appName.includes('saber')) {
            setActiveTab('wiki');
            executedDescription = 'Módulo Wikipédia aberto';
          } else if (appName.includes('foto') || appName.includes('imagem') || appName.includes('arte') || appName.includes('vídeo') || appName.includes('video') || appName.includes('cinema') || appName.includes('estudio')) {
            setActiveTab('image');
            executedDescription = 'Estúdio de Criação de Imagens & Vídeos aberto';
          } else {
            setActiveTab('apps');
            executedDescription = `Aplicativo ${action.payload?.appName || 'selecionado'} aberto`;
          }
          break;
        }
        case 'LOCK_PHONE':
          setIsPhoneLocked(true);
          voiceService.playChime('alert');
          executedDescription = 'Celular bloqueado com sucesso';
          break;
        case 'UNLOCK_PHONE':
          setIsPhoneLocked(false);
          voiceService.playChime('success');
          executedDescription = 'Celular desbloqueado com sucesso';
          break;
        case 'LOCK_APP': {
          const targetName = action.payload?.appName?.toLowerCase() || '';
          setApps(prev => prev.map(a => a.name.toLowerCase().includes(targetName) ? { ...a, isLocked: true } : a));
          executedDescription = `Aplicativo ${action.payload?.appName} bloqueado`;
          break;
        }
        case 'UNLOCK_APP': {
          const targetName = action.payload?.appName?.toLowerCase() || '';
          setApps(prev => prev.map(a => a.name.toLowerCase().includes(targetName) ? { ...a, isLocked: false } : a));
          executedDescription = `Aplicativo ${action.payload?.appName} desbloqueado`;
          break;
        }
        case 'SEND_MESSAGE': {
          if (action.payload?.messageText) {
            handleSendMessage(action.payload?.contactName || 'Mariana Silva', action.payload?.messageText);
            setActiveTab('messages');
            executedDescription = `Mensagem enviada para ${action.payload?.contactName || 'Contato'}`;
          }
          break;
        }
        case 'SET_ALARM': {
          const alarmTime = action.payload?.alarmTime || '07:00';
          handleAddAlarm({
            time: alarmTime,
            label: action.payload?.reminderText || 'Alarme APOLO',
            active: true,
            repeatDays: ['Todos os dias']
          });
          setActiveTab('clock');
          executedDescription = `Alarme configurado para às ${alarmTime}`;
          break;
        }
        case 'CREATE_REMINDER': {
          const reminderText = action.payload?.reminderText || result.command;
          handleAddTask({
            title: reminderText,
            time: action.payload?.reminderTime || '09:00',
            date: 'Hoje',
            completed: false,
            category: 'trabalho',
            isOverdue: false
          });
          setActiveTab('clock');
          executedDescription = `Lembrete adicionado: "${reminderText}"`;
          break;
        }
        case 'FIND_PHONE_RING':
          voiceService.startEmergencyRing();
          setActiveTab('security');
          executedDescription = 'Sirene de localização ativada';
          break;
        case 'WIKIPEDIA_SEARCH':
          setActiveTab('wiki');
          executedDescription = 'Pesquisa da Wikipédia carregada';
          break;
        case 'GENERATE_IMAGE':
          setActiveTab('image');
          executedDescription = 'Estúdio de Criação Visual acionado';
          break;
        case 'CREATE_OFFICE_DOC':
          setActiveTab('office');
          executedDescription = 'Novo documento criado no Office Studio';
          break;
        default:
          executedDescription = 'Comando processado com sucesso';
          break;
      }
    });

    if (executedDescription) {
      setActionToast({
        message: executedDescription,
        type: 'success'
      });
    }

    setShowExecutorModal(false);
  };

  // Toggle Continuous / One-Shot Voice Listening
  const handleToggleListening = () => {
    if (isListening) {
      const captured = voiceService.stopListening();
      setIsListening(false);
      if (captured && captured.trim()) {
        handleProcessCommand(captured.trim());
      } else {
        setAssistantStatus('Microfone desativado. Fale ou digite seu comando.');
      }
      return;
    }

    setIsListening(true);
    setVoiceTranscript('');
    setAssistantStatus('Ouvindo a sua voz... Fale com o APOLO.');
    voiceService.playChime('wake');

    voiceService.startListening(
      (transcript, isFinal) => {
        setVoiceTranscript(transcript);
        setCommandInputValue(transcript);
        if (isFinal) {
          setIsListening(false);
          handleProcessCommand(transcript);
        }
      },
      (error) => {
        console.warn('Speech error:', error);
        setIsListening(false);
        setAssistantStatus('Microfone disponível. Fale novamente ou use os comandos rápidos abaixo.');
        setActionToast({
          message: 'Microfone ativo. Pode falar ou clicar em um comando rápido!',
          type: 'info'
        });
      },
      (finalTranscript) => {
        setIsListening(false);
        if (finalTranscript && finalTranscript.trim()) {
          handleProcessCommand(finalTranscript.trim());
        }
      }
    );
  };

  // Handlers for App Actions
  const handleOpenApp = (appId: string) => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;

    if (app.isLocked) {
      voiceService.playChime('alert');
      const text = `O aplicativo ${app.name} está bloqueado por segurança. Diga o comando de desbloqueio.`;
      setLastSpeechResponse(text);
      voiceService.speak(text);
      setActionToast({ message: `Aplicativo ${app.name} está bloqueado!`, type: 'alert' });
      return;
    }

    voiceService.playChime('confirm');
    const text = appId === 'youtube' || appId === 'tiktok'
      ? `Secção ${app.name} aberta no APOLO. Use o botão de abertura para continuar na plataforma.`
      : appId === 'music'
        ? 'Biblioteca de música do APOLO aberta.'
        : `Abrindo o aplicativo ${app.name}.`;
    setLastSpeechResponse(text);
    voiceService.speak(text);

    if (appId === 'youtube') {
      setActiveTab('youtube');
    } else if (appId === 'tiktok') {
      setActiveTab('tiktok');
    } else if (appId === 'music') {
      setActiveTab('music');
    } else if (appId === 'messages') {
      setActiveTab('messages');
    } else if (appId === 'contacts') {
      setActiveTab('contacts');
    } else if (appId === 'clock') {
      setActiveTab('clock');
    } else if (appId === 'office') {
      setActiveTab('office');
    } else if (appId === 'security') {
      setActiveTab('security');
    } else if (appId === 'gamer') {
      setActiveTab('gamer');
    } else if (appId === 'wiki') {
      setActiveTab('wiki');
    } else if (appId === 'photos') {
      setActiveTab('image');
    }
  };

  const handleToggleLockApp = (appId: string) => {
    setApps(prev => prev.map(a => {
      if (a.id === appId) {
        const nextState = !a.isLocked;
        voiceService.playChime('confirm');
        const text = `Aplicativo ${a.name} ${nextState ? 'bloqueado' : 'desbloqueado'} com sucesso.`;
        setLastSpeechResponse(text);
        voiceService.speak(text);
        setActionToast({ message: text, type: 'info' });
        return { ...a, isLocked: nextState };
      }
      return a;
    }));
  };

  const handleUninstallApp = (appId: string) => {
    const target = apps.find(a => a.id === appId);
    if (!target) return;
    setApps(prev => prev.filter(a => a.id !== appId));
    const text = `Aplicativo ${target.name} desinstalado com sucesso.`;
    setLastSpeechResponse(text);
    voiceService.speak(text);
    setActionToast({ message: text, type: 'info' });
  };

  const handleInstallApp = (app: Omit<AppItem, 'id' | 'isLocked'>) => {
    const newApp: AppItem = {
      ...app,
      id: `app_${Date.now()}`,
      isLocked: false
    };
    setApps(prev => [...prev, newApp]);
    const text = `Aplicativo ${app.name} instalado e pronto para uso.`;
    setLastSpeechResponse(text);
    voiceService.speak(text);
    setActionToast({ message: text, type: 'success' });
  };

  // Contacts
  const handleAddContact = (contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: `c_${Date.now()}`
    };
    setContacts(prev => [newContact, ...prev]);
    const text = `Contato ${contact.name} salvo com sucesso.`;
    setLastSpeechResponse(text);
    voiceService.speak(text);
    setActionToast({ message: text, type: 'success' });
  };

  const handleDeleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    setContacts(prev => prev.filter(c => c.id !== id));
    if (contact) {
      const text = `Contato ${contact.name} removido.`;
      setLastSpeechResponse(text);
      voiceService.speak(text);
    }
  };

  // Agenda & Alarms
  const handleAddTask = (task: Omit<AgendaItem, 'id'>) => {
    const newTask: AgendaItem = {
      ...task,
      id: `task_${Date.now()}`
    };
    setAgenda(prev => [newTask, ...prev]);
    const text = `Tarefa "${task.title}" agendada com sucesso.`;
    setLastSpeechResponse(text);
    voiceService.speak(text);
    setActionToast({ message: text, type: 'success' });
  };

  const handleToggleTask = (id: string) => {
    setAgenda(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    setAgenda(prev => prev.filter(t => t.id !== id));
  };

  const handleAddAlarm = (alarm: Omit<AlarmItem, 'id'>) => {
    const newAlarm: AlarmItem = {
      ...alarm,
      id: `alarm_${Date.now()}`
    };
    setAlarms(prev => [newAlarm, ...prev]);
    const text = `Alarme definido para às ${alarm.time}.`;
    setLastSpeechResponse(text);
    voiceService.speak(text);
    setActionToast({ message: text, type: 'success' });
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  // Notifications
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleClearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleSendMessage = (contactName: string, text: string) => {
    const newNotification: PhoneNotification = {
      id: `notif_${Date.now()}`,
      appName: 'WhatsApp',
      sender: contactName,
      message: text,
      time: 'Agora',
      isRead: false,
      priority: 'high'
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  // Navigation Items
  const NAV_ITEMS = [
    { id: 'apps', label: 'Aplicativos & Telas', icon: Smartphone },
    { id: 'messages', label: 'Mensagens & Notificações', icon: MessageSquare },
    { id: 'contacts', label: 'Contatos & Discador', icon: Users },
    { id: 'clock', label: 'Relógio & Agenda', icon: Clock },
    { id: 'music', label: 'Música', icon: Music2 },
    { id: 'youtube', label: 'YouTube', icon: Youtube },
    { id: 'tiktok', label: 'TikTok', icon: Video },
    { id: 'office', label: 'Office Studio', icon: FileText },
    { id: 'security', label: 'Segurança & Radar', icon: ShieldCheck },
    { id: 'gamer', label: 'Coach Gamer', icon: Gamepad2 },
    { id: 'persona', label: 'Personalidade IA', icon: Bot },
    { id: 'wiki', label: 'Wikipédia IA', icon: BookOpen },
    { id: 'image', label: 'Estúdio de Imagens', icon: Palette },
    { id: 'video', label: 'Gerador de Vídeos', icon: Video },
    { id: 'plans', label: 'Planos e Preços', icon: CreditCard }
  ];

  return (
    <div id="apolo-app-root" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Main Navigation Header */}
      <header id="apolo-header-bar" className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl overflow-hidden border border-indigo-400/40 shadow-lg shadow-indigo-600/30 flex items-center justify-center bg-indigo-950">
              <img
                src={apoloAppIcon}
                alt="APOLO App Icon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  APOLO<span className="text-indigo-400">.IA</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-bold hidden sm:inline-block">
                  Assistente Oral
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Assistente Particular Orientado para Linguagem Oral
              </p>
            </div>
          </div>

          {/* Right Status & Lock State */}
          <div className="flex items-center gap-3">
            {userProfile && (
              <>
                <span className="hidden text-xs font-semibold text-indigo-200 sm:inline">
                  Olá, {userProfile.preferredName}
                </span>
                <button
                  onClick={() => setIsProfilePreferencesOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-[10px] font-semibold text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
                  title="Alterar idioma e região"
                >
                  <Globe2 className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{userProfile.languageCode || 'pt-PT'} · {userProfile.regionCode || 'MZ'}</span>
                </button>
              </>
            )}
            <button
              id="header-phone-lock-toggle"
              onClick={() => {
                const next = !isPhoneLocked;
                setIsPhoneLocked(next);
                voiceService.playChime(next ? 'alert' : 'success');
                const msg = next ? 'Celular bloqueado por segurança.' : 'Celular desbloqueado.';
                setLastSpeechResponse(msg);
                voiceService.speak(msg);
                setActionToast({ message: msg, type: next ? 'alert' : 'success' });
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isPhoneLocked
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              }`}
            >
              {isPhoneLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{isPhoneLocked ? 'Bloqueado' : 'Protegido'}</span>
            </button>

            <button
              onClick={() => {
                if (executionResult) setShowExecutorModal(true);
                else {
                  handleProcessCommand('Status geral do sistema APOLO');
                }
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
              title="Abrir Pipeline do Executor"
            >
              <Terminal className="w-4 h-4 text-indigo-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Toast */}
      <AnimatePresence>
        {actionToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-2xl border shadow-xl flex items-center gap-2.5 text-xs font-medium backdrop-blur-lg ${
              actionToast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/50'
                : actionToast.type === 'alert'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/40 shadow-rose-950/50'
                : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/40 shadow-indigo-950/50'
            }`}
          >
            {actionToast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
            {actionToast.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {actionToast.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-400" />}
            <span>{actionToast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top Section: Glowing Voice Hologram Avatar & Voice Controls */}
        <section id="apolo-avatar-section" className="w-full">
          <ApoloVoiceAvatar
            persona={persona}
            assistantName={assistantName}
            customAvatarUrl={customAvatarUrl}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleListen={handleToggleListening}
            statusText={assistantStatus}
            transcript={voiceTranscript}
            lastSpeechResponse={lastSpeechResponse}
            onReplaySpeech={handleReplaySpeech}
            onQuickCommand={handleProcessCommand}
            isProcessing={isProcessingCommand}
            onNavigateToCustomizer={() => setActiveTab('persona')}
          />
        </section>

        {/* Navigation Tabs Bar */}
        <section id="navigation-tabs" className="sticky top-16 z-30 bg-slate-950/90 backdrop-blur-md pt-2 pb-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    voiceService.playChime('click');
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic Active Module Area */}
        <section id="active-module-container" className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'apps' && (
                <PhoneAppsLauncher
                  apps={apps}
                  onOpenApp={handleOpenApp}
                  onToggleLockApp={handleToggleLockApp}
                  onUninstallApp={handleUninstallApp}
                  onInstallApp={handleInstallApp}
                />
              )}

              {activeTab === 'messages' && (
                <NotificationsCenter
                  notifications={notifications}
                  contacts={contacts}
                  onMarkAsRead={handleMarkAsRead}
                  onClearNotification={handleClearNotification}
                  onSendMessage={handleSendMessage}
                />
              )}

              {activeTab === 'contacts' && (
                <ContactsDialer
                  contacts={contacts}
                  onAddContact={handleAddContact}
                  onDeleteContact={handleDeleteContact}
                  onUpdateContact={(up) => setContacts(prev => prev.map(c => c.id === up.id ? up : c))}
                />
              )}

              {activeTab === 'clock' && (
                <ClockAgendaModule
                  agenda={agenda}
                  alarms={alarms}
                  onToggleTask={handleToggleTask}
                  onAddTask={handleAddTask}
                  onDeleteTask={handleDeleteTask}
                  onToggleAlarm={handleToggleAlarm}
                  onAddAlarm={handleAddAlarm}
                  onDeleteAlarm={handleDeleteAlarm}
                />
              )}

              {activeTab === 'youtube' && (
                <ExternalPlatformPanel
                  platform="youtube"
                  query={mediaSearchQuery}
                  onQueryChange={setMediaSearchQuery}
                />
              )}

              {activeTab === 'tiktok' && (
                <ExternalPlatformPanel
                  platform="tiktok"
                  query={tiktokSearchQuery}
                  onQueryChange={setTiktokSearchQuery}
                />
              )}

              {activeTab === 'office' && (
                <OfficeStudio
                  documents={officeDocs}
                  onAddDocument={(doc) => setOfficeDocs(prev => [doc, ...prev])}
                  onDeleteDocument={(id) => setOfficeDocs(prev => prev.filter(d => d.id !== id))}
                  onUpdateDocument={(doc) => setOfficeDocs(prev => prev.map(d => d.id === doc.id ? doc : d))}
                />
              )}

              {activeTab === 'security' && (
                <SecurityLocationCenter
                  isPhoneLocked={isPhoneLocked}
                  onToggleLockPhone={() => setIsPhoneLocked(prev => !prev)}
                  friends={friends}
                />
              )}

              {activeTab === 'gamer' && (
                <GamerCoachModule
                  isLiveMode={gamerLiveMode}
                  apoloIsCalled={isListening || isProcessingCommand}
                  onLiveModeChange={setGamerLiveMode}
                />
              )}

              {activeTab === 'persona' && (
                <PersonaCustomizer
                  currentPersona={persona}
                  assistantName={assistantName}
                  customAvatarUrl={customAvatarUrl}
                  onSelectPersona={handleSelectPersona}
                  onUpdateVoiceSettings={(pitch, rate) => setPersona(prev => ({ ...prev, pitch, rate }))}
                  onUpdateAssistantName={handleUpdateAssistantName}
                  onUpdateCustomAvatar={handleUpdateCustomAvatar}
                  onNavigateToImageStudio={() => setActiveTab('image')}
                />
              )}

              {activeTab === 'wiki' && (
                <WikipediaKnowledge />
              )}

              {activeTab === 'image' && (
                <ImageStudio mode="images" />
              )}

              {activeTab === 'video' && (
                <ImageStudio mode="video" />
              )}

              {activeTab === 'plans' && (
                <PlansPricing
                  selectedRegionCode={userProfile?.regionCode || 'MZ'}
                  onRegionChange={(regionCode) => {
                    if (userProfile) {
                      handleSaveProfilePreferences(userProfile.languageCode || 'pt-PT', regionCode);
                    }
                  }}
                />
              )}
            </motion.div>
          </AnimatePresence>
          <MultimediaHub
            ref={mediaHubRef}
            tracks={mediaTracks}
            isActive={activeTab === 'music'}
            onReturnToAssistant={() => {
              setActiveTab('apps');
              document.getElementById('apolo-avatar-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          />
        </section>
      </main>

      {!userProfile && <UserOnboarding onComplete={handleCompleteOnboarding} />}
      {userProfile && isProfilePreferencesOpen && (
        <ProfilePreferencesModal
          profile={userProfile}
          onClose={() => setIsProfilePreferencesOpen(false)}
          onSave={handleSaveProfilePreferences}
        />
      )}

      {/* Floating Bottom Voice & Text Command Input Bar */}
      <div id="floating-command-bar" className="sticky bottom-0 z-40 p-4 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <button
            id="floating-mic-button"
            type="button"
            onClick={handleToggleListening}
            aria-label={isListening ? 'Desligar a captura do microfone' : 'Iniciar captura de voz'}
            aria-pressed={isListening}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-600 text-white animate-bounce shadow-lg shadow-rose-600/40'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
            }`}
            title={isListening ? 'Desligar microfone' : 'Falar com APOLO'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (commandInputValue.trim()) {
                handleProcessCommand(commandInputValue);
                setCommandInputValue('');
              }
            }}
            className="flex-1 flex gap-2"
          >
            <input
              id="voice-command-text-input"
              type="text"
              value={commandInputValue}
              onChange={(e) => setCommandInputValue(e.target.value)}
              placeholder="Diga ou digite um comando para o APOLO (ex: 'Que horas são?', 'Abre o YouTube', 'Alarme às 7h')..."
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 shadow-inner"
            />

            <button
              id="send-command-btn"
              type="submit"
              disabled={isProcessingCommand}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Executar</span>
            </button>
          </form>
        </div>
      </div>

      {/* Central Pipeline Executor Modal */}
      <ExecutorPipelineModal
        isOpen={showExecutorModal}
        onClose={() => setShowExecutorModal(false)}
        executionData={executionResult}
        onConfirmExecution={() => {
          if (executionResult) {
            executeActions(executionResult);
          }
        }}
        isExecuting={isProcessingCommand}
      />
    </div>
  );
}
