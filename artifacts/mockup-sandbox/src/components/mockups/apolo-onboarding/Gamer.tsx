import React, { useState } from 'react';
import { ArrowRight, AudioLines, Globe2, LockKeyhole, UserRound } from 'lucide-react';
import { PROFILE_LANGUAGES, PROFILE_REGIONS } from './profileOptions';
import './_group.css';

interface ApoloUserProfile {
  fullName: string;
  preferredName: string;
  email?: string;
  phone?: string;
  languageCode?: string;
  regionCode?: string;
  createdAt: string;
}

export function Gamer() {
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [languageCode, setLanguageCode] = useState('pt-PT');
  const [regionCode, setRegionCode] = useState('MZ');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = preferredName.trim() || fullName.trim().split(' ')[0];
    if (!fullName.trim() || !name) return;

    const profile: ApoloUserProfile = {
      fullName: fullName.trim(),
      preferredName: name,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      languageCode,
      regionCode,
      createdAt: new Date().toISOString()
    };
    console.info('Onboarding preview profile submitted', profile);
    setSubmitted(true);
  };

  const fieldClass = 'apolo-gamer-input w-full rounded-[10px] border border-[#334545] bg-[#0c1718] px-3.5 py-3 text-[14px] text-[#e8f0e9] placeholder:text-[#75827d] transition-colors';
  const labelClass = 'mb-1.5 block text-[11px] font-semibold tracking-[0.025em] text-[#c4d0c9]';

  return (
    <main className="apolo-gamer relative isolate flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#071112] px-3 py-5 text-[#e8f0e9] sm:px-6 sm:py-8">
      <style>{`
        .apolo-gamer {
          font-family: 'Space Grotesk', 'DM Sans', ui-sans-serif, system-ui, sans-serif;
          background-image:
            radial-gradient(ellipse at 17% 18%, rgba(38, 102, 84, .18), transparent 36%),
            radial-gradient(ellipse at 82% 85%, rgba(170, 117, 51, .08), transparent 34%);
        }
        .apolo-gamer::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          opacity: .2;
          background-image:
            linear-gradient(rgba(138, 174, 155, .08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(138, 174, 155, .08) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: linear-gradient(to bottom, black, transparent 90%);
        }
        .apolo-gamer-input:focus-visible {
          outline: 2px solid #d3e66f;
          outline-offset: 2px;
          border-color: #d3e66f;
          box-shadow: 0 0 0 4px rgba(211, 230, 111, .12);
        }
        @keyframes apolo-status-pulse {
          0%, 100% { opacity: .45; transform: scale(.88); }
          50% { opacity: 1; transform: scale(1); }
        }
        .apolo-status-pulse { animation: apolo-status-pulse 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .apolo-status-pulse { animation: none; }
        }
      `}</style>

      <section className="relative grid w-full max-w-[1080px] overflow-hidden rounded-[20px] border border-[#354744] bg-[#101a1b] shadow-[0_28px_100px_rgba(0,0,0,0.48)] lg:min-h-[680px] lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="relative flex min-h-[218px] flex-col overflow-hidden border-b border-[#354744] bg-[#142321] px-6 py-5 sm:px-8 sm:py-7 lg:min-h-full lg:border-b-0 lg:border-r lg:px-9 lg:py-8">
          <div className="absolute -right-14 top-10 h-56 w-56 rounded-full border border-[#819585]/15 sm:right-0 sm:top-12 sm:h-64 sm:w-64" />
          <div className="absolute -right-3 top-[74px] h-40 w-40 rounded-full border border-dashed border-[#b2c4ae]/20 sm:right-11 sm:top-[82px] sm:h-48 sm:w-48" />
          <div className="absolute right-[58px] top-[108px] h-28 w-28 rounded-full border border-[#c6d194]/25 bg-[#1d342f]/70 sm:right-[87px] sm:top-[114px] sm:h-36 sm:w-36" />
          <div className="absolute right-[91px] top-[141px] flex h-[60px] w-[60px] items-center justify-center rounded-full border border-[#d4e56f]/40 bg-[#172725] text-[#d4e56f] shadow-[0_0_40px_rgba(196,220,93,0.12)] sm:right-[123px] sm:top-[150px] sm:h-[68px] sm:w-[68px]">
            <AudioLines aria-hidden="true" className="h-7 w-7" strokeWidth={1.6} />
          </div>
          <span className="absolute right-[54px] top-[98px] h-2 w-2 rounded-full bg-[#d4e56f] shadow-[0_0_12px_rgba(212,229,111,0.55)] sm:right-[79px] sm:top-[108px]" />
          <span className="absolute right-[211px] top-[205px] h-1.5 w-1.5 rounded-full bg-[#c58f54] sm:right-[245px] sm:top-[231px]" />

          <div className="relative z-10 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-[#c3d474]/30 bg-[#d3e66f]/10 text-[#d3e66f]">
              <UserRound aria-hidden="true" className="h-[17px] w-[17px]" strokeWidth={1.8} />
            </div>
            <div className="leading-none">
              <div className="text-[13px] font-bold tracking-[0.22em] text-[#edf1e5]">APOLO</div>
              <div className="mt-1.5 font-mono text-[8px] tracking-[0.16em] text-[#92a59a]">ASSISTENTE PESSOAL</div>
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-full border border-[#496456] bg-[#172d28]/80 px-2.5 py-1.5 font-mono text-[8px] tracking-[0.12em] text-[#b6c7b8]">
              <span className="apolo-status-pulse h-1.5 w-1.5 rounded-full bg-[#d3e66f]" />
              PRONTO
            </div>
          </div>

          <div className="relative z-10 mt-auto pt-7 lg:pt-0 lg:pb-7">
            <div className="mb-3 flex items-center gap-2 font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#c0d276]">
              <span className="h-px w-5 bg-[#c0d276]" />
              PERSONALIZAÇÃO LOCAL
            </div>
            <h2 className="max-w-[290px] text-[25px] font-semibold leading-[1.07] tracking-[-0.045em] text-[#eff2e9] sm:text-[30px] lg:text-[34px]">
              A sua voz,<br />no centro.
            </h2>
            <p className="mt-3 hidden max-w-[270px] text-[12px] leading-[1.65] text-[#a6b6ad] sm:block">
              Defina como o APOLO fala consigo e ajuste o perfil ao seu dia a dia.
            </p>
            <div className="mt-5 hidden items-center gap-2.5 font-mono text-[9px] tracking-[0.09em] text-[#7f9288] sm:flex">
              <span className="h-px w-8 bg-[#51675d]" />
              CONFIGURAÇÃO GUARDADA NESTE DISPOSITIVO
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-0 right-0 hidden h-24 w-24 opacity-30 lg:block">
            <div className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-[#a8bc9d]" />
            <div className="absolute bottom-6 right-12 h-8 w-px bg-[#a8bc9d]" />
            <div className="absolute bottom-12 right-6 h-px w-8 bg-[#a8bc9d]" />
          </div>
        </aside>

        <div className="px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <header className="mb-6 sm:mb-7">
            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.19em] text-[#a6bb67]">Primeiro acesso <span className="mx-1.5 text-[#63766b]">/</span> Perfil de voz</p>
            <h1 className="mt-2.5 text-[25px] font-semibold leading-tight tracking-[-0.045em] text-[#f0f1e8] sm:text-[28px]">Como devo chamar você?</h1>
            <p className="mt-2 max-w-[470px] text-[12px] leading-[1.65] text-[#9caaa3]">
              O APOLO usará esses dados para personalizar as respostas e reconhecer seu perfil neste dispositivo.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-[15px]">
            <div className="grid grid-cols-1 gap-x-3.5 gap-y-[15px] sm:grid-cols-2">
              <div>
                <label htmlFor="gamer-full-name" className={labelClass}>Nome completo <span className="text-[#d3e66f]">*</span></label>
                <input id="gamer-full-name" name="fullName" required autoComplete="name" value={fullName} onChange={(event) => { setFullName(event.target.value); setSubmitted(false); }} placeholder="Ex.: Ana Costa" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="gamer-preferred-name" className={labelClass}>Como prefere ser chamado?</label>
                <input id="gamer-preferred-name" name="preferredName" autoComplete="nickname" value={preferredName} onChange={(event) => { setPreferredName(event.target.value); setSubmitted(false); }} placeholder="Ex.: Ana (opcional)" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="gamer-email" className={labelClass}>E-mail <span className="font-normal text-[#82918a]">(opcional)</span></label>
                <input id="gamer-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => { setEmail(event.target.value); setSubmitted(false); }} placeholder="voce@email.com" className={fieldClass} />
              </div>
              <div>
                <label htmlFor="gamer-phone" className={labelClass}>Telefone <span className="font-normal text-[#82918a]">(opcional)</span></label>
                <input id="gamer-phone" name="phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => { setPhone(event.target.value); setSubmitted(false); }} placeholder="+258..." className={fieldClass} />
              </div>
              <div>
                <label htmlFor="gamer-language" className={labelClass}>Idioma do assistente</label>
                <div className="relative">
                  <select id="gamer-language" name="languageCode" value={languageCode} onChange={(event) => { setLanguageCode(event.target.value); setSubmitted(false); }} className={`${fieldClass} apolo-gamer-select appearance-none pr-10`}>
                    {PROFILE_LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}
                  </select>
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#a6bb67]">⌄</span>
                </div>
              </div>
              <div>
                <label htmlFor="gamer-region" className={labelClass}>País ou região</label>
                <div className="relative">
                  <select id="gamer-region" name="regionCode" value={regionCode} onChange={(event) => { setRegionCode(event.target.value); setSubmitted(false); }} className={`${fieldClass} apolo-gamer-select appearance-none pr-10`}>
                    {PROFILE_REGIONS.map((region) => <option key={region.code} value={region.code}>{region.label} · {region.currency}</option>)}
                  </select>
                  <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#a6bb67]">⌄</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 rounded-[10px] border border-[#405548] bg-[#17241f] px-3.5 py-3 text-[10px] leading-[1.55] text-[#a7b5ac]">
              <Globe2 aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-[#b9ce70]" strokeWidth={1.7} />
              <span>O perfil e as preferências ficam neste dispositivo. Idioma de voz depende das vozes disponíveis no navegador; o país será usado para preferências regionais, não para pagamentos nesta etapa.</span>
            </div>

            {submitted && (
              <p role="status" className="text-[11px] text-[#d3e66f]">Perfil preparado. O APOLO já sabe como falar consigo.</p>
            )}

            <div className="flex flex-col gap-3 pt-0.5 sm:flex-row sm:items-center">
              <button type="submit" className="group flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#d8e77b] bg-[#d3e66f] px-5 text-[13px] font-bold tracking-[0.01em] text-[#18201a] transition-colors hover:bg-[#e0ed8e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#eff5b6] sm:w-auto sm:min-w-[190px]">
                Entrar no APOLO
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.035em] text-[#82918a]">
                <LockKeyhole aria-hidden="true" className="h-3 w-3 text-[#9eae8a]" strokeWidth={1.7} />
                SEM CONTA · SEM ARMAZENAMENTO NA NUVEM
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
