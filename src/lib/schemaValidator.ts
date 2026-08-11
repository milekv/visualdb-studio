import type { Table, Relation, ValidationWarning } from '../types/schema';
import { generateId } from '../store/schemaStore';

export function validateSchema(tables: Table[], relations: Relation[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  // Validate each table
  for (const table of tables) {
    // Empty table name
    if (!table.name.trim()) {
      warnings.push({
        id: generateId(),
        tableId: table.id,
        message: 'Nazwa tabeli jest pusta.',
        type: 'error',
      });
    }

    // No primary key
    const hasPrimaryKey = table.columns.some(col => col.isPrimaryKey);
    if (table.columns.length > 0 && !hasPrimaryKey) {
      warnings.push({
        id: generateId(),
        tableId: table.id,
        message: `Tabela "${table.name}" nie ma klucza głównego.`,
        type: 'warning',
      });
    }

    // Validate columns
    const columnNames = new Set<string>();

    for (const col of table.columns) {
      // Empty column name
      if (!col.name.trim()) {
        warnings.push({
          id: generateId(),
          tableId: table.id,
          columnId: col.id,
          message: `Kolumna w tabeli "${table.name}" nie ma nazwy.`,
          type: 'error',
        });
      }

      // Duplicate column name
      if (columnNames.has(col.name.toLowerCase())) {
        warnings.push({
          id: generateId(),
          tableId: table.id,
          columnId: col.id,
          message: `Duplikat nazwy kolumny "${col.name}" w tabeli "${table.name}".`,
          type: 'error',
        });
      }
      columnNames.add(col.name.toLowerCase());

      // No data type selected (should not happen but check anyway)
      if (!col.dataType) {
        warnings.push({
          id: generateId(),
          tableId: table.id,
          columnId: col.id,
          message: `Kolumna "${col.name}" w tabeli "${table.name}" nie ma wybranego typu danych.`,
          type: 'error',
        });
      }

      // FK without index
      if (col.isForeignKey && !col.isIndex) {
        warnings.push({
          id: generateId(),
          tableId: table.id,
          columnId: col.id,
          message: `Kolumna FK "${col.name}" w tabeli "${table.name}" nie ma indeksu - rozważ dodanie INDEX.`,
          type: 'warning',
        });
      }

      // FK validation
      if (col.isForeignKey && col.foreignKey) {
        const refTable = tables.find(t => t.id === col.foreignKey!.referencedTableId);
        if (!refTable) {
          warnings.push({
            id: generateId(),
            tableId: table.id,
            columnId: col.id,
            message: `Klucz obcy w kolumnie "${col.name}" wskazuje na nieistniejącą tabelę.`,
            type: 'error',
          });
        } else {
          const refColumn = refTable.columns.find(c => c.id === col.foreignKey!.referencedColumnId);
          if (!refColumn) {
            warnings.push({
              id: generateId(),
              tableId: table.id,
              columnId: col.id,
              message: `Klucz obcy w kolumnie "${col.name}" wskazuje na nieistniejącą kolumnę w tabeli "${refTable.name}".`,
              type: 'error',
            });
          } else {
            // Check type mismatch
            const isCompatible =
              col.dataType === refColumn.dataType ||
              (col.dataType === 'INTEGER' && refColumn.dataType === 'SERIAL') ||
              (col.dataType === 'BIGINT' && (refColumn.dataType === 'SERIAL' || refColumn.dataType === 'INTEGER'));

            if (!isCompatible) {
              warnings.push({
                id: generateId(),
                tableId: table.id,
                columnId: col.id,
                message: `Klucz obcy "${col.name}" ma typ ${col.dataType}, ale kolumna referencyjna "${refTable.name}.${refColumn.name}" ma typ ${refColumn.dataType}.`,
                type: 'warning',
              });
            }
          }
        }
      }
    }
  }

  // Validate relations
  for (const rel of relations) {
    const sourceTable = tables.find(t => t.id === rel.sourceTableId);
    const targetTable = tables.find(t => t.id === rel.targetTableId);

    if (!sourceTable || !targetTable) {
      warnings.push({
        id: generateId(),
        message: 'Relacja wskazuje na nieistniejącą tabelę.',
        type: 'error',
      });
      continue;
    }

    const sourceColumn = sourceTable.columns.find(c => c.id === rel.sourceColumnId);
    const targetColumn = targetTable.columns.find(c => c.id === rel.targetColumnId);

    if (!sourceColumn || !targetColumn) {
      warnings.push({
        id: generateId(),
        message: 'Relacja wskazuje na nieistniejącą kolumnę.',
        type: 'error',
      });
    }
  }

  return warnings;
}
