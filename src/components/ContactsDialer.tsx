import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  UserPlus, 
  Volume2, 
  Star, 
  Search, 
  Trash2, 
  Edit3, 
  Check, 
  Mic
} from 'lucide-react';
import { Contact } from '../types';
import { voiceService } from '../services/voice';

interface ContactsDialerProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id'>) => void;
  onDeleteContact: (id: string) => void;
  onUpdateContact: (contact: Contact) => void;
}

export const ContactsDialer: React.FC<ContactsDialerProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
  onUpdateContact
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCallContact, setActiveCallContact] = useState<Contact | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callTimerInterval, setCallTimerInterval] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dialPadNumber, setDialPadNumber] = useState('');

  // Form State for new contact
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [relationshipInput, setRelationshipInput] = useState('Pessoal');

  // Read Contact details aloud with APOLO Voice
  const handleSpeakContact = (contact: Contact) => {
    voiceService.playChime('confirm');
    const text = `Contato: ${contact.name}. Número de telefone: ${contact.phone}. Relação: ${contact.relationship}.`;
    voiceService.speak(text);
  };

  // Start Simulated Voice Call
  const handleStartCall = (contact: Contact) => {
    setActiveCallContact(contact);
    setCallDuration(0);
    voiceService.playChime('wake');

    voiceService.speak(`Iniciando chamada de voz para ${contact.name}...`);

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    setCallTimerInterval(interval);
  };

  // End Call
  const handleEndCall = () => {
    if (callTimerInterval) {
      clearInterval(callTimerInterval);
      setCallTimerInterval(null);
    }
    voiceService.playChime('alert');
    if (activeCallContact) {
      voiceService.speak(`Chamada com ${activeCallContact.name} finalizada.`);
    }
    setActiveCallContact(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !phoneInput.trim()) return;

    onAddContact({
      name: nameInput.trim(),
      phone: phoneInput.trim(),
      email: emailInput.trim() || `${nameInput.toLowerCase().replace(/\s+/g, '')}@email.com`,
      avatarColor: 'bg-indigo-500',
      relationship: relationshipInput,
      isFavorite: false
    });

    setNameInput('');
    setPhoneInput('');
    setEmailInput('');
    setShowAddModal(false);
    voiceService.playChime('success');
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div id="contacts-dialer-center" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Lista de Contatos & Discador</h2>
            <p className="text-xs text-slate-400">
              Ligações por voz, leitura de número e identificação inteligente
            </p>
          </div>
        </div>

        <button
          id="add-contact-modal-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Adicionar Contato
        </button>
      </div>

      {/* Search & Dial Keypad Input */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="md:col-span-8 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="search-contacts-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou número..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filtered.map((contact) => (
              <div
                key={contact.id}
                id={`contact-card-${contact.id}`}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl ${contact.avatarColor} text-white flex items-center justify-center font-bold text-xs shadow-md`}>
                      {contact.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-slate-100">{contact.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{contact.phone}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSpeakContact(contact)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                    title="Leitura de nome e número pelo APOLO"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-900">
                  <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {contact.relationship}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`call-contact-btn-${contact.id}`}
                      onClick={() => handleStartCall(contact)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
                    >
                      <Phone className="w-3 h-3" /> Ligar
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Dialpad Simulator */}
        <div className="md:col-span-4 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Discador Rápido
            </span>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center mb-3">
              <span className="text-lg font-mono text-white font-bold tracking-wider">
                {dialPadNumber || 'Digite o número'}
              </span>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                <button
                  key={digit}
                  onClick={() => {
                    setDialPadNumber((prev) => prev + digit);
                    voiceService.playChime('click');
                  }}
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold rounded-xl border border-slate-800/80 active:scale-95 transition-all cursor-pointer"
                >
                  {digit}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-800">
            <button
              onClick={() => setDialPadNumber('')}
              className="flex-1 py-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-medium cursor-pointer"
            >
              Limpar
            </button>
            <button
              onClick={() => {
                if (!dialPadNumber) return;
                handleStartCall({
                  id: 'dialed',
                  name: `Número ${dialPadNumber}`,
                  phone: dialPadNumber,
                  email: '',
                  avatarColor: 'bg-emerald-600',
                  relationship: 'Discagem Direta'
                });
              }}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-md cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" /> Discar
            </button>
          </div>
        </div>
      </div>

      {/* Active Call Simulation Overlay */}
      <AnimatePresence>
        {activeCallContact && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl space-y-6">
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -inset-3 rounded-full bg-emerald-500/20 blur-md"
                />
                <div className={`w-20 h-20 rounded-full ${activeCallContact.avatarColor} text-white flex items-center justify-center text-2xl font-bold shadow-xl`}>
                  {activeCallContact.name.slice(0, 2).toUpperCase()}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-1">{activeCallContact.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-2">{activeCallContact.phone}</p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Em chamada • {formatDuration(callDuration)}
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-xs">
                Linha conectada com voz em tempo real. O assistente APOLO está gerenciando a chamada.
              </p>

              <button
                id="end-call-btn"
                onClick={handleEndCall}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
              >
                <PhoneOff className="w-7 h-7" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Adicionar Novo Contato</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ex: Carlos Oliveira"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telefone</label>
                  <input
                    type="text"
                    required
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Ex: +258 84 000 0000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Relação</label>
                  <input
                    type="text"
                    value={relationshipInput}
                    onChange={(e) => setRelationshipInput(e.target.value)}
                    placeholder="Ex: Trabalho, Família, Amigo"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
                  >
                    Salvar Contato
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
