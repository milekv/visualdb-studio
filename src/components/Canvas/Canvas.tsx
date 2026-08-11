import { useCallback, useRef, useMemo, useState, useEffect, type ComponentProps } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  BackgroundVariant,
  ConnectionLineType,
  Panel,
  applyNodeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Sparkles, LayoutTemplate, HelpCircle, ZoomIn } from 'lucide-react';
import { TableNode } from '../TableNode/TableNode';
import { useSchemaStore } from '../../store/schemaStore';

interface CanvasProps {
  onAddTable?: () => void;
  onOpenDescribe?: () => void;
  onOpenTemplates?: () => void;
  onConnectTable?: (tableId: string) => void;
  onRelatedTable?: (tableId: string, position: { x: number; y: number }) => void;
}

function Canvas({ onAddTable, onOpenDescribe, onOpenTemplates, onConnectTable, onRelatedTable }: CanvasProps) {
  const { tables, relations, updateTable, addRelation, selectRelation } = useSchemaStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Node types - memoized
  const nodeTypes = useMemo(() => ({
    table: (props: ComponentProps<typeof TableNode>) => (
      <TableNode
        {...props}
        onConnectClicked={onConnectTable}
        onRelatedTableClicked={onRelatedTable}
      />
    ),
  }), [onConnectTable, onRelatedTable]);

  // Sync nodes from tables only when tables change
  useEffect(() => {
    const newNodes = tables.map((table) => ({
      id: table.id,
      type: 'table',
      position: table.position,
      data: { table },
      draggable: true,
    }));

    setNodes(prevNodes => {
      // Preserve existing node positions if they exist
      return newNodes.map(node => {
        const existingNode = prevNodes.find(n => n.id === node.id);
        if (existingNode && existingNode.position) {
          // Keep existing position if table position matches
          return { ...node, position: existingNode.position };
        }
        return node;
      });
    });

    if (!isInitialized && tables.length > 0) {
      setIsInitialized(true);
    }
  }, [tables, isInitialized]);

  // Create edges from relations - memoized
  const edges: Edge[] = useMemo(() => {
    return relations.map((rel) => {
      const sourceTable = tables.find(t => t.id === rel.sourceTableId);
      const targetTable = tables.find(t => t.id === rel.targetTableId);
      const sourceCol = sourceTable?.columns.find(c => c.id === rel.sourceColumnId);
      const targetCol = targetTable?.columns.find(c => c.id === rel.targetColumnId);

      const label = sourceCol && targetCol
        ? `${sourceCol.name} → ${targetCol.name}`
        : 'FK';

      return {
        id: rel.id,
        source: rel.sourceTableId,
        sourceHandle: `${rel.sourceColumnId}-source`,
        target: rel.targetTableId,
        targetHandle: `${rel.targetColumnId}-target`,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        label,
        labelStyle: { fill: '#94a3b8', fontSize: 10 },
        labelBgStyle: { fill: '#1e293b', fillOpacity: 0.8 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [relations, tables]);

  // Handle node changes (including drag)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(nds => applyNodeChanges(changes, nds));

      // Update position in store only on drag stop
      for (const change of changes) {
        if (change.type === 'position' && change.dragging === false && change.position) {
          updateTable(change.id, { position: change.position });
        }
      }
    },
    [updateTable]
  );

  // Handle connection creation
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const sourceTable = tables.find((t) => t.id === connection.source);
        const targetTable = tables.find((t) => t.id === connection.target);

        if (sourceTable && targetTable) {
          const sourceColumnId = connection.sourceHandle?.replace('-source', '') || '';
          const targetColumnId = connection.targetHandle?.replace('-target', '') || targetTable.columns.find(c => c.isPrimaryKey)?.id || '';

          if (sourceColumnId && targetColumnId) {
            addRelation({
              id: `rel_${Date.now().toString(36)}`,
              sourceTableId: connection.source,
              sourceColumnId,
              targetTableId: connection.target,
              targetColumnId,
              onDelete: 'NO ACTION',
            });
          }
        }
      }
    },
    [tables, addRelation]
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const relation = relations.find(r => r.id === edge.id);
      if (relation) {
        selectRelation(relation.id);
      }
    },
    [relations, selectRelation]
  );

  // Handle fit view
  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2, duration: 200 });
  }, [fitView]);

  // Initial fit view when tables are added
  useEffect(() => {
    if (tables.length > 0 && !isInitialized) {
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 300 });
      }, 100);
    }
  }, [tables.length, isInitialized, fitView]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        fitView={!isInitialized}
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        className="bg-slate-950"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        preventScrolling={true}
      >
        <defs>
          <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>

        <Background
          color="#334155"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />

        <Controls
          className="!bg-slate-800/80 !border-slate-700 !rounded-lg !shadow-lg"
          showInteractive={false}
        />

        <MiniMap
          className="!bg-slate-800/80 !border-slate-700 !rounded-lg"
          nodeColor="#3b82f6"
          maskColor="rgba(15, 23, 42, 0.8)"
        />

        {/* Fit view button */}
        <Panel position="bottom-right" className="mb-4 mr-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFitView}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors text-sm"
          >
            <ZoomIn className="w-4 h-4" />
            Dopasuj widok
          </motion.button>
        </Panel>

        {/* Empty state */}
        <Panel position="top-center" className="mt-16">
          <AnimatePresence>
            {tables.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="mb-8">
                  <p className="text-white font-semibold text-xl mb-2">
                    VisualDB Studio
                  </p>
                  <p className="text-slate-400 text-sm mb-6">
                    Intuicyjny kreator baz danych
                  </p>
                </div>

                <div className="flex gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onAddTable}
                    className="w-52 p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-sm hover:border-blue-500/60 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Edit3 className="w-7 h-7 text-blue-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Stwórz tabelę</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Dodaj nazwę, kolumny i typy danych ręcznie.
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenDescribe}
                    className="w-52 p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-sm hover:border-amber-500/60 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 border border-amber-500/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Opisz bazę</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Wpisz opis projektu, a aplikacja wygeneruje schemat.
                    </p>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.03, y: -4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onOpenTemplates}
                    className="w-52 p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 backdrop-blur-sm hover:border-violet-500/60 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/30 border border-violet-500/40 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <LayoutTemplate className="w-7 h-7 text-violet-400" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">Użyj szablonu</h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      Sklep, blog, CRM, rezerwacje lub SaaS.
                    </p>
                  </motion.button>
                </div>

                {/* Help section */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 max-w-md mx-auto"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <HelpCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-slate-300">Jak zacząć?</span>
                  </div>
                  <ol className="text-left text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] shrink-0">1</span>
                      Dodaj pierwszą tabelę, np. <span className="text-blue-300">users</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] shrink-0">2</span>
                      Kliknij <span className="text-amber-300">Wygeneruj strukturę</span> w modalu
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] shrink-0">3</span>
                      Dodaj powiązaną tabelę, np. <span className="text-green-300">orders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] shrink-0">4</span>
                      Kliknij <span className="text-violet-300">Generuj SQL</span> w prawym górnym rogu
                    </li>
                  </ol>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Wrap with ReactFlowProvider at export
import { ReactFlowProvider } from '@xyflow/react';

function CanvasWrapper(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

export default CanvasWrapper;
