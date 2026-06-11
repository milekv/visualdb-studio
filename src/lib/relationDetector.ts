import type { Table, Column, OnDeleteAction } from '../types/schema';

export interface DetectedRelation {
  columnId: string;
  columnName: string;
  sourceTableId: string;
  sourceTableName: string;
  targetTableId: string | null;
  targetTableName: string | null;
  targetColumnName: string;
  confidence: 'high' | 'medium' | 'low';
  onDelete: OnDeleteAction;
}

const fkPatterns: Record<string, { tableName: string; columnName: string }> = {
  'user_id': { tableName: 'users', columnName: 'id' },
  'customer_id': { tableName: 'customers', columnName: 'id' },
  'order_id': { tableName: 'orders', columnName: 'id' },
  'product_id': { tableName: 'products', columnName: 'id' },
  'category_id': { tableName: 'categories', columnName: 'id' },
  'post_id': { tableName: 'posts', columnName: 'id' },
  'comment_id': { tableName: 'comments', columnName: 'id' },
  'role_id': { tableName: 'roles', columnName: 'id' },
  'author_id': { tableName: 'users', columnName: 'id' },
  'booking_id': { tableName: 'bookings', columnName: 'id' },
  'payment_id': { tableName: 'payments', columnName: 'id' },
  'guest_id': { tableName: 'guests', columnName: 'id' },
  'room_id': { tableName: 'rooms', columnName: 'id' },
  'company_id': { tableName: 'companies', columnName: 'id' },
  'contact_id': { tableName: 'contacts', columnName: 'id' },
  'deal_id': { tableName: 'deals', columnName: 'id' },
  'tag_id': { tableName: 'tags', columnName: 'id' },
  'organization_id': { tableName: 'organizations', columnName: 'id' },
  'subscription_id': { tableName: 'subscriptions', columnName: 'id' },
  'parent_id': { tableName: null, columnName: 'id' },
  'location_id': { tableName: 'locations', columnName: 'id' },
  'inventory_id': { tableName: 'inventory', columnName: 'id' },
  'from_location_id': { tableName: 'locations', columnName: 'id' },
  'to_location_id': { tableName: 'locations', columnName: 'id' },
};

export function detectRelationForColumn(
  columnName: string,
  sourceTable: Table,
  allTables: Table[]
): DetectedRelation | null {
  const normalized = columnName.toLowerCase().trim();
  const pattern = fkPatterns[normalized];

  if (!pattern) return null;

  if (normalized === 'parent_id') {
    const sameNameTable = allTables.find(t => t.name === sourceTable.name && t.id !== sourceTable.id);
    if (sameNameTable) {
      const pkColumn = sameNameTable.columns.find(c => c.isPrimaryKey);
      if (pkColumn) {
        return {
          columnId: '',
          columnName,
          sourceTableId: sourceTable.id,
          sourceTableName: sourceTable.name,
          targetTableId: sameNameTable.id,
          targetTableName: sameNameTable.name,
          targetColumnName: 'id',
          confidence: 'high',
          onDelete: 'NO ACTION',
        };
      }
    }
    return null;
  }

  const targetTable = allTables.find(
    t => t.name.toLowerCase() === pattern.tableName?.toLowerCase()
  );

  if (!targetTable) {
    return {
      columnId: '',
      columnName,
      sourceTableId: sourceTable.id,
      sourceTableName: sourceTable.name,
      targetTableId: null,
      targetTableName: pattern.tableName || null,
      targetColumnName: pattern.columnName,
      confidence: 'medium',
      onDelete: 'NO ACTION',
    };
  }

  const pkColumn = targetTable.columns.find(c => c.isPrimaryKey);
  if (!pkColumn) return null;

  const existingColumn = sourceTable.columns.find(c => c.id === '');
  const hasExistingRelation = existingColumn?.isForeignKey;

  return {
    columnId: '',
    columnName,
    sourceTableId: sourceTable.id,
    sourceTableName: sourceTable.name,
    targetTableId: targetTable.id,
    targetTableName: targetTable.name,
    targetColumnName: pkColumn.name,
    confidence: targetTable ? 'high' : 'medium',
    onDelete: getSuggestedOnDelete(sourceTable.name, targetTable.name),
  };
}

function getSuggestedOnDelete(sourceTableName: string, targetTableName: string): OnDeleteAction {
  if (targetTableName === 'users' || targetTableName === 'customers' || targetTableName === 'guests') {
    return 'CASCADE';
  }
  if (targetTableName === 'products' || targetTableName === 'rooms' || targetTableName === 'locations') {
    return 'RESTRICT';
  }
  return 'NO ACTION';
}

export function detectAllPotentialRelations(tables: Table[]): DetectedRelation[] {
  const relations: DetectedRelation[] = [];

  for (const table of tables) {
    for (const column of table.columns) {
      if (column.isForeignKey) continue;

      const detected = detectRelationForColumn(column.name, table, tables);
      if (detected && detected.targetTableId) {
        relations.push({
          ...detected,
          columnId: column.id,
        });
      }
    }
  }

  return relations;
}

export function suggestOnDeleteForContext(columnName: string, tables: Table[]): OnDeleteAction {
  const normalized = columnName.toLowerCase();

  if (normalized.includes('user') || normalized.includes('customer') || normalized.includes('guest')) {
    return 'CASCADE';
  }
  if (normalized.includes('product') || normalized.includes('room') || normalized.includes('location')) {
    return 'RESTRICT';
  }
  if (normalized.includes('parent')) {
    return 'SET NULL';
  }
  if (normalized.includes('order') || normalized.includes('booking')) {
    return 'CASCADE';
  }

  return 'NO ACTION';
}

export function getRelationMessage(detected: DetectedRelation): string {
  if (detected.targetTableId) {
    return `Wykryto relację z ${detected.targetTableName}.${detected.targetColumnName}`;
  }
  return `Kolumna ${detected.columnName} może być kluczem obcym - brak tabeli ${detected.targetTableName}`;
}
