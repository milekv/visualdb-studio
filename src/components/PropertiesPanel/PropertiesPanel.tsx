import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Key, Link2, Gem } from 'lucide-react';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import { HelpTooltip } from '../HelpTooltip/HelpTooltip';
import type { DataType, OnDeleteAction, Column } from '../../types/schema';

const DATA_TYPES: DataType[] = [
  'SERIAL',
  'INTEGER',
  'BIGINT',
  'UUID',
  'VARCHAR(255)',
  'VARCHAR(100)',
  'VARCHAR(50)',
  'VARCHAR(20)',
  'TEXT',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'NUMERIC(10,2)',
  'JSONB',
];

const ON_DELETE_OPTIONS: OnDeleteAction[] = ['CASCADE', 'SET NULL', 'RESTRICT', 'NO ACTION'];

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

export function PropertiesPanel() {
  const {
    tables,
    selectedTableId,
    selectTable,
    updateTable,
    deleteTable,
    addColumn,
    updateColumn,
    deleteColumn,
  } = useSchemaStore();

  const selectedTable = tables.find(t => t.id === selectedTableId);

  const handleClose = () => {
    selectTable(null);
  };

  const handleAddColumn = () => {
    if (selectedTableId) {
      addColumn(selectedTableId, createEmptyColumn());
    }
  };

  if (!selectedTable) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 20, opacity: 0 }}
        className="w-80 bg-slate-900/90 border-l border-slate-700/50 flex flex-col backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
          <h3 className="font-semibold text-white">Table properties</h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Table name */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Table name
            </label>
            <input
              type="text"
              value={selectedTable.name}
              onChange={(e) => updateTable(selectedTable.id, { name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Columns */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">
              Columns
            </label>

            <div className="space-y-2">
              {selectedTable.columns.map((column) => (
                <motion.div
                  key={column.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  {/* Column header */}
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(selectedTable.id, column.id, { name: e.target.value })}
                      placeholder="Column name..."
                      className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                    />
                    <select
                      value={column.dataType}
                      onChange={(e) => updateColumn(selectedTable.id, column.id, { dataType: e.target.value as DataType })}
                      className="px-2 py-1 rounded bg-slate-900 border border-slate-600 text-white text-xs focus:outline-none"
                    >
                      {DATA_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteColumn(selectedTable.id, column.id)}
                      className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Checkboxes with help tooltips */}
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateColumn(selectedTable.id, column.id, { isPrimaryKey: !column.isPrimaryKey })}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          column.isPrimaryKey
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        <Key className="w-3 h-3" />
                        PK
                      </button>
                      <HelpTooltip topic="primaryKey" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateColumn(selectedTable.id, column.id, { isNotNull: !column.isNotNull })}
                        className={`px-2 py-1 rounded text-xs ${
                          column.isNotNull
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        NOT NULL
                      </button>
                      <HelpTooltip topic="notNull" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateColumn(selectedTable.id, column.id, { isUnique: !column.isUnique })}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          column.isUnique
                            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        <Gem className="w-3 h-3" />
                        UNIQUE
                      </button>
                      <HelpTooltip topic="unique" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateColumn(selectedTable.id, column.id, { isIndex: !column.isIndex })}
                        className={`px-2 py-1 rounded text-xs ${
                          column.isIndex
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        INDEX
                      </button>
                      <HelpTooltip topic="index" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateColumn(selectedTable.id, column.id, { isForeignKey: !column.isForeignKey })}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${
                          column.isForeignKey
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                        }`}
                      >
                        <Link2 className="w-3 h-3" />
                        FK
                      </button>
                      <HelpTooltip topic="foreignKey" />
                    </div>
                  </div>

                  {/* FK options */}
                  {column.isForeignKey && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 pt-2 border-t border-slate-600/50 space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={column.foreignKey?.referencedTableId || ''}
                          onChange={(e) => updateColumn(selectedTable.id, column.id, {
                            foreignKey: {
                              ...column.foreignKey,
                              referencedTableId: e.target.value,
                              referencedColumnId: e.target.value ? column.foreignKey?.referencedColumnId || '' : '',
                              onDelete: column.foreignKey?.onDelete || 'NO ACTION',
                            },
                          })}
                          className="px-2 py-1.5 rounded bg-slate-900 border border-slate-600 text-white text-xs focus:outline-none"
                        >
                          <option value="">Referenced table...</option>
                          {tables
                            .filter((t) => t.id !== selectedTable.id)
                            .map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <select
                          value={column.foreignKey?.referencedColumnId || ''}
                          onChange={(e) => updateColumn(selectedTable.id, column.id, {
                            foreignKey: {
                              ...column.foreignKey,
                              referencedColumnId: e.target.value,
                              referencedTableId: column.foreignKey?.referencedTableId || '',
                              onDelete: column.foreignKey?.onDelete || 'NO ACTION',
                            },
                          })}
                          className="px-2 py-1.5 rounded bg-slate-900 border border-slate-600 text-white text-xs focus:outline-none"
                          disabled={!column.foreignKey?.referencedTableId}
                        >
                          <option value="">Referenced column...</option>
                          {tables
                            .find((t) => t.id === column.foreignKey?.referencedTableId)
                            ?.columns.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                      </div>

                      <select
                        value={column.foreignKey?.onDelete || 'NO ACTION'}
                        onChange={(e) => updateColumn(selectedTable.id, column.id, {
                          foreignKey: {
                            ...column.foreignKey,
                            onDelete: e.target.value as OnDeleteAction,
                            referencedTableId: column.foreignKey?.referencedTableId || '',
                            referencedColumnId: column.foreignKey?.referencedColumnId || '',
                          },
                        })}
                        className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-600 text-white text-xs focus:outline-none"
                      >
                        {ON_DELETE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>ON DELETE {opt}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            <button
              onClick={handleAddColumn}
              className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">Add column</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
          <button
            onClick={() => {
              deleteTable(selectedTable.id);
              selectTable(null);
            }}
            className="w-full px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
          >
              Delete table
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
