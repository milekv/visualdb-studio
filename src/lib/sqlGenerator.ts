import type { Table, Column } from '../types/schema';

function getColumnDefinition(col: Column): string {
  const parts: string[] = [];

  // Data type
  if (col.dataType === 'SERIAL') {
    if (col.isPrimaryKey) {
      parts.push(`${col.name} SERIAL PRIMARY KEY`);
      return parts.join(' ');
    }
    parts.push(`${col.name} SERIAL`);
  } else {
    parts.push(`${col.name} ${col.dataType}`);
  }

  // NOT NULL (skip for SERIAL PRIMARY KEY)
  if (col.isNotNull && !col.isPrimaryKey) {
    parts.push('NOT NULL');
  }

  // UNIQUE (skip for SERIAL PRIMARY KEY)
  if (col.isUnique && !col.isPrimaryKey) {
    parts.push('UNIQUE');
  }

  // DEFAULT
  if (col.defaultValue && col.dataType !== 'SERIAL') {
    const rawDefault = col.defaultValue.trim();
    const isTextType = col.dataType === 'TEXT' || col.dataType.startsWith('VARCHAR');
    const isAlreadyQuoted = rawDefault.startsWith("'") && rawDefault.endsWith("'");
    const defaultValue = isTextType && !isAlreadyQuoted
      ? `'${rawDefault.replace(/'/g, "''")}'`
      : rawDefault;
    parts.push(`DEFAULT ${defaultValue}`);
  }

  return parts.join(' ');
}

function getForeignKeyConstraint(
  table: Table,
  col: Column,
  allTables: Table[]
): string | null {
  if (!col.isForeignKey || !col.foreignKey) return null;

  const refTable = allTables.find(t => t.id === col.foreignKey!.referencedTableId);
  if (!refTable) return null;

  const refColumn = refTable.columns.find(c => c.id === col.foreignKey!.referencedColumnId);
  if (!refColumn) return null;

  const constraintName = `fk_${table.name}_${col.name}`;

  return `CONSTRAINT ${constraintName}
    FOREIGN KEY (${col.name})
    REFERENCES ${refTable.name}(${refColumn.name})
    ON DELETE ${col.foreignKey.onDelete}`;
}

export function generateSQL(tables: Table[]): string {
  const statements: string[] = [];

  // Sort tables by foreign key dependencies
  const sortedTables = [...tables].sort((a, b) => {
    const aHasFkToB = a.columns.some(col =>
      col.isForeignKey && col.foreignKey?.referencedTableId === b.id
    );
    const bHasFkToA = b.columns.some(col =>
      col.isForeignKey && col.foreignKey?.referencedTableId === a.id
    );
    if (aHasFkToB) return 1;
    if (bHasFkToA) return -1;
    return 0;
  });

  for (const table of sortedTables) {
    const columnDefs: string[] = [];
    const foreignKeyConstraints: string[] = [];

    for (const col of table.columns) {
      const colDef = getColumnDefinition(col);
      columnDefs.push(`  ${colDef}`);

      const fkConstraint = getForeignKeyConstraint(table, col, sortedTables);
      if (fkConstraint) {
        foreignKeyConstraints.push(`  ${fkConstraint}`);
      }
    }

    // Add INDEX statements
    const indexStatements: string[] = [];
    for (const col of table.columns) {
      if (col.isIndex && !col.isPrimaryKey) {
        indexStatements.push(`CREATE INDEX idx_${table.name}_${col.name} ON ${table.name}(${col.name});`);
      }
    }

    const allDefs = [...columnDefs, ...foreignKeyConstraints];
    const createTable = `CREATE TABLE ${table.name} (\n${allDefs.join(',\n')}\n);`;

    statements.push(createTable);

    if (indexStatements.length > 0) {
      statements.push('');
      statements.push(...indexStatements);
    }

    statements.push('');
  }

  return statements.join('\n');
}

export function downloadSQL(sql: string, filename: string = 'schema.sql') {
  const blob = new Blob([sql], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
