import { memo, useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Link2, Gem, Plus, MoreHorizontal } from 'lucide-react';
import { Handle, Position } from '@xyflow/react';
import { useSchemaStore } from '../../store/schemaStore';
import type { Table } from '../../types/schema';

interface TableNodeProps {
  data: { table: Table };
  selected?: boolean;
  onConnectClicked?: (tableId: string) => void;
  onRelatedTableClicked?: (tableId: string, position: { x: number; y: number }) => void;
}

function TableNodeComponent({ data, selected, onConnectClicked, onRelatedTableClicked }: TableNodeProps) {
  const { table } = data;
  const { selectTable, relationMode } = useSchemaStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectTable(table.id);
  };

  const handleConnectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConnectClicked?.(table.id);
  };

  const handleRelatedTableClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onRelatedTableClicked?.(table.id, { x: rect.right + 8, y: rect.top });
    setShowMenu(false);
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleClick}
      className={`min-w-[240px] rounded-xl overflow-hidden cursor-pointer transition-all ${
        selected
          ? 'ring-2 ring-blue-500/80 shadow-lg shadow-blue-500/20'
          : 'shadow-lg shadow-black/20'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="bg-gradient-to-r from-blue-600/80 to-violet-600/80 px-4 py-3 border-b border-slate-600/30 flex items-center justify-between">
        <h3 className="font-semibold text-white tracking-wide">{table.name}</h3>
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="w-6 h-6 rounded flex items-center justify-center text-blue-200 hover:bg-white/20 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 top-full mt-1 w-40 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleConnectClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <Link2 className="w-4 h-4 text-blue-400" />
                <span>+ Połącz</span>
              </button>
              <button
                onClick={handleRelatedTableClick}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 transition-colors"
              >
                <Plus className="w-4 h-4 text-green-400" />
                <span>+ Powiązana</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-2 space-y-1">
        {table.columns.map((col) => (
          <div
            key={col.id}
            className="group relative flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-colors text-sm"
          >
            {/* Target handle for PK columns to receive FK connections (left side) */}
            {col.isPrimaryKey && (
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.id}-target`}
                className="!absolute !-left-1.5 !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-amber-400 !border-2 !border-amber-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}

            {/* Target handle for FK columns to receive connections (left side) */}
            {col.isForeignKey && (
              <Handle
                type="target"
                position={Position.Left}
                id={`${col.id}-target`}
                className="!absolute !-left-1.5 !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-violet-400 !border-2 !border-violet-300 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            )}

            <div className="flex items-center gap-2">
              {col.isPrimaryKey ? (
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : col.isForeignKey ? (
                <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 shrink-0" />
              )}

              {col.isUnique && !col.isPrimaryKey && (
                <Gem className="w-3 h-3 text-violet-400 shrink-0" />
              )}

              <span className="text-slate-200 font-medium">{col.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-xs">{col.dataType}</span>
              {/* Source handle for FK columns (right side) */}
              {col.isForeignKey && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`${col.id}-source`}
                  className="!absolute !-right-1.5 !top-1/2 !-translate-y-1/2 !w-3 !h-3 !bg-blue-400 !border-2 !border-blue-300 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        id={`${table.id}-target`}
        className="!w-2 !h-2 !bg-violet-400 !border-0 opacity-0 hover:opacity-100"
      />

      {relationMode && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-violet-600 text-white text-xs">
          Tryb relacji
        </div>
      )}
    </motion.div>
  );
}

export const TableNode = memo(TableNodeComponent);
