import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Volume2, 
  Send, 
  CheckCheck, 
  Mic, 
  Trash2, 
  MessageSquare, 
  Plus, 
  User, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { PhoneNotification, Contact } from '../types';
import { voiceService } from '../services/voice';

interface NotificationsCenterProps {
  notifications: PhoneNotification[];
  contacts: Contact[];
  onMarkAsRead: (id: string) => void;
  onClearNotification: (id: string) => void;
  onSendMessage: (contactName: string, text: string) => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  notifications,
  contacts,
  onMarkAsRead,
  onClearNotification,
  onSendMessage
}) => {
  const [selectedContact, setSelectedContact] = useState<string>(contacts[0]?.name || 'João Silva');
  const [voiceDraft, setVoiceDraft] = useState('');
  const [isRecordingReply, setIsRecordingReply] = useState(false);
  const [activeReadingId, setActiveReadingId] = useState<string | null>(null);

  // Read message with APOLO Voice
  const handleReadMessage = (notif: PhoneNotification) => {
    setActiveReadingId(notif.id);
    onMarkAsRead(notif.id);

    const speechText = `Mensagem recebida de ${notif.sender}, no aplicativo ${notif.appName}. Diz o seguinte: ${notif.message}`;
    
    voiceService.speak(speechText, {
      onEnd: () => setActiveReadingId(null),
      onError: () => setActiveReadingId(null)
    });
  };

  // Voice dictation for message reply
  const handleToggleVoiceReply = () => {
    if (isRecordingReply) {
      voiceService.stopListening();
      setIsRecordingReply(false);
      return;
    }

    setIsRecordingReply(true);
    voiceService.startListening(
      (transcript, isFinal) => {
        setVoiceDraft(transcript);
        if (isFinal) {
          setIsRecordingReply(false);
        }
      },
      () => {
        setIsRecordingReply(false);
      },
      () => {
        setIsRecordingReply(false);
      }
    );
  };

  const handleSendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceDraft.trim()) return;
    onSendMessage(selectedContact, voiceDraft.trim());
    setVoiceDraft('');
    voiceService.playChime('success');
  };

  return (
    <div id="notifications-messages-center" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-green-600/20 border border-green-500/30 text-green-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Leitura de Mensagens & Notificações</h2>
            <p className="text-xs text-slate-400">
              Identificação de contato, leitura falada e resposta por digitação de voz
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
          {notifications.filter(n => !n.isRead).length} não lidas
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Notification Feed */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Notificações Recebidas</span>
            <span className="text-[11px] text-slate-500">Clique para ouvir por voz</span>
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            <AnimatePresence>
              {notifications.map((notif) => {
                const isReadingThis = activeReadingId === notif.id;
                return (
                  <motion.div
                    key={notif.id}
                    id={`notification-card-${notif.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      !notif.isRead
                        ? 'bg-slate-950/80 border-indigo-500/40 ring-1 ring-indigo-500/20'
                        : 'bg-slate-950/40 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                          {notif.appName}
                        </span>
                        <span className="font-semibold text-xs text-white">{notif.sender}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{notif.time}</span>
                    </div>

                    <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                      "{notif.message}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                      <button
                        id={`read-notif-voice-btn-${notif.id}`}
                        onClick={() => handleReadMessage(notif)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
                          isReadingThis
                            ? 'bg-cyan-500 text-white animate-pulse'
                            : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        {isReadingThis ? 'Lendo Mensagem...' : 'Ouvir em Voz Alta'}
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                          title="Marcar como lida"
                        >
                          <CheckCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onClearNotification(notif.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Voice Dictation & Reply Box */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Digitação e Envio por Voz
              </h3>
            </div>

            <form onSubmit={handleSendSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Enviar mensagem para:
                </label>
                <select
                  id="message-contact-recipient-select"
                  value={selectedContact}
                  onChange={(e) => setSelectedContact(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.relationship})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-medium text-slate-400">
                    Conteúdo da Mensagem:
                  </label>
                  <button
                    type="button"
                    id="dictate-voice-msg-btn"
                    onClick={handleToggleVoiceReply}
                    className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                      isRecordingReply
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                    }`}
                  >
                    <Mic className="w-3 h-3" />
                    {isRecordingReply ? 'Gravando voz...' : 'Ditar por Voz'}
                  </button>
                </div>

                <textarea
                  id="message-text-area"
                  rows={4}
                  value={voiceDraft}
                  onChange={(e) => setVoiceDraft(e.target.value)}
                  placeholder="Ex: Vou chegar às 9 para a reunião com os relatórios..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              <button
                id="send-voice-message-btn"
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" /> Enviar Mensagem
              </button>
            </form>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
            🔒 <strong className="text-slate-300">Nível 2 de Segurança:</strong> O APOLO confirma o remetente e o texto antes de disparar o envio.
          </div>
        </div>
      </div>
    </div>
  );
};
