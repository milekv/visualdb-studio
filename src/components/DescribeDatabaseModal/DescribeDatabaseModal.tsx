import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { useSchemaStore, generateId } from '../../store/schemaStore';
import { getTablePreset, createColumnsFromPresets } from '../../lib/tablePresets';
import type { Table, OnDeleteAction, Column } from '../../types/schema';

interface DescribeDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DescribeDatabaseModal({ isOpen, onClose }: DescribeDatabaseModalProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { addTable, addRelation, clearProject } = useSchemaStore();

  const handleGenerate = () => {
    if (!description.trim()) return;

    setIsGenerating(true);

    setTimeout(() => {
      const lowerDesc = description.toLowerCase();
      const tables: Table[] = [];
      const relations: Array<{ source: string; sourceCol: string; target: string; onDelete: OnDeleteAction }> = [];

      // Detect ecommerce
      if (lowerDesc.includes('sklep') || lowerDesc.includes('ecommerce') || lowerDesc.includes('e-commerce') ||
          lowerDesc.includes('produkt') || lowerDesc.includes('zamówien') || lowerDesc.includes('zamowien')) {
        const tableDefs = [
          { name: 'users', preset: 'users' },
          { name: 'products', preset: 'products' },
          { name: 'orders', preset: 'orders' },
          { name: 'order_items', preset: 'order_items' },
          { name: 'payments', preset: 'payments' },
        ];

        tableDefs.forEach((def, idx) => {
          const preset = getTablePreset(def.name) || [];
          const columns = createColumnsFromPresets(preset);

          tables.push({
            id: generateId(),
            name: def.name,
            columns,
            position: { x: 100 + (idx % 3) * 320, y: 100 + Math.floor(idx / 3) * 280 },
          });
        });

        relations.push(
          { source: 'orders', sourceCol: 'user_id', target: 'users', onDelete: 'CASCADE' },
          { source: 'order_items', sourceCol: 'order_id', target: 'orders', onDelete: 'CASCADE' },
          { source: 'order_items', sourceCol: 'product_id', target: 'products', onDelete: 'RESTRICT' },
          { source: 'payments', sourceCol: 'order_id', target: 'orders', onDelete: 'CASCADE' },
        );
      }
      // Detect blog
      else if (lowerDesc.includes('blog') || lowerDesc.includes('wpis') || lowerDesc.includes('komentarz') || lowerDesc.includes('artykul')) {
        const tableDefs = [
          { name: 'users', preset: 'users' },
          { name: 'posts', preset: 'posts' },
          { name: 'comments', preset: 'comments' },
          { name: 'categories', preset: 'categories' },
        ];

        tableDefs.forEach((def, idx) => {
          const preset = getTablePreset(def.name) || [];
          const columns = createColumnsFromPresets(preset);

          tables.push({
            id: generateId(),
            name: def.name,
            columns,
            position: { x: 100 + (idx % 3) * 320, y: 100 + Math.floor(idx / 3) * 280 },
          });
        });

        relations.push(
          { source: 'posts', sourceCol: 'author_id', target: 'users', onDelete: 'CASCADE' },
          { source: 'comments', sourceCol: 'post_id', target: 'posts', onDelete: 'CASCADE' },
        );
      }
      // Detect CRM
      else if (lowerDesc.includes('crm') || lowerDesc.includes('klient') || lowerDesc.includes('kontakt') || lowerDesc.includes('sprzedaż') || lowerDesc.includes('sprzedaz')) {
        const tableDefs = [
          { name: 'customers', preset: 'users' },
          { name: 'contacts', preset: 'contacts' },
          { name: 'deals', preset: 'deals' },
          { name: 'notes', preset: 'notes' },
        ];

        tableDefs.forEach((def, idx) => {
          const preset = getTablePreset(def.name);

          let columns: Column[];
          if (preset) {
            columns = createColumnsFromPresets(preset);
          } else {
            columns = [
              { id: generateId(), name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'description', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
            ];
          }

          tables.push({
            id: generateId(),
            name: def.name,
            columns,
            position: { x: 100 + (idx % 3) * 320, y: 100 + Math.floor(idx / 3) * 280 },
          });
        });

        relations.push(
          { source: 'contacts', sourceCol: 'customer_id', target: 'customers', onDelete: 'SET NULL' },
          { source: 'deals', sourceCol: 'customer_id', target: 'customers', onDelete: 'CASCADE' },
          { source: 'notes', sourceCol: 'deal_id', target: 'deals', onDelete: 'CASCADE' },
        );
      }
      // Detect booking
      else if (lowerDesc.includes('rezerwa') || lowerDesc.includes('hotel') || lowerDesc.includes('pokój') || lowerDesc.includes('pokoje') || lowerDesc.includes('wizyt')) {
        const tableDefs = [
          { name: 'users', preset: 'users' },
          { name: 'bookings', preset: 'orders' },
          { name: 'rooms', preset: 'products' },
          { name: 'payments', preset: 'payments' },
        ];

        tableDefs.forEach((def, idx) => {
          const preset = getTablePreset(def.name);
          let columns: Column[];
          if (preset) {
            columns = createColumnsFromPresets(preset);
          } else {
            columns = [
              { id: generateId(), name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
            ];
          }

          tables.push({
            id: generateId(),
            name: def.name,
            columns,
            position: { x: 100 + (idx % 3) * 320, y: 100 + Math.floor(idx / 3) * 280 },
          });
        });

        relations.push(
          { source: 'bookings', sourceCol: 'user_id', target: 'users', onDelete: 'CASCADE' },
          { source: 'bookings', sourceCol: 'room_id', target: 'rooms', onDelete: 'RESTRICT' },
          { source: 'payments', sourceCol: 'booking_id', target: 'bookings', onDelete: 'CASCADE' },
        );
      }
      // Default - generic
      else {
        const genericTables = [
          { name: 'items', preset: null },
        ];

        genericTables.forEach((def) => {
          tables.push({
            id: generateId(),
            name: def.name,
            columns: [
              { id: generateId(), name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'description', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
              { id: generateId(), name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
            ],
            position: { x: 100, y: 100 },
          });
        });
      }

      // Add FK columns and create relations
      clearProject();

      for (const table of tables) {
        addTable(table);
      }

      // Process relations after tables are added
      for (const rel of relations) {
        const sourceTable = tables.find(t => t.name === rel.source);
        const targetTable = tables.find(t => t.name === rel.target);

        if (sourceTable && targetTable) {
          const pkColumn = targetTable.columns.find(c => c.isPrimaryKey);
          if (!pkColumn) continue;

          // Check if FK column exists
          let fkColumn = sourceTable.columns.find(c => c.name === rel.sourceCol);

          if (!fkColumn) {
            // Create FK column
            const newFkColumn: Column = {
              id: generateId(),
              name: rel.sourceCol,
              dataType: 'INTEGER',
              isPrimaryKey: false,
              isNotNull: true,
              isUnique: false,
              isIndex: true,
              isForeignKey: true,
              foreignKey: {
                referencedTableId: targetTable.id,
                referencedColumnId: pkColumn.id,
                onDelete: rel.onDelete,
              },
            };

            const tableStore = useSchemaStore.getState();
            const storedTable = tableStore.tables.find(t => t.id === sourceTable.id);
            if (storedTable) {
              useSchemaStore.getState().addColumn(sourceTable.id, newFkColumn);
              fkColumn = newFkColumn;
            }
          }

          if (fkColumn) {
            addRelation({
              id: generateId(),
              sourceTableId: sourceTable.id,
              sourceColumnId: fkColumn.id,
              targetTableId: targetTable.id,
              targetColumnId: pkColumn.id,
              onDelete: rel.onDelete,
            });
          }
        }
      }

      setIsGenerating(false);
      onClose();
    }, 500);
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
          className="w-full max-w-lg bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Opisz bazę danych</h2>
                <p className="text-sm text-slate-400">Opisz projekt, a DataFlow wygeneruje schemat</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Np. Chcę bazę do sklepu internetowego z użytkownikami, produktami i zamówieniami..."
              className="w-full h-32 px-4 py-3 rounded-lg bg-slate-900 border border-slate-600 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              disabled={isGenerating}
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs text-slate-500">Przykłady:</span>
              {['Sklep internetowy', 'Blog', 'CRM', 'Rezerwacje hotelowe'].map(example => (
                <button
                  key={example}
                  onClick={() => setDescription(example)}
                  className="px-2 py-0.5 text-xs rounded bg-slate-700/50 text-slate-400 hover:bg-slate-600/50 hover:text-slate-300 transition-colors"
                  disabled={isGenerating}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-700 bg-slate-800/50">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
              disabled={isGenerating}
            >
              Anuluj
            </button>
            <button
              onClick={handleGenerate}
              disabled={!description.trim() || isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium hover:shadow-lg hover:shadow-amber-500/25 transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generowanie...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generuj</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
