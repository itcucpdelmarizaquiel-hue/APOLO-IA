import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, UserRound } from 'lucide-react';
import { ApoloUserProfile } from '../types';

interface UserOnboardingProps {
  onComplete: (profile: ApoloUserProfile) => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = preferredName.trim() || fullName.trim().split(' ')[0];
    if (!fullName.trim() || !name) return;
    onComplete({
      fullName: fullName.trim(),
      preferredName: name,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 px-4 py-6 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/60"
      >
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-2xl bg-indigo-500/15 p-3 text-indigo-300">
            <UserRound className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-300">Primeiro acesso</p>
            <h1 className="mt-1 text-xl font-black text-white">Como devo chamar você?</h1>
            <p className="mt-1 text-sm text-slate-400">O APOLO usará esses dados para personalizar as respostas e reconhecer seu perfil neste dispositivo.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Nome completo</label>
            <input required value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ex.: Ana Costa" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">Como prefere ser chamado?</label>
            <input value={preferredName} onChange={(event) => setPreferredName(event.target.value)} placeholder="Ex.: Ana (opcional)" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">E-mail <span className="font-normal text-slate-500">(opcional)</span></label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Telefone <span className="font-normal text-slate-500">(opcional)</span></label>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+258..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white outline-none focus:border-indigo-500" />
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5 text-xs text-slate-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>O cadastro fica salvo apenas neste dispositivo para personalizar sua experiência.</span>
          </div>
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition-colors hover:bg-indigo-500">
            Entrar no APOLO <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};