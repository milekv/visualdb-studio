import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ShoppingCart, CreditCard, Package, MessageSquare, MapPin, FolderTree, Edit3, X, ChevronRight } from 'lucide-react';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import { getTablePreset, createColumnsFromPresets, getUniversalPreset } from '../../lib/tablePresets';
import type { Table, OnDeleteAction } from '../../types/schema';

interface RelatedTableMenuProps {
  sourceTableId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

interface RelatedTableOption {
  id: string;
  name: string;
  nameEn: string;
  icon: React.ReactNode;
  color: string;
  fkColumn: string;
  suggestedOnDelete: OnDeleteAction;
}

const relatedTableOptions: RelatedTableOption[] = [
  {
    id: 'orders',
    name: 'Zamówienia',
    nameEn: 'orders',
    icon: <ShoppingCart className="w-4 h-4" />,
    color: 'text-orange-400',
    fkColumn: 'user_id',
    suggestedOnDelete: 'CASCADE',
  },
  {
    id: 'payments',
    name: 'Płatności',
    nameEn: 'payments',
    icon: <CreditCard className="w-4 h-4" />,
    color: 'text-green-400',
    fkColumn: 'order_id',
    suggestedOnDelete: 'CASCADE',
  },
  {
    id: 'products',
    name: 'Produkty',
    nameEn: 'products',
    icon: <Package className="w-4 h-4" />,
    color: 'text-blue-400',
    fkColumn: 'category_id',
    suggestedOnDelete: 'SET NULL',
  },
  {
    id: 'comments',
    name: 'Komentarze',
    nameEn: 'comments',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-purple-400',
    fkColumn: 'post_id',
    suggestedOnDelete: 'CASCADE',
  },
  {
    id: 'addresses',
    name: 'Adresy',
    nameEn: 'addresses',
    icon: <MapPin className="w-4 h-4" />,
    color: 'text-cyan-400',
    fkColumn: 'user_id',
    suggestedOnDelete: 'CASCADE',
  },
  {
    id: 'categories',
    name: 'Kategorie',
    nameEn: 'categories',
    icon: <FolderTree className="w-4 h-4" />,
    color: 'text-amber-400',
    fkColumn: 'parent_id',
    suggestedOnDelete: 'SET NULL',
  },
];

export function RelatedTableMenu({ sourceTableId, position, onClose }: RelatedTableMenuProps) {
  const { tables, addTable, addRelation, addColumn, updateColumn } = useSchemaStore();
  const [customTableName, setCustomTableName] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const sourceTable = tables.find(t => t.id === sourceTableId);
  const pkColumn = sourceTable?.columns.find(c => c.isPrimaryKey);

  const handleCreateRelatedTable = (option: RelatedTableOption) => {
    if (!sourceTable || !pkColumn) return;

    let preset = getTablePreset(option.nameEn);
    if (!preset) {
      preset = getUniversalPreset();
    }

    const columns = createColumnsFromPresets(preset);

    const fkColumnName = `${sourceTable.name.slice(0, -1)}_id`.replace('ees_', 'e_').replace('users', 'user');
    const normalizedFkName = option.fkColumn;

    const existingFkCol = columns.find(c => c.name.toLowerCase() === normalizedFkName || c.name === 'user_id');
    if (!existingFkCol) {
      columns.push({
        id: generateId(),
        name: sourceTable.name === 'users' ? 'user_id' : `${sourceTable.name.slice(0, -1)}_id`,
        dataType: 'INTEGER',
        isPrimaryKey: false,
        isNotNull: true,
        isUnique: false,
        isIndex: true,
        isForeignKey: true,
        foreignKey: {
          referencedTableId: sourceTable.id,
          referencedColumnId: pkColumn.id,
          onDelete: option.suggestedOnDelete,
        },
      });
    } else {
      const idx = columns.findIndex(c => c.name.toLowerCase() === normalizedFkName);
      if (idx !== -1) {
        columns[idx] = {
          ...columns[idx],
          isForeignKey: true,
          isIndex: true,
          foreignKey: {
            referencedTableId: sourceTable.id,
            referencedColumnId: pkColumn.id,
            onDelete: option.suggestedOnDelete,
          },
        };
      }
    }

    const maxX = tables.length > 0 ? Math.max(...tables.map(t => t.position.x)) : 0;

    const newTable: Table = {
      id: generateId(),
      name: option.nameEn,
      columns,
      position: { x: maxX + 350, y: sourceTable.position.y },
    };

    addTable(newTable);

    const fkColumn = newTable.columns.find(c => c.isForeignKey);
    if (fkColumn && fkColumn.foreignKey) {
      addRelation({
        id: generateId(),
        sourceTableId: newTable.id,
        sourceColumnId: fkColumn.id,
        targetTableId: sourceTable.id,
        targetColumnId: pkColumn.id,
        onDelete: fkColumn.foreignKey.onDelete,
      });
    }

    onClose();
  };

  const handleCreateCustomTable = () => {
    if (!customTableName.trim() || !sourceTable || !pkColumn) return;

    let preset = getTablePreset(customTableName);
    if (!preset) {
      preset = getUniversalPreset();
    }

    const columns = createColumnsFromPresets(preset);

    const sourceName = sourceTable.name.toLowerCase();
    if (sourceName.includes('user') || sourceName.includes('klient') || sourceName.includes('customer')) {
      // Add user_id if it matches
      if (!columns.some(c => c.name === 'user_id')) {
        columns.push({
          id: generateId(),
          name: 'user_id',
          dataType: 'INTEGER',
          isPrimaryKey: false,
          isNotNull: true,
          isUnique: false,
          isIndex: true,
          isForeignKey: true,
          foreignKey: {
            referencedTableId: sourceTable.id,
            referencedColumnId: pkColumn.id,
            onDelete: 'CASCADE',
          },
        });
      } else {
        const idx = columns.findIndex(c => c.name === 'user_id');
        if (idx !== -1) {
          columns[idx] = {
            ...columns[idx],
            isForeignKey: true,
            isIndex: true,
            foreignKey: {
              referencedTableId: sourceTable.id,
              referencedColumnId: pkColumn.id,
              onDelete: 'CASCADE',
            },
          };
        }
      }
    }

    const maxX = tables.length > 0 ? Math.max(...tables.map(t => t.position.x)) : 0;

    const newTable: Table = {
      id: generateId(),
      name: customTableName.trim().toLowerCase().replace(/\s+/g, '_'),
      columns,
      position: { x: maxX + 350, y: sourceTable.position.y },
    };

    const fkColumn = newTable.columns.find(c => c.isForeignKey);
    if (fkColumn) {
      addTable(newTable);

      if (fkColumn.foreignKey) {
        addRelation({
          id: generateId(),
          sourceTableId: newTable.id,
          sourceColumnId: fkColumn.id,
          targetTableId: sourceTable.id,
          targetColumnId: pkColumn.id,
          onDelete: fkColumn.foreignKey.onDelete,
        });
      }
    } else {
      addTable(newTable);
    }

    setCustomTableName('');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="absolute bg-slate-800 rounded-xl border border-slate-700 shadow-2xl overflow-hidden"
          style={{
            left: position.x,
            top: position.y,
            minWidth: 220,
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="p-2">
            <div className="px-3 py-2 text-xs text-slate-400 font-medium">
              Dodaj powiązaną tabelę
            </div>

            {relatedTableOptions.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCreateRelatedTable(option)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-slate-700/50"
              >
                <div className={`${option.color}`}>
                  {option.icon}
                </div>
                <span className="text-sm text-slate-200">{option.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-500 ml-auto" />
              </motion.button>
            ))}

            <div className="my-2 border-t border-slate-700" />

            {!showCustom ? (
              <motion.button
                whileHover={{ backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCustom(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors hover:bg-slate-700/50"
              >
                <div className="text-violet-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-200">Własna tabela...</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-2"
              >
                <input
                  type="text"
                  value={customTableName}
                  onChange={e => setCustomTableName(e.target.value)}
                  placeholder="Nazwa tabeli (np. reviews)"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-600 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleCreateCustomTable();
                    if (e.key === 'Escape') {
                      setShowCustom(false);
                      setCustomTableName('');
                    }
                  }}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setShowCustom(false);
                      setCustomTableName('');
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 text-sm hover:bg-slate-600 transition-colors"
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleCreateCustomTable}
                    disabled={!customTableName.trim()}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-sm hover:bg-violet-500 transition-colors disabled:opacity-50"
                  >
                    Utwórz
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
