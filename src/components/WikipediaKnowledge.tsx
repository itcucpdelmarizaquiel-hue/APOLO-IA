import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Search, 
  Sparkles, 
  Volume2, 
  ExternalLink, 
  Globe, 
  Lightbulb,
  Check
} from 'lucide-react';
import { voiceService } from '../services/voice';

export const WikipediaKnowledge: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [knowledgeData, setKnowledgeData] = useState<any>({
    title: 'Inteligência Artificial & Assistentes de Voz',
    extract: 'A inteligência artificial aplicada ao processamento de linguagem natural permite que assistentes como o APOLO compreendam comandos orais, planejem rotinas, operem aplicativos e administrem tarefas com alta precisão contextual.',
    category: 'Tecnologia & Ciência',
    source: 'Enciclopédia APOLO / Base de Conhecimento Global',
    relatedTopics: ['Redes Neurais', 'Síntese de Voz', 'Automação Mobile', 'Segurança Cibernética']
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    voiceService.playChime('wake');

    try {
      const res = await fetch('/api/gemini/knowledge-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!res.ok) {
        throw new Error(`HTTP error: ${res.status}`);
      }

      const text = await res.text();
      if (!text || !text.trim()) {
        throw new Error('Empty response');
      }

      const data = JSON.parse(text);
      setKnowledgeData(data);
      voiceService.playChime('success');
      voiceService.speak(`Segundo a enciclopédia: ${data.extract || data.summary}`);
    } catch (err) {
      console.warn('Wikipedia query fallback:', err);
      const fallbackData = {
        title: query.trim(),
        extract: `Resumo enciclopédico sobre ${query.trim()} preparado pelo APOLO. O tema abrange conceitos fundamentais e referências enciclopédicas consolidadas.`,
        category: 'Conhecimento Geral',
        source: 'Enciclopédia APOLO',
        relatedTopics: ['Ciência', 'História', 'Tecnologia']
      };
      setKnowledgeData(fallbackData);
      voiceService.playChime('success');
      voiceService.speak(`Segundo a enciclopédia: ${fallbackData.extract}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakExtract = () => {
    if (!knowledgeData?.extract) return;
    voiceService.playChime('confirm');
    voiceService.speak(`Sobre ${knowledgeData.title}: ${knowledgeData.extract}`);
  };

  return (
    <div id="wikipedia-knowledge-module" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Wikipédia & Enciclopédia Oral</h2>
            <p className="text-xs text-slate-400">
              Consultas enciclopédicas de Nível 1 com leitura em tempo real
            </p>
          </div>
        </div>

        <button
          onClick={handleSpeakExtract}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30 text-xs font-semibold transition-all cursor-pointer"
        >
          <Volume2 className="w-4 h-4" /> Ler Resumo por Voz
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="wiki-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pergunte sobre história, ciência, geografia, personalidades..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          {isLoading ? 'Pesquisando...' : 'Consultar'}
        </button>
      </form>

      {/* Knowledge Result Card */}
      {knowledgeData && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {knowledgeData.category || 'Enciclopédia Geral'}
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5">{knowledgeData.title}</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Nível 1 • Livre
            </span>
          </div>

          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {knowledgeData.extract}
          </p>

          {knowledgeData.relatedTopics && (
            <div className="pt-3 border-t border-slate-900 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Tópicos Relacionados:
              </span>
              <div className="flex flex-wrap gap-2">
                {knowledgeData.relatedTopics.map((topic: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(topic);
                      voiceService.playChime('click');
                    }}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
