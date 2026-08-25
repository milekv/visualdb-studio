import {
  useCallback,
  useRef,
  useMemo,
  useState,
  useEffect,
  type ComponentProps,
} from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { Database, ZoomIn } from "lucide-react";
import { TableNode } from "../TableNode/TableNode";
import { useSchemaStore } from "../../store/schemaStore";

interface CanvasProps {
  onAddTable?: () => void;
  onOpenDescribe?: () => void;
  onOpenTemplates?: () => void;
  onConnectTable?: (tableId: string) => void;
  onRelatedTable?: (
    tableId: string,
    position: { x: number; y: number },
  ) => void;
}

function Canvas({
  onAddTable,
  onOpenDescribe,
  onOpenTemplates,
  onConnectTable,
  onRelatedTable,
}: CanvasProps) {
  const { tables, relations, updateTable, addRelation, selectRelation } =
    useSchemaStore();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Node types - memoized
  const nodeTypes = useMemo(
    () => ({
      table: (props: ComponentProps<typeof TableNode>) => (
        <TableNode
          {...props}
          onConnectClicked={onConnectTable}
          onRelatedTableClicked={onRelatedTable}
        />
      ),
    }),
    [onConnectTable, onRelatedTable],
  );

  // Sync nodes from tables only when tables change
  useEffect(() => {
    const newNodes = tables.map((table) => ({
      id: table.id,
      type: "table",
      position: table.position,
      data: { table },
      draggable: true,
    }));

    setNodes((prevNodes) => {
      // Preserve existing node positions if they exist
      return newNodes.map((node) => {
        const existingNode = prevNodes.find((n) => n.id === node.id);
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
      const sourceTable = tables.find((t) => t.id === rel.sourceTableId);
      const targetTable = tables.find((t) => t.id === rel.targetTableId);
      const sourceCol = sourceTable?.columns.find(
        (c) => c.id === rel.sourceColumnId,
      );
      const targetCol = targetTable?.columns.find(
        (c) => c.id === rel.targetColumnId,
      );

      const label =
        sourceCol && targetCol ? `${sourceCol.name} → ${targetCol.name}` : "FK";

      return {
        id: rel.id,
        source: rel.sourceTableId,
        sourceHandle: `${rel.sourceColumnId}-source`,
        target: rel.targetTableId,
        targetHandle: `${rel.targetColumnId}-target`,
        animated: false,
        style: { stroke: "#38bdf8", strokeWidth: 1.5 },
        label,
        labelStyle: { fill: "#94a3b8", fontSize: 10 },
        labelBgStyle: { fill: "#0f1f30", fillOpacity: 0.96 },
        labelBgPadding: [4, 2] as [number, number],
        labelBgBorderRadius: 4,
      };
    });
  }, [relations, tables]);

  // Handle node changes (including drag)
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));

      // Update position in store only on drag stop
      for (const change of changes) {
        if (
          change.type === "position" &&
          change.dragging === false &&
          change.position
        ) {
          updateTable(change.id, { position: change.position });
        }
      }
    },
    [updateTable],
  );

  // Handle connection creation
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const sourceTable = tables.find((t) => t.id === connection.source);
        const targetTable = tables.find((t) => t.id === connection.target);

        if (sourceTable && targetTable) {
          const sourceColumnId =
            connection.sourceHandle?.replace("-source", "") || "";
          const targetColumnId =
            connection.targetHandle?.replace("-target", "") ||
            targetTable.columns.find((c) => c.isPrimaryKey)?.id ||
            "";

          if (sourceColumnId && targetColumnId) {
            addRelation({
              id: `rel_${Date.now().toString(36)}`,
              sourceTableId: connection.source,
              sourceColumnId,
              targetTableId: connection.target,
              targetColumnId,
              onDelete: "NO ACTION",
            });
          }
        }
      }
    },
    [tables, addRelation],
  );

  // Handle edge click
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      const relation = relations.find((r) => r.id === edge.id);
      if (relation) {
        selectRelation(relation.id);
      }
    },
    [relations, selectRelation],
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
        connectionLineStyle={{ stroke: "#6366f1", strokeWidth: 2 }}
        connectionLineType={ConnectionLineType.SmoothStep}
        className="bg-slate-950"
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        preventScrolling={true}
      >
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
          nodeColor="#38bdf8"
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
            Fit view
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
                className="max-w-sm text-center"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10">
                  <Database className="h-6 w-6 text-cyan-300" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-slate-100">
                  Start with the database you need
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete the guided setup, choose a template, or add the first
                  table manually.
                </p>
                <div className="mt-5 flex justify-center gap-3">
                  <button
                    onClick={onOpenDescribe}
                    className="rounded-md bg-cyan-500 px-3.5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400"
                  >
                    Open setup
                  </button>
                  <button
                    onClick={onAddTable}
                    className="rounded-md border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-slate-600 hover:text-white"
                  >
                    Add table
                  </button>
                  <button
                    onClick={onOpenTemplates}
                    className="rounded-md px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    Templates
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Wrap with ReactFlowProvider at export
import { ReactFlowProvider } from "@xyflow/react";

function CanvasWrapper(props: CanvasProps) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  );
}

export default CanvasWrapper;
