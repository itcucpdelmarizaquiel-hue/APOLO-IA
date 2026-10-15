import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Palette, 
  Sparkles, 
  Download, 
  Wand2, 
  Sliders, 
  Layers, 
  Video, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  FlipHorizontal, 
  Sun, 
  Contrast, 
  Maximize2, 
  Film, 
  Camera, 
  Clock, 
  Upload, 
  Check, 
  Share2, 
  Volume2, 
  Eye, 
  Zap, 
  Scissors,
  Bookmark,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  User,
  Trash2
} from 'lucide-react';
import { voiceService } from '../services/voice';
import type { GeneratedAsset } from '../types';
type StudioTab = 'generate-image' | 'edit-image' | 'generate-video' | 'prompt-library';

const STUDIO_HISTORY_STORAGE_KEY = 'apolo_image_studio_history';
const MAX_PERSISTED_HISTORY_ITEMS = 30;

interface ImageStudioProps {
  mode?: 'images' | 'video';
}

const PRESET_PROMPTS = [
  {
    category: 'Cyberpunk & Sci-Fi',
    title: 'Metrópole Cyberpunk com Carros Voadores',
    prompt: 'Uma metrópole futurista hiper-detalhada à noite sob chuva leve, arranha-céus colossais iluminados por hologramas neon em ciano e magenta, carros voadores cruzando avenidas aéreas, reflexos realistas no asfalto molhado.',
    style: 'Holográfico Sci-Fi Cyberpunk',
    lighting: 'Neon Cyberpunk',
    cameraAngle: 'Grande Angular 24mm'
  },
  {
    category: 'Fotorrealismo 8K',
    title: 'Retrato de Androide com Olhos Biônicos',
    prompt: 'Retrato em close-up de um androide de alta precisão com acabamento em cerâmica branca e titânio polido, circuitos bioluminescentes sutis sob a pele sintética, olhos biônicos com íris mecânica reflexiva, iluminação de estúdio suave.',
    style: 'Fotorealista 8K / DSLR',
    lighting: 'Estúdio Softbox Suave',
    cameraAngle: 'Retrato 85mm Bokeh'
  },
  {
    category: 'Natureza & Espaço',
    title: 'Aurora Boreal em Paisagem Cósmica',
    prompt: 'Paisagem épica com montanhas cristalinas refletindo uma aurora boreal esmeralda e violeta, céu estrelado com a Via Láctea e luas gigantescas no horizonte, água cristalina com neblina mística.',
    style: 'Cinemático Hollywood',
    lighting: 'Luz Noturna Dramática',
    cameraAngle: 'Vista Aérea Drone'
  },
  {
    category: 'Render 3D & Games',
    title: 'Armadura Samurai Tecnológica',
    prompt: 'Conceito de armadura samurai com exoesqueleto robótico de fibra de carbono e placas de ouro polido, katana com lâmina de plasma azul acesa, partículas de faíscas no ar, render 3D em Unreal Engine 5.',
    style: 'Render 3D Octane / Unreal 5',
    lighting: 'Luz Volumétrica de Cinema',
    cameraAngle: 'Ângulo Baixo Heróico'
  }
];

const DEFAULT_HISTORY: GeneratedAsset[] = [
  {
    id: 'h1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=90',
    prompt: 'Metrópole futurista com luzes neon e assistente holográfico',
    style: 'Fotorealista 8K',
    aspectRatio: '16:9',
    createdAt: 'Hoje às 11:20'
  },
  {
    id: 'h2',
    type: 'video',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    prompt: 'Câmera lenta épica de um carro futurista acelerando sob chuva de neon',
    style: 'Cinemática 8K',
    aspectRatio: '16:9',
    createdAt: 'Hoje às 11:15'
  }
];
export const ImageStudio: React.FC<ImageStudioProps> = ({ mode = 'images' }) => {
  const [activeTab, setActiveTab] = useState<StudioTab>(mode === 'video' ? 'generate-video' : 'generate-image');
  
  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('Metrópole futurista com luzes neon e assistente holográfico');
  const [imageStyle, setImageStyle] = useState('Fotorealista 8K / DSLR');
  const [imageAspectRatio, setImageAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [lighting, setLighting] = useState('Luz Volumétrica de Cinema');
  const [cameraAngle, setCameraAngle] = useState('Grande Angular 24mm');
  const [detailLevel, setDetailLevel] = useState(90);
  const [aiEngine, setAiEngine] = useState<'flux' | 'flux-realism' | 'flux-3d' | 'flux-anime' | 'turbo'>('flux');
  const [strictAdherence, setStrictAdherence] = useState(true);
  const [negativePrompt, setNegativePrompt] = useState('deformidades, baixa qualidade, texto borrado, artefatos, membros extras');
  const [characterReference, setCharacterReference] = useState('');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [lastTranslatedPrompt, setLastTranslatedPrompt] = useState<string>('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const [currentImage, setCurrentImage] = useState(
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=90'
  );

  // Image Edit State
  const [editPrompt, setEditPrompt] = useState('Adicionar reflexos de neon azul e chuva suave');
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [blur, setBlur] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('normal');
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video Generation State
  const [videoPrompt, setVideoPrompt] = useState('Câmera lenta épica de um carro futurista acelerando sob chuva de neon');
  const [videoStyle, setVideoStyle] = useState('Cinemática 8K');
  const [videoMotion, setVideoMotion] = useState('Travelling Dinâmico');
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoResolution, setVideoResolution] = useState('1080p');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    title: 'Cena Cinemática Sci-Fi',
    storyboard: null as any
  });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoPlaybackSpeed, setVideoPlaybackSpeed] = useState(1.0);
  const [videoOverlayText, setVideoOverlayText] = useState('APOLO CINEMA IA');
  const [showVideoOverlay, setShowVideoOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Asset History
  const [history, setHistory] = useState<GeneratedAsset[]>(loadStoredHistory);
  const [unavailableAssetIds, setUnavailableAssetIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const persistableHistory = history
      .filter((asset) => isPersistableUrl(asset.url))
      .slice(0, MAX_PERSISTED_HISTORY_ITEMS)
      .map((asset) => ({
        ...asset,
        poster: isPersistableUrl(asset.poster) ? asset.poster : undefined
      }));

    try {
      window.localStorage.setItem(
        STUDIO_HISTORY_STORAGE_KEY,
        JSON.stringify(persistableHistory)
      );
    } catch (error) {
      // Large data URLs and private browsing can exceed localStorage limits.
      // Keep the gallery usable and preserve as many recent items as possible.
      let saved = false;
      for (let count = persistableHistory.length - 1; count >= 0 && !saved; count -= 1) {
        try {
          window.localStorage.setItem(
            STUDIO_HISTORY_STORAGE_KEY,
            JSON.stringify(persistableHistory.slice(0, count))
          );
          saved = true;
        } catch {
          // Try again with fewer items.
        }
      }
      if (!saved) {
        console.warn('Não foi possível persistir o histórico do Estúdio Visual:', error);
      }
    }
  }, [history]);

  const removeHistoryAsset = (assetId: string) => {
    setHistory((previousHistory) => previousHistory.filter((asset) => asset.id !== assetId));
    setUnavailableAssetIds((previousIds) => {
      const nextIds = new Set(previousIds);
      nextIds.delete(assetId);
      return nextIds;
    });
  };

  const markAssetAsUnavailable = (assetId: string) => {
    setUnavailableAssetIds((previousIds) => {
      if (previousIds.has(assetId)) {
        return previousIds;
      }
      return new Set(previousIds).add(assetId);
    });
  };

  const STYLES_IMAGE = [
    'Fotorealista',
    'Cinemático',
    'Ilustração',
    'Anime'
  ];

  const LIGHTING_OPTIONS = [
    'Luz Volumétrica de Cinema',
    'Golden Hour (Pôr do Sol)',
    'Neon Cyberpunk',
    'Estúdio Softbox Suave',
    'Luz Noturna Dramática',
    'Luz Solar Natural'
  ];

  const CAMERA_ANGLES = [
    'Grande Angular 24mm',
    'Retrato 85mm Bokeh',
    'Vista Aérea Drone',
    'Macro Detalhes',
    'Ângulo Baixo Heróico'
  ];

  const ASPECT_RATIOS = [
    { label: '16:9 Widescreen', value: '16:9' },
    { label: '1:1 Quadrado', value: '1:1' },
    { label: '9:16 Stories/Reels', value: '9:16' },
    { label: '4:3 Fotografia', value: '4:3' },
    { label: '3:4 Retrato', value: '3:4' }
  ];

  const VIDEO_MOTIONS = [
    'Travelling Dinâmico',
    'Panorâmica Suave (Pan)',
    'Zoom In Cinemático',
    'Drone Orbit 360°',
    'Câmera Lenta Épica',
    'Hyperlapse Noturno'
  ];

  const FILTERS = [
    { id: 'normal', name: 'Normal', filterStyle: 'none' },
    { id: 'cyberpunk', name: 'Cyber Neon', filterStyle: 'hue-rotate(290deg) saturate(160%) contrast(120%)' },
    { id: 'cinema', name: 'Cinema 35mm', filterStyle: 'sepia(30%) contrast(125%) saturate(120%)' },
    { id: 'noir', name: 'Film Noir', filterStyle: 'grayscale(100%) contrast(150%)' },
    { id: 'vivid', name: 'Vivid HDR', filterStyle: 'saturate(180%) contrast(115%)' },
    { id: 'warm', name: 'Golden Warm', filterStyle: 'sepia(45%) hue-rotate(-20deg) saturate(140%)' }
  ];

  // 1. AI Prompt Enhancer
  const handleEnhancePrompt = async () => {
    if (!imagePrompt.trim()) return;
    setIsEnhancingPrompt(true);
    setGenerationError('');
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: imageStyle,
          lighting,
          cameraAngle,
          characterReference
        })
      });
      const data = await res.json();
      if (data.enhancedPromptPt) {
        setImagePrompt(data.enhancedPromptPt);
        voiceService.playChime('success');
        voiceService.speak('Prompt refinado com parâmetros de alta precisão e iluminação cinematográfica.');
      } else if (data.error) {
        setGenerationError(data.error);
      }
    } catch (err) {
      console.error('Enhance error:', err);
      setGenerationError('Não foi possível aprimorar o prompt agora. Você pode gerar a imagem com o texto atual.');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // 2. Generate Image via Backend
  const handleGenerateImage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!imagePrompt.trim()) return;

    setIsGeneratingImage(true);
    setGenerationError('');
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          style: imageStyle,
          aspectRatio: imageAspectRatio,
          imageSize,
          lighting,
          cameraAngle,
          engine: aiEngine,
          strictAdherence,
          negativePrompt,
          detailLevel,
          characterReference,
          seed: customSeed ? Number(customSeed) : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'O motor não conseguiu gerar a imagem.');
      }
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
        if (data.translatedPrompt) {
          setLastTranslatedPrompt(data.translatedPrompt);
        }
        if (data.seed !== undefined) {
          setCustomSeed(String(data.seed));
        }
        const newAsset: GeneratedAsset = {
          id: `img_${Date.now()}`,
          type: 'image',
          url: data.imageUrl,
          prompt: imagePrompt,
          style: `${imageStyle} (${aiEngine.toUpperCase()})`,
          aspectRatio: imageAspectRatio,
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setHistory(prev => [newAsset, ...prev]);
        voiceService.playChime('success');
        voiceService.speak('Imagem gerada seguindo estritamente todas as instruções do prompt.');
      }
    } catch (err) {
      console.error('Generate image error:', err);
      setGenerationError(err instanceof Error ? err.message : 'Não foi possível gerar a imagem. Tente novamente.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 3. AI Image Edit / Inpaint
  const handleApplyAIEdit = async () => {
    if (!editPrompt.trim()) return;
    setIsEditingImage(true);
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editPrompt,
          editInstruction: editPrompt,
          base64Image: currentImage.startsWith('data:') ? currentImage : undefined,
          style: imageStyle,
          aspectRatio: imageAspectRatio
        })
      });

      const data = await res.json();
      if (data.imageUrl) {
        setCurrentImage(data.imageUrl);
        voiceService.playChime('success');
        voiceService.speak('Transformação visual e edição aplicadas com sucesso.');
      }
    } catch (err) {
      console.error('Edit image error:', err);
    } finally {
      setIsEditingImage(false);
    }
  };

  // 4. Video Generation
  const handleGenerateVideo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!videoPrompt.trim()) return;

    setIsGeneratingVideo(true);
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt,
          style: videoStyle,
          motionType: videoMotion,
          duration: videoDuration,
          resolution: videoResolution,
          characterReference
        })
      });

      const data = await res.json();
      if (data.videoUrl) {
        setCurrentVideo({
          url: data.videoUrl,
          poster: data.posterUrl,
          title: data.storyboard?.title || 'Vídeo Gerado por IA',
          storyboard: data.storyboard
        });

        const newAsset: GeneratedAsset = {
          id: `vid_${Date.now()}`,
          type: 'video',
          url: data.videoUrl,
          poster: data.posterUrl,
          prompt: videoPrompt,
          style: videoStyle,
          aspectRatio: '16:9',
          createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          storyboard: data.storyboard
        };
        setHistory(prev => [newAsset, ...prev]);

        voiceService.playChime('success');
        voiceService.speak('Clipe de vídeo gerado e renderizado com movimento de câmera cinemático.');
      }
    } catch (err) {
      console.error('Video generation error:', err);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Upload image handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCurrentImage(ev.target.result as string);
          setActiveTab('edit-image');
          voiceService.playChime('confirm');
          voiceService.speak('Imagem carregada no estúdio de edição.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Download Image
  const handleDownloadImage = () => {
    voiceService.playChime('confirm');
    const a = document.createElement('a');
    a.href = currentImage;
    a.download = `apolo_creation_${Date.now()}.png`;
    a.target = '_blank';
    a.click();
  };

  // Reset Filters
  const handleResetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setBlur(0);
    setSelectedFilter('normal');
    setRotation(0);
    setFlipH(false);
    voiceService.playChime('confirm');
  };

  // Toggle Video Playback
  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  return (
    <div id="image-studio-module" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 border border-fuchsia-400/40 text-white shadow-lg shadow-fuchsia-600/30">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-black text-white tracking-tight">
                 {mode === 'video' ? 'Gerador de Vídeos IA' : 'Estúdio de Imagens IA'}
               </h2>
              <span className="text-[10px] font-mono font-bold uppercase bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-2 py-0.5 rounded-full">
                Alta Precisão • Imagen 3 & Veo
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Criação e edição profissional de imagens e vídeos ultra-realistas com controle de iluminação, lentes e câmera
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {mode === 'images' && <button
            onClick={() => setActiveTab('generate-image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'generate-image'
                ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" /> Criar Imagem
          </button>}
          {mode === 'images' && <button
            onClick={() => setActiveTab('edit-image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'edit-image'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" /> Editar & Retocar
          </button>}
          <button
            onClick={() => setActiveTab('generate-video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'generate-video'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" /> Gerador de Vídeos
          </button>
          {mode === 'images' && <button
            onClick={() => setActiveTab('prompt-library')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'prompt-library'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Ideias & Presets
          </button>}
        </div>
      </div>

      {/* TAB 1: GENERATE IMAGE */}
      {activeTab === 'generate-image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleGenerateImage} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> Descreva exatamente o que deseja criar:
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancingPrompt}
                    className="text-[11px] font-semibold text-fuchsia-300 hover:text-fuchsia-200 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className="w-3 h-3" /> {isEnhancingPrompt ? 'Refinando...' : '✨ Aprimorar Prompt com IA'}
                  </button>
                </div>
                <textarea
                  id="image-prompt-input"
                  rows={3}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Ex: Uma casa de madeira na floresta com cachorro da raça labrador correndo na grama, luz do pôr do sol..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500 transition-colors"
                />

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                    <User className="h-3.5 w-3.5 text-cyan-400" /> Personagem conhecido (opcional)
                  </label>
                  <input
                    value={characterReference}
                    onChange={(e) => setCharacterReference(e.target.value)}
                    placeholder="Ex.: Naruto Uzumaki, Darth Vader, Wednesday Addams..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                  <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
                    A IA tenta reconhecer traços canônicos de personagens de filmes, séries, animes e jogos: rosto, cabelo, roupa, cores, acessórios e silhueta.
                  </p>
                </div>

                {/* Quick Modification Tag Pills */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {[
                    '+ 8K UHD',
                    '+ Foco Nítido DSLR',
                    '+ Luz Volumétrica',
                    '+ Render Octane 3D',
                    '+ Close-up Detalhado',
                    '+ Cores Vivas'
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (!imagePrompt.includes(tag)) {
                          setImagePrompt(prev => `${prev.trim()}, ${tag.replace('+ ', '')}`);
                        }
                      }}
                      className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-fuchsia-500/40 px-2 py-0.5 rounded-md transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motor de IA & Fidelidade Estrita */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Motor de IA (Generative Engine):
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.2 rounded font-mono">
                    Fidelidade Estrita Ativa
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'flux', label: 'Automático' },
                    { id: 'flux-realism', label: 'Fotorealista' },
                    { id: 'flux-anime', label: 'Ilustração / Anime' }
                  ].map((engine) => (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => setAiEngine(engine.id as any)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-medium text-left truncate transition-all cursor-pointer ${
                        aiEngine === engine.id
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {engine.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-300">Seguir à risca cada palavra da instrução:</span>
                  <button
                    type="button"
                    onClick={() => setStrictAdherence(!strictAdherence)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                      strictAdherence 
                        ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {strictAdherence ? '✓ Ativado (Literal)' : 'Livre / Criativo'}
                  </button>
                </div>

                <div className="pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                    <span>Nível de detalhe</span>
                    <span className="font-mono text-amber-300">{detailLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={detailLevel}
                    onChange={(e) => setDetailLevel(Number(e.target.value))}
                    className="w-full accent-amber-500"
                    aria-label="Nível de detalhe"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdvancedSettings((current) => !current)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 text-left hover:border-fuchsia-500/40 transition-colors cursor-pointer"
                aria-expanded={showAdvancedSettings}
              >
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-fuchsia-400" />
                  Configurações avançadas
                </span>
                <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${showAdvancedSettings ? 'rotate-90' : ''}`} />
              </button>

              {showAdvancedSettings && <div className="space-y-4">
              {/* Estilos */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Estilo Visual Artístico:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {STYLES_IMAGE.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setImageStyle(s)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-left truncate transition-all cursor-pointer ${
                        imageStyle === s
                          ? 'bg-fuchsia-600 text-white font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Proporção & Resolução */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Proporção (Aspect Ratio):
                  </label>
                  <select
                    value={imageAspectRatio}
                    onChange={(e) => setImageAspectRatio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    {ASPECT_RATIOS.map((ar) => (
                      <option key={ar.value} value={ar.value}>
                        {ar.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Resolução & Qualidade:
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    <option value="1K">1K HD (1024x1024)</option>
                    <option value="2K">2K Quad HD (2048x2048)</option>
                    <option value="4K">4K Ultra HD (4096x4096)</option>
                  </select>
                </div>
              </div>

              {/* Iluminação & Lente */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Iluminação:
                  </label>
                  <select
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    {LIGHTING_OPTIONS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Lente / Câmera:
                  </label>
                  <select
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-fuchsia-500"
                  >
                    {CAMERA_ANGLES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prompt Negativo & Semente (Seed) */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-1">
                    Prompt Negativo (O que EVITAR):
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Ex: deformidades, baixa qualidade, borrão, texto"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
                      Semente (Seed Fixa):
                    </label>
                    <input
                      type="number"
                      value={customSeed}
                      onChange={(e) => setCustomSeed(e.target.value)}
                      placeholder="Aleatória"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-fuchsia-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCustomSeed(String(Math.floor(Math.random() * 9999999)))}
                    className="mt-4 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    🎲 Sortear
                  </button>
                </div>
              </div>
              </div>}

              {generationError && (
                <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-200">
                  <Info className="w-4 h-4 mt-0.5 shrink-0 text-rose-400" />
                  <div>
                    <strong className="block text-rose-300">Geração não concluída</strong>
                    <span>{generationError}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isGeneratingImage}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-fuchsia-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Renderizando com Fidelidade Estrita...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Gerar Imagem com Alta Precisão
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Preview Canvas */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center group">
              {isGeneratingImage ? (
                <div className="flex flex-col items-center gap-3 text-fuchsia-400 p-6 text-center">
                  <div className="p-4 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/30 animate-pulse">
                    <Sparkles className="w-10 h-10 animate-spin text-fuchsia-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Sintetizando Arte Visual com Fidelidade Estrita</h4>
                    <p className="text-xs text-slate-400 mt-1">Traduzindo semântica exata, calculando iluminação e texturas 8K...</p>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={currentImage}
                    alt="Arte Visual Gerada"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between">
                    <span className="text-xs text-white font-medium bg-black/60 px-3 py-1 rounded-lg backdrop-blur-sm">
                      {imageStyle} • {imageAspectRatio}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('edit-image');
                          voiceService.playChime('confirm');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Scissors className="w-3.5 h-3.5" /> Editar Imagem
                      </button>
                      <button
                        onClick={handleDownloadImage}
                        className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Translated / Technical Prompt Audit */}
            {lastTranslatedPrompt && (
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3 h-3" /> Prompt Técnico em Inglês (Auditoria de Precisão):
                  </span>
                  <span className="font-mono text-slate-500">Seed: {customSeed || 'auto'}</span>
                </div>
                <p className="text-slate-300 font-mono text-[11px] leading-relaxed break-words bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                  {lastTranslatedPrompt}
                </p>
              </div>
            )}

            {/* Visual Metadata Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Motor de IA:</span>
                <strong className="text-amber-400 uppercase font-mono block">{aiEngine}</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Iluminação:</span>
                <strong className="text-slate-200 truncate block">{lighting}</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Câmera:</span>
                <strong className="text-slate-200 truncate block">{cameraAngle}</strong>
              </div>
              <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block">Resolução:</span>
                <strong className="text-emerald-400 font-mono block">{imageSize} ({imageAspectRatio})</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EDIT & RETOUCH IMAGE */}
      {activeTab === 'edit-image' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Edit Tools */}
          <div className="lg:col-span-5 space-y-4">
            {/* AI Inpainting / Modification Prompt */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" /> Instrução de Edição por IA:
                </label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] font-semibold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" /> Enviar Foto
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <textarea
                rows={2}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Ex: Mudar as cores para tons quentes dourados, adicionar óculos futuristas..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                onClick={handleApplyAIEdit}
                disabled={isEditingImage}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isEditingImage ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Aplicando Transformação...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" /> Executar Edição com IA
                  </>
                )}
              </button>
            </div>

            {/* Realtime Image Retouch Controls */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" /> Ajustes em Tempo Real
                </h3>
                <button
                  onClick={handleResetFilters}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" /> Restaurar
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> Brilho:</span>
                    <span className="font-mono text-slate-400">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Contrast className="w-3 h-3 text-cyan-400" /> Contraste:</span>
                    <span className="font-mono text-slate-400">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Palette className="w-3 h-3 text-fuchsia-400" /> Saturação:</span>
                    <span className="font-mono text-slate-400">{saturate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturate}
                    onChange={(e) => setSaturate(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              {/* Preset Filters */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Filtros Cinematográficos:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      className={`px-2 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                        selectedFilter === f.id
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotate & Flip */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                <button
                  onClick={() => setRotation((prev) => (prev - 90) % 360)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> -90°
                </button>
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="flex-1 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" /> +90°
                </button>
                <button
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`flex-1 py-1.5 rounded-xl border text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                    flipH
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" /> Espelhar
                </button>
              </div>
            </div>
          </div>

          {/* Edit Canvas Preview */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center">
              <img
                src={currentImage}
                alt="Edição Visual"
                referrerPolicy="no-referrer"
                style={{
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) ${
                    FILTERS.find((f) => f.id === selectedFilter)?.filterStyle !== 'none'
                      ? FILTERS.find((f) => f.id === selectedFilter)?.filterStyle
                      : ''
                  }`,
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  transition: 'filter 0.2s ease, transform 0.3s ease'
                }}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Filtro Ativo: <strong className="text-indigo-300">{FILTERS.find(f => f.id === selectedFilter)?.name}</strong>
              </span>
              <button
                onClick={handleDownloadImage}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" /> Baixar Imagem Editada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GENERATE VIDEO (Veo 2 & Video AI) */}
      {activeTab === 'generate-video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Video Controls */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleGenerateVideo} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
                  <Film className="w-3.5 h-3.5 text-rose-400" /> Descreva a cena e ação do vídeo:
                </label>
                <textarea
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Ex: Câmera lenta épica de um carro futurista acelerando sob chuva de neon com reflexos de água..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                  <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                    <User className="h-3.5 w-3.5 text-cyan-400" /> Personagem ou universo visual
                  </label>
                  <input
                    value={characterReference}
                    onChange={(e) => setCharacterReference(e.target.value)}
                    placeholder="Ex.: Goku em uma transformação específica, Geralt de Rívia..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                  <p className="mt-1.5 text-[10px] leading-relaxed text-slate-400">
                    Informe o nome e, se quiser, a versão, traje ou transformação para orientar o storyboard e a continuidade do vídeo.
                  </p>
                </div>
              </div>

              {/* Movimento de Câmera */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Movimento de Câmera (Motion Dynamics):
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {VIDEO_MOTIONS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setVideoMotion(m)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-left truncate transition-all cursor-pointer ${
                        videoMotion === m
                          ? 'bg-rose-600 text-white font-bold shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duração & Resolução */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Duração do Clipe:
                  </label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value={3}>3 Segundos (Short)</option>
                    <option value={5}>5 Segundos (Padrão)</option>
                    <option value={10}>10 Segundos (Cinemático)</option>
                    <option value={15}>15 Segundos (Trailer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Resolução de Vídeo:
                  </label>
                  <select
                    value={videoResolution}
                    onChange={(e) => setVideoResolution(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="720p">720p HD</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="4k">4K Ultra Cinema</option>
                  </select>
                </div>
              </div>

              {/* Legenda Overlay */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Texto de Título no Vídeo (Overlay):
                </label>
                <input
                  type="text"
                  value={videoOverlayText}
                  onChange={(e) => setVideoOverlayText(e.target.value)}
                  placeholder="Título cinematográfico..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isGeneratingVideo}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingVideo ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Renderizando Vídeo com IA...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4" /> Gerar Clipe de Vídeo IA
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Video Player & Storyboard */}
          <div className="lg:col-span-7 bg-slate-950/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900 border border-slate-800 flex items-center justify-center group">
              {isGeneratingVideo ? (
                <div className="flex flex-col items-center gap-3 text-rose-400 p-6 text-center">
                  <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/30 animate-pulse">
                    <Video className="w-10 h-10 animate-bounce text-rose-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Renderizando Sequência Cinemática de Vídeo</h4>
                    <p className="text-xs text-slate-400 mt-1">Calculando interpolação de quadros a 60 FPS, color grading e iluminação...</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={currentVideo.url}
                    poster={currentVideo.poster}
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    onPlay={() => setIsVideoPlaying(true)}
                    onPause={() => setIsVideoPlaying(false)}
                  />

                  {/* Optional Text Overlay */}
                  {showVideoOverlay && videoOverlayText && (
                    <div className="absolute top-4 left-4 right-4 pointer-events-none">
                      <span className="inline-block px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white font-mono text-xs tracking-widest font-black uppercase">
                        {videoOverlayText}
                      </span>
                    </div>
                  )}

                  {/* Center Play Button */}
                  <button
                    onClick={toggleVideoPlay}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-transform active:scale-95 cursor-pointer z-10"
                  >
                    {isVideoPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
                  </button>
                </>
              )}
            </div>

            {/* Video Controls Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Velocidade:</span>
                {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      setVideoPlaybackSpeed(spd);
                      if (videoRef.current) videoRef.current.playbackRate = spd;
                    }}
                    className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-semibold cursor-pointer ${
                      videoPlaybackSpeed === spd
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVideoOverlay(prev => !prev)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    showVideoOverlay ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  Overlay: {showVideoOverlay ? 'Ligado' : 'Desligado'}
                </button>
                <a
                  href={currentVideo.url}
                  download={`apolo_video_${Date.now()}.mp4`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar Vídeo
                </a>
              </div>
            </div>

            {/* Storyboard Notes */}
            {currentVideo.storyboard && (
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-rose-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" /> {currentVideo.storyboard.title}
                  </strong>
                  <span className="text-[10px] text-slate-400 font-mono">{currentVideo.storyboard.cameraMotion}</span>
                </div>
                <p className="text-[11px] text-slate-400">{currentVideo.storyboard.directorNotes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PRESET PROMPT LIBRARY */}
      {activeTab === 'prompt-library' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
            <span>💡 Clique em qualquer preset para carregar automaticamente parâmetros calibrados de alta precisão.</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_PROMPTS.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-fuchsia-500/40 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 px-2 py-0.5 rounded border border-fuchsia-500/20">
                      {item.category}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.lighting}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-fuchsia-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    "{item.prompt}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-900">
                  <span className="text-[11px] text-slate-500 font-mono">{item.cameraAngle}</span>
                  <button
                    onClick={() => {
                      setImagePrompt(item.prompt);
                      setImageStyle(item.style);
                      setLighting(item.lighting);
                      setCameraAngle(item.cameraAngle);
                      setActiveTab('generate-image');
                      voiceService.playChime('confirm');
                      voiceService.speak(`Preset "${item.title}" carregado no estúdio.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    Usar este Prompt <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Carousel */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Histórico do Estúdio
            </h4>
            <span className="text-[11px] text-slate-500">{history.length} itens salvos</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {history.map((asset) => (
              <div
                key={asset.id}
                onClick={() => {
                  if (unavailableAssetIds.has(asset.id)) {
                    return;
                  }

                  if (asset.type === 'image') {
                    setCurrentImage(asset.url);
                    setActiveTab('generate-image');
                  } else {
                    setCurrentVideo({
                      url: asset.url,
                      poster: asset.poster || '',
                      title: asset.prompt,
                      storyboard: asset.storyboard
                    });
                    setActiveTab('generate-video');
                  }
                  voiceService.playChime('confirm');
                }}
                className="group relative rounded-xl overflow-hidden aspect-video bg-slate-950 border border-slate-800 hover:border-indigo-500 cursor-pointer transition-all"
              >
                {unavailableAssetIds.has(asset.id) || (asset.type === 'video' && !asset.poster) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-3 text-center text-slate-500">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Prévia indisponível</span>
                  </div>
                ) : (
                  <img
                    src={asset.type === 'video' ? asset.poster : asset.url}
                    alt={asset.prompt}
                    referrerPolicy="no-referrer"
                    onError={() => markAssetAsUnavailable(asset.id)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="text-[10px] text-white font-semibold line-clamp-2">
                    {asset.type === 'video' ? '🎬 ' : '🖼️ '}{asset.prompt}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Remover ${asset.type === 'video' ? 'vídeo' : 'imagem'} do histórico`}
                  title="Remover do histórico"
                  onClick={(event) => {
                    event.stopPropagation();
                    removeHistoryAsset(asset.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 rounded-lg bg-slate-950/80 text-slate-300 hover:bg-rose-600 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const isPersistableUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value.trim() || value.startsWith('blob:')) {
    return false;
  }

  if (value.startsWith('data:')) {
    return true;
  }

  try {
    const url = new URL(value, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const sanitizeStoredHistory = (value: unknown): GeneratedAsset[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<GeneratedAsset[]>((assets, item) => {
    if (
      !item ||
      typeof item !== 'object' ||
      !('id' in item) ||
      !('type' in item) ||
      !('url' in item) ||
      !('prompt' in item) ||
      !('style' in item) ||
      !('aspectRatio' in item) ||
      !('createdAt' in item)
    ) {
      return assets;
    }

    const asset = item as Partial<GeneratedAsset>;
    if (
      (asset.type !== 'image' && asset.type !== 'video') ||
      typeof asset.id !== 'string' ||
      !asset.id.trim() ||
      !isPersistableUrl(asset.url)
    ) {
      return assets;
    }

    assets.push({
      id: asset.id,
      type: asset.type,
      url: asset.url,
      poster: isPersistableUrl(asset.poster) ? asset.poster : undefined,
      prompt: typeof asset.prompt === 'string' ? asset.prompt : '',
      style: typeof asset.style === 'string' ? asset.style : '',
      aspectRatio: typeof asset.aspectRatio === 'string' ? asset.aspectRatio : '16:9',
      createdAt: typeof asset.createdAt === 'string' ? asset.createdAt : '',
      storyboard: asset.storyboard
    });
    return assets;
  }, []);
};

const loadStoredHistory = (): GeneratedAsset[] => {
  if (typeof window === 'undefined') {
    return DEFAULT_HISTORY;
  }

  try {
    const storedHistory = window.localStorage.getItem(STUDIO_HISTORY_STORAGE_KEY);
    if (storedHistory === null) {
      return DEFAULT_HISTORY;
    }

    return sanitizeStoredHistory(JSON.parse(storedHistory));
  } catch (error) {
    console.warn('Não foi possível carregar o histórico do Estúdio Visual:', error);
    return DEFAULT_HISTORY;
  }
};
