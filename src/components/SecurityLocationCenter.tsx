import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Users, 
  Smartphone, 
  Radio, 
  KeyRound, 
  Compass, 
  AlertTriangle,
  Battery,
  ShieldAlert
} from 'lucide-react';
import { FriendLocation } from '../types';
import { voiceService } from '../services/voice';

interface SecurityLocationCenterProps {
  isPhoneLocked: boolean;
  onToggleLockPhone: () => void;
  friends: FriendLocation[];
  onAddFriendLocation?: (friend: FriendLocation) => void;
}

export const SecurityLocationCenter: React.FC<SecurityLocationCenterProps> = ({
  isPhoneLocked,
  onToggleLockPhone,
  friends
}) => {
  const [isRingingPhone, setIsRingingPhone] = useState(false);
  const [securityPasscode, setSecurityPasscode] = useState('1234');
  const [voiceKeyword, setVoiceKeyword] = useState('apolo desbloquear');
  const [activeFriend, setActiveFriend] = useState<FriendLocation | null>(friends[0] || null);

  // Trigger loud sound beacon to find lost phone
  const handleToggleEmergencyRing = () => {
    if (isRingingPhone) {
      voiceService.stopEmergencyRing();
      setIsRingingPhone(false);
      voiceService.speak('Alarme de localização desativado.');
    } else {
      setIsRingingPhone(true);
      voiceService.startEmergencyRing();
      voiceService.speak('Sinal sonoro de localização ativado! Siga o som do celular.');
    }
  };

  return (
    <div id="security-location-center" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-teal-600/20 border border-teal-500/30 text-teal-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Segurança, Alarme & Localização Amiga</h2>
            <p className="text-xs text-slate-400">
              Bloqueio biométrico por voz, toque sonoro para encontrar o celular e radar de amigos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-phone-lock-btn"
            onClick={onToggleLockPhone}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
              isPhoneLocked
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isPhoneLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {isPhoneLocked ? 'Celular Bloqueado' : 'Celular Desbloqueado'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Phone Finder & Voice Security Config */}
        <div className="lg:col-span-6 space-y-4">
          {/* Emergency Phone Siren Beacon */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className={`w-5 h-5 ${isRingingPhone ? 'text-rose-500 animate-spin' : 'text-indigo-400'}`} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Localização do Telefone por Toque Sonoro
                </h3>
              </div>

              {isRingingPhone && (
                <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30 animate-pulse">
                  Sirene Ativa
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Perdeu o telefone no quarto ou sofá? O APOLO reconhece a sua voz e dispara um alarme sonoro potente para você encontrar o aparelho imediatamente.
            </p>

            <button
              id="emergency-ring-toggle-btn"
              onClick={handleToggleEmergencyRing}
              className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                isRingingPhone
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
              }`}
            >
              {isRingingPhone ? (
                <>
                  <VolumeX className="w-4 h-4" /> Parar Sirene de Localização
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" /> Tocar Alarme do Celular
                </>
              )}
            </button>
          </div>

          {/* Voice Security & Passcode Settings */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Parâmetros de Bloqueio por Reconhecimento de Voz
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Palavra-chave de desbloqueio por voz:
                </label>
                <input
                  type="text"
                  value={voiceKeyword}
                  onChange={(e) => setVoiceKeyword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  Código PIN de emergência (Nível 3):
                </label>
                <input
                  type="password"
                  value={securityPasscode}
                  onChange={(e) => setSecurityPasscode(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Proteção anti-acesso não autorizado ativa no APOLO.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Localização Amiga (Interactive Radar) */}
        <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-400 animate-spin" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Radar • Localização Amiga
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                {friends.length} Amigos Conectados
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Localiza pessoas que também utilizam o APOLO e aceitaram a partilha segura de localização.
            </p>

            {/* Radar Circular Stage */}
            <div className="relative w-full h-56 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center mb-4">
              {/* Concentric Radar Grid */}
              <div className="absolute w-44 h-44 rounded-full border border-teal-500/20" />
              <div className="absolute w-32 h-32 rounded-full border border-teal-500/30" />
              <div className="absolute w-16 h-16 rounded-full border border-teal-500/40" />
              <div className="absolute w-full h-px bg-teal-500/10" />
              <div className="absolute h-full w-px bg-teal-500/10" />

              {/* Center User Pin */}
              <div className="relative z-10 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shadow-lg shadow-indigo-600/50 ring-4 ring-indigo-500/30">
                EU
              </div>

              {/* Friend Pins */}
              {friends.map((f, i) => {
                const isSelected = activeFriend?.id === f.id;
                const topPercent = 50 + f.latOffset * 1000;
                const leftPercent = 50 + f.lngOffset * 1000;

                return (
                  <motion.button
                    key={f.id}
                    onClick={() => {
                      setActiveFriend(f);
                      voiceService.playChime('click');
                    }}
                    style={{ top: `${Math.max(15, Math.min(85, topPercent))}%`, left: `${Math.max(15, Math.min(85, leftPercent))}%` }}
                    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 p-1.5 rounded-full text-xs font-bold transition-transform cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-400/40 scale-125'
                        : 'bg-slate-800 text-teal-300 border border-teal-500/40 hover:scale-110'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                  </motion.button>
                );
              })}
            </div>

            {/* Active Friend Card */}
            {activeFriend && (
              <div className="p-3.5 rounded-xl bg-slate-900 border border-teal-500/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-600/20 border border-teal-500/40 text-teal-300 flex items-center justify-center font-bold">
                    {activeFriend.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{activeFriend.name}</h4>
                    <span className="text-[11px] text-slate-400">{activeFriend.status}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-teal-400 font-bold block">{activeFriend.distanceKm} km de você</span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                    <Battery className="w-3 h-3 text-emerald-400" /> {activeFriend.battery}% bateria
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-900">
            🔒 Localização protegida por criptografia de ponta a ponta com Nível 3 de Segurança.
          </div>
        </div>
      </div>
    </div>
  );
};
