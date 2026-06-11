import { motion } from 'framer-motion';
import { PlusCircle, GitBranch, AlertTriangle, Lightbulb, Sparkles, Link2, FileText, TrendingUp, Layers } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';

interface SidebarProps {
  onAddTable: () => void;
  onOpenValidation: () => void;
  onOpenSuggestions: () => void;
  onOpenDescribe: () => void;
  onOpenDbDescription: () => void;
  onOpenSchemaScore: () => void;
  onOpenExpandDatabase: () => void;
}

export function Sidebar({ onAddTable, onOpenValidation, onOpenSuggestions, onOpenDescribe, onOpenDbDescription, onOpenSchemaScore, onOpenExpandDatabase }: SidebarProps) {
  const { relationMode, toggleRelationMode, warnings, tables } = useSchemaStore();

  const errorCount = warnings.filter(w => w.type === 'error').length;
  const warningCount = warnings.filter(w => w.type === 'warning').length;

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-slate-900/80 border-r border-slate-700/50 flex flex-col p-4 backdrop-blur-sm"
    >
      <div className="flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAddTable}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600/20 to-violet-600/20 border border-blue-500/30 text-blue-300 hover:border-blue-500/50 hover:from-blue-600/30 hover:to-violet-600/30 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-medium">Dodaj tabelę</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenDescribe}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-600/20 to-orange-600/20 border border-amber-500/30 text-amber-300 hover:border-amber-500/50 transition-all"
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-medium">Opisz bazę</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenSuggestions}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="font-medium">Sugestie</span>
        </motion.button>

        {tables.length > 0 && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onOpenExpandDatabase}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 text-violet-300 hover:border-violet-500/50 transition-all"
          >
            <Layers className="w-5 h-5" />
            <span className="font-medium">Rozbuduj bazę</span>
          </motion.button>
        )}

        {tables.length > 0 && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onOpenDbDescription}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all"
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium">Opis bazy</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={toggleRelationMode}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all ${
            relationMode
              ? 'bg-violet-600/20 border-violet-500/50 text-violet-300'
              : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white'
          }`}
        >
          <GitBranch className="w-5 h-5" />
          <span className="font-medium">Tryb relacji</span>
          {relationMode && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto w-2 h-2 rounded-full bg-violet-400"
            />
          )}
        </motion.button>

        {tables.length >= 2 && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {}}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all"
          >
            <Link2 className="w-5 h-5" />
            <span className="font-medium">Szybka relacja</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={onOpenValidation}
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:border-slate-600 hover:text-white transition-all"
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="font-medium">Walidacja</span>
          {(errorCount > 0 || warningCount > 0) && (
            <div className="ml-auto flex gap-1">
              {errorCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                  {errorCount}
                </span>
              )}
              {warningCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {warningCount}
                </span>
              )}
            </div>
          )}
        </motion.button>

        {tables.length > 0 && (
          <motion.button
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.99 }}
            onClick={onOpenSchemaScore}
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 transition-all"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Ocena schematu</span>
          </motion.button>
        )}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
        <p className="text-sm text-slate-400 leading-relaxed">
          Dodaj tabelę, uzupełnij kolumny i połącz relacje.
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-700/30">
        <p className="text-xs text-slate-500">
          Kliknij tabelę, aby edytować jej właściwości.
        </p>
      </div>
    </motion.aside>
  );
}
