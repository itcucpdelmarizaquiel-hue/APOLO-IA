import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cpu, 
  ArrowDown, 
  CheckCircle, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  X, 
  Radio, 
  Globe, 
  Smartphone, 
  Layers, 
  Server,
  Terminal,
  Volume2
} from 'lucide-react';
import { CommandExecutionResult } from '../types';

interface ExecutorPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  executionData: CommandExecutionResult | null;
  onConfirmExecution: () => void;
  isExecuting?: boolean;
}

export const ExecutorPipelineModal: React.FC<ExecutorPipelineModalProps> = ({
  isOpen,
  onClose,
  executionData,
  onConfirmExecution,
  isExecuting = false
}) => {
  if (!isOpen || !executionData) return null;

  const getSecurityBadge = (lvl: number) => {
    if (lvl === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3.5 h-3.5" /> Nível 1 — Livre Execução
        </span>
      );
    } else if (lvl === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5" /> Nível 2 — Confirmação do Usuário
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
          <ShieldAlert className="w-3.5 h-3.5" /> Nível 3 — Confirmação Forte & Biometria
        </span>
      );
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Top Close Button */}
          <button
            id="close-executor-modal"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">Executor Central APOLO</h2>
                {getSecurityBadge(executionData.securityLevel)}
              </div>
              <p className="text-xs text-slate-400">
                Pipeline de conversão de voz em ações de sistema estruturadas
              </p>
            </div>
          </div>

          {/* Spoken Response Preview */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 flex items-start gap-3 shadow-inner">
            <Volume2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                Resposta por Voz do APOLO:
              </span>
              <p className="text-sm text-slate-100 font-medium leading-relaxed">
                "{executionData.speechResponse}"
              </p>
            </div>
          </div>

          {/* Visual Architecture Diagram */}
          <div className="mb-6 p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Terminal className="w-4 h-4" /> Fluxo Arquitetural APOLO
              </span>
              <span className="text-[11px] text-slate-500">Pipeline de Execução Ativo</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center">
                <Radio className="w-4 h-4 text-rose-400 mb-1" />
                <span className="font-semibold text-slate-200">1. VOZ / TEXTO</span>
                <span className="text-[10px] text-slate-400">Captura & Token</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-indigo-500/40 flex flex-col items-center">
                <Cpu className="w-4 h-4 text-indigo-400 mb-1 animate-spin" />
                <span className="font-semibold text-indigo-300">2. MOTOR IA</span>
                <span className="text-[10px] text-slate-400">Planejador + Memória</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/40 flex flex-col items-center">
                <ShieldAlert className="w-4 h-4 text-amber-400 mb-1" />
                <span className="font-semibold text-amber-300">3. SEGURANÇA</span>
                <span className="text-[10px] text-slate-400">Nível {executionData.securityLevel} Verificado</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/40 flex flex-col items-center">
                <Layers className="w-4 h-4 text-emerald-400 mb-1" />
                <span className="font-semibold text-emerald-300">4. EXECUTOR</span>
                <span className="text-[10px] text-slate-400">Ações no Celular</span>
              </div>
            </div>
          </div>

          {/* Detailed Plan Steps */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Etapas Desmembradas pelo Motor IA:
            </h3>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {executionData.executionPlan.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-[11px]">
                      {step.step || idx + 1}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-200 block">{step.name}</span>
                      <span className="text-slate-400 text-[11px]">{step.detail}</span>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <CheckCircle className="w-3.5 h-3.5" /> Concluído
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action List Preview */}
          {executionData.actions.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h4 className="text-xs font-semibold text-slate-300">Ações Finais a Executar no Dispositivo:</h4>
              <div className="space-y-1.5">
                {executionData.actions.map((act, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <Play className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>[{act.type}] {JSON.stringify(act.payload)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warning for Level 2 & Level 3 */}
          {executionData.requiresConfirmation && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200 leading-relaxed">
                <strong className="block font-semibold mb-0.5">Autorização de Segurança Obrigatória</strong>
                {executionData.confirmationReason || 'Esta ação afeta dados externos, mensagens ou segurança do sistema. Por favor autorize para prosseguir.'}
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              id="cancel-execution-btn"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              id="confirm-execution-btn"
              disabled={isExecuting}
              onClick={onConfirmExecution}
              className={`px-5 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                executionData.securityLevel === 3
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              {isExecuting ? 'Executando Tarefas...' : 'Autorizar & Executar Ações'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
