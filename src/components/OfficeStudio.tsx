import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Table, 
  Presentation, 
  Plus, 
  Sparkles, 
  Download, 
  FileCode, 
  Save, 
  Trash2, 
  Layers,
  Edit3
} from 'lucide-react';
import { OfficeDocument } from '../types';
import { voiceService } from '../services/voice';

interface OfficeStudioProps {
  documents: OfficeDocument[];
  onAddDocument: (doc: OfficeDocument) => void;
  onDeleteDocument: (id: string) => void;
  onUpdateDocument: (doc: OfficeDocument) => void;
}

export const OfficeStudio: React.FC<OfficeStudioProps> = ({
  documents,
  onAddDocument,
  onDeleteDocument,
  onUpdateDocument
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [activeType, setActiveType] = useState<'doc' | 'sheet' | 'slide'>('doc');
  const [generateTopic, setGenerateTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  const currentDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  // AI Document Generator using backend
  const handleGenerateAIDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateTopic.trim()) return;

    setIsGenerating(true);
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/generate-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: activeType,
          topic: generateTopic.trim(),
          instructions: 'Completo, detalhado e profissional'
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const text = await res.text();
      if (!text || !text.trim()) {
        throw new Error('Empty response');
      }

      const data = JSON.parse(text);
      const newDoc: OfficeDocument = {
        id: `doc-${Date.now()}`,
        title: data.title || generateTopic,
        type: activeType,
        updatedAt: 'Agora mesmo',
        content: data.content || `# ${generateTopic}\n\nDocumento gerado com sucesso pelo APOLO IA.`,
        tableData: data.tableData,
        slides: data.slides
      };

      onAddDocument(newDoc);
      setSelectedDocId(newDoc.id);
      setGenerateTopic('');
      voiceService.playChime('success');
      voiceService.speak(`Documento ${newDoc.title} criado com sucesso no Office Studio.`);
    } catch (err) {
      console.error(err);
      const fallbackDoc: OfficeDocument = {
        id: `doc-${Date.now()}`,
        title: generateTopic,
        type: activeType,
        updatedAt: 'Agora mesmo',
        content: `# ${generateTopic}\n\nConteúdo gerado para uso executivo e acadêmico.`
      };
      onAddDocument(fallbackDoc);
      setSelectedDocId(fallbackDoc.id);
    } finally {
      setIsGenerating(false);
    }
  };

  // Export / Download Document
  const handleDownloadFile = () => {
    if (!currentDoc) return;
    voiceService.playChime('success');
    const blob = new Blob([currentDoc.content || JSON.stringify(currentDoc, null, 2)], {
      type: 'text/plain;charset=utf-8'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDoc.title.replace(/\s+/g, '_')}.${currentDoc.type === 'doc' ? 'docx' : currentDoc.type === 'sheet' ? 'xlsx' : 'pptx'}`;
    a.click();
    URL.revokeObjectURL(url);
    voiceService.speak(`Download do arquivo ${currentDoc.title} iniciado.`);
  };

  return (
    <div id="office-studio-module" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Criação de Documentos Office com IA</h2>
            <p className="text-xs text-slate-400">
              Gere documentos de texto (.docx), planilhas (.xlsx) e apresentações (.pptx)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFile}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Exportar Arquivo
          </button>
        </div>
      </div>

      {/* AI Prompt Generator Bar */}
      <form onSubmit={handleGenerateAIDoc} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-200">Gerador Inteligente por Comando</span>
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'doc', label: 'Documento Texto (.docx)', icon: FileText },
              { id: 'sheet', label: 'Planilha (.xlsx)', icon: Table },
              { id: 'slide', label: 'Apresentação (.pptx)', icon: Presentation }
            ].map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  type="button"
                  key={btn.id}
                  onClick={() => setActiveType(btn.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    activeType === btn.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <input
            id="office-topic-input"
            type="text"
            value={generateTopic}
            onChange={(e) => setGenerateTopic(e.target.value)}
            placeholder="Ex: 'Relatório financeiro trimestral' ou 'Slide sobre IA na educação'..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Gerando...' : 'Criar com IA'}
          </button>
        </div>
      </form>

      {/* Main Studio View: Document List on Left, Editor/Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Files List */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Arquivos Salvos no APOLO:
          </span>

          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  doc.id === currentDoc?.id
                    ? 'bg-blue-600/20 border-blue-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-blue-400">
                    {doc.type === 'sheet' ? <Table className="w-4 h-4" /> : doc.type === 'slide' ? <Presentation className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-xs truncate block">{doc.title}</span>
                    <span className="text-[10px] text-slate-400">{doc.updatedAt}</span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDocument(doc.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Document Viewer / Editor */}
        <div className="lg:col-span-8 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                {currentDoc?.type?.toUpperCase()}
              </span>
              <h3 className="text-base font-bold text-white mt-1">{currentDoc?.title}</h3>
            </div>

            <button
              onClick={handleDownloadFile}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Baixar
            </button>
          </div>

          {/* Render based on document type */}
          {currentDoc?.type === 'sheet' && currentDoc.tableData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-200 border-collapse">
                <tbody>
                  {currentDoc.tableData.map((row, rIdx) => (
                    <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-900 font-bold text-blue-300' : 'border-b border-slate-800/60'}>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5 border border-slate-800 font-mono">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : currentDoc?.type === 'slide' && currentDoc.slides ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentDoc.slides.map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">SLIDE {idx + 1}</span>
                  <h4 className="font-bold text-xs text-white">{s.title}</h4>
                  <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-1">
                    {s.points.map((p, pIdx) => (
                      <li key={pIdx}>{p}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
              {currentDoc?.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
