import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlaySquare, 
  Film, 
  FileText, 
  Users, 
  MessageSquare, 
  Clock, 
  Music, 
  Gamepad2, 
  MapPin, 
  ShieldCheck, 
  BookOpen, 
  Image as ImageIcon,
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Check, 
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { AppItem } from '../types';

interface PhoneAppsLauncherProps {
  apps: AppItem[];
  onOpenApp: (appId: string) => void;
  onToggleLockApp: (appId: string) => void;
  onUninstallApp: (appId: string) => void;
  onInstallApp: (appName: string, category: any) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  PlaySquare,
  Film,
  FileText,
  Users,
  MessageSquare,
  Clock,
  Music,
  Gamepad2,
  MapPin,
  ShieldCheck,
  BookOpen,
  Image: ImageIcon
};

export const PhoneAppsLauncher: React.FC<PhoneAppsLauncherProps> = ({
  apps,
  onOpenApp,
  onToggleLockApp,
  onUninstallApp,
  onInstallApp
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newAppCategory, setNewAppCategory] = useState<'tools' | 'games' | 'productivity' | 'multimedia' | 'social'>('tools');

  const filteredApps = apps.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'installed') return app.isInstalled;
    if (filter === 'locked') return app.isLocked;
    return app.category === filter;
  });

  const handleInstallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    onInstallApp(newAppName.trim(), newAppCategory);
    setNewAppName('');
    setShowInstallModal(false);
  };

  return (
    <div id="phone-apps-launcher" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Controle de Aplicativos do Telemóvel</h2>
            <p className="text-xs text-slate-400">
              Operar, bloquear, instalar e apagar aplicativos por voz ou toque
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="install-new-app-btn"
            onClick={() => setShowInstallModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Instalar App
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 text-xs">
        {[
          { id: 'all', label: 'Todos os Apps' },
          { id: 'multimedia', label: 'Multimídia' },
          { id: 'productivity', label: 'Produtividade' },
          { id: 'social', label: 'Sociais' },
          { id: 'tools', label: 'Ferramentas' },
          { id: 'locked', label: 'Bloqueados' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredApps.map((app) => {
          const IconComp = ICON_MAP[app.icon] || Smartphone;
          return (
            <motion.div
              key={app.id}
              id={`app-item-${app.id}`}
              whileHover={{ y: -2 }}
              className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                app.isLocked
                  ? 'bg-slate-950/70 border-rose-500/30'
                  : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/30'
              }`}
            >
              {/* App Icon & Lock Badge */}
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md ${app.color}`}>
                  <IconComp className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    id={`toggle-lock-btn-${app.id}`}
                    onClick={() => onToggleLockApp(app.id)}
                    title={app.isLocked ? 'Desbloquear App' : 'Bloquear App por Segurança'}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      app.isLocked
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {app.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    id={`uninstall-app-btn-${app.id}`}
                    onClick={() => onUninstallApp(app.id)}
                    title="Apagar / Desinstalar App"
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 hover:text-rose-400 hover:border-rose-500/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* App Info */}
              <div className="space-y-1 mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-xs text-slate-200">{app.name}</h3>
                  {app.isLocked && (
                    <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                      Trancado
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">{app.description}</p>
              </div>

              {/* Open App Action Button */}
              <button
                id={`open-app-btn-${app.id}`}
                onClick={() => onOpenApp(app.id)}
                className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  app.isLocked
                    ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    : 'bg-indigo-600/90 hover:bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                }`}
              >
                {app.isLocked ? (
                  <>
                    <Lock className="w-3.5 h-3.5" /> Pedir Acesso
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3.5 h-3.5" /> Abrir App
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Voice command hints */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <span>
          💡 Diga: <strong className="text-indigo-300">"APOLO, abre o YouTube"</strong> ou <strong className="text-indigo-300">"Bloqueia o WhatsApp por voz"</strong>
        </span>
        <span className="text-[11px] text-emerald-400 font-medium">Controle de Voz Ativo</span>
      </div>

      {/* Install App Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Instalar Novo Aplicativo</h3>
                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleInstallSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome do Aplicativo
                  </label>
                  <input
                    id="new-app-name-input"
                    type="text"
                    required
                    value={newAppName}
                    onChange={(e) => setNewAppName(e.target.value)}
                    placeholder="Ex: Spotify, Instagram, Netflix..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Categoria
                  </label>
                  <select
                    id="new-app-category-select"
                    value={newAppCategory}
                    onChange={(e: any) => setNewAppCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="multimedia">Multimídia</option>
                    <option value="productivity">Produtividade</option>
                    <option value="social">Redes Sociais & Mensagens</option>
                    <option value="tools">Ferramentas de Sistema</option>
                    <option value="games">Jogos & E-Sports</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInstallModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                  >
                    Confirmar Instalação
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
