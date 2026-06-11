export type DataType =
  | 'SERIAL'
  | 'INTEGER'
  | 'BIGINT'
  | 'UUID'
  | 'VARCHAR(255)'
  | 'VARCHAR(100)'
  | 'VARCHAR(50)'
  | 'VARCHAR(20)'
  | 'TEXT'
  | 'BOOLEAN'
  | 'DATE'
  | 'TIMESTAMP'
  | 'NUMERIC(10,2)'
  | 'JSONB';

export type OnDeleteAction = 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';

export interface ForeignKey {
  referencedTableId: string;
  referencedColumnId: string;
  onDelete: OnDeleteAction;
}

export interface Column {
  id: string;
  name: string;
  dataType: DataType;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  isIndex: boolean;
  isForeignKey: boolean;
  foreignKey?: ForeignKey;
  defaultValue?: string;
}

export interface Table {
  id: string;
  name: string;
  columns: Column[];
  position: { x: number; y: number };
}

export interface Relation {
  id: string;
  sourceTableId: string;
  sourceColumnId: string;
  targetTableId: string;
  targetColumnId: string;
  onDelete: OnDeleteAction;
}

export interface SchemaProject {
  tables: Table[];
  relations: Relation[];
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationWarning {
  id: string;
  tableId?: string;
  columnId?: string;
  message: string;
  type: 'error' | 'warning';
}

export interface TemplateColumn {
  name: string;
  dataType: DataType;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  isIndex: boolean;
  isForeignKey: boolean;
  foreignKey?: { referencedTableId: string; referencedColumnId: string; onDelete: OnDeleteAction };
  defaultValue?: string;
}

export interface TemplateTable {
  name: string;
  columns: TemplateColumn[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  tables: TemplateTable[];
  relations: Omit<Relation, 'id'>[];
}
