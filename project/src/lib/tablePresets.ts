import type { Column, DataType } from '../types/schema';
import { generateId } from '../store/schemaStore';

export interface ColumnPreset {
  name: string;
  dataType: DataType;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  isIndex: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
}

export interface TablePreset {
  keywords: string[];
  columns: ColumnPreset[];
}

const columnPresets: Record<string, ColumnPreset> = {
  id: {
    name: 'id',
    dataType: 'SERIAL',
    isPrimaryKey: true,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  name: {
    name: 'name',
    dataType: 'VARCHAR(255)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  email: {
    name: 'email',
    dataType: 'VARCHAR(255)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: true,
    isIndex: true,
    isForeignKey: false,
  },
  passwordHash: {
    name: 'password_hash',
    dataType: 'TEXT',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  description: {
    name: 'description',
    dataType: 'TEXT',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  content: {
    name: 'content',
    dataType: 'TEXT',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  price: {
    name: 'price',
    dataType: 'NUMERIC(10,2)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  totalAmount: {
    name: 'total_amount',
    dataType: 'NUMERIC(10,2)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  amount: {
    name: 'amount',
    dataType: 'NUMERIC(10,2)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  stock: {
    name: 'stock',
    dataType: 'INTEGER',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
    defaultValue: '0',
  },
  quantity: {
    name: 'quantity',
    dataType: 'INTEGER',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  status: {
    name: 'status',
    dataType: 'VARCHAR(50)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  published: {
    name: 'published',
    dataType: 'BOOLEAN',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
    defaultValue: 'false',
  },
  title: {
    name: 'title',
    dataType: 'VARCHAR(255)',
    isPrimaryKey: false,
    isNotNull: true,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
  createdAt: {
    name: 'created_at',
    dataType: 'TIMESTAMP',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
    defaultValue: 'CURRENT_TIMESTAMP',
  },
  updatedAt: {
    name: 'updated_at',
    dataType: 'TIMESTAMP',
    isPrimaryKey: false,
    isNotNull: false,
    isUnique: false,
    isIndex: false,
    isForeignKey: false,
  },
};

const tablePresets: TablePreset[] = [
  {
    keywords: ['users', 'uzytkownicy', 'uzytkownik', 'user', 'klienci', 'klient', 'customers', 'customer', 'klienci'],
    columns: [
      columnPresets.id,
      columnPresets.name,
      columnPresets.email,
      columnPresets.passwordHash,
      columnPresets.createdAt,
      columnPresets.updatedAt,
    ],
  },
  {
    keywords: ['products', 'produkt', 'produkty', 'product', 'towary', 'towar'],
    columns: [
      columnPresets.id,
      columnPresets.name,
      columnPresets.description,
      columnPresets.price,
      columnPresets.stock,
      columnPresets.createdAt,
    ],
  },
  {
    keywords: ['orders', 'zamowienia', 'zamowienie', 'order', 'orders'],
    columns: [
      columnPresets.id,
      { ...columnPresets.status, name: 'status', defaultValue: "'pending'" },
      columnPresets.totalAmount,
      columnPresets.createdAt,
    ],
  },
  {
    keywords: ['categories', 'kategorie', 'kategoria', 'category'],
    columns: [
      columnPresets.id,
      { ...columnPresets.name, isUnique: true },
      columnPresets.description,
    ],
  },
  {
    keywords: ['payments', 'platnosci', 'platnosc', 'payment'],
    columns: [
      columnPresets.id,
      columnPresets.amount,
      columnPresets.status,
      { ...columnPresets.createdAt, name: 'paid_at' },
    ],
  },
  {
    keywords: ['posts', 'wpisy', 'wpis', 'post', 'artykuly', 'artykul'],
    columns: [
      columnPresets.id,
      columnPresets.title,
      columnPresets.content,
      columnPresets.published,
      columnPresets.createdAt,
    ],
  },
  {
    keywords: ['comments', 'komentarze', 'komentarz', 'comment'],
    columns: [
      columnPresets.id,
      columnPresets.content,
      columnPresets.createdAt,
    ],
  },
  {
    keywords: ['roles', 'role', 'rola', 'role'],
    columns: [
      columnPresets.id,
      { ...columnPresets.name, isUnique: true },
      columnPresets.description,
    ],
  },
];

export function getTablePreset(tableName: string): ColumnPreset[] | null {
  const normalizedName = tableName.toLowerCase().trim();

  for (const preset of tablePresets) {
    if (preset.keywords.some(kw => normalizedName.includes(kw) || kw.includes(normalizedName))) {
      return preset.columns;
    }
  }

  return null;
}

export function getUniversalPreset(): ColumnPreset[] {
  return [
    columnPresets.id,
    columnPresets.name,
    columnPresets.description,
    columnPresets.createdAt,
  ];
}

export interface ColumnSmartPreset {
  dataType: DataType;
  isPrimaryKey: boolean;
  isNotNull: boolean;
  isUnique: boolean;
  isIndex: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
}

const columnSmartPresets: Record<string, ColumnSmartPreset> = {
  'id': { dataType: 'SERIAL', isPrimaryKey: true, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'user_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'customer_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'order_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'product_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'category_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'post_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'role_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'booking_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'payment_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'comment_id': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: true, isForeignKey: true },
  'email': { dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
  'password': { dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'password_hash': { dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'name': { dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'title': { dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'first_name': { dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'last_name': { dataType: 'VARCHAR(100)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'description': { dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'content': { dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'price': { dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'amount': { dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'total': { dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'total_amount': { dataType: 'NUMERIC(10,2)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'stock': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: '0' },
  'quantity': { dataType: 'INTEGER', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'is_active': { dataType: 'BOOLEAN', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'true' },
  'active': { dataType: 'BOOLEAN', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'true' },
  'published': { dataType: 'BOOLEAN', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'false' },
  'created_at': { dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false, defaultValue: 'CURRENT_TIMESTAMP' },
  'updated_at': { dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'deleted_at': { dataType: 'TIMESTAMP', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'date': { dataType: 'DATE', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'birth_date': { dataType: 'DATE', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'metadata': { dataType: 'JSONB', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'settings': { dataType: 'JSONB', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'status': { dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: false, isIndex: false, isForeignKey: false },
  'phone': { dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'address': { dataType: 'TEXT', isPrimaryKey: false, isNotNull: false, isUnique: false, isIndex: false, isForeignKey: false },
  'slug': { dataType: 'VARCHAR(255)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
  'sku': { dataType: 'VARCHAR(50)', isPrimaryKey: false, isNotNull: true, isUnique: true, isIndex: true, isForeignKey: false },
};

export function getSmartColumnPreset(columnName: string): ColumnSmartPreset | null {
  const normalized = columnName.toLowerCase().trim();
  return columnSmartPresets[normalized] || null;
}

export function createColumnFromPreset(preset: ColumnPreset): Column {
  return {
    id: generateId(),
    name: preset.name,
    dataType: preset.dataType,
    isPrimaryKey: preset.isPrimaryKey,
    isNotNull: preset.isNotNull,
    isUnique: preset.isUnique,
    isIndex: preset.isIndex,
    isForeignKey: preset.isForeignKey,
    defaultValue: preset.defaultValue,
  };
}

export function createColumnsFromPresets(presets: ColumnPreset[]): Column[] {
  return presets.map(createColumnFromPreset);
}
