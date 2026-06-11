import { motion } from 'framer-motion';
import { Database, FileJson, Download, Upload, FileCode, Sparkles, Trash2 } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import { exportProject, downloadJSON, parseImport, readFileAsText } from '../../lib/exportUtils';
import { useRef, useState } from 'react';

interface TopbarProps {
  onNewProject: () => void;
  onOpenTemplates: () => void;
  onOpenSqlPreview: () => void;
}

export function Topbar({ onNewProject, onOpenTemplates, onOpenSqlPreview }: TopbarProps) {
  const { tables, relations, projectName, loadProject, clearProject } = useSchemaStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExport = () => {
    const json = exportProject(tables, relations, projectName);
    downloadJSON(json, `${projectName.replace(/\s+/g, '_')}.json`);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      const result = parseImport(content);
      if (result) {
        loadProject(result.tables, result.relations);
      } else {
        alert('Nieprawidłowy format pliku JSON');
      }
    } catch {
      alert('Błąd podczas importowania pliku');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearProject = () => {
    clearProject();
    setShowClearConfirm(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50 flex items-center justify-between px-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Database className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            VisualDB Studio
          </span>
        </motion.div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Nowy projekt</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenTemplates}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <FileCode className="w-4 h-4" />
          <span className="text-sm font-medium">Szablony</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="text-sm font-medium">Import JSON</span>
        </motion.button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Eksport JSON</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Wyczyść</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenSqlPreview}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow ml-2"
        >
          <FileJson className="w-4 h-4" />
          <span>Generuj SQL</span>
        </motion.button>
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowClearConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">Wyczyścić projekt?</h3>
            <p className="text-slate-400 mb-4">Ta operacja usunie wszystkie tabele i relacje. Czy chcesz kontynuować?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleClearProject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                Wyczyść
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.header>
  );
}
