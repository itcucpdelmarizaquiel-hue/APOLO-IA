import { AppItem, Contact, PhoneNotification, AgendaItem, AlarmItem, MediaTrack, OfficeDocument, FriendLocation, ApoloPersona } from '../types';
import { apoloAvatar } from '../assets';

export const INITIAL_APPS: AppItem[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'multimedia',
    icon: 'PlaySquare',
    color: 'bg-red-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Vídeos, músicas e canais ao vivo'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'multimedia',
    icon: 'Film',
    color: 'bg-zinc-900 border border-cyan-500/40',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Vídeos curtos e tendências'
  },
  {
    id: 'office',
    name: 'Office Studio',
    category: 'productivity',
    icon: 'FileText',
    color: 'bg-blue-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Criação e edição de Docs, Planilhas e Slides'
  },
  {
    id: 'contacts',
    name: 'Contatos & Chamadas',
    category: 'social',
    icon: 'Users',
    color: 'bg-emerald-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Agenda telefônica e discador com voz'
  },
  {
    id: 'whatsapp',
    name: 'Mensagens / Zap',
    category: 'social',
    icon: 'MessageSquare',
    color: 'bg-green-600',
    isInstalled: true,
    isLocked: true,
    isOpen: false,
    description: 'Mensagens instantâneas e leitura falada'
  },
  {
    id: 'clock',
    name: 'Horas & Agenda',
    category: 'tools',
    icon: 'Clock',
    color: 'bg-amber-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Alarmes falados, tarefas e cronograma'
  },
  {
    id: 'music',
    name: 'Música & Spotify',
    category: 'multimedia',
    icon: 'Music',
    color: 'bg-emerald-500',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Player de áudio, downloads e identificador'
  },
  {
    id: 'gamer',
    name: 'Assistente Gamer',
    category: 'games',
    icon: 'Gamepad2',
    color: 'bg-violet-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Coach tático de gameplay e FPS analyzer'
  },
  {
    id: 'radar',
    name: 'Localização Amiga',
    category: 'tools',
    icon: 'MapPin',
    color: 'bg-teal-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Radar de amigos conectados com APOLO'
  },
  {
    id: 'security',
    name: 'Segurança & Bloqueio',
    category: 'system',
    icon: 'ShieldCheck',
    color: 'bg-indigo-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Bloqueio do celular, alarme e permissões'
  },
  {
    id: 'wiki',
    name: 'Wikipédia & IA',
    category: 'productivity',
    icon: 'BookOpen',
    color: 'bg-slate-700',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Enciclopédia global e respostas inteligentes'
  },
  {
    id: 'image_gen',
    name: 'Estúdio de Imagens',
    category: 'productivity',
    icon: 'Image',
    color: 'bg-pink-600',
    isInstalled: true,
    isLocked: false,
    isOpen: false,
    description: 'Gerador e editor de fotos com IA'
  }
];

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+258 84 123 4567',
    email: 'joao.silva@email.com',
    avatarColor: 'bg-blue-500',
    relationship: 'Trabalho / Colega',
    isFavorite: true
  },
  {
    id: '2',
    name: 'Maria Fernandes',
    phone: '+258 82 987 6543',
    email: 'maria.fernandes@email.com',
    avatarColor: 'bg-purple-500',
    relationship: 'Família / Irmã',
    isFavorite: true
  },
  {
    id: '3',
    name: 'Carlos Oliveira',
    phone: '+258 87 555 1212',
    email: 'carlos.oliveira@empresa.com',
    avatarColor: 'bg-emerald-500',
    relationship: 'Gestor de Projetos',
    isFavorite: false
  },
  {
    id: '4',
    name: 'Ana Costa',
    phone: '+258 84 888 9999',
    email: 'ana.costa@tech.mz',
    avatarColor: 'bg-rose-500',
    relationship: 'Amiga / Universidade',
    isFavorite: true
  }
];

export const INITIAL_NOTIFICATIONS: PhoneNotification[] = [
  {
    id: 'notif-1',
    appName: 'WhatsApp',
    sender: 'João Silva',
    message: 'Oi! Consegues me mandar os documentos do projeto hoje?',
    time: 'Há 5 minutos',
    isRead: false,
    priority: 'high'
  },
  {
    id: 'notif-2',
    appName: 'Agenda APOLO',
    sender: 'Lembrete Automático',
    message: 'Reunião de alinhamento com a equipa às 14:30.',
    time: 'Há 20 minutos',
    isRead: false,
    priority: 'normal'
  },
  {
    id: 'notif-3',
    appName: 'YouTube',
    sender: 'Tecnologia & Futuro',
    message: 'Novo vídeo: "Como a IA por voz está a transformar 2026".',
    time: 'Há 1 hora',
    isRead: true,
    priority: 'low'
  }
];

export const INITIAL_AGENDA: AgendaItem[] = [
  {
    id: 'agenda-1',
    title: 'Levar os documentos e relatórios assinados',
    time: '07:00',
    date: 'Amanhã',
    completed: false,
    category: 'trabalho',
    isOverdue: false
  },
  {
    id: 'agenda-2',
    title: 'Reunião com João sobre metas trimestrais',
    time: '09:00',
    date: 'Amanhã',
    completed: false,
    category: 'trabalho',
    isOverdue: false
  },
  {
    id: 'agenda-3',
    title: 'Comprar suprimentos e remédios',
    time: '18:00',
    date: 'Hoje',
    completed: true,
    category: 'pessoal',
    isOverdue: false
  },
  {
    id: 'agenda-4',
    title: 'Revisar código da aplicação APOLO',
    time: '11:00',
    date: 'Hoje',
    completed: false,
    category: 'estudos',
    isOverdue: true
  }
];

export const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-1',
    time: '06:30',
    label: 'Despertar Matinal',
    active: true,
    repeatDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex']
  },
  {
    id: 'alarm-2',
    time: '07:00',
    label: 'Hora de preparar documentos',
    active: true,
    repeatDays: ['Todos os dias']
  },
  {
    id: 'alarm-3',
    time: '22:30',
    label: 'Rotina de Sono & Relaxamento',
    active: false,
    repeatDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
  }
];

export const INITIAL_MEDIA_TRACKS: MediaTrack[] = [
  {
    id: 'track-1',
    title: 'Cyberpulse Synthwave (Original APOLO Theme)',
    artist: 'APOLO Audio Engine',
    duration: '3:45',
    type: 'music',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    subtitles: ['[Música Eletrônica Energética]', 'Sintetizadores harmônicos em progressão', 'Batida constante de 128 BPM']
  },
  {
    id: 'track-2',
    title: 'Guia Completo de Produtividade & IA por Voz',
    artist: 'Canal Tech Futuro',
    duration: '12:20',
    type: 'video',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
    subtitles: ['Olá a todos, bem-vindos ao guia.', 'Hoje vamos demonstrar o executor da APOLO.', 'Execução de tarefas em tempo recorde.']
  },
  {
    id: 'track-3',
    title: 'Midnight Jazz & Lo-Fi Lounge',
    artist: 'Acoustic Waves',
    duration: '4:10',
    type: 'music',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    subtitles: ['[Piano suave ao fundo]', 'Saxofone melódico relaxante']
  }
];

export const INITIAL_DOCUMENTS: OfficeDocument[] = [
  {
    id: 'doc-1',
    title: 'Relatório Executivo de Produtividade 2026',
    type: 'doc',
    updatedAt: 'Hoje, às 10:15',
    content: `# Relatório Executivo de Produtividade\n\n## 1. Sumário Executivo\nA implementação do APOLO IA assistente reduziu em 74% o tempo gasto em tarefas operacionais manuais de celular.\n\n## 2. Ações Automatizadas\n- Leitura e envio de mensagens por ditado de voz\n- Agendamento proativo de tarefas e lembretes\n- Gestão integrada de multimídia e documentos\n\n## 3. Conclusão\nO executor garante precisão e segurança com verificação multi-nível.`
  },
  {
    id: 'doc-2',
    title: 'Controle de Custos & Orçamento Mensal',
    type: 'sheet',
    updatedAt: 'Ontem, às 16:40',
    content: 'Planilha financeira consolidada',
    tableData: [
      ['Item', 'Categoria', 'Previsto (MT)', 'Realizado (MT)', 'Status'],
      ['Servidores Cloud', 'Infra', '12.000', '11.500', 'OK'],
      ['Equipamentos & Áudio', 'Hardware', '8.500', '8.200', 'OK'],
      ['Internet Fibra', 'Serviços', '3.500', '3.500', 'OK'],
      ['Total', 'Geral', '24.000', '23.200', 'Economia']
    ]
  },
  {
    id: 'doc-3',
    title: 'Apresentação do Projeto APOLO IA',
    type: 'slide',
    updatedAt: 'Há 2 dias',
    content: 'Pitch deck do assistente',
    slides: [
      { title: 'APOLO IA Assistente', points: ['Assistente orientado para linguagem oral', 'Executor autônomo com segurança multi-nível'] },
      { title: 'Arquitetura Integrada', points: ['Voz -> Motor IA -> Memória/Planejador -> Executor -> Celular & Apps'] },
      { title: 'Impacto Real', points: ['100% mãos livres', 'Integração completa com rotina diária'] }
    ]
  }
];

export const INITIAL_FRIENDS: FriendLocation[] = [
  {
    id: 'friend-1',
    name: 'Ana Costa',
    status: 'Online • No escritório',
    distanceKm: 1.4,
    battery: 88,
    latOffset: 0.012,
    lngOffset: -0.008,
    acceptedFriendship: true
  },
  {
    id: 'friend-2',
    name: 'João Silva',
    status: 'Em trânsito • Av. Principal',
    distanceKm: 3.8,
    battery: 62,
    latOffset: -0.018,
    lngOffset: 0.024,
    acceptedFriendship: true
  },
  {
    id: 'friend-3',
    name: 'Carlos Oliveira',
    status: 'Online • Em reunião',
    distanceKm: 5.2,
    battery: 95,
    latOffset: 0.035,
    lngOffset: 0.015,
    acceptedFriendship: true
  }
];

export const INITIAL_PERSONAS: ApoloPersona[] = [
  {
    id: 'voice-tech-cyborg',
    name: 'Narrador Cibernético Tech',
    tagline: 'Voz Grave, Tecnológica & Ritmada',
    category: 'tech',
    description: 'Voz impactante e confiante de narrativa tecnológica, documentários de computação e cyber security.',
    personality: 'Narrador tecnológico sofisticado, analítico, seguro e envolvente. Explica tecnologia e executa comandos com precisão de elite.',
    pitch: 0.85,
    rate: 1.02,
    gender: 'male',
    voiceName: 'Tech Cyborg Narrator',
    themeColor: 'from-cyan-500 to-blue-700',
    avatarGlow: 'bg-cyan-500',
    avatarIcon: 'Cpu',
    samplePhrase: 'O próximo vírus não precisava de declaração de amor, bastava abrir um documento do Word.',
    soundGreeting: 'Sistemas carregados. Sou o Narrador Cibernético Tech, pronto para processar suas ordens.'
  },
  {
    id: 'voice-viral-creator',
    name: 'Creator / Viral Redes Sociais',
    tagline: 'Voz Dinâmica, Persuasiva & Alto Impacto',
    category: 'viral',
    description: 'Aquela voz perfeita e ideal para mídias sociais, Reels, TikTok e vídeos de alto engajamento.',
    personality: 'Extremamente carismático, energético, rápido e focado em engajamento e tendências virais.',
    pitch: 1.05,
    rate: 1.15,
    gender: 'male',
    voiceName: 'Social Viral Creator',
    themeColor: 'from-fuchsia-500 to-rose-600',
    avatarGlow: 'bg-fuchsia-500',
    avatarIcon: 'Sparkles',
    samplePhrase: 'Aquela voz perfeita e ideal para mídias sociais, você acaba de encontrar aqui! Use e abuse desta voz para viralizar.',
    soundGreeting: 'Fala criador! A voz ideal para bombar nas suas redes sociais está pronta. O que vamos criar hoje?'
  },
  {
    id: 'voice-viral-commercial',
    name: 'Locutor Comercial & Impacto',
    tagline: 'Voz Promocional & Chamadas Virais',
    category: 'viral',
    description: 'Voz expressiva para chamadas de ação, dicas rápidas, comerciais e conversão direta.',
    personality: 'Persuasivo, focado em resultados, direto e dinâmico.',
    pitch: 1.08,
    rate: 1.12,
    gender: 'male',
    voiceName: 'Commercial Impact Engine',
    themeColor: 'from-amber-500 to-orange-600',
    avatarGlow: 'bg-amber-500',
    avatarIcon: 'Zap',
    samplePhrase: 'Dica número um: use esta voz para viralizar. Dica número dois: use e abuse!',
    soundGreeting: 'Pronto para o próximo nível! Locutor de alto impacto conectado para impulsionar suas tarefas.'
  },
  {
    id: 'voice-cinema-monarch',
    name: 'Monarca & Cinema Épico',
    tagline: 'Voz Profunda, Cavernosa & Solene',
    category: 'cinema',
    description: 'Voz ultra grave de trailer de cinema, narrativas de fantasia, reinos lendários e ficção científica imersiva.',
    personality: 'Imponente, solene, lendário, profundo e teatral. Conduz respostas com peso cinematográfico épico.',
    pitch: 0.68,
    rate: 0.88,
    gender: 'male',
    voiceName: 'Deep Cinematic Monarch',
    themeColor: 'from-red-600 to-amber-900',
    avatarGlow: 'bg-red-700',
    avatarIcon: 'Shield',
    samplePhrase: 'Além dos mares de gelo escuro, onde a luz jamais ousa tocar, ergue-se a fortaleza de pedra. Lá, o monarca imortal aguarda o fim de todas as eras.',
    soundGreeting: 'Das profundezas do silêncio, a fortaleza atende ao seu chamado. Diga sua vontade.'
  },
  {
    id: 'voice-audiobook-doc',
    name: 'Narrador de Audiobook & Doc',
    tagline: 'Voz Suave, Articulada & Confortável',
    category: 'audiobook',
    description: 'Perfeita para leitura longa de livros, matérias, notícias e documentários com dicção impecável.',
    personality: 'Elegante, calmo, didático e acolhedor. Torna qualquer leitura leve, agradável e informativa.',
    pitch: 0.94,
    rate: 1.02,
    gender: 'male',
    voiceName: 'Audiobook Documentary Master',
    themeColor: 'from-emerald-500 to-teal-700',
    avatarGlow: 'bg-emerald-600',
    avatarIcon: 'BookOpen',
    samplePhrase: 'A leitura dos seus livros ficará muito mais atrativa e leve. Esta voz se encaixa perfeitamente para audiobooks, narrações de documentários e notícias.',
    soundGreeting: 'Olá. Seja para explorar um novo livro ou organizar seu dia com serenidade, estou à sua disposição.'
  },
  {
    id: 'voice-poetic-drama',
    name: 'Voz Poética & Dramática',
    tagline: 'Emotiva, Reflexiva & Inspiradora',
    category: 'drama',
    description: 'Tom profundo e poético que toca o coração, ideal para reflexões, histórias tocantes e motivação pessoal.',
    personality: 'Sensível, poético, reflexivo e empático. Responde com profundidade emocional e clareza de pensamento.',
    pitch: 0.86,
    rate: 0.90,
    gender: 'male',
    voiceName: 'Poetic Dramatic Voice',
    themeColor: 'from-indigo-500 to-purple-800',
    avatarGlow: 'bg-indigo-600',
    avatarIcon: 'Heart',
    samplePhrase: 'As lembranças, as marcas, a dor, todas as sombras foram esquecidas, e o recomeço inicia como o vento que vem pela manhã, trazendo esperança e glória.',
    soundGreeting: 'Um novo horizonte se abre. Estou aqui para guiar suas palavras e seus caminhos com propósito.'
  },
  {
    id: 'voice-fairytale-story',
    name: 'Contadora de Histórias & Contos',
    tagline: 'Voz Doce, Expressiva & Encantadora',
    category: 'story',
    description: 'Voz feminina suave e expressiva para contar fábulas, contos infantis, aventuras mágicas e entretenimento.',
    personality: 'Carinhosa, expressiva, lúdica e imaginativa. Dá vida a personagens e torna qualquer aprendizado divertido.',
    pitch: 1.25,
    rate: 1.02,
    gender: 'female',
    voiceName: 'Fairytale Storyteller (Female)',
    themeColor: 'from-pink-400 to-purple-600',
    avatarGlow: 'bg-pink-500',
    avatarIcon: 'Sparkles',
    samplePhrase: 'Era uma vez João e Maria. Abandonados na floresta, encontraram uma casa feita de doces e uma bruxa muito perigosa. Será que eles escaparam?',
    soundGreeting: 'Olá! Que magia vamos descobrir hoje? Estou prontinha para contar histórias e te ajudar em tudo!'
  },
  {
    id: 'adam-voice-natural',
    name: 'Adam (Voz Humana Conectiva)',
    tagline: 'Voz Natural Realista • Feels Real & Sounds Human',
    category: 'human',
    description: 'Pacote vocal Adam: caloroso, confiante, expressivo e empático. Soe verdadeiramente humano e conecte em cada resposta.',
    personality: 'Voz humana natural, realista, empática, inteligente e conversacional. Responde a qualquer questão com clareza, profundidade e naturalidade.',
    pitch: 0.95,
    rate: 1.05,
    gender: 'male',
    voiceName: 'Adam (Natural Human Voice Engine)',
    themeColor: 'from-amber-500 to-indigo-600',
    avatarGlow: 'bg-indigo-500',
    avatarIcon: 'Mic',
    avatarImage: apoloAvatar,
    samplePhrase: "Hey, Adam here. Let's create something that feels real, sounds human, and connects every time.",
    soundGreeting: 'Olá! Aqui é o Adam com o APOLO. Vamos criar algo que pareça real, soe humano e conecte de verdade. Como posso te ajudar hoje?'
  },
  {
    id: 'apolo-core',
    name: 'APOLO Core (Original)',
    tagline: 'Inteligência Artificial Pura & Holográfica',
    category: 'tech',
    description: 'Formal, preciso, extremamente veloz e focado em produtividade máxima.',
    personality: 'Formal, preciso, veloz e focado em produtividade máxima.',
    pitch: 1.0,
    rate: 1.05,
    gender: 'male',
    voiceName: 'Voz Sintetizada Futurista',
    themeColor: 'from-indigo-600 to-cyan-500',
    avatarGlow: 'bg-indigo-600',
    avatarIcon: 'Cpu',
    avatarImage: apoloAvatar,
    samplePhrase: 'Sistema APOLO inicializado com parâmetros operacionais nominais. Aguardando diretrizes.',
    soundGreeting: 'Olá! Sou o APOLO, o seu assistente pessoal orientado por voz. Como posso ajudar agora?'
  },
  {
    id: 'cyberpunk-nova',
    name: 'Nova Cyberpunk',
    tagline: 'Agente Tático Cibernético 2077',
    category: 'gaming',
    description: 'Direta, afiada, focada em segurança, hacks rápidos e diagnóstico de sistemas.',
    personality: 'Direta, afiada, focada em segurança e diagnóstico de sistemas.',
    pitch: 1.15,
    rate: 1.1,
    gender: 'female',
    voiceName: 'Voz Sintética Cristalina',
    themeColor: 'from-fuchsia-600 to-cyan-400',
    avatarGlow: 'bg-fuchsia-600',
    avatarIcon: 'Zap',
    samplePhrase: 'Firewall ativo, criptografia militar engajada. Protocolo Cyberpunk liberado.',
    soundGreeting: 'Sistemas online. Agente Nova pronta para escanear a rede e executar ordens táticas.'
  },
  {
    id: 'anime-sensei',
    name: 'Sensei Kaito',
    tagline: 'Mestre Sábio & Estrategista de Anime',
    category: 'human',
    description: 'Calmo, reflexivo, inspirador e com conselhos filosóficos sobre rotina e foco.',
    personality: 'Calmo, reflexivo, inspirador e com conselhos filosóficos.',
    pitch: 0.85,
    rate: 0.95,
    gender: 'male',
    voiceName: 'Voz Serena e Profunda',
    themeColor: 'from-amber-600 to-rose-500',
    avatarGlow: 'bg-amber-600',
    avatarIcon: 'Compass',
    samplePhrase: 'A verdadeira vitória é dominar a própria mente antes do campo de batalha.',
    soundGreeting: 'Saudações, jovem guerreiro. Respire fundo; juntos organizaremos a sua jornada hoje.'
  },
  {
    id: 'jarvis-executive',
    name: 'Jarvis Executivo',
    tagline: 'Mordomo Digital & Gestor Corporativo',
    category: 'executive',
    description: 'Impecavelmente polido, cortês, antecipa necessidades e gerencia a agenda com perfeição.',
    personality: 'Impecavelmente polido, cortês, antecipa necessidades com perfeição.',
    pitch: 0.92,
    rate: 1.0,
    gender: 'male',
    voiceName: 'Voz Britânica Refinada',
    themeColor: 'from-slate-700 to-blue-900',
    avatarGlow: 'bg-slate-700',
    avatarIcon: 'Briefcase',
    samplePhrase: 'Todos os seus relatórios e compromissos foram organizados com máxima discrição.',
    soundGreeting: 'Muito bom dia, senhor. Toda a sua agenda e controles do dispositivo estão sob meu comando.'
  }
];

export const PRESET_AVATARS = [
  {
    id: 'avatar-original',
    name: 'APOLO Holographic Core',
    category: 'Original',
    url: apoloAvatar
  },
  {
    id: 'avatar-cyborg-tech',
    name: 'Cyborg Neon Android',
    category: 'Tech / IA',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-human-adam',
    name: 'Adam Realistic Companion',
    category: 'Humano',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-epic-monarch',
    name: 'Lord Monarca Imperial',
    category: 'Épico',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-fairytale-story',
    name: 'Luna Fairy Oracle',
    category: 'Fantasia',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-creator-viral',
    name: 'Cyberpunk Creator Pulse',
    category: 'Viral',
    url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'avatar-golden-sphere',
    name: 'Neural Quantum Nexus',
    category: 'Futurista',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&auto=format&fit=crop&q=80'
  }
];

export const APOLO_PERSONAS = INITIAL_PERSONAS;
export const INITIAL_MEDIA = INITIAL_MEDIA_TRACKS;
export const INITIAL_OFFICE_DOCS = INITIAL_DOCUMENTS;
