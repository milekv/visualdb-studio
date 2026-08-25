import { motion } from 'framer-motion';
import { Check, Database, FileJson, Download, Upload, FileCode, Plus, Redo2, Trash2, Undo2 } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import { exportProject, downloadJSON, parseImport, readFileAsText } from '../../lib/exportUtils';
import { useRef, useState } from 'react';

interface TopbarProps {
  onNewProject: () => void;
  onOpenTemplates: () => void;
  onOpenSqlPreview: () => void;
}

export function Topbar({ onNewProject, onOpenTemplates, onOpenSqlPreview }: TopbarProps) {
  const { tables, relations, projectName, loadProject, clearProject, setProjectName, history, future, undo, redo } = useSchemaStore();
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
      className="h-14 shrink-0 bg-[#091522] border-b border-slate-700/70 flex items-center justify-between px-4"
    >
      <div className="flex min-w-0 items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-cyan-500/40 bg-cyan-500/10">
            <Database className="w-[18px] h-[18px] text-cyan-300" />
          </div>
          <span className="text-[15px] font-semibold text-slate-100">
            VisualDB Studio
          </span>
        </div>
        <div className="hidden h-5 w-px bg-slate-700 sm:block" />
        <input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          aria-label="Project name"
          className="hidden w-44 border-0 bg-transparent px-0 text-sm font-medium text-slate-200 ring-0 placeholder:text-slate-600 focus:ring-0 sm:block"
        />
        <span className="hidden items-center gap-1.5 text-[11px] text-slate-500 xl:flex">
          <Check className="h-3.5 w-3.5 text-emerald-400" /> Autosaved locally
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          title="Undo"
          className="hidden rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 md:block"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={future.length === 0}
          title="Redo"
          className="hidden rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 md:block"
        >
          <Redo2 className="h-4 w-4" />
        </button>
        <div className="mx-1 hidden h-5 w-px bg-slate-700 md:block" />
        <button
          onClick={onNewProject}
          className="hidden items-center gap-2 rounded-md px-2.5 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:flex"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden text-xs font-medium xl:inline">New</span>
        </button>

        <button
          onClick={onOpenTemplates}
          className="hidden items-center gap-2 rounded-md px-2.5 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:flex"
        >
          <FileCode className="w-4 h-4" />
          <span className="hidden text-xs font-medium xl:inline">Templates</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="hidden items-center gap-2 rounded-md px-2.5 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:flex"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden text-xs font-medium xl:inline">Import project</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        <button
          onClick={handleExport}
          className="hidden items-center gap-2 rounded-md px-2.5 py-2 text-slate-400 transition hover:bg-slate-800 hover:text-white md:flex"
        >
          <Download className="w-4 h-4" />
          <span className="hidden text-xs font-medium xl:inline">Export</span>
        </button>

        <button
          onClick={() => setShowClearConfirm(true)}
          title="Clear project"
          className="hidden rounded-md p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 md:block"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSqlPreview}
          className="ml-1 flex items-center gap-2 rounded-md bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          <FileJson className="w-4 h-4" />
          <span>SQL preview</span>
        </button>
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
