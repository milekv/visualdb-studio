import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Key, Link2, Trash2, Sparkles, Wand2 } from 'lucide-react';
import type { Column, DataType, OnDeleteAction } from '../../types/schema';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import { getTablePreset, getUniversalPreset, createColumnsFromPresets, getSmartColumnPreset } from '../../lib/tablePresets';
import { detectRelationForColumn, getRelationMessage } from '../../lib/relationDetector';

const DATA_TYPES: DataType[] = [
  'SERIAL',
  'INTEGER',
  'BIGINT',
  'UUID',
  'VARCHAR(255)',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'NUMERIC(10,2)',
  'JSONB',
];

const ON_DELETE_OPTIONS: OnDeleteAction[] = ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'];

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTableId?: string | null;
}

function createEmptyColumn(): Column {
  return {
    id: generateId(),
    name: '',
    dataType: 'INTEGER',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
    foreignKey: undefined,
    defaultValue: '',
  };
}

export function TableModal({ isOpen, onClose, editingTableId }: TableModalProps) {
  const { tables, addTable, updateTable } = useSchemaStore();
  const editingTable = tables.find(t => t.id === editingTableId);

  const [tableName, setTableName] = useState(editingTable?.name || '');
  const [columns, setColumns] = useState<Column[]>(
    editingTable?.columns || [createEmptyColumn()]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detectedRelation, setDetectedRelation] = useState<string | null>(null);

  // Auto-detect column presets when column name changes
  const handleColumnNameChange = (columnId: string, newName: string) => {
    const smartPreset = getSmartColumnPreset(newName);
    let updates: Partial<Column> = { name: newName };

    if (smartPreset && columns.find(c => c.id === columnId)?.name === '') {
      updates = {
        name: newName,
        dataType: smartPreset.dataType,
        isPrimaryKey: smartPreset.isPrimaryKey,
        isNotNull: smartPreset.isNotNull,
        isUnique: smartPreset.isUnique,
        isIndex: smartPreset.isIndex,
        isForeignKey: smartPreset.isForeignKey,
        defaultValue: smartPreset.defaultValue,
      };
    }

    // Check for potential relations
    const col = columns.find(c => c.id === columnId);
    if (col && !col.isForeignKey) {
      const tempTable = {
        id: editingTableId || 'temp',
        name: tableName || 'temp_table',
        columns: columns.map(c => c.id === columnId ? { ...c, name: newName } : c),
        position: { x: 0, y: 0 },
      };
      const detected = detectRelationForColumn(newName, tempTable, tables);
      if (detected && detected.targetTableId) {
        setDetectedRelation(getRelationMessage(detected));
      } else {
        setDetectedRelation(null);
      }
    }

    handleColumnChange(columnId, updates);
  };

  const handleAddColumn = () => {
    setColumns([...columns, createEmptyColumn()]);
  };

  const handleRemoveColumn = (columnId: string) => {
    setColumns(columns.filter(c => c.id !== columnId));
  };

  const handleColumnChange = (columnId: string, updates: Partial<Column>) => {
    setColumns(columns.map(c => {
      if (c.id === columnId) {
        const updated = { ...c, ...updates };
        // Reset FK if disabled
        if (updates.isForeignKey === false) {
          updated.foreignKey = undefined;
        }
        // Initialize FK if enabled
        if (updates.isForeignKey === true && !c.foreignKey) {
          // Try to auto-detect reference
          const colName = updated.name.toLowerCase();
          let targetTableName = colName.replace('_id', '');
          if (colName === 'author_id') targetTableName = 'users';

          const targetTable = tables.find(t => t.name.toLowerCase() === targetTableName.toLowerCase());
          const pkColumn = targetTable?.columns.find(c => c.isPrimaryKey);

          updated.foreignKey = {
            referencedTableId: targetTable?.id || '',
            referencedColumnId: pkColumn?.id || '',
            onDelete: 'NO ACTION',
          };
        }
        return updated;
      }
      return c;
    }));
  };

  const handleGenerateStructure = () => {
    if (!tableName.trim()) return;

    const preset = getTablePreset(tableName) || getUniversalPreset();
    const newColumns = createColumnsFromPresets(preset);

    // Auto-detect relations for FK columns
    const tempTable = {
      id: 'temp',
      name: tableName,
      columns: newColumns,
      position: { x: 0, y: 0 },
    };

    for (let i = 0; i < newColumns.length; i++) {
      const col = newColumns[i];
      if (col.name.endsWith('_id') && !col.isForeignKey) {
        const detected = detectRelationForColumn(col.name, tempTable, tables);
        if (detected && detected.targetTableId) {
          const targetTable = tables.find(t => t.id === detected.targetTableId);
          const pkColumn = targetTable?.columns.find(c => c.isPrimaryKey);
          if (targetTable && pkColumn) {
            newColumns[i] = {
              ...col,
              isForeignKey: true,
              isIndex: true,
              foreignKey: {
                referencedTableId: targetTable.id,
                referencedColumnId: pkColumn.id,
                onDelete: detected.onDelete,
              },
            };
          }
        }
      }
    }

    setColumns(newColumns);
  };

  const handleFkChange = (columnId: string, fkUpdates: Partial<NonNullable<Column['foreignKey']>>) => {
    setColumns(columns.map(c => {
      if (c.id === columnId && c.foreignKey) {
        return {
          ...c,
          foreignKey: { ...c.foreignKey, ...fkUpdates },
        };
      }
      return c;
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!tableName.trim()) {
      newErrors.table = 'Nazwa tabeli jest wymagana';
    }

    // Check for duplicate column names
    const colNames = new Set<string>();
    columns.forEach(col => {
      if (!col.name.trim()) {
        newErrors[`col_${col.id}`] = 'Nazwa kolumny jest wymagana';
      } else if (colNames.has(col.name.toLowerCase())) {
        newErrors[`col_${col.id}`] = 'Duplikat nazwy kolumny';
      } else {
        colNames.add(col.name.toLowerCase());
      }

      if (col.isForeignKey && col.foreignKey) {
        if (!col.foreignKey.referencedTableId) {
          newErrors[`fk_table_${col.id}`] = 'Wybierz tabelę referencyjną';
        }
        if (!col.foreignKey.referencedColumnId) {
          newErrors[`fk_column_${col.id}`] = 'Wybierz kolumnę referencyjną';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Calculate position for new table
    const positions = tables.map(t => t.position.x);
    const maxX = positions.length > 0 ? Math.max(...positions) : 0;

    const tableData = {
      id: editingTableId || generateId(),
      name: tableName.trim(),
      columns: columns.filter(c => c.name.trim()),
      position: editingTable?.position || { x: maxX + 200, y: 100 },
    };

    if (editingTableId) {
      updateTable(editingTableId, tableData);
    } else {
      addTable(tableData);
    }

    // Reset form
    setTableName('');
    setColumns([createEmptyColumn()]);
    setErrors({});
    onClose();
  };

  const handleClose = () => {
    setTableName(editingTable?.name || '');
    setColumns(editingTable?.columns || [createEmptyColumn()]);
    setErrors({});
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
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-3xl bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <h2 className="text-xl font-semibold text-white">
              {editingTableId ? 'Edytuj tabelę' : 'Nowa tabela'}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Table name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nazwa tabeli
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tableName}
                  onChange={e => setTableName(e.target.value)}
                  placeholder="np. users, products, orders..."
                  className={`flex-1 px-4 py-3 rounded-lg bg-slate-900/50 border ${
                    errors.table ? 'border-red-500' : 'border-slate-600'
                  } text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all`}
                />
                {!editingTableId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateStructure}
                    disabled={!tableName.trim()}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 text-violet-300 hover:border-violet-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Wygeneruj</span>
                  </motion.button>
                )}
              </div>
              {errors.table && (
                <p className="mt-1 text-sm text-red-400">{errors.table}</p>
              )}
            </div>

            {/* Columns */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Kolumny
              </label>

              <div className="space-y-3">
                {columns.map((column) => (
                  <motion.div
                    key={column.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-slate-900/50 border border-slate-700 space-y-3"
                  >
                    {/* Column header */}
                    <div className="flex items-start gap-3">
                      {/* Column name */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={column.name}
                          onChange={e => handleColumnNameChange(column.id, e.target.value)}
                          placeholder="Nazwa kolumny"
                          className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${
                            errors[`col_${column.id}`] ? 'border-red-500' : 'border-slate-600'
                          } text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                        />
                        {errors[`col_${column.id}`] && (
                          <p className="mt-1 text-xs text-red-400">{errors[`col_${column.id}`]}</p>
                        )}
                        {detectedRelation && column.name.endsWith('_id') && !column.isForeignKey && (
                          <div className="mt-1 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span className="text-xs text-amber-400">{detectedRelation}</span>
                          </div>
                        )}
                      </div>

                      {/* Data type */}
                      <select
                        value={column.dataType}
                        onChange={e => handleColumnChange(column.id, { dataType: e.target.value as DataType })}
                        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {DATA_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveColumn(column.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={column.isPrimaryKey}
                          onChange={e => handleColumnChange(column.id, { isPrimaryKey: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-500 text-amber-500 focus:ring-amber-500/50"
                        />
                        <Key className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-sm text-slate-300">PK</span>
                      </label>

                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={column.isNotNull}
                          onChange={e => handleColumnChange(column.id, { isNotNull: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500/50"
                        />
                        <span className="text-sm text-slate-300">NOT NULL</span>
                      </label>

                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={column.isUnique}
                          onChange={e => handleColumnChange(column.id, { isUnique: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-500 text-violet-500 focus:ring-violet-500/50"
                        />
                        <span className="text-sm text-slate-300">UNIQUE</span>
                      </label>

                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={column.isIndex}
                          onChange={e => handleColumnChange(column.id, { isIndex: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-500 text-green-500 focus:ring-green-500/50"
                        />
                        <span className="text-sm text-slate-300">INDEX</span>
                      </label>

                      <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 cursor-pointer hover:bg-slate-700/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={column.isForeignKey}
                          onChange={e => handleColumnChange(column.id, { isForeignKey: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-500 text-blue-500 focus:ring-blue-500/50"
                        />
                        <Link2 className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-sm text-slate-300">FK</span>
                      </label>
                    </div>

                    {/* Default value */}
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={column.defaultValue || ''}
                        onChange={e => handleColumnChange(column.id, { defaultValue: e.target.value })}
                        placeholder="Wartość domyślna (opcjonalnie)"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    {/* Foreign key options */}
                    {column.isForeignKey && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="pl-4 border-l-2 border-blue-500/30 space-y-3"
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Tabela referencyjna</label>
                            <select
                              value={column.foreignKey?.referencedTableId || ''}
                              onChange={e => handleFkChange(column.id, { referencedTableId: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${
                                errors[`fk_table_${column.id}`] ? 'border-red-500' : 'border-slate-600'
                              } text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                            >
                              <option value="">Wybierz tabelę</option>
                              {tables
                                .filter(t => t.id !== editingTableId)
                                .map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))
                              }
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-slate-400 mb-1">Kolumna referencyjna</label>
                            <select
                              value={column.foreignKey?.referencedColumnId || ''}
                              onChange={e => handleFkChange(column.id, { referencedColumnId: e.target.value })}
                              className={`w-full px-3 py-2 rounded-lg bg-slate-800 border ${
                                errors[`fk_column_${column.id}`] ? 'border-red-500' : 'border-slate-600'
                              } text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
                              disabled={!column.foreignKey?.referencedTableId}
                            >
                              <option value="">Wybierz kolumnę</option>
                              {tables
                                .find(t => t.id === column.foreignKey?.referencedTableId)
                                ?.columns.map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                                ))
                              }
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs text-slate-400 mb-1">ON DELETE</label>
                          <select
                            value={column.foreignKey?.onDelete || 'NO ACTION'}
                            onChange={e => handleFkChange(column.id, { onDelete: e.target.value as OnDeleteAction })}
                            className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                          >
                            {ON_DELETE_OPTIONS.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <button
                onClick={handleAddColumn}
                className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Dodaj kolumnę</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-shadow"
            >
              {editingTableId ? 'Zapisz zmiany' : 'Utwórz tabelę'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
