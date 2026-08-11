import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Download, Check } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import { generateSQL, downloadSQL } from '../../lib/sqlGenerator';

interface SqlPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SqlPreview({ isOpen, onClose }: SqlPreviewProps) {
  const { tables, projectName } = useSchemaStore();
  const [copied, setCopied] = useState(false);

  const sql = generateSQL(tables);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = sql;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadSQL(sql, `${projectName.replace(/\s+/g, '_')}.sql`);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <div>
              <h2 className="text-xl font-semibold text-white">Wygenerowany SQL</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                PostgreSQL CREATE TABLE statements
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          {tables.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <p className="text-slate-400 mb-1">Brak tabel do wygenerowania SQL</p>
                <p className="text-slate-500 text-sm">Dodaj tabele, aby zobaczyć kod SQL</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <pre className="p-6 text-sm font-mono text-slate-300 leading-relaxed">
                {sql.split('\n').map((line, i) => (
                  <div key={i} className="flex">
                    <span className="w-10 text-right text-slate-600 select-none pr-4">
                      {i + 1}
                    </span>
                    <span className="flex-1">
                      {line.split(/(\s+)/).map((word, j) => {
                        if (/^\s+$/.test(word)) {
                          return word;
                        }
                        // Highlight SQL keywords
                        const keywords = ['CREATE', 'TABLE', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'NOT', 'NULL', 'UNIQUE', 'DEFAULT', 'CONSTRAINT', 'ON', 'DELETE', 'CASCADE', 'SET', 'RESTRICT', 'NO', 'ACTION', 'INDEX'];
                        const comparableWord = word.replace(/[(),;]/g, '').toUpperCase();
                        if (keywords.includes(comparableWord)) {
                          return (
                            <span key={j} className="text-blue-400">
                              {word}
                            </span>
                          );
                        }
                        // Highlight data types
                        const types = ['SERIAL', 'INTEGER', 'BIGINT', 'UUID', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'NUMERIC', 'JSONB'];
                        if (types.some(type => comparableWord.startsWith(type))) {
                          return (
                            <span key={j} className="text-violet-400">
                              {word}
                            </span>
                          );
                        }
                        // Highlight strings
                        if (word.startsWith("'") || word.includes("'")) {
                          return (
                            <span key={j} className="text-green-400">
                              {word}
                            </span>
                          );
                        }
                        return <span key={j}>{word}</span>;
                      })}
                    </span>
                  </div>
                ))}
              </pre>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <div className="text-sm text-slate-400">
              {tables.length} {tables.length === 1 ? 'tabela' : tables.length < 5 ? 'tabele' : 'tabel'}
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Skopiowano!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kopiuj SQL</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow"
              >
                <Download className="w-4 h-4" />
                <span>Pobierz .sql</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
