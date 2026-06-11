import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ChevronRight, ShoppingCart, CreditCard, Package, MessageSquare, MapPin, FolderTree, Star, Tag, Truck, Image, FileText } from 'lucide-react';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import { getTablePreset, createColumnsFromPresets, getUniversalPreset } from '../../lib/tablePresets';
import type { Table, OnDeleteAction } from '../../types/schema';

interface ExpandDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SuggestedTable {
  id: string;
  name: string;
  namePl: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  reason: string;
  fkTo?: string;
  suggestedOnDelete: OnDeleteAction;
}

function analyzeSchemaAndSuggest(tables: Table[]): SuggestedTable[] {
  const tableNames = tables.map(t => t.name.toLowerCase());
  const suggestions: SuggestedTable[] = [];

  const hasTable = (name: string) => tableNames.some(n => n.includes(name) || name.includes(n));

  // Users/Customer related suggestions
  if (hasTable('user') || hasTable('klient') || hasTable('customer')) {
    if (!hasTable('order') && !hasTable('zamowien')) {
      suggestions.push({
        id: 'orders',
        name: 'orders',
        namePl: 'Zamówienia',
        icon: <ShoppingCart className="w-4 h-4" />,
        color: 'text-orange-400',
        bgColor: 'from-orange-600/20 to-orange-900/20',
        reason: 'Użytkownicy składają zamówienia',
        fkTo: 'users',
        suggestedOnDelete: 'CASCADE',
      });
    }
    if (!hasTable('address') && !hasTable('adres')) {
      suggestions.push({
        id: 'addresses',
        name: 'addresses',
        namePl: 'Adresy',
        icon: <MapPin className="w-4 h-4" />,
        color: 'text-cyan-400',
        bgColor: 'from-cyan-600/20 to-cyan-900/20',
        reason: 'Użytkownicy mają adresy dostawy',
        fkTo: 'users',
        suggestedOnDelete: 'CASCADE',
      });
    }
    if (!hasTable('payment') && !hasTable('platnosc')) {
      suggestions.push({
        id: 'payments',
        name: 'payments',
        namePl: 'Płatności',
        icon: <CreditCard className="w-4 h-4" />,
        color: 'text-green-400',
        bgColor: 'from-green-600/20 to-green-900/20',
        reason: 'Zamówienia wymagają płatności',
        fkTo: 'orders',
        suggestedOnDelete: 'CASCADE',
      });
    }
  }

  // Products related suggestions
  if (hasTable('product') || hasTable('produkt') || hasTable('towar')) {
    if (!hasTable('category') && !hasTable('kategor')) {
      suggestions.push({
        id: 'categories',
        name: 'categories',
        namePl: 'Kategorie',
        icon: <FolderTree className="w-4 h-4" />,
        color: 'text-amber-400',
        bgColor: 'from-amber-600/20 to-amber-900/20',
        reason: 'Produkty są grupowane w kategorie',
        fkTo: undefined,
        suggestedOnDelete: 'SET NULL',
      });
    }
    if (!hasTable('review') && !hasTable('opini') && !hasTable('ocen')) {
      suggestions.push({
        id: 'reviews',
        name: 'reviews',
        namePl: 'Opinie',
        icon: <Star className="w-4 h-4" />,
        color: 'text-yellow-400',
        bgColor: 'from-yellow-600/20 to-yellow-900/20',
        reason: 'Klienci oceniają produkty',
        fkTo: 'products',
        suggestedOnDelete: 'CASCADE',
      });
    }
    if (!hasTable('tag') && !hasTable('etykiet')) {
      suggestions.push({
        id: 'tags',
        name: 'tags',
        namePl: 'Tagi',
        icon: <Tag className="w-4 h-4" />,
        color: 'text-violet-400',
        bgColor: 'from-violet-600/20 to-violet-900/20',
        reason: 'Produkty mogą mieć tagi',
        fkTo: undefined,
        suggestedOnDelete: 'SET NULL',
      });
    }
  }

  // Orders related suggestions
  if (hasTable('order') || hasTable('zamowien')) {
    if (!hasTable('order_item') && !hasTable('pozycja')) {
      suggestions.push({
        id: 'order_items',
        name: 'order_items',
        namePl: 'Pozycje zamówienia',
        icon: <Package className="w-4 h-4" />,
        color: 'text-blue-400',
        bgColor: 'from-blue-600/20 to-blue-900/20',
        reason: 'Zamówienia zawierają produkty',
        fkTo: 'orders',
        suggestedOnDelete: 'CASCADE',
      });
    }
    if (!hasTable('ship') && !hasTable('dostaw')) {
      suggestions.push({
        id: 'shipments',
        name: 'shipments',
        namePl: 'Wysyłki',
        icon: <Truck className="w-4 h-4" />,
        color: 'text-teal-400',
        bgColor: 'from-teal-600/20 to-teal-900/20',
        reason: 'Zamówienia są wysyłane',
        fkTo: 'orders',
        suggestedOnDelete: 'RESTRICT',
      });
    }
  }

  // Posts/Blog related suggestions
  if (hasTable('post') || hasTable('wpis') || hasTable('artykul')) {
    if (!hasTable('comment') && !hasTable('komentarz')) {
      suggestions.push({
        id: 'comments',
        name: 'comments',
        namePl: 'Komentarze',
        icon: <MessageSquare className="w-4 h-4" />,
        color: 'text-purple-400',
        bgColor: 'from-purple-600/20 to-purple-900/20',
        reason: 'Posty mają komentarze',
        fkTo: 'posts',
        suggestedOnDelete: 'CASCADE',
      });
    }
    if (!hasTable('image') && !hasTable('obraz') && !hasTable('galer')) {
      suggestions.push({
        id: 'images',
        name: 'images',
        namePl: 'Obrazy',
        icon: <Image className="w-4 h-4" />,
        color: 'text-pink-400',
        bgColor: 'from-pink-600/20 to-pink-900/20',
        reason: 'Posty mogą mieć obrazy',
        fkTo: 'posts',
        suggestedOnDelete: 'CASCADE',
      });
    }
  }

  // Generic suggestions if nothing specific fits
  if (suggestions.length === 0 && tables.length >= 1) {
    if (!hasTable('log') && !hasTable('historia')) {
      suggestions.push({
        id: 'audit_log',
        name: 'audit_log',
        namePl: 'Dziennik zmian',
        icon: <FileText className="w-4 h-4" />,
        color: 'text-slate-400',
        bgColor: 'from-slate-600/20 to-slate-900/20',
        reason: 'Śledzenie zmian w danych',
        fkTo: undefined,
        suggestedOnDelete: 'NO ACTION',
      });
    }
  }

  // Remove duplicates and return max 6 suggestions
  const uniqueNames = new Set<string>();
  return suggestions.filter(s => {
    if (uniqueNames.has(s.name)) return false;
    uniqueNames.add(s.name);
    return true;
  }).slice(0, 6);
}

export function ExpandDatabaseModal({ isOpen, onClose }: ExpandDatabaseModalProps) {
  const { tables, addTable, addRelation } = useSchemaStore();

  const suggestions = useMemo(() => analyzeSchemaAndSuggest(tables), [tables]);

  const handleAddTable = (suggestion: SuggestedTable) => {
    let preset = getTablePreset(suggestion.name);
    if (!preset) {
      preset = getUniversalPreset();
    }

    const columns = createColumnsFromPresets(preset);

    // Find target table for FK
    const targetTable = suggestion.fkTo
      ? tables.find(t => t.name.toLowerCase().includes(suggestion.fkTo!))
      : null;
    const pkColumn = targetTable?.columns.find(c => c.isPrimaryKey);

    // Add FK column if needed
    if (targetTable && pkColumn) {
      const fkColumnName = `${targetTable.name.slice(0, -1)}_id`.replace('users', 'user');
      const existingFkCol = columns.find(c => c.name.toLowerCase().includes('_id'));

      if (existingFkCol) {
        const idx = columns.indexOf(existingFkCol);
        columns[idx] = {
          ...columns[idx],
          isForeignKey: true,
          isIndex: true,
          foreignKey: {
            referencedTableId: targetTable.id,
            referencedColumnId: pkColumn.id,
            onDelete: suggestion.suggestedOnDelete,
          },
        };
      } else {
        columns.push({
          id: generateId(),
          name: fkColumnName,
          dataType: 'INTEGER',
          isPrimaryKey: false,
          isNotNull: true,
          isUnique: false,
          isIndex: true,
          isForeignKey: true,
          foreignKey: {
            referencedTableId: targetTable.id,
            referencedColumnId: pkColumn.id,
            onDelete: suggestion.suggestedOnDelete,
          },
        });
      }
    }

    // Calculate position
    const maxX = tables.length > 0 ? Math.max(...tables.map(t => t.position.x)) : 0;
    const avgY = tables.length > 0
      ? tables.reduce((sum, t) => sum + t.position.y, 0) / tables.length
      : 200;

    const newTable: Table = {
      id: generateId(),
      name: suggestion.name,
      columns,
      position: { x: maxX + 350, y: avgY },
    };

    addTable(newTable);

    // Add relation if FK exists
    const fkColumn = newTable.columns.find(c => c.isForeignKey);
    if (fkColumn && fkColumn.foreignKey) {
      addRelation({
        id: generateId(),
        sourceTableId: newTable.id,
        sourceColumnId: fkColumn.id,
        targetTableId: fkColumn.foreignKey.referencedTableId,
        targetColumnId: fkColumn.foreignKey.referencedColumnId,
        onDelete: fkColumn.foreignKey.onDelete,
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-violet-900/30 to-blue-900/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Rozbuduj bazę</h2>
                  <p className="text-sm text-slate-400">Propozycje na podstawie Twojego schematu</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400">
                  Dodaj więcej tabel, aby otrzymać sugestie rozszerzeń.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddTable(suggestion)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${suggestion.bgColor} border border-slate-700/50 hover:border-slate-600 transition-all text-left`}
                  >
                    <div className={`${suggestion.color}`}>
                      {suggestion.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{suggestion.namePl}</span>
                        <span className="text-xs text-slate-500">{suggestion.name}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{suggestion.reason}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              Tabele zostaną automatycznie połączone z istniejącymi
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
