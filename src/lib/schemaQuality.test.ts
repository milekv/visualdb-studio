import { describe, expect, it } from 'vitest';
import { detectRelationForColumn } from './relationDetector';
import { calculateSchemaScore } from './schemaScore';
import { validateSchema } from './schemaValidator';
import type { Table } from '../types/schema';

const users: Table = {
  id: 'users',
  name: 'users',
  position: { x: 0, y: 0 },
  columns: [
    {
      id: 'users-id',
      name: 'id',
      dataType: 'SERIAL',
      isPrimaryKey: true,
      isNotNull: true,
      isUnique: false,
      isIndex: false,
      isForeignKey: false,
    },
    {
      id: 'users-email',
      name: 'email',
      dataType: 'VARCHAR(255)',
      isPrimaryKey: false,
      isNotNull: true,
      isUnique: true,
      isIndex: true,
      isForeignKey: false,
    },
  ],
};

describe('schema quality checks', () => {
  it('detects a conventional user_id relationship', () => {
    const orders: Table = { id: 'orders', name: 'orders', position: { x: 0, y: 0 }, columns: [] };
    const relation = detectRelationForColumn('user_id', orders, [users, orders]);
    expect(relation).toMatchObject({
      targetTableId: 'users',
      targetColumnName: 'id',
      confidence: 'high',
      onDelete: 'CASCADE',
    });
  });

  it('warns about duplicate columns and a missing primary key', () => {
    const invalid: Table = {
      id: 'invalid',
      name: 'events',
      position: { x: 0, y: 0 },
      columns: [
        { ...users.columns[1], id: 'first', name: 'name', isUnique: false },
        { ...users.columns[1], id: 'second', name: 'NAME', isUnique: false },
      ],
    };
    const messages = validateSchema([invalid], []).map((warning) => warning.message);
    expect(messages.some((message) => message.includes('nie ma klucza głównego'))).toBe(true);
    expect(messages.some((message) => message.includes('Duplikat nazwy kolumny'))).toBe(true);
  });

  it('returns an empty score for an empty project', () => {
    expect(calculateSchemaScore([], [])).toMatchObject({ percentage: 0, grade: 'F' });
  });

  it('rewards a schema with a primary key and consistent naming', () => {
    const score = calculateSchemaScore([users], []);
    expect(score.percentage).toBeGreaterThan(0);
    expect(score.categories).toHaveLength(5);
  });

  it('never reports a percentage above 100 for multi-table schemas', () => {
    const tables = Array.from({ length: 8 }, (_, index) => ({
      ...users,
      id: `users-${index}`,
      name: `users_${index}`,
      columns: users.columns.map((column) => ({ ...column, id: `${column.id}-${index}` })),
    }));

    expect(calculateSchemaScore(tables, []).percentage).toBeLessThanOrEqual(100);
  });
});
