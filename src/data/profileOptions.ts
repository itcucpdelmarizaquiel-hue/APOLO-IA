export interface ProfileLanguageOption {
  code: string;
  label: string;
}

export interface ProfileRegionOption {
  code: string;
  label: string;
  currency: string;
  callingCode: string;
}

export const DEFAULT_PROFILE_REGION_CODE = 'US';

export const getProfileRegion = (code: string | undefined) =>
  PROFILE_REGIONS.find((region) => region.code === code) ||
  PROFILE_REGIONS.find((region) => region.code === DEFAULT_PROFILE_REGION_CODE)!;

export const formatPhoneForRegion = (localPhone: string, regionCode: string) => {
  const digits = localPhone.replace(/\D/g, '');
  if (!digits) return undefined;
  const callingCode = getProfileRegion(regionCode).callingCode;
  return callingCode ? `+${callingCode}${digits}` : localPhone.trim();
};

export const PROFILE_LANGUAGES: ProfileLanguageOption[] = [
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'en-US', label: 'English (United States)' },
  { code: 'en-GB', label: 'English (United Kingdom)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'sw-KE', label: 'Kiswahili' },
  { code: 'yo-NG', label: 'Yorùbá' },
  { code: 'ha-NG', label: 'Hausa' },
  { code: 'ja-JP', label: '日本語' }
];

export const PROFILE_REGIONS: ProfileRegionOption[] = [
  { code: 'MZ', label: 'Moçambique', currency: 'MZN', callingCode: '258' },
  { code: 'NG', label: 'Nigéria', currency: 'NGN', callingCode: '234' },
  { code: 'ZA', label: 'África do Sul', currency: 'ZAR', callingCode: '27' },
  { code: 'US', label: 'Estados Unidos', currency: 'USD', callingCode: '1' },
  { code: 'EU', label: 'Zona Euro', currency: 'EUR', callingCode: '' },
  { code: 'GB', label: 'Reino Unido', currency: 'GBP', callingCode: '44' },
  { code: 'BR', label: 'Brasil', currency: 'BRL', callingCode: '55' },
  { code: 'IN', label: 'Índia', currency: 'INR', callingCode: '91' },
  { code: 'KE', label: 'Quénia', currency: 'KES', callingCode: '254' },
  { code: 'CA', label: 'Canadá', currency: 'CAD', callingCode: '1' },
  { code: 'AU', label: 'Austrália', currency: 'AUD', callingCode: '61' },
  { code: 'JP', label: 'Japão', currency: 'JPY', callingCode: '81' },
  { code: 'OTHER', label: 'Outro país ou região', currency: '—', callingCode: '' }
];
