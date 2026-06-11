import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, TrendingUp, Sparkles } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import { calculateSchemaScore } from '../../lib/schemaScore';

interface SchemaScorePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SchemaScorePanel({ isOpen, onClose }: SchemaScorePanelProps) {
  const { tables, relations } = useSchemaStore();
  const score = calculateSchemaScore(tables, relations);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-emerald-400 from-emerald-500 to-emerald-600';
      case 'B': return 'text-blue-400 from-blue-500 to-blue-600';
      case 'C': return 'text-amber-400 from-amber-500 to-amber-600';
      case 'D': return 'text-orange-400 from-orange-500 to-orange-600';
      default: return 'text-red-400 from-red-500 to-red-600';
    }
  };

  const gradeColor = getGradeColor(score.grade);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-96 bg-slate-900 border-l border-slate-700 z-50 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Ocena schematu</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {tables.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-400">Dodaj tabele, aby obliczyć ocenę</p>
                </div>
              ) : (
                <>
                  {/* Grade display */}
                  <div className="bg-slate-800/50 rounded-2xl p-6 mb-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">Ocena ogólna</p>
                        <p className="text-4xl font-bold text-white">{score.percentage}%</p>
                      </div>
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${gradeColor.split(' ')[1]} ${gradeColor.split(' ')[2]} flex items-center justify-center shadow-lg`}>
                        <span className={`text-3xl font-bold ${gradeColor.split(' ')[0]}`}>{score.grade}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score.percentage}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full bg-gradient-to-r ${gradeColor.split(' ')[1]} ${gradeColor.split(' ')[2]}`}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{score.total} / {score.maxTotal} punktów</p>
                  </div>

                  {/* Categories */}
                  <div className="space-y-3 mb-6">
                    <h3 className="text-sm font-medium text-slate-300">Kategorie</h3>
                    {score.categories.map((category, idx) => (
                      <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-slate-300">{category.name}</span>
                          <span className="text-sm font-medium text-white">
                            {category.score}/{category.maxScore}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              category.score / category.maxScore >= 0.8
                                ? 'bg-emerald-500'
                                : category.score / category.maxScore >= 0.5
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                          />
                        </div>

                        {category.recommendations.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {category.recommendations.slice(0, 2).map((rec, recIdx) => (
                              <div key={recIdx} className="flex items-start gap-2 text-xs text-slate-400">
                                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Suggestions */}
                  {score.suggestions.length > 0 && (
                    <div className="bg-gradient-to-br from-blue-900/30 to-violet-900/30 rounded-xl p-4 border border-blue-700/30">
                      <h3 className="text-sm font-medium text-blue-300 mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Sugestie poprawy
                      </h3>
                      <ul className="space-y-2">
                        {score.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                            <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
