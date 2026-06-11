import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';

interface ValidationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ValidationPanel({ isOpen, onClose }: ValidationPanelProps) {
  const { warnings, tables } = useSchemaStore();

  const errors = warnings.filter(w => w.type === 'error');
  const warningsOnly = warnings.filter(w => w.type === 'warning');

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
          className="w-full max-w-2xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-white">Walidacja</h2>
              {errors.length === 0 && warningsOnly.length === 0 && tables.length > 0 && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm border border-green-500/30">
                  <CheckCircle className="w-4 h-4" />
                  Wszystko OK
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-6">
            {tables.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">Brak tabel do walidacji</p>
                <p className="text-slate-500 text-sm mt-1">Dodaj tabele, aby sprawdzić ich poprawność</p>
              </div>
            ) : warnings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-300 font-medium">Schemat jest poprawny</p>
                <p className="text-slate-500 text-sm mt-1">Nie znaleziono żadnych błędów ani ostrzeżeń</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Errors section */}
                {errors.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-red-400 mb-3">
                      <AlertCircle className="w-4 h-4" />
                      Błędy ({errors.length})
                    </h3>
                    <div className="space-y-2">
                      {errors.map(warning => {
                        const table = tables.find(t => t.id === warning.tableId);
                        return (
                          <motion.div
                            key={warning.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                          >
                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-red-200 text-sm">{warning.message}</p>
                              {table && (
                                <p className="text-red-400/60 text-xs mt-1">
                                  Tabela: {table.name}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Warnings section */}
                {warningsOnly.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-amber-400 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Ostrzeżenia ({warningsOnly.length})
                    </h3>
                    <div className="space-y-2">
                      {warningsOnly.map(warning => {
                        const table = tables.find(t => t.id === warning.tableId);
                        return (
                          <motion.div
                            key={warning.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                          >
                            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-amber-200 text-sm">{warning.message}</p>
                              {table && (
                                <p className="text-amber-400/60 text-xs mt-1">
                                  Tabela: {table.name}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              {errors.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  {errors.length} {errors.length === 1 ? 'błąd' : 'błędy'}
                </span>
              )}
              {warningsOnly.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  {warningsOnly.length} {warningsOnly.length === 1 ? 'ostrzeżenie' : 'ostrzeżenia'}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Zamknij
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
