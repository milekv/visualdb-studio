import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Table, Relation, Column, ValidationWarning } from '../types/schema';
import { validateSchema } from '../lib/schemaValidator';

interface SchemaState {
  tables: Table[];
  relations: Relation[];
  selectedTableId: string | null;
  selectedRelationId: string | null;
  relationMode: boolean;
  warnings: ValidationWarning[];
  projectName: string;
  history: SchemaSnapshot[];
  future: SchemaSnapshot[];

  // Table actions
  addTable: (table: Table) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  selectTable: (id: string | null) => void;

  // Column actions
  addColumn: (tableId: string, column: Column) => void;
  updateColumn: (tableId: string, columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (tableId: string, columnId: string) => void;

  // Relation actions
  addRelation: (relation: Relation) => void;
  updateRelation: (id: string, updates: Partial<Relation>) => void;
  deleteRelation: (id: string) => void;
  selectRelation: (id: string | null) => void;

  // Mode
  toggleRelationMode: () => void;

  // Project actions
  setProjectName: (name: string) => void;
  loadProject: (tables: Table[], relations: Relation[], projectName?: string) => void;
  clearProject: () => void;
  undo: () => void;
  redo: () => void;

  // Validation
  runValidation: () => void;
}

interface SchemaSnapshot {
  tables: Table[];
  relations: Relation[];
  projectName: string;
}

const generateId = () => Math.random().toString(36).substring(2, 11);

export const useSchemaStore = create<SchemaState>()(
  persist(
    (set, get) => {
      const snapshot = (): SchemaSnapshot => {
        const state = get();
        return { tables: state.tables, relations: state.relations, projectName: state.projectName };
      };
      const checkpoint = () => set((state) => ({ history: [...state.history.slice(-49), snapshot()], future: [] }));

      return ({
      tables: [],
      relations: [],
      selectedTableId: null,
      selectedRelationId: null,
      relationMode: false,
      warnings: [],
      projectName: 'Nowy projekt',
      history: [],
      future: [],

      addTable: (table) => {
        checkpoint();
        set((state) => ({
          tables: [...state.tables, table],
        }));
        get().runValidation();
      },

      updateTable: (id, updates) => {
        checkpoint();
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
        get().runValidation();
      },

      deleteTable: (id) => {
        checkpoint();
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id),
          relations: state.relations.filter(
            (r) => r.sourceTableId !== id && r.targetTableId !== id
          ),
          selectedTableId: state.selectedTableId === id ? null : state.selectedTableId,
        }));
        get().runValidation();
      },

      selectTable: (id) => {
        set({ selectedTableId: id, selectedRelationId: null });
      },

      addColumn: (tableId, column) => {
        checkpoint();
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId ? { ...t, columns: [...t.columns, column] } : t
          ),
        }));
        get().runValidation();
      },

      updateColumn: (tableId, columnId, updates) => {
        checkpoint();
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? {
                  ...t,
                  columns: t.columns.map((c) =>
                    c.id === columnId ? { ...c, ...updates } : c
                  ),
                }
              : t
          ),
        }));
        get().runValidation();
      },

      deleteColumn: (tableId, columnId) => {
        checkpoint();
        set((state) => ({
          tables: state.tables.map((t) =>
            t.id === tableId
              ? { ...t, columns: t.columns.filter((c) => c.id !== columnId) }
              : t
          ),
          relations: state.relations.filter(
            (r) =>
              !(r.sourceTableId === tableId && r.sourceColumnId === columnId) &&
              !(r.targetTableId === tableId && r.targetColumnId === columnId)
          ),
        }));
        get().runValidation();
      },

      addRelation: (relation) => {
        checkpoint();
        set((state) => ({
          relations: [...state.relations, relation],
        }));
        get().runValidation();
      },

      updateRelation: (id, updates) => {
        checkpoint();
        set((state) => ({
          relations: state.relations.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
        get().runValidation();
      },

      deleteRelation: (id) => {
        checkpoint();
        set((state) => ({
          relations: state.relations.filter((r) => r.id !== id),
          selectedRelationId: state.selectedRelationId === id ? null : state.selectedRelationId,
        }));
        get().runValidation();
      },

      selectRelation: (id) => {
        set({ selectedRelationId: id, selectedTableId: null });
      },

      toggleRelationMode: () => {
        set((state) => ({ relationMode: !state.relationMode }));
      },

      setProjectName: (name) => {
        checkpoint();
        set({ projectName: name });
      },

      loadProject: (tables, relations, projectName) => {
        checkpoint();
        set((state) => ({ tables, relations, projectName: projectName ?? state.projectName, selectedTableId: null, selectedRelationId: null }));
        get().runValidation();
      },

      clearProject: () => {
        checkpoint();
        set({
          tables: [],
          relations: [],
          selectedTableId: null,
          selectedRelationId: null,
          warnings: [],
          projectName: 'Nowy projekt',
        });
      },

      undo: () => {
        const { history } = get();
        const previous = history[history.length - 1];
        if (!previous) return;
        set((state) => ({
          ...previous,
          history: state.history.slice(0, -1),
          future: [snapshot(), ...state.future].slice(0, 50),
          selectedTableId: null,
          selectedRelationId: null,
        }));
        get().runValidation();
      },

      redo: () => {
        const { future } = get();
        const next = future[0];
        if (!next) return;
        set((state) => ({
          ...next,
          history: [...state.history.slice(-49), snapshot()],
          future: state.future.slice(1),
          selectedTableId: null,
          selectedRelationId: null,
        }));
        get().runValidation();
      },

      runValidation: () => {
        const { tables, relations } = get();
        const warnings = validateSchema(tables, relations);
        set({ warnings });
      },
      });
    },
    {
      name: 'dataflow-storage',
      partialize: (state) => ({
        tables: state.tables,
        relations: state.relations,
        projectName: state.projectName,
      }),
    }
  )
);

export { generateId };
