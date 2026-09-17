import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  Bell, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Trash2, 
  Sparkles,
  CalendarDays,
  Timer
} from 'lucide-react';
import { AgendaItem, AlarmItem } from '../types';
import { voiceService } from '../services/voice';

interface ClockAgendaModuleProps {
  agenda: AgendaItem[];
  alarms: AlarmItem[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Omit<AgendaItem, 'id'>) => void;
  onDeleteTask: (id: string) => void;
  onToggleAlarm: (id: string) => void;
  onAddAlarm: (alarm: Omit<AlarmItem, 'id'>) => void;
  onDeleteAlarm: (id: string) => void;
}

export const ClockAgendaModule: React.FC<ClockAgendaModuleProps> = ({
  agenda,
  alarms,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onToggleAlarm,
  onAddAlarm,
  onDeleteAlarm
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateStr, setCurrentDateStr] = useState<string>('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('09:00');
  const [newTaskDate, setNewTaskDate] = useState('Amanhã');
  const [newAlarmTime, setNewAlarmTime] = useState('07:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Lembrete de Tarefa');

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const mins = now.getMinutes().toString().padStart(2, '0');
      const secs = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${mins}:${secs}`);

      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDateStr(now.toLocaleDateString('pt-BR', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Voice read time
  const handleSpeakTime = () => {
    voiceService.playChime('confirm');
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const speech = `Agora são exatamente ${h} horas e ${m} minutos. Data de hoje: ${currentDateStr}.`;
    voiceService.speak(speech);
  };

  // Voice read overdue / uncompleted tasks
  const handleSpeakPendingTasks = () => {
    const pending = agenda.filter((t) => !t.completed);
    if (pending.length === 0) {
      voiceService.speak('Parabéns! Todas as tarefas da sua agenda foram realizadas.');
      return;
    }

    const taskNames = pending.map((t) => `${t.title} às ${t.time}`).join(', ');
    const text = `Você possui ${pending.length} tarefas pendentes na agenda do APOLO: ${taskNames}.`;
    voiceService.speak(text);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      time: newTaskTime,
      date: newTaskDate,
      completed: false,
      category: 'trabalho',
      isOverdue: false
    });

    setNewTaskTitle('');
    voiceService.playChime('success');
  };

  const handleAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime) return;

    onAddAlarm({
      time: newAlarmTime,
      label: newAlarmLabel || 'Alarme APOLO',
      active: true,
      repeatDays: ['Todos os dias']
    });

    setNewAlarmLabel('');
    voiceService.playChime('success');
  };

  const pendingCount = agenda.filter((t) => !t.completed).length;

  return (
    <div id="clock-agenda-module" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header & Talking Clock Banner */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-6 flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Controle de Horas, Alarmes & Agenda</h2>
            <p className="text-xs text-slate-400">
              Relógio falante, lembretes de tarefas e cronograma automatizado
            </p>
          </div>
        </div>

        {/* Digital Talking Clock Display */}
        <div className="md:col-span-6 flex items-center justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <div className="text-2xl sm:text-3xl font-mono font-extrabold text-amber-400 tracking-wider">
              {currentTime || '--:--:--'}
            </div>
            <div className="text-[11px] text-slate-400 capitalize">
              {currentDateStr || 'Carregando data...'}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="speak-time-btn"
              onClick={handleSpeakTime}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" /> Ler Horas
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Agenda List & Alarm Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Agenda & Tasks */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Tarefas da Agenda ({pendingCount} pendentes)
              </h3>
            </div>

            <button
              id="speak-pending-tasks-btn"
              onClick={handleSpeakPendingTasks}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" /> Ler Tarefas Pendentes
            </button>
          </div>

          {/* New Task Form */}
          <form onSubmit={handleTaskSubmit} className="flex gap-2">
            <input
              id="new-agenda-task-input"
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Ex: Levar documentos às 7:00..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={newTaskTime}
              onChange={(e) => setNewTaskTime(e.target.value)}
              className="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-center text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>

          {/* Tasks List */}
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            <AnimatePresence>
              {agenda.map((task) => (
                <motion.div
                  key={task.id}
                  id={`agenda-item-${task.id}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 text-xs ${
                    task.completed
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-70'
                      : task.isOverdue
                      ? 'bg-rose-500/10 border-rose-500/30'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 cursor-pointer" onClick={() => onToggleTask(task.id)}>
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 hover:border-slate-400'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="space-y-0.5">
                      <span className={`font-medium block ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {task.title}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-mono text-indigo-300 font-semibold">{task.time}</span>
                        <span>•</span>
                        <span>{task.date}</span>
                        {task.isOverdue && !task.completed && (
                          <span className="text-rose-400 font-bold bg-rose-500/20 px-1 rounded">Atrasada</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Alarms Manager */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Alarmes por Voz & Notificação
              </h3>
            </div>

            {/* New Alarm Form */}
            <form onSubmit={handleAlarmSubmit} className="space-y-2 mb-4">
              <div className="flex gap-2">
                <input
                  type="time"
                  required
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                />
                <input
                  type="text"
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  placeholder="Nome do Alarme..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1 shadow-md shadow-amber-600/20 cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Criar Alarme
              </button>
            </form>

            {/* Alarms List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  id={`alarm-card-${alarm.id}`}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onToggleAlarm(alarm.id)}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        alarm.active ? 'bg-amber-500 border-amber-400 shadow-sm shadow-amber-500/50' : 'border-slate-600'
                      }`}
                    />
                    <div>
                      <span className="text-base font-mono font-bold text-slate-100 block">
                        {alarm.time}
                      </span>
                      <span className="text-[11px] text-slate-400">{alarm.label}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500">
                      {alarm.repeatDays.join(', ')}
                    </span>
                    <button
                      onClick={() => onDeleteAlarm(alarm.id)}
                      className="p-1 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
            💬 Diga: <strong className="text-amber-300">"APOLO, amanhã às 7 da manhã me lembra de levar os documentos"</strong> para agendamento automático!
          </div>
        </div>
      </div>
    </div>
  );
};
