import { describe, expect, it } from 'vitest';
import { generateSQL } from './sqlGenerator';
import type { Table } from '../types/schema';

const tables: Table[] = [
  {
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
  },
  {
    id: 'orders',
    name: 'orders',
    position: { x: 300, y: 0 },
    columns: [
      {
        id: 'orders-id',
        name: 'id',
        dataType: 'SERIAL',
        isPrimaryKey: true,
        isNotNull: true,
        isUnique: false,
        isIndex: false,
        isForeignKey: false,
      },
      {
        id: 'orders-user-id',
        name: 'user_id',
        dataType: 'INTEGER',
        isPrimaryKey: false,
        isNotNull: true,
        isUnique: false,
        isIndex: true,
        isForeignKey: true,
        foreignKey: {
          referencedTableId: 'users',
          referencedColumnId: 'users-id',
          onDelete: 'CASCADE',
        },
      },
    ],
  },
];

describe('generateSQL', () => {
  it('orders referenced tables before dependent tables', () => {
    const sql = generateSQL([...tables].reverse());
    expect(sql.indexOf('CREATE TABLE users')).toBeLessThan(sql.indexOf('CREATE TABLE orders'));
  });

  it('generates primary keys, foreign keys, delete actions, and indexes', () => {
    const sql = generateSQL(tables);
    expect(sql).toContain('id SERIAL PRIMARY KEY');
    expect(sql).toContain('FOREIGN KEY (user_id)');
    expect(sql).toContain('REFERENCES users(id)');
    expect(sql).toContain('ON DELETE CASCADE');
    expect(sql).toContain('CREATE INDEX idx_orders_user_id ON orders(user_id);');
  });

  it('does not double-quote an existing text default', () => {
    const statusTable: Table = {
      id: 'tasks',
      name: 'tasks',
      position: { x: 0, y: 0 },
      columns: [
        {
          id: 'status',
          name: 'status',
          dataType: 'VARCHAR(50)',
          isPrimaryKey: false,
          isNotNull: true,
          isUnique: false,
          isIndex: false,
          isForeignKey: false,
          defaultValue: "'pending'",
        },
      ],
    };

    const sql = generateSQL([statusTable]);
    expect(sql).toContain("DEFAULT 'pending'");
    expect(sql).not.toContain("DEFAULT ''pending''");
  });
});
