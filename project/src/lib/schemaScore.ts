import type { Table, Relation, Column } from '../types/schema';

export interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  recommendations: string[];
}

export interface SchemaScore {
  total: number;
  maxTotal: number;
  percentage: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  categories: ScoreCategory[];
  suggestions: string[];
}

function checkNamingConventions(tables: Table[]): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];
  const maxScore = tables.length * 10;

  for (const table of tables) {
    const tableName = table.name.toLowerCase();

    // Check table name is lowercase and uses underscores
    if (tableName === table.name && !/\s/.test(table.name)) {
      score += 5;
    } else {
      issues.push(`Tabela "${table.name}": używaj małych liter i podkreślników (np. user_orders)`);
    }

    // Check for plural/singular consistency
    if (tableName.endsWith('s') || tableName.endsWith('y') ||
        ['user', 'order', 'product', 'category', 'post', 'comment', 'role'].includes(tableName)) {
      score += 5;
    } else {
      issues.push(`Tabela "${table.name}": rozważ użycie liczby mnogiej dla nazwy tabeli`);
    }
  }

  return { score, issues };
}

function checkPrimaryKeys(tables: Table[]): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];
  const maxScore = tables.length * 15;

  for (const table of tables) {
    const pkColumns = table.columns.filter(c => c.isPrimaryKey);

    if (pkColumns.length === 1) {
      score += 15;
    } else if (pkColumns.length === 0) {
      issues.push(`Tabela "${table.name}" nie ma klucza głównego`);
    } else {
      issues.push(`Tabela "${table.name}" ma wiele kluczy głównych - rozważ użycie jednego`);
      score += 5;
    }
  }

  return { score, issues };
}

function checkForeignKeys(tables: Table[], relations: Relation[]): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  const tablesWithFk = new Set(relations.map(r => r.sourceTableId));

  for (const table of tables) {
    const tableName = table.name.toLowerCase();

    // Tables that typically need foreign keys
    const needsFk = ['orders', 'order_items', 'payments', 'comments', 'posts', 'products', 'reviews', 'addresses'];
    const shouldHaveFk = needsFk.some(n => tableName.includes(n));

    if (shouldHaveFk && tablesWithFk.has(table.id)) {
      score += 10;
    } else if (shouldHaveFk && !tablesWithFk.has(table.id)) {
      issues.push(`Tabela "${table.name}" powinna mieć klucz obcy do powiązanej tabeli`);
    } else if (!shouldHaveFk) {
      score += 5;
    }
  }

  // Check FK columns have indexes
  for (const relation of relations) {
    const sourceTable = tables.find(t => t.id === relation.sourceTableId);
    const sourceColumn = sourceTable?.columns.find(c => c.id === relation.sourceColumnId);

    if (sourceColumn?.isIndex) {
      score += 5;
    } else {
      issues.push(`Kolumna "${sourceColumn?.name}" w "${sourceTable?.name}": dodaj INDEX dla klucza obcego`);
    }
  }

  return { score, issues };
}

function checkTimestamps(tables: Table[]): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  for (const table of tables) {
    const tableName = table.name.toLowerCase();
    const hasCreatedAt = table.columns.some(c => c.name.toLowerCase() === 'created_at');
    const hasUpdatedAt = table.columns.some(c => c.name.toLowerCase() === 'updated_at');

    // Skip junction tables and pivot tables
    if (tableName.includes('junction') || tableName.includes('pivot') || tableName.includes('_has_')) {
      continue;
    }

    if (hasCreatedAt && hasUpdatedAt) {
      score += 10;
    } else if (hasCreatedAt) {
      score += 5;
      issues.push(`Tabela "${table.name}": rozważ dodanie kolumny "updated_at"`);
    } else {
      issues.push(`Tabela "${table.name}": dodaj kolumny "created_at" i "updated_at"`);
    }
  }

  return { score, issues };
}

function checkDataTypes(tables: Table[]): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  for (const table of tables) {
    for (const column of table.columns) {
      const colName = column.name.toLowerCase();

      // Check price/amount columns use NUMERIC
      if ((colName.includes('price') || colName.includes('amount') || colName === 'total') &&
          column.dataType !== 'NUMERIC(10,2)') {
        issues.push(`"${table.name}.${column.name}": użyj NUMERIC(10,2) dla wartości finansowych`);
      } else if ((colName.includes('price') || colName.includes('amount') || colName === 'total') &&
                 column.dataType === 'NUMERIC(10,2)') {
        score += 3;
      }

      // Check email columns are VARCHAR with UNIQUE
      if (colName === 'email' && !column.isUnique) {
        issues.push(`"${table.name}.${column.name}": kolumna email powinna mieć UNIQUE`);
      } else if (colName === 'email' && column.isUnique) {
        score += 3;
      }

      // Check boolean columns have defaults
      if (column.dataType === 'BOOLEAN' && !column.defaultValue) {
        issues.push(`"${table.name}.${column.name}": rozważ dodanie wartości domyślnej dla boolean`);
      } else if (column.dataType === 'BOOLEAN' && column.defaultValue) {
        score += 2;
      }
    }
  }

  return { score, issues };
}

function checkIndexes(tables: Table[]): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  for (const table of tables) {
    const indexCount = table.columns.filter(c => c.isIndex).length;

    // PK columns should not have extra INDEX (they're already indexed)
    const pkWithIndex = table.columns.filter(c => c.isPrimaryKey && c.isIndex);
    if (pkWithIndex.length > 0) {
      issues.push(`Tabela "${table.name}": INDEX na kluczu głównym jest zbędny`);
    } else {
      score += 5;
    }

    // Check for frequently searched columns without indexes
    const searchableCols = table.columns.filter(c => {
      const name = c.name.toLowerCase();
      return (name.includes('name') || name.includes('title') || name.includes('slug') ||
              name.includes('status') || name.includes('email')) && !c.isPrimaryKey;
    });

    for (const col of searchableCols) {
      if (col.isIndex) {
        score += 3;
      } else {
        issues.push(`"${table.name}.${col.name}": rozważ dodanie INDEX dla często wyszukiwanej kolumny`);
      }
    }
  }

  return { score, issues };
}

export function calculateSchemaScore(tables: Table[], relations: Relation[]): SchemaScore {
  if (tables.length === 0) {
    return {
      total: 0,
      maxTotal: 100,
      percentage: 0,
      grade: 'F',
      categories: [],
      suggestions: ['Dodaj tabele, aby obliczyć ocenę schematu'],
    };
  }

  const categories: ScoreCategory[] = [];

  // 1. Naming conventions (max 20)
  const naming = checkNamingConventions(tables);
  categories.push({
    name: 'Konwencje nazewnictwa',
    score: naming.score,
    maxScore: 20,
    recommendations: naming.issues,
  });

  // 2. Primary keys (max 25)
  const pk = checkPrimaryKeys(tables);
  categories.push({
    name: 'Klucze główne',
    score: pk.score,
    maxScore: 25,
    recommendations: pk.issues,
  });

  // 3. Foreign keys and relations (max 25)
  const fk = checkForeignKeys(tables, relations);
  categories.push({
    name: 'Relacje i klucze obce',
    score: fk.score,
    maxScore: 25,
    recommendations: fk.issues,
  });

  // 4. Timestamps (max 15)
  const timestamps = checkTimestamps(tables);
  categories.push({
    name: 'Znaczniki czasu',
    score: timestamps.score,
    maxScore: 15,
    recommendations: timestamps.issues,
  });

  // 5. Data types (max 15)
  const types = checkDataTypes(tables);
  categories.push({
    name: 'Typy danych',
    score: types.score,
    maxScore: 15,
    recommendations: types.issues,
  });

  const total = categories.reduce((sum, cat) => sum + cat.score, 0);
  const maxTotal = categories.reduce((sum, cat) => sum + cat.maxScore, 0);
  const percentage = Math.round((total / maxTotal) * 100);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else grade = 'F';

  const suggestions = categories
    .flatMap(cat => cat.recommendations)
    .slice(0, 5);

  return {
    total,
    maxTotal,
    percentage,
    grade,
    categories,
    suggestions,
  };
}
