import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Topbar } from './components/Topbar/Topbar';
import { Sidebar } from './components/Sidebar/Sidebar';
import Canvas from './components/Canvas/Canvas';
import { TableModal } from './components/TableModal/TableModal';
import { PropertiesPanel } from './components/PropertiesPanel/PropertiesPanel';
import { SqlPreview } from './components/SqlPreview/SqlPreview';
import { ValidationPanel } from './components/ValidationPanel/ValidationPanel';
import { TemplatesModal } from './components/TemplatesModal/TemplatesModal';
import { SmartSuggestionsPanel } from './components/SmartSuggestionsPanel/SmartSuggestionsPanel';
import { QuickRelationModal } from './components/QuickRelationModal/QuickRelationModal';
import { RelatedTableMenu } from './components/RelatedTableMenu/RelatedTableMenu';
import { DescribeDatabasePanel } from './components/DescribeDatabasePanel/DescribeDatabasePanel';
import { DatabaseDescriptionPanel } from './components/DatabaseDescriptionPanel/DatabaseDescriptionPanel';
import { SchemaScorePanel } from './components/SchemaScorePanel/SchemaScorePanel';
import { ExpandDatabaseModal } from './components/ExpandDatabaseModal/ExpandDatabaseModal';
import { SchemaStatusBar } from './components/SchemaStatusBar/SchemaStatusBar';
import { useSchemaStore } from './store/schemaStore';

function App() {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isSqlPreviewOpen, setIsSqlPreviewOpen] = useState(false);
  const [isValidationOpen, setIsValidationOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isDescribeOpen, setIsDescribeOpen] = useState(true);
  const [isDbDescriptionOpen, setIsDbDescriptionOpen] = useState(false);
  const [isSchemaScoreOpen, setIsSchemaScoreOpen] = useState(false);
  const [isExpandDatabaseOpen, setIsExpandDatabaseOpen] = useState(false);
  const [isQuickRelationOpen, setIsQuickRelationOpen] = useState(false);
  const [isRelatedTableMenuOpen, setIsRelatedTableMenuOpen] = useState(false);
  const [relatedTableSourceId, setRelatedTableSourceId] = useState<string | null>(null);
  const [relatedTablePosition, setRelatedTablePosition] = useState({ x: 0, y: 0 });
  const [quickRelationSourceId, setQuickRelationSourceId] = useState<string | null>(null);

  const { selectedTableId, clearProject, tables } = useSchemaStore();

  const handleNewProject = () => {
    if (confirm('Czy na pewno chcesz utworzyć nowy projekt? Wszystkie niezapisane zmiany zostaną utracone.')) {
      clearProject();
    }
  };

  const handleConnectClicked = (tableId: string) => {
    setQuickRelationSourceId(tableId);
    setIsQuickRelationOpen(true);
  };

  const handleRelatedTableClicked = (tableId: string, position: { x: number; y: number }) => {
    setRelatedTableSourceId(tableId);
    setRelatedTablePosition(position);
    setIsRelatedTableMenuOpen(true);
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-white overflow-hidden">
      <Topbar
        onNewProject={handleNewProject}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onOpenSqlPreview={() => setIsSqlPreviewOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onAddTable={() => setIsTableModalOpen(true)}
          onOpenValidation={() => setIsValidationOpen(true)}
          onOpenSuggestions={() => setIsSuggestionsOpen(!isSuggestionsOpen)}
          onOpenDescribe={() => setIsDescribeOpen(true)}
          onOpenDbDescription={() => setIsDbDescriptionOpen(!isDbDescriptionOpen)}
          onOpenSchemaScore={() => setIsSchemaScoreOpen(true)}
          onOpenExpandDatabase={() => setIsExpandDatabaseOpen(true)}
          isDescribeOpen={isDescribeOpen}
        />

        <AnimatePresence>
          {isDescribeOpen && (
            <DescribeDatabasePanel
              isOpen={isDescribeOpen}
              onClose={() => setIsDescribeOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className={`${isDescribeOpen ? 'hidden lg:flex' : 'flex'} min-w-0 flex-1`}>
          <Canvas
            onAddTable={() => setIsTableModalOpen(true)}
            onOpenDescribe={() => setIsDescribeOpen(true)}
            onOpenTemplates={() => setIsTemplatesOpen(true)}
            onConnectTable={handleConnectClicked}
            onRelatedTable={handleRelatedTableClicked}
          />
        </div>

        <AnimatePresence>
          {selectedTableId && <PropertiesPanel />}
        </AnimatePresence>

        <SmartSuggestionsPanel
          isOpen={isSuggestionsOpen}
          onClose={() => setIsSuggestionsOpen(false)}
        />

        <DatabaseDescriptionPanel
          isOpen={isDbDescriptionOpen}
          onClose={() => setIsDbDescriptionOpen(false)}
        />
      </div>

      <SchemaStatusBar />

      {/* Modals */}
      <TableModal
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        editingTableId={selectedTableId}
      />

      <SqlPreview
        isOpen={isSqlPreviewOpen}
        onClose={() => setIsSqlPreviewOpen(false)}
      />

      <ValidationPanel
        isOpen={isValidationOpen}
        onClose={() => setIsValidationOpen(false)}
      />

      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />

      <SchemaScorePanel
        isOpen={isSchemaScoreOpen}
        onClose={() => setIsSchemaScoreOpen(false)}
      />

      <ExpandDatabaseModal
        isOpen={isExpandDatabaseOpen}
        onClose={() => setIsExpandDatabaseOpen(false)}
      />

      {tables.length > 0 && (
        <QuickRelationModal
          isOpen={isQuickRelationOpen}
          onClose={() => {
            setIsQuickRelationOpen(false);
            setQuickRelationSourceId(null);
          }}
          sourceTableId={quickRelationSourceId}
        />
      )}

      {isRelatedTableMenuOpen && relatedTableSourceId && (
        <RelatedTableMenu
          sourceTableId={relatedTableSourceId}
          position={relatedTablePosition}
          onClose={() => {
            setIsRelatedTableMenuOpen(false);
            setRelatedTableSourceId(null);
          }}
        />
      )}

    </div>
  );
}

export default App;
