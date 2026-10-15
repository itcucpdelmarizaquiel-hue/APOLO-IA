import React, { useState } from 'react';
import { Globe2, X } from 'lucide-react';
import { ApoloUserProfile } from '../types';
import { PROFILE_LANGUAGES, PROFILE_REGIONS } from '../data/profileOptions';

interface ProfilePreferencesModalProps {
  profile: ApoloUserProfile;
  onClose: () => void;
  onSave: (languageCode: string, regionCode: string) => void;
}

export const ProfilePreferencesModal: React.FC<ProfilePreferencesModalProps> = ({ profile, onClose, onSave }) => {
  const [languageCode, setLanguageCode] = useState(profile.languageCode || 'pt-PT');
  const [regionCode, setRegionCode] = useState(profile.regionCode || 'MZ');

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur-sm">
      <section role="dialog" aria-modal="true" aria-labelledby="profile-preferences-title" className="w-full max-w-md rounded-3xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-300"><Globe2 className="h-5 w-5" /></div>
            <div>
              <h2 id="profile-preferences-title" className="text-lg font-black text-white">Idioma e região</h2>
              <p className="mt-1 text-xs text-slate-400">Preferências de {profile.preferredName} para voz e localização regional.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="Fechar">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="profile-language-select" className="mb-1.5 block text-xs font-semibold text-slate-300">Idioma do assistente</label>
            <select id="profile-language-select" value={languageCode} onChange={(event) => setLanguageCode(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500">
              {PROFILE_LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="profile-region-select" className="mb-1.5 block text-xs font-semibold text-slate-300">País ou região</label>
            <select id="profile-region-select" value={regionCode} onChange={(event) => setRegionCode(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500">
              {PROFILE_REGIONS.map((region) => <option key={region.code} value={region.code}>{region.label} · {region.currency}</option>)}
            </select>
          </div>
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 text-[11px] leading-relaxed text-slate-400">
            A interface continua em português. O idioma selecionado orienta a voz, o reconhecimento de fala e as respostas online; a disponibilidade depende do navegador e dos serviços de voz do dispositivo. País e moeda são preferências, ainda sem cobrança ou preços ativos.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800">Cancelar</button>
            <button onClick={() => onSave(languageCode, regionCode)} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500">Guardar preferências</button>
          </div>
        </div>
      </section>
    </div>
  );
};
