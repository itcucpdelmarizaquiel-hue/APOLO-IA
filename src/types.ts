export type SecurityLevel = 1 | 2 | 3;

export interface ExecutionStep {
  step: number;
  name: string;
  detail: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface ApoloAction {
  type: 
    | 'OPEN_APP'
    | 'CLOSE_APP'
    | 'LOCK_APP'
    | 'UNLOCK_APP'
    | 'LOCK_PHONE'
    | 'UNLOCK_PHONE'
    | 'SEND_MESSAGE'
    | 'CALL_CONTACT'
    | 'CREATE_REMINDER'
    | 'SET_ALARM'
    | 'PLAY_MEDIA'
    | 'PAUSE_MEDIA'
    | 'FIND_PHONE_RING'
    | 'CREATE_OFFICE_DOC'
    | 'WIKIPEDIA_SEARCH'
    | 'GENERATE_IMAGE'
    | 'GENERAL_ANSWER';
  payload: {
    appName?: string;
    contactName?: string;
    contactPhone?: string;
    messageText?: string;
    reminderText?: string;
    reminderTime?: string;
    alarmTime?: string;
    mediaTitle?: string;
    documentType?: 'doc' | 'sheet' | 'slide';
    documentTitle?: string;
    searchQuery?: string;
    imagePrompt?: string;
  };
}

export interface CommandExecutionResult {
  command?: string;
  intent?: string;
  speechResponse: string;
  securityLevel: SecurityLevel;
  requiresConfirmation: boolean;
  confirmationReason?: string;
  executionPlan: ExecutionStep[];
  actions: ApoloAction[];
  knowledgeAnswer?: string;
}

export interface AppItem {
  id: string;
  name: string;
  category: 'multimedia' | 'productivity' | 'social' | 'tools' | 'system' | 'games';
  icon: string;
  color: string;
  isInstalled: boolean;
  isLocked: boolean;
  isOpen: boolean;
  description: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarColor: string;
  relationship: string;
  isFavorite?: boolean;
}

export interface PhoneNotification {
  id: string;
  appName: string;
  sender: string;
  message: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
}

export interface AgendaItem {
  id: string;
  title: string;
  time: string;
  date: string;
  completed: boolean;
  category: 'trabalho' | 'pessoal' | 'estudos' | 'saude';
  isOverdue?: boolean;
}

export interface AlarmItem {
  id: string;
  time: string;
  label: string;
  active: boolean;
  repeatDays: string[];
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
  type: 'music' | 'video';
  thumbnail: string;
  url?: string;
  subtitles?: string[];
}

export interface OfficeDocument {
  id: string;
  title: string;
  type: 'doc' | 'sheet' | 'slide';
  updatedAt: string;
  content: string;
  tableData?: string[][];
  slides?: { title: string; points: string[] }[];
}

export interface FriendLocation {
  id: string;
  name: string;
  status: string;
  distanceKm: number;
  battery: number;
  latOffset: number;
  lngOffset: number;
  acceptedFriendship: boolean;
}

export interface ApoloPersona {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  category?: 'human' | 'tech' | 'viral' | 'cinema' | 'audiobook' | 'drama' | 'story' | 'gaming' | 'executive';
  personality: string;
  pitch: number;
  rate: number;
  gender?: 'male' | 'female' | 'neutral';
  voiceName?: string;
  voiceTone?: string;
  themeColor?: string;
  avatarGlow?: string;
  avatarIcon?: string;
  avatarImage?: string;
  samplePhrase?: string;
  soundGreeting?: string;
}
