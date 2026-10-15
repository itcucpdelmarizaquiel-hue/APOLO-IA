import React from 'react';
import { BadgeCheck, CircleHelp, Crown, Gem, Globe2, Sparkles, Star } from 'lucide-react';
import { PROFILE_REGIONS } from '../data/profileOptions';

type PlanId = 'free' | 'base' | 'medium' | 'premium';

interface PlansPricingProps {
  selectedRegionCode: string;
  onRegionChange: (regionCode: string) => void;
}

const PLAN_DETAILS: Array<{
  id: PlanId;
  name: string;
  icon: typeof Sparkles;
  accent: string;
  images: string;
  features: string[];
}> = [
  {
    id: 'free',
    name: 'Grátis',
    icon: Sparkles,
    accent: 'emerald',
    images: '18 imagens por dia',
    features: [
      'Comandos locais e uso básico por voz',
      'Leitura de horas, notificações e resposta de mensagens por voz',
      'Controlo básico de música e multimédia offline',
      'Respostas online com restrições e criação de documentos Office'
    ]
  },
  {
    id: 'base',
    name: 'Base',
    icon: Star,
    accent: 'cyan',
    images: '25 imagens por dia',
    features: [
      'Mais comandos, personalização e histórico básico',
      'Controlo de aplicações e acesso aos contactos',
      'Bloqueio e desbloqueio de aplicações por voz',
      'Edição de mensagens e fotos e identificação de música'
    ]
  },
  {
    id: 'medium',
    name: 'Médio',
    icon: Gem,
    accent: 'violet',
    images: '60 imagens por dia',
    features: [
      'Alarmes, agenda detalhada e lembretes',
      'Mais utilização de IA e recursos de voz',
      'Coach Gamer e personalização de voz, avatar e comportamento',
      'Ferramentas de edição e pesquisa de música e vídeo'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    icon: Crown,
    accent: 'amber',
    images: 'Imagens ilimitadas',
    features: [
      'Maior acesso aos recursos avançados de IA',
      'Ferramentas avançadas para pesquisar e ler ficheiros',
      'Leitura de livros, criação de programas e sites',
      'Recursos personalizados de treino e produtividade'
    ]
  }
];

const PRICES: Record<string, Record<PlanId, string | null>> = {
  MZ: { free: '0 MT', base: '50 MT', medium: '100 MT', premium: '200 MT' },
  US: { free: '$0', base: '$1.99', medium: '$3.99', premium: '$6.99' },
  EU: { free: '€0', base: '€1.99', medium: '€3.99', premium: '€6.99' },
  GB: { free: '£0', base: '£1.79', medium: '£3.49', premium: '£5.99' },
  BR: { free: 'R$ 0', base: 'R$ 7,90', medium: 'R$ 15,90', premium: 'R$ 29,90' },
  ZA: { free: 'R 0', base: 'R 19,99', medium: 'R 39,99', premium: 'R 69,99' },
  IN: { free: '₹0', base: '₹99', medium: '₹199', premium: '₹349' },
  NG: { free: '₦0', base: '₦1.500', medium: '₦3.000', premium: '₦5.500' },
  KE: { free: 'KSh 0', base: 'KSh 99', medium: 'KSh 199', premium: 'KSh 349' },
  CA: { free: 'C$ 0', base: 'C$ 2,49', medium: 'C$ 4,99', premium: 'C$ 8,99' },
  AU: { free: 'A$ 0', base: 'A$ 2,99', medium: 'A$ 5,99', premium: 'A$ 9,99' },
  JP: { free: '¥0', base: '¥300', medium: '¥600', premium: '¥1.000' },
  OTHER: { free: '0', base: null, medium: null, premium: null }
};

const ACCENT_STYLES: Record<string, { border: string; text: string; iconBg: string }> = {
  emerald: { border: 'border-emerald-500/25', text: 'text-emerald-300', iconBg: 'bg-emerald-500/10' },
  cyan: { border: 'border-cyan-500/25', text: 'text-cyan-300', iconBg: 'bg-cyan-500/10' },
  violet: { border: 'border-violet-500/30', text: 'text-violet-300', iconBg: 'bg-violet-500/10' },
  amber: { border: 'border-amber-500/30', text: 'text-amber-300', iconBg: 'bg-amber-500/10' }
};

export const PlansPricing: React.FC<PlansPricingProps> = ({ selectedRegionCode, onRegionChange }) => {
  const region = PROFILE_REGIONS.find((item) => item.code === selectedRegionCode) || PROFILE_REGIONS[0];
  const prices = PRICES[selectedRegionCode] || PRICES.OTHER;

  return (
    <div id="apolo-plans-pricing" className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl sm:p-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-200">
            <BadgeCheck className="h-3.5 w-3.5" /> Proposta de planos mensais
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Planos e preços APOLO</h2>
          <p className="mt-1 text-sm text-slate-400">Valores de referência do documento, ajustados à região selecionada.</p>
        </div>
        <label className="flex min-w-52 items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
          <Globe2 className="h-4 w-4 shrink-0 text-indigo-400" />
          <span className="sr-only">País ou região para mostrar preços</span>
          <select
            value={selectedRegionCode}
            onChange={(event) => onRegionChange(event.target.value)}
            className="w-full bg-transparent text-xs font-semibold text-white outline-none"
          >
            {PROFILE_REGIONS.map((item) => (
              <option key={item.code} value={item.code} className="bg-slate-950">
                {item.label} · {item.currency}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="w-full min-w-[610px] border-collapse text-left">
          <thead className="bg-slate-950/90 text-[10px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 font-bold">Pacote</th>
              <th className="px-4 py-3 font-bold">Preço mensal · {region.label}</th>
              <th className="px-4 py-3 font-bold">Geração de imagens proposta</th>
              <th className="px-4 py-3 font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {PLAN_DETAILS.map((plan) => {
              const price = prices[plan.id];
              const style = ACCENT_STYLES[plan.accent];
              return (
                <tr key={plan.id} className="border-t border-slate-800 bg-slate-900/50 text-xs text-slate-200">
                  <th scope="row" className={`whitespace-nowrap px-4 py-3 font-bold ${style.text}`}>{plan.name}</th>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-black text-white">
                    {price ?? 'Preço por definir'}
                    {price && <span className="ml-1 text-[10px] font-medium text-slate-500">/mês</span>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-300">{plan.images}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${style.border} ${style.text} ${style.iconBg}`}>
                      Proposta
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedRegionCode === 'OTHER' && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100">
          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>O documento não define preços para esta região. Os valores dos pacotes pagos serão apresentados quando forem definidos; não fazemos conversão cambial automática.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PLAN_DETAILS.map((plan) => {
          const Icon = plan.icon;
          const style = ACCENT_STYLES[plan.accent];
          return (
            <article key={plan.id} className={`rounded-2xl border bg-slate-950/60 p-4 ${style.border}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`rounded-xl p-2 ${style.iconBg} ${style.text}`}><Icon className="h-4 w-4" /></span>
                <h3 className="text-sm font-bold text-white">{plan.name}</h3>
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-[11px] leading-relaxed text-slate-300">
                    <span className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${style.iconBg.replace('/10', '')}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="space-y-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-start gap-2">
          <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <div>
            <h3 className="text-xs font-bold text-amber-100">Preços e funcionalidades ainda são propostas</h3>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">
              Os valores mensais variam por região e não foram validados comercialmente. As funcionalidades dos cartões descrevem o plano previsto no documento; algumas ainda não estão disponíveis. Esta tela não inicia uma subscrição nem processa pagamentos.
            </p>
          </div>
        </div>
        <p className="border-t border-amber-500/10 pt-3 text-[11px] leading-relaxed text-slate-400">
          O documento também prevê um teste pessoal Premium de 14 dias, sem cobrança automática. A ativação do teste e a data de validade ainda dependem de conta e validação de subscrição no servidor.
        </p>
      </div>
    </div>
  );
};
