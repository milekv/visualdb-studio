import type { Template, Table, Relation, Column } from '../types/schema';
import { generateId } from '../store/schemaStore';

export const templates: Template[] = [
  {
    id: 'ecommerce',
    name: 'Sklep internetowy',
    description: 'Produkty, kategorie, zamówienia, użytkownicy',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'email', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'password_hash', dataType: 'TEXT', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'name', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'categories',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'slug', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
        ],
      },
      {
        name: 'products',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'description', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'price', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'stock', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: '0' },
          { name: 'category_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'categories', referencedColumnId: 'id', onDelete: 'SET NULL' } },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'orders',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'user_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'users', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'total', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'status', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: "'pending'" },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'order_items',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'order_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'orders', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'product_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'products', referencedColumnId: 'id', onDelete: 'RESTRICT' } },
          { name: 'quantity', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'price', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
    ],
    relations: [],
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Posty, komentarze, autorzy, tagi',
    tables: [
      {
        name: 'users',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'email', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'bio', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
      {
        name: 'posts',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'title', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'slug', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'content', dataType: 'TEXT', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'author_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'users', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'published', dataType: 'BOOLEAN', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'false' },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'comments',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'post_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'posts', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'author_name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'content', dataType: 'TEXT', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'tags',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'slug', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
        ],
      },
      {
        name: 'post_tags',
        columns: [
          { name: 'post_id', dataType: 'INTEGER', isPrimaryKey: true, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'posts', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'tag_id', dataType: 'INTEGER', isPrimaryKey: true, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'tags', referencedColumnId: 'id', onDelete: 'CASCADE' } },
        ],
      },
    ],
    relations: [],
  },
  {
    id: 'crm',
    name: 'CRM',
    description: 'Klienci, kontakty, szanse sprzedaży',
    tables: [
      {
        name: 'companies',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'website', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'industry', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'contacts',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'first_name', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'last_name', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'email', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'phone', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'company_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'companies', referencedColumnId: 'id', onDelete: 'SET NULL' } },
        ],
      },
      {
        name: 'deals',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'title', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'value', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'stage', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false, defaultValue: "'lead'" },
          { name: 'company_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'companies', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'contact_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'contacts', referencedColumnId: 'id', onDelete: 'SET NULL' } },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'activities',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'deal_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'deals', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'type', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'description', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
    ],
    relations: [],
  },
  {
    id: 'booking',
    name: 'System rezerwacji',
    description: 'Rezerwacje, pokoje, goście',
    tables: [
      {
        name: 'guests',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'first_name', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'last_name', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'email', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'phone', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
      {
        name: 'rooms',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'number', dataType: 'VARCHAR(20)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'type', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'price_per_night', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'capacity', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
      {
        name: 'bookings',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'guest_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'guests', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'room_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'rooms', referencedColumnId: 'id', onDelete: 'RESTRICT' } },
          { name: 'check_in', dataType: 'DATE', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'check_out', dataType: 'DATE', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'total_price', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'status', dataType: 'VARCHAR(20)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false, defaultValue: "'confirmed'" },
        ],
      },
      {
        name: 'payments',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'booking_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'bookings', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'amount', dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'method', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'paid_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
    ],
    relations: [],
  },
  {
    id: 'saas',
    name: 'Aplikacja SaaS',
    description: 'Organizacje, użytkownicy, subskrypcje',
    tables: [
      {
        name: 'organizations',
        columns: [
          { name: 'id', dataType: 'UUID', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'gen_random_uuid()' },
          { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'slug', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'plan', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: "'free'" },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'users',
        columns: [
          { name: 'id', dataType: 'UUID', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'gen_random_uuid()' },
          { name: 'email', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'password_hash', dataType: 'TEXT', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'full_name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'role', dataType: 'VARCHAR(20)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: "'member'" },
          { name: 'organization_id', dataType: 'UUID', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'organizations', referencedColumnId: 'id', onDelete: 'CASCADE' } },
        ],
      },
      {
        name: 'subscriptions',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'organization_id', dataType: 'UUID', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'organizations', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'stripe_subscription_id', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: false, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'status', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'current_period_end', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
      {
        name: 'api_keys',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'organization_id', dataType: 'UUID', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'organizations', referencedColumnId: 'id', onDelete: 'CASCADE' } },
          { name: 'key_hash', dataType: 'TEXT', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: false, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
    ],
    relations: [],
  },
  {
    id: 'warehouse',
    name: 'System magazynowy',
    description: 'Produkty, lokalizacje, przesunięcia',
    tables: [
      {
        name: 'products',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'sku', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'name', dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'description', dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'unit', dataType: 'VARCHAR(20)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
      {
        name: 'locations',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'code', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
          { name: 'warehouse', dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: false },
          { name: 'zone', dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
        ],
      },
      {
        name: 'inventory',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'product_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'products', referencedColumnId: 'id', onDelete: 'RESTRICT' } },
          { name: 'location_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'locations', referencedColumnId: 'id', onDelete: 'RESTRICT' } },
          { name: 'quantity', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: '0' },
          { name: 'updated_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
      {
        name: 'stock_movements',
        columns: [
          { name: 'id', dataType: 'SERIAL', isPrimaryKey: true, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'product_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'products', referencedColumnId: 'id', onDelete: 'RESTRICT' } },
          { name: 'from_location_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'locations', referencedColumnId: 'id', onDelete: 'SET NULL' } },
          { name: 'to_location_id', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: true, isForeignKey: true, foreignKey: { referencedTableId: 'locations', referencedColumnId: 'id', onDelete: 'SET NULL' } },
          { name: 'quantity', dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'type', dataType: 'VARCHAR(20)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
          { name: 'created_at', dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
        ],
      },
    ],
    relations: [],
  },
];

export function instantiateTemplate(template: Template): { tables: Table[]; relations: Relation[] } {
  const tableIdMap = new Map<string, string>();

  const tables: Table[] = template.tables.map((t, index) => {
    const tableId = generateId();
    tableIdMap.set(t.name, tableId);

    const columns: Column[] = t.columns.map((c) => ({
      ...c,
      id: generateId(),
      foreignKey: c.foreignKey ? { ...c.foreignKey } : undefined,
    }));

    return {
      id: tableId,
      name: t.name,
      columns,
      position: {
        x: 100 + (index % 3) * 350,
        y: 100 + Math.floor(index / 3) * 250,
      },
    };
  });

  // Resolve FK references
  for (const table of tables) {
    for (const col of table.columns) {
      if (col.isForeignKey && col.foreignKey) {
        const refTableName = col.foreignKey.referencedTableId;
        const refTable = tables.find(t => t.name === refTableName);

        if (refTable) {
          const refColName = col.foreignKey.referencedColumnId;
          const refColumn = refTable.columns.find(c => c.name === refColName);
          if (refColumn) {
            col.foreignKey = {
              referencedTableId: refTable.id,
              referencedColumnId: refColumn.id,
              onDelete: col.foreignKey.onDelete,
            };
          }
        }
      }
    }
  }

  // Generate relations from FKs
  const relations: Relation[] = [];
  for (const table of tables) {
    for (const col of table.columns) {
      if (col.isForeignKey && col.foreignKey) {
        relations.push({
          id: generateId(),
          sourceTableId: table.id,
          sourceColumnId: col.id,
          targetTableId: col.foreignKey.referencedTableId,
          targetColumnId: col.foreignKey.referencedColumnId,
          onDelete: col.foreignKey.onDelete,
        });
      }
    }
  }

  return { tables, relations };
}
