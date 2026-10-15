export interface ProfileLanguageOption {
  code: string;
  label: string;
}

export interface ProfileRegionOption {
  code: string;
  label: string;
  currency: string;
}

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
  { code: 'MZ', label: 'Moçambique', currency: 'MZN' },
  { code: 'NG', label: 'Nigéria', currency: 'NGN' },
  { code: 'ZA', label: 'África do Sul', currency: 'ZAR' },
  { code: 'US', label: 'Estados Unidos', currency: 'USD' },
  { code: 'EU', label: 'Zona Euro', currency: 'EUR' },
  { code: 'GB', label: 'Reino Unido', currency: 'GBP' },
  { code: 'BR', label: 'Brasil', currency: 'BRL' },
  { code: 'IN', label: 'Índia', currency: 'INR' },
  { code: 'KE', label: 'Quénia', currency: 'KES' },
  { code: 'CA', label: 'Canadá', currency: 'CAD' },
  { code: 'AU', label: 'Austrália', currency: 'AUD' },
  { code: 'JP', label: 'Japão', currency: 'JPY' },
  { code: 'OTHER', label: 'Outro país ou região', currency: '—' }
];
