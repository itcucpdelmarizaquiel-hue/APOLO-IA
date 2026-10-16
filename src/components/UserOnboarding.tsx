import React, { useState } from 'react';
import { ArrowRight, AudioLines, Globe2, LockKeyhole, UserRound } from 'lucide-react';
import { ApoloUserProfile } from '../types';
import { PROFILE_LANGUAGES, PROFILE_REGIONS } from '../data/profileOptions';

interface UserOnboardingProps {
  onComplete: (profile: ApoloUserProfile) => void;
}

export const UserOnboarding: React.FC<UserOnboardingProps> = ({ onComplete }) => {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languageCode, setLanguageCode] = useState('pt-PT');
  const [regionCode, setRegionCode] = useState('MZ');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = preferredName.trim() || fullName.trim().split(' ')[0];
    if (!fullName.trim() || !name) return;

    onComplete({
      fullName: fullName.trim(),
      preferredName: name,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      languageCode,
      regionCode,
      createdAt: new Date().toISOString()
    });
  };

  const fieldClass = 'apolo-onboarding-field w-full rounded-[7px] border border-[#1e3b67] bg-[#071329]/85 px-3.5 py-[11px] text-[13px] text-[#e2edff] placeholder:text-[#8191ad] transition-colors';
  const labelClass = 'mb-1.5 block text-[10px] font-semibold tracking-[0.08em] text-[#b8c9e6]';

  return (
    <main className="apolo-onboarding relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#030b1b] px-3 py-6 text-[#e4edff] sm:px-6 sm:py-10">
      <style>{`
        .apolo-onboarding {
          font-family: 'Space Grotesk', 'DM Sans', ui-sans-serif, system-ui, sans-serif;
          background-image:
            radial-gradient(ellipse at 50% 42%, rgba(13, 61, 132, .24), transparent 48%),
            linear-gradient(135deg, transparent 0 72%, rgba(14, 47, 100, .18) 72% 76%, transparent 76%),
            linear-gradient(315deg, transparent 0 83%, rgba(13, 40, 83, .22) 83% 88%, transparent 88%);
        }
        .apolo-onboarding::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .2;
          background-image:
            linear-gradient(rgba(61, 121, 209, .12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(61, 121, 209, .12) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse at center, black, transparent 82%);
        }
        .apolo-onboarding-field:focus-visible {
          outline: 2px solid #238bff;
          outline-offset: 2px;
          border-color: #238bff;
          box-shadow: 0 0 0 3px rgba(35, 139, 255, .15);
        }
        .apolo-onboarding-panel {
          position: relative;
          isolation: isolate;
          background:
            linear-gradient(145deg, rgba(6, 18, 41, .98), rgba(4, 13, 31, .985));
          box-shadow: 0 28px 90px rgba(0, 0, 0, .52), inset 0 0 42px rgba(13, 54, 117, .13);
        }
        .apolo-onboarding-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          border: 1px solid rgba(42, 112, 220, .48);
          clip-path: polygon(0 22px, 22px 0, calc(100% - 56px) 0, 100% 56px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 28px 100%, 0 calc(100% - 28px));
        }
        .apolo-onboarding-panel::after {
          content: '';
          position: absolute;
          inset: 5px;
          z-index: -1;
          pointer-events: none;
          border: 1px solid rgba(66, 127, 216, .09);
          clip-path: polygon(0 17px, 17px 0, calc(100% - 52px) 0, 100% 52px, 100% calc(100% - 20px), calc(100% - 20px) 100%, 23px 100%, 0 calc(100% - 23px));
        }
        @keyframes apolo-signal {
          0%, 100% { opacity: .55; transform: scale(.88); }
          50% { opacity: 1; transform: scale(1); }
        }
        .apolo-onboarding-signal { animation: apolo-signal 2.6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .apolo-onboarding *,
          .apolo-onboarding *::before,
          .apolo-onboarding *::after {
            scroll-behavior: auto !important;
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }
        }
      `}</style>

      <span aria-hidden="true" className="pointer-events-none absolute left-[7%] top-[13%] hidden h-14 w-14 rotate-45 border-l border-t border-[#1678ef]/45 sm:block" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-[12%] right-[8%] hidden h-20 w-20 border-b border-r border-[#1678ef]/35 sm:block" />

      <section className="apolo-onboarding-panel w-full max-w-[790px] overflow-hidden px-5 py-6 sm:px-9 sm:py-8 md:px-12 md:py-10">
        <span aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-[2px] w-24 bg-[#1684ff] shadow-[0_0_16px_rgba(22,132,255,.7)]" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-20 bg-[#1684ff] shadow-[0_0_16px_rgba(22,132,255,.65)]" />

        <header className="relative mb-6 border-b border-[#19345a] pb-5 sm:mb-7 sm:pb-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-[#1c70db]/65 bg-[#0b1e3b] text-[#2791ff] shadow-[inset_0_0_18px_rgba(16,103,222,.16)]">
              <UserRound aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-bold tracking-[0.24em] text-[#e8f1ff]">APOLO</div>
              <div className="mt-1.5 font-mono text-[8px] tracking-[0.18em] text-[#7890b5]">ASSISTENTE DE VOZ</div>
            </div>
            <div className="ml-auto flex items-center gap-2 border border-[#183b70] bg-[#091a34] px-2.5 py-1.5 font-mono text-[8px] tracking-[0.12em] text-[#9ab5dc]">
              <span aria-hidden="true" className="apolo-onboarding-signal h-1.5 w-1.5 rounded-full bg-[#2994ff] shadow-[0_0_9px_rgba(41,148,255,.75)]" />
              PERFIL LOCAL
            </div>
          </div>
          <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#398fff]">
            Primeiro acesso <span aria-hidden="true" className="mx-1.5 text-[#52719d]">/</span> Personalização
          </p>
          <h1 className="mt-2 text-[26px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#f0f5ff] sm:text-[32px]">
            Como devo chamar <span className="text-[#1686ff]">você?</span>
          </h1>
          <p className="mt-2 max-w-[540px] text-[12px] leading-[1.6] text-[#9aacc9]">
            O APOLO usará estes dados para personalizar as respostas e reconhecer o seu perfil neste dispositivo.
          </p>
          <AudioLines aria-hidden="true" className="absolute bottom-6 right-1 hidden h-8 w-8 text-[#1d65bd]/50 sm:block" strokeWidth={1.4} />
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <div>
              <label htmlFor="apolo-full-name" className={labelClass}>NOME COMPLETO <span className="text-[#3193ff]">*</span></label>
              <input id="apolo-full-name" name="fullName" required autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ex.: Ana Costa" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="apolo-preferred-name" className={labelClass}>COMO PREFERE SER CHAMADO?</label>
              <input id="apolo-preferred-name" name="preferredName" autoComplete="nickname" value={preferredName} onChange={(event) => setPreferredName(event.target.value)} placeholder="Ex.: Ana (opcional)" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="apolo-email" className={labelClass}>E-MAIL <span className="font-normal tracking-normal text-[#8093b1]">(opcional)</span></label>
              <input id="apolo-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" className={fieldClass} />
            </div>
            <div>
              <label htmlFor="apolo-phone" className={labelClass}>TELEFONE <span className="font-normal tracking-normal text-[#8093b1]">(opcional)</span></label>
              <input id="apolo-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+258..." className={fieldClass} />
            </div>
            <div>
              <label htmlFor="apolo-language" className={labelClass}>IDIOMA DO ASSISTENTE</label>
              <div className="relative">
                <select id="apolo-language" name="languageCode" value={languageCode} onChange={(event) => setLanguageCode(event.target.value)} className={`${fieldClass} appearance-none pr-10`}>
                  {PROFILE_LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#3193ff]">⌄</span>
              </div>
            </div>
            <div>
              <label htmlFor="apolo-region" className={labelClass}>PAÍS OU REGIÃO</label>
              <div className="relative">
                <select id="apolo-region" name="regionCode" value={regionCode} onChange={(event) => setRegionCode(event.target.value)} className={`${fieldClass} appearance-none pr-10`}>
                  {PROFILE_REGIONS.map((region) => <option key={region.code} value={region.code}>{region.label} · {region.currency}</option>)}
                </select>
                <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#3193ff]">⌄</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 border border-[#1c3b63] bg-[#08172e] px-3.5 py-3 text-[10px] leading-[1.55] text-[#9aacc9]">
            <Globe2 aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-[#398fff]" strokeWidth={1.7} />
            <span>O perfil e as preferências ficam neste dispositivo. Idioma de voz depende das vozes disponíveis no navegador; o país será usado para preferências regionais, não para pagamentos nesta etapa.</span>
          </div>

          <div className="flex flex-col gap-3 pt-0.5 sm:flex-row sm:items-center">
            <button type="submit" className="group flex min-h-[46px] w-full items-center justify-center gap-2 border border-[#3295ff] bg-[#0877ed] px-5 text-[12px] font-bold tracking-[0.06em] text-white transition-colors hover:bg-[#1688ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7dbbff] sm:w-auto sm:min-w-[190px]">
              ENTRAR NO APOLO
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <div className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.07em] text-[#8297b6]">
              <LockKeyhole aria-hidden="true" className="h-3 w-3 text-[#398fff]" strokeWidth={1.7} />
              SEM CONTA · SEM ARMAZENAMENTO NA NUVEM
            </div>
          </div>
        </form>

        <div aria-hidden="true" className="mt-6 flex items-center gap-2 font-mono text-[8px] tracking-[0.16em] text-[#46638d]">
          <span className="h-px w-7 bg-[#24518a]" />
          PERSONALIZAÇÃO GUARDADA LOCALMENTE
          <span className="ml-auto hidden h-px w-7 bg-[#24518a] sm:block" />
        </div>
      </section>
    </main>
  );
};
