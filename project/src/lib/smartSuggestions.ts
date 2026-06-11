import type { Table, Column } from '../types/schema';
import { detectRelationForColumn, detectAllPotentialRelations } from './relationDetector';

export interface Suggestion {
  id: string;
  type: 'relation' | 'column_type' | 'constraint' | 'index' | 'column_missing';
  severity: 'info' | 'warning' | 'optimization';
  tableId: string;
  tableName: string;
  columnId?: string;
  columnName?: string;
  message: string;
  action: () => void;
  actionLabel: string;
}

let suggestionId = 0;
const generateSuggestionId = () => `suggestion_${++suggestionId}`;

export function generateSuggestions(
  tables: Table[],
  applySuggestion: (suggestion: Suggestion) => void
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  for (const table of tables) {
    suggestions.push(...getTableSuggestions(table, tables, applySuggestion));
  }

  suggestions.push(...getRelationSuggestions(tables, applySuggestion));

  return suggestions;
}

function getTableSuggestions(
  table: Table,
  tables: Table[],
  applySuggestion: (suggestion: Suggestion) => void
): Suggestion[] {
  const suggestions: Suggestion[] = [];

  const hasId = table.columns.some(c => c.isPrimaryKey);
  if (!hasId) {
    suggestions.push({
      id: generateSuggestionId(),
      type: 'column_missing',
      severity: 'warning',
      tableId: table.id,
      tableName: table.name,
      message: `Tabela "${table.name}" nie ma klucza głównego (PK).`,
      action: () => applySuggestion({
        id: generateSuggestionId(),
        type: 'column_missing',
        severity: 'warning',
        tableId: table.id,
        tableName: table.name,
        message: '',
        action: () => {},
        actionLabel: '',
      }),
      actionLabel: 'Dodaj kolumnę id',
    });
  }

  const hasCreatedAt = table.columns.some(c => c.name.toLowerCase() === 'created_at');
  if (!hasCreatedAt && !['junction', 'pivot'].some(k => table.name.toLowerCase().includes(k))) {
    suggestions.push({
      id: generateSuggestionId(),
      type: 'column_missing',
      severity: 'info',
      tableId: table.id,
      tableName: table.name,
      message: `Warto dodać kolumnę "created_at" do tabeli "${table.name}".`,
      action: () => applySuggestion({
        id: generateSuggestionId(),
        type: 'column_missing',
        severity: 'info',
        tableId: table.id,
        tableName: table.name,
        message: '',
        action: () => {},
        actionLabel: '',
      }),
      actionLabel: 'Dodaj created_at',
    });
  }

  for (const column of table.columns) {
    suggestions.push(...getColumnSuggestions(table, column, tables, applySuggestion));
  }

  return suggestions;
}

function getColumnSuggestions(
  table: Table,
  column: Column,
  tables: Table[],
  applySuggestion: (suggestion: Suggestion) => void
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const colName = column.name.toLowerCase();

  if (colName.endsWith('_id') && !column.isForeignKey) {
    const detected = detectRelationForColumn(column.name, table, tables);
    if (detected?.targetTableId) {
      suggestions.push({
        id: generateSuggestionId(),
        type: 'relation',
        severity: 'optimization',
        tableId: table.id,
        tableName: table.name,
        columnId: column.id,
        columnName: column.name,
        message: `Kolumna "${column.name}" może zostać połączona z ${detected.targetTableName}.${detected.targetColumnName}.`,
        action: () => applySuggestion({
          id: generateSuggestionId(),
          type: 'relation',
          severity: 'optimization',
          tableId: table.id,
          tableName: table.name,
          columnId: column.id,
          columnName: column.name,
          message: '',
          action: () => {},
          actionLabel: '',
        }),
        actionLabel: 'Połącz automatycznie',
      });
    }
  }

  if (colName === 'email' && !column.isUnique) {
    suggestions.push({
      id: generateSuggestionId(),
      type: 'constraint',
      severity: 'warning',
      tableId: table.id,
      tableName: table.name,
      columnId: column.id,
      columnName: column.name,
      message: `Kolumna "${column.name}" powinna mieć ograniczenie UNIQUE.`,
      action: () => applySuggestion({
        id: generateSuggestionId(),
        type: 'constraint',
        severity: 'warning',
        tableId: table.id,
        tableName: table.name,
        columnId: column.id,
        columnName: column.name,
        message: '',
        action: () => {},
        actionLabel: '',
      }),
      actionLabel: 'Dodaj UNIQUE',
    });
  }

  if ((colName.includes('price') || colName.includes('amount') || colName === 'total') &&
      column.dataType !== 'NUMERIC(10,2)') {
    suggestions.push({
      id: generateSuggestionId(),
      type: 'column_type',
      severity: 'warning',
      tableId: table.id,
      tableName: table.name,
      columnId: column.id,
      columnName: column.name,
      message: `Kolumna "${column.name}" powinna mieć typ NUMERIC(10,2) dla precyzji finansowej.`,
      action: () => applySuggestion({
        id: generateSuggestionId(),
        type: 'column_type',
        severity: 'warning',
        tableId: table.id,
        tableName: table.name,
        columnId: column.id,
        columnName: column.name,
        message: '',
        action: () => {},
        actionLabel: '',
      }),
      actionLabel: 'Zmień typ',
    });
  }

  if (column.isForeignKey && !column.isIndex) {
    suggestions.push({
      id: generateSuggestionId(),
      type: 'index',
      severity: 'optimization',
      tableId: table.id,
      tableName: table.name,
      columnId: column.id,
      columnName: column.name,
      message: `Dla klucza obcego "${column.name}" warto dodać INDEX dla wydajności.`,
      action: () => applySuggestion({
        id: generateSuggestionId(),
        type: 'index',
        severity: 'optimization',
        tableId: table.id,
        tableName: table.name,
        columnId: column.id,
        columnName: column.name,
        message: '',
        action: () => {},
        actionLabel: '',
      }),
      actionLabel: 'Dodaj INDEX',
    });
  }

  if (tables.length > 0) {
    const ordersTable = tables.find(t => t.name === 'orders' || t.name === 'zamowienia');
    if (table.name === 'users' || table.name === 'uzytkownicy' || table.name === 'customers' || table.name === 'klienci') {
      const hasOrdersTable = tables.some(t => t.name === 'orders' || t.name === 'zamowienia');
      if (!hasOrdersTable) {
        suggestions.push({
          id: generateSuggestionId(),
          type: 'column_missing',
          severity: 'info',
          tableId: table.id,
          tableName: table.name,
          message: `Tabela "${table.name}" prawdopodobnie powinna mieć powiązane zamówienia.`,
          action: () => applySuggestion({
            id: generateSuggestionId(),
            type: 'column_missing',
            severity: 'info',
            tableId: table.id,
            tableName: table.name,
            message: '',
            action: () => {},
            actionLabel: '',
          }),
          actionLabel: 'Dodaj tabelę orders',
        });
      }
    }
  }

  return suggestions;
}

function getRelationSuggestions(
  tables: Table[],
  applySuggestion: (suggestion: Suggestion) => void
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const potentialRelations = detectAllPotentialRelations(tables);

  for (const rel of potentialRelations) {
    const table = tables.find(t => t.id === rel.sourceTableId);
    const column = table?.columns.find(c => c.id === rel.columnId);

    if (table && column && !column.isForeignKey && rel.targetTableId) {
      suggestions.push({
        id: generateSuggestionId(),
        type: 'relation',
        severity: 'optimization',
        tableId: table.id,
        tableName: table.name,
        columnId: column.id,
        columnName: column.name,
        message: `Kolumna "${column.name}" w tabeli "${table.name}" może wskazywać na ${rel.targetTableName}.`,
        action: () => applySuggestion({
          id: generateSuggestionId(),
          type: 'relation',
          severity: 'optimization',
          tableId: table.id,
          tableName: table.name,
          columnId: column.id,
          columnName: column.name,
          message: '',
          action: () => {},
          actionLabel: '',
        }),
        actionLabel: 'Utwórz relację',
      });
    }
  }

  return suggestions;
}

export function parseDescriptionToTables(description: string): Array<{ name: string; type: string }> {
  const lowerDesc = description.toLowerCase();
  const tables: Array<{ name: string; type: string }> = [];

  const patterns: Array<{ keywords: string[]; tableType: string }> = [
    { keywords: ['sklep', 'ecommerce', 'e-commerce', 'sklepu', 'produkt', 'zamowien', 'produktów'], tableType: 'ecommerce' },
    { keywords: ['blog', 'wpis', 'komentarz', 'artykul', 'artykulów'], tableType: 'blog' },
    { keywords: ['crm', 'klient', 'kontakt', 'sprzedaz', 'sprzedaż', 'deal'], tableType: 'crm' },
    { keywords: ['rezerwacj', 'hotel', 'pokoj', 'pokoje', 'wizyt', 'gosc', 'gość'], tableType: 'booking' },
    { keywords: ['saas', 'subskrypcj', 'organizacj', 'aplikacja', 'subskrypcje'], tableType: 'saas' },
    { keywords: ['magazyn', 'produkt', 'lokalizacj', 'przesunieci', 'inwentarz'], tableType: 'warehouse' },
  ];

  let detectedType = 'generic';
  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => lowerDesc.includes(kw))) {
      detectedType = pattern.tableType;
      break;
    }
  }

  const typeTableMap: Record<string, Array<{ name: string; type: string }>> = {
    ecommerce: [
      { name: 'users', type: 'users' },
      { name: 'products', type: 'products' },
      { name: 'orders', type: 'orders' },
      { name: 'order_items', type: 'order_items' },
      { name: 'payments', type: 'payments' },
    ],
    blog: [
      { name: 'users', type: 'users' },
      { name: 'posts', type: 'posts' },
      { name: 'comments', type: 'comments' },
      { name: 'categories', type: 'categories' },
    ],
    crm: [
      { name: 'customers', type: 'users' },
      { name: 'contacts', type: 'contacts' },
      { name: 'deals', type: 'deals' },
      { name: 'notes', type: 'notes' },
    ],
    booking: [
      { name: 'users', type: 'users' },
      { name: 'bookings', type: 'orders' },
      { name: 'rooms', type: 'services' },
      { name: 'payments', type: 'payments' },
    ],
    saas: [
      { name: 'organizations', type: 'organizations' },
      { name: 'users', type: 'users' },
      { name: 'subscriptions', type: 'subscriptions' },
    ],
    warehouse: [
      { name: 'products', type: 'products' },
      { name: 'locations', type: 'locations' },
      { name: 'inventory', type: 'inventory' },
    ],
    generic: [
      { name: 'items', type: 'generic' },
    ],
  };

  return typeTableMap[detectedType] || typeTableMap.generic;
}
