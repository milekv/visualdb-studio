import { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, X, Link2, Type, Key, Database, Plus, CheckCircle } from 'lucide-react';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import type { Suggestion } from '../../lib/smartSuggestions';
import { generateSuggestions } from '../../lib/smartSuggestions';
import type { DataType, OnDeleteAction } from '../../types/schema';

interface SmartSuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  relation: <Link2 className="w-4 h-4" />,
  column_type: <Type className="w-4 h-4" />,
  constraint: <Key className="w-4 h-4" />,
  index: <Database className="w-4 h-4" />,
  column_missing: <Plus className="w-4 h-4" />,
};

const severityColors: Record<string, string> = {
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  optimization: 'border-green-500/30 bg-green-500/10',
};

const severityTextColors: Record<string, string> = {
  warning: 'text-amber-400',
  info: 'text-blue-400',
  optimization: 'text-green-400',
};

export function SmartSuggestionsPanel({ isOpen, onClose }: SmartSuggestionsPanelProps) {
  const { tables, addColumn, updateColumn, addRelation } = useSchemaStore();

  const applySuggestion = useCallback((suggestion: Suggestion) => {
    if (suggestion.type === 'column_missing' && suggestion.columnName === undefined) {
      const table = tables.find(t => t.id === suggestion.tableId);
      if (!table) return;

      if (suggestion.message.includes('klucza głównego')) {
        addColumn(table.id, {
          id: generateId(),
          name: 'id',
          dataType: 'SERIAL',
          isPrimaryKey: true,
          isNotNull: true,
          isUnique: false,
          isIndex: false,
          isForeignKey: false,
        });
      } else if (suggestion.message.includes('created_at')) {
        addColumn(table.id, {
          id: generateId(),
          name: 'created_at',
          dataType: 'TIMESTAMP',
          isPrimaryKey: false,
          isNotNull: false,
          isUnique: false,
          isIndex: false,
          isForeignKey: false,
          defaultValue: 'CURRENT_TIMESTAMP',
        });
      } else if (suggestion.message.includes('zamówienia')) {
        // This is handled by RelatedTableMenu
      }
    }

    if (suggestion.type === 'constraint' && suggestion.columnId) {
      if (suggestion.message.includes('UNIQUE')) {
        updateColumn(suggestion.tableId, suggestion.columnId, { isUnique: true });
      }
    }

    if (suggestion.type === 'column_type' && suggestion.columnId) {
      if (suggestion.message.includes('NUMERIC')) {
        updateColumn(suggestion.tableId, suggestion.columnId, { dataType: 'NUMERIC(10,2)' as DataType });
      }
    }

    if (suggestion.type === 'index' && suggestion.columnId) {
      updateColumn(suggestion.tableId, suggestion.columnId, { isIndex: true });
    }

    if (suggestion.type === 'relation' && suggestion.columnId) {
      const table = tables.find(t => t.id === suggestion.tableId);
      const column = table?.columns.find(c => c.id === suggestion.columnId);
      if (!table || !column) return;

      const colName = column.name.toLowerCase();
      let targetTableName = colName.replace('_id', '');

      if (colName === 'author_id') targetTableName = 'users';
      if (colName === 'customer_id') targetTableName = 'customers';
      if (colName === 'user_id') targetTableName = 'users';

      const targetTable = tables.find(t => t.name.toLowerCase() === targetTableName.toLowerCase());
      if (!targetTable) return;

      const pkColumn = targetTable.columns.find(c => c.isPrimaryKey);
      if (!pkColumn) return;

      updateColumn(table.id, column.id, {
        isForeignKey: true,
        foreignKey: {
          referencedTableId: targetTable.id,
          referencedColumnId: pkColumn.id,
          onDelete: 'NO ACTION' as OnDeleteAction,
        },
      });

      addRelation({
        id: generateId(),
        sourceTableId: table.id,
        sourceColumnId: column.id,
        targetTableId: targetTable.id,
        targetColumnId: pkColumn.id,
        onDelete: 'NO ACTION',
      });
    }
  }, [tables, addColumn, updateColumn, addRelation]);

  const suggestions = useMemo(() => {
    return generateSuggestions(tables, () => {});
  }, [tables]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="w-80 bg-slate-900/95 border-l border-slate-700/50 flex flex-col backdrop-blur-sm"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">Sugestie</h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {suggestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <CheckCircle className="w-10 h-10 text-green-400 mb-3" />
              <p className="text-slate-300 font-medium">Wszystko w porządku</p>
              <p className="text-slate-500 text-sm mt-1">Brak sugestii do zastosowania</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${severityColors[suggestion.severity]}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 ${severityTextColors[suggestion.severity]}`}>
                      {iconMap[suggestion.type]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {suggestion.message}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => applySuggestion(suggestion)}
                        className="mt-2 px-3 py-1.5 rounded-md bg-slate-700/50 text-sm text-slate-300 hover:bg-slate-600/50 hover:text-white transition-colors"
                      >
                        {suggestion.actionLabel}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="p-3 border-t border-slate-700/30">
          <p className="text-xs text-slate-500">
            Sugestie aktualizują się automatycznie na podstawie schematu.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
