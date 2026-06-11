import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Plus } from 'lucide-react';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import type { OnDeleteAction, Column } from '../../types/schema';

interface QuickRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceTableId?: string | null;
}

const ON_DELETE_OPTIONS: OnDeleteAction[] = ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'];

export function QuickRelationModal({ isOpen, onClose, sourceTableId }: QuickRelationModalProps) {
  const { tables, addColumn, updateColumn, addRelation } = useSchemaStore();

  const initialSourceTable = sourceTableId
    ? tables.find(t => t.id === sourceTableId)
    : tables[0];

  const [selectedSourceTableId, setSelectedSourceTableId] = useState(
    initialSourceTable?.id || ''
  );
  const [selectedSourceColumnId, setSelectedSourceColumnId] = useState('');
  const [selectedTargetTableId, setSelectedTargetTableId] = useState('');
  const [selectedTargetColumnId, setSelectedTargetColumnId] = useState('');
  const [onDelete, setOnDelete] = useState<OnDeleteAction>('NO ACTION');
  const [shouldAddColumn, setShouldAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const sourceTable = tables.find(t => t.id === selectedSourceTableId);
  const targetTable = tables.find(t => t.id === selectedTargetTableId);

  const fkColumns = useMemo(() => {
    if (!sourceTable) return [];
    return sourceTable.columns.filter(c =>
      c.name.toLowerCase().endsWith('_id') && !c.isForeignKey
    );
  }, [sourceTable]);

  const pkColumns = useMemo(() => {
    if (!targetTable) return [];
    return targetTable.columns.filter(c => c.isPrimaryKey);
  }, [targetTable]);

  useEffect(() => {
    if (sourceTable && fkColumns.length > 0) {
      setSelectedSourceColumnId(fkColumns[0].id);
    }
    if (tables.length > 1 && sourceTable) {
      const otherTables = tables.filter(t => t.id !== sourceTable.id);
      if (otherTables.length > 0) {
        const suggestedTarget = otherTables.find(t =>
          t.name === 'users' || t.name === 'uzytkownicy' || t.name === 'customers'
        ) || otherTables[0];
        setSelectedTargetTableId(suggestedTarget.id);
      }
    }
  }, [sourceTable, tables, fkColumns]);

  useEffect(() => {
    if (targetTable && pkColumns.length > 0) {
      setSelectedTargetColumnId(pkColumns[0].id);
    }
  }, [targetTable, pkColumns]);

  useEffect(() => {
    if (targetTable) {
      const suggestedName = `${targetTable.name.slice(0, -1)}_id`;
      if (targetTable.name === 'users' || targetTable.name === 'uzytkownicy') {
        setNewColumnName('user_id');
      } else {
        setNewColumnName(suggestedName);
      }
    }
  }, [targetTable]);

  useEffect(() => {
    if (initialSourceTable) {
      setSelectedSourceTableId(initialSourceTable.id);
    }
  }, [initialSourceTable]);

  const handleAddColumnAndConnect = () => {
    if (!sourceTable || !targetTable || !newColumnName.trim()) return;

    const pkColumn = targetTable.columns.find(c => c.isPrimaryKey);
    if (!pkColumn) return;

    const newColumn: Column = {
      id: generateId(),
      name: newColumnName.trim(),
      dataType: 'INTEGER',
      isPrimaryKey: false,
      isNotNull: true,
      isUnique: false,
      isIndex: true,
      isForeignKey: true,
      foreignKey: {
        referencedTableId: targetTable.id,
        referencedColumnId: pkColumn.id,
        onDelete,
      },
    };

    addColumn(sourceTable.id, newColumn);

    addRelation({
      id: generateId(),
      sourceTableId: sourceTable.id,
      sourceColumnId: newColumn.id,
      targetTableId: targetTable.id,
      targetColumnId: pkColumn.id,
      onDelete,
    });

    onClose();
  };

  const handleConnect = () => {
    const sourceColumn = sourceTable?.columns.find(c => c.id === selectedSourceColumnId);
    if (!sourceTable || !sourceColumn || !targetTable) return;

    const pkColumn = targetTable.columns.find(c => c.id === selectedTargetColumnId);
    if (!pkColumn) return;

    updateColumn(sourceTable.id, sourceColumn.id, {
      isForeignKey: true,
      isIndex: true,
      foreignKey: {
        referencedTableId: targetTable.id,
        referencedColumnId: pkColumn.id,
        onDelete,
      },
    });

    addRelation({
      id: generateId(),
      sourceTableId: sourceTable.id,
      sourceColumnId: sourceColumn.id,
      targetTableId: targetTable.id,
      targetColumnId: pkColumn.id,
      onDelete,
    });

    onClose();
  };

  const canConnectExisting = selectedSourceColumnId && selectedTargetColumnId;
  const canAddNew = shouldAddColumn && newColumnName.trim() && selectedTargetTableId && selectedTargetColumnId;

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
          className="w-full max-w-md bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Utwórz relację</h2>
                <p className="text-sm text-slate-400">Połącz dwie tabeli kluczem obcym</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Tabela źródłowa</label>
                <select
                  value={selectedSourceTableId}
                  onChange={e => setSelectedSourceTableId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {tables.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Tabela docelowa</label>
                <select
                  value={selectedTargetTableId}
                  onChange={e => setSelectedTargetTableId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {tables
                    .filter(t => t.id !== selectedSourceTableId)
                    .map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
              </div>
            </div>

            {fkColumns.length > 0 && !shouldAddColumn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kolumna źródłowa</label>
                    <select
                      value={selectedSourceColumnId}
                      onChange={e => setSelectedSourceColumnId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {fkColumns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Kolumna docelowa</label>
                    <select
                      value={selectedTargetColumnId}
                      onChange={e => setSelectedTargetColumnId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      {pkColumns.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ON DELETE</label>
                  <select
                    value={onDelete}
                    onChange={e => setOnDelete(e.target.value as OnDeleteAction)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {ON_DELETE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            <div className="pt-2">
              <button
                onClick={() => setShouldAddColumn(!shouldAddColumn)}
                className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg border transition-colors ${
                  shouldAddColumn
                    ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">
                  {shouldAddColumn ? 'Anuluj dodawanie kolumny' : 'Dodaj nową kolumnę FK'}
                </span>
              </button>
            </div>

            {shouldAddColumn && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3 pt-2"
              >
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Nazwa kolumny</label>
                  <input
                    type="text"
                    value={newColumnName}
                    onChange={e => setNewColumnName(e.target.value)}
                    placeholder="np. user_id"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">ON DELETE</label>
                  <select
                    value={onDelete}
                    onChange={e => setOnDelete(e.target.value as OnDeleteAction)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    {ON_DELETE_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Anuluj
            </button>
            {shouldAddColumn ? (
              <button
                onClick={handleAddColumnAndConnect}
                disabled={!canAddNew}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dodaj i połącz
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={!canConnectExisting}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Połącz
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
