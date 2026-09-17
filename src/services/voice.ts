/**
 * Audio, Speech Synthesis (TTS), and Speech Recognition (STT) Service for APOLO
 */

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private audioCtx: AudioContext | null = null;
  private recognition: any = null;
  private isListeningInternal = false;
  private isSpeakingInternal = false;
  private ringOscillator: OscillatorNode | null = null;
  private ringGain: GainNode | null = null;
  private ringInterval: any = null;
  private silenceTimer: any = null;
  private lastTranscriptBuffer = '';
  private voicesLoaded = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      this.initRecognition();
    }
  }

  private loadVoices() {
    if (this.synth) {
      try {
        const voices = this.synth.getVoices();
        if (voices && voices.length > 0) {
          this.cachedVoices = voices;
          this.voicesLoaded = true;
        }
      } catch (e) {
        console.warn('Voice loading error:', e);
      }
    }
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'pt-BR';
        this.recognition.maxAlternatives = 1;
      } catch (e) {
        console.warn('SpeechRecognition init error:', e);
      }
    }
  }

  public getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public get isSupported(): boolean {
    return Boolean(this.recognition);
  }

  public get speaking(): boolean {
    return this.isSpeakingInternal || Boolean(this.synth && this.synth.speaking);
  }

  public get isListening(): boolean {
    return this.isListeningInternal;
  }

  // Play synthetic pleasant UI sounds using Web Audio
  public playChime(type: 'wake' | 'success' | 'confirm' | 'alert' | 'click' = 'wake') {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      if (type === 'wake') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'triangle';

        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

        osc2.frequency.setValueAtTime(1174.66, now); // D6
        osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.18);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === 'success') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'alert') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(330, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'confirm') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.12);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      console.warn('Web Audio error:', e);
    }
  }

  // Emergency Siren / Ringtone to find phone
  public startEmergencyRing() {
    this.stopEmergencyRing();
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      let toggle = false;
      this.ringInterval = setInterval(() => {
        if (!this.ringOscillator) return;
        const now = ctx.currentTime;
        osc.frequency.setValueAtTime(toggle ? 960 : 720, now);
        toggle = !toggle;
      }, 350);

      this.ringOscillator = osc;
      this.ringGain = gain;
    } catch (e) {
      console.warn('Ring error:', e);
    }
  }

  public stopEmergencyRing() {
    if (this.ringInterval) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
    if (this.ringOscillator) {
      try {
        this.ringOscillator.stop();
        this.ringOscillator.disconnect();
      } catch (e) {}
      this.ringOscillator = null;
    }
    if (this.ringGain) {
      try {
        this.ringGain.disconnect();
      } catch (e) {}
      this.ringGain = null;
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.synth) {
      const v = this.synth.getVoices();
      if (v && v.length > 0) this.cachedVoices = v;
    }
    return this.cachedVoices;
  }

  // Speak using SpeechSynthesis
  public speak(
    text: string, 
    options?: { 
      pitch?: number; 
      rate?: number; 
      gender?: 'male' | 'female' | 'neutral';
      voiceName?: string;
      onStart?: () => void; 
      onEnd?: () => void;
      onError?: () => void;
    }
  ) {
    if (!text || !text.trim()) return;

    if (!this.synth) {
      this.isSpeakingInternal = true;
      options?.onStart?.();
      setTimeout(() => {
        this.isSpeakingInternal = false;
        options?.onEnd?.();
      }, 2000);
      return;
    }

    try {
      // Resume synth in case Chrome auto-paused it
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Detect if English or Portuguese
      const isEnglish = /^[a-zA-Z\s\.,!\?']{15,}$/.test(text) && (
        text.toLowerCase().includes('hey') || 
        text.toLowerCase().includes('adam') || 
        text.toLowerCase().includes('hello') ||
        text.toLowerCase().includes('create')
      );

      utterance.lang = isEnglish ? 'en-US' : 'pt-BR';
      utterance.pitch = options?.pitch ?? 0.95;
      utterance.rate = options?.rate ?? 1.05;

      // Select best natural voice
      const voices = this.cachedVoices.length > 0 ? this.cachedVoices : this.synth.getVoices();
      
      let selectedVoice: SpeechSynthesisVoice | undefined;

      // If specific voice requested by name
      if (options?.voiceName) {
        selectedVoice = voices.find(v => v.name.toLowerCase().includes(options.voiceName!.toLowerCase()));
      }

      if (!selectedVoice) {
        if (isEnglish) {
          selectedVoice = voices.find(v => 
            v.lang.startsWith('en') && (
              v.name.toLowerCase().includes('adam') ||
              v.name.toLowerCase().includes('natural') ||
              v.name.toLowerCase().includes('guy') ||
              v.name.toLowerCase().includes('david') ||
              v.name.toLowerCase().includes('google us english')
            )
          ) || voices.find(v => v.lang.startsWith('en'));
        } else if (options?.gender === 'female') {
          // Look for female Portuguese voices
          selectedVoice = voices.find(v => 
            (v.lang === 'pt-BR' || v.lang.startsWith('pt')) && (
              v.name.toLowerCase().includes('maria') ||
              v.name.toLowerCase().includes('francisca') ||
              v.name.toLowerCase().includes('luciana') ||
              v.name.toLowerCase().includes('thalita') ||
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('vitória') ||
              v.name.toLowerCase().includes('vitoria') ||
              v.name.toLowerCase().includes('raquel') ||
              v.name.toLowerCase().includes('leticia') ||
              v.name.toLowerCase().includes('helena')
            )
          ) || voices.find(v => 
            v.lang === 'pt-BR' || v.lang.startsWith('pt')
          );
        } else {
          // Look for natural Portuguese voices
          selectedVoice = voices.find(v => 
            (v.lang === 'pt-BR' || v.lang.startsWith('pt')) && (
              v.name.toLowerCase().includes('natural') ||
              v.name.toLowerCase().includes('google') ||
              v.name.toLowerCase().includes('daniel') ||
              v.name.toLowerCase().includes('antonio') ||
              v.name.toLowerCase().includes('felipe') ||
              v.name.toLowerCase().includes('luciano') ||
              v.name.toLowerCase().includes('neural')
            )
          ) || voices.find(v => 
            v.lang === 'pt-BR' || 
            v.lang.startsWith('pt') || 
            v.name.toLowerCase().includes('portuguese') || 
            v.name.toLowerCase().includes('brasil')
          );
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      this.isSpeakingInternal = true;

      utterance.onstart = () => {
        this.isSpeakingInternal = true;
        options?.onStart?.();
      };
      utterance.onend = () => {
        this.isSpeakingInternal = false;
        options?.onEnd?.();
      };
      utterance.onerror = (e) => {
        console.warn('Utterance speech error:', e);
        this.isSpeakingInternal = false;
        options?.onError?.();
        options?.onEnd?.();
      };

      this.synth.speak(utterance);
    } catch (e) {
      console.error('Speech error:', e);
      this.isSpeakingInternal = false;
      options?.onEnd?.();
    }
  }

  public stopSpeaking() {
    this.isSpeakingInternal = false;
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
  }

  // Start Voice Recognition with Instant Silence Auto-Dispatch
  public startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: any) => void,
    onEnd: (finalTranscript?: string) => void
  ) {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError(new Error('Reconhecimento de voz não suportado neste navegador. Digite seu comando ou clique em um dos exemplos rápidos!'));
      return;
    }

    try {
      this.stopSpeaking();
      this.playChime('wake');
      this.isListeningInternal = true;
      this.lastTranscriptBuffer = '';

      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const activeText = (finalTranscript || interimTranscript).trim();
        if (activeText) {
          this.lastTranscriptBuffer = activeText;
          const isFinal = Boolean(finalTranscript);
          onResult(activeText, isFinal);

          // If browser provided final phrase, dispatch immediately without silence delay
          if (isFinal && activeText.length > 2) {
            if (this.silenceTimer) clearTimeout(this.silenceTimer);
            this.stopListening();
            return;
          }

          // Ultra-fast auto-dispatch after 600ms of silence
          if (this.silenceTimer) clearTimeout(this.silenceTimer);
          this.silenceTimer = setTimeout(() => {
            if (this.isListeningInternal && this.lastTranscriptBuffer) {
              const textToDispatch = this.lastTranscriptBuffer;
              this.stopListening();
              onResult(textToDispatch, true);
            }
          }, 600);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn('Recognition error:', event?.error);
        if (event?.error !== 'no-speech') {
          this.isListeningInternal = false;
          onError(event);
        }
      };

      this.recognition.onend = () => {
        this.isListeningInternal = false;
        if (this.silenceTimer) {
          clearTimeout(this.silenceTimer);
          this.silenceTimer = null;
        }
        onEnd(this.lastTranscriptBuffer);
      };

      this.recognition.start();
    } catch (e) {
      this.isListeningInternal = false;
      onError(e);
    }
  }

  public stopListening(): string {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    const captured = this.lastTranscriptBuffer;
    if (this.recognition && this.isListeningInternal) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListeningInternal = false;
    }
    return captured;
  }
}

export const voiceService = new VoiceService();
