import { motion, AnimatePresence } from 'framer-motion';
import { X, Database, ShoppingCart, FileText, Users, Calendar, Building, Boxes } from 'lucide-react';
import { templates, instantiateTemplate } from '../../lib/templates';
import { useSchemaStore } from '../../store/schemaStore';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const templateIcons: Record<string, React.ReactNode> = {
  ecommerce: <ShoppingCart className="w-6 h-6" />,
  blog: <FileText className="w-6 h-6" />,
  crm: <Users className="w-6 h-6" />,
  booking: <Calendar className="w-6 h-6" />,
  saas: <Building className="w-6 h-6" />,
  warehouse: <Boxes className="w-6 h-6" />,
};

const templateColors: Record<string, string> = {
  ecommerce: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400',
  blog: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400',
  crm: 'from-emerald-500/20 to-green-500/20 border-emerald-500/30 text-emerald-400',
  booking: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
  saas: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-400',
  warehouse: 'from-zinc-500/20 to-slate-500/20 border-zinc-500/30 text-zinc-400',
};

export function TemplatesModal({ isOpen, onClose }: TemplatesModalProps) {
  const { loadProject, clearProject } = useSchemaStore();

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const { tables, relations } = instantiateTemplate(template);
    clearProject();
    loadProject(tables, relations);
    onClose();
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
          className="w-full max-w-4xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <div>
              <h2 className="text-xl font-semibold text-white">Szablony</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Wybierz gotowy projekt, aby rozpocząć
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
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTemplate(template.id)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${templateColors[template.id] || 'from-slate-600/20 to-slate-500/20 border-slate-500/30 text-slate-400'} border text-left transition-all hover:shadow-lg`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-600/30">
                      {templateIcons[template.id] || <Database className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{template.name}</h3>
                      <p className="text-xs text-slate-400">{template.tables.length} tabel</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {template.description}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Anuluj
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
