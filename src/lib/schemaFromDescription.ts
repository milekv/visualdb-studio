import type {
  Column,
  DataType,
  OnDeleteAction,
  Relation,
  Table,
} from "../types/schema";

export interface DescriptionOptions {
  includeAuditColumns: boolean;
}

export interface GeneratedSchema {
  projectName: string;
  tables: Table[];
  relations: Relation[];
  summary: string;
  assumptions: string[];
}

interface ColumnDefinition {
  name: string;
  dataType: DataType;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  defaultValue?: string;
}

interface TableDefinition {
  name: string;
  columns: ColumnDefinition[];
}

interface RelationDefinition {
  source: string;
  column: string;
  target: string;
  onDelete: OnDeleteAction;
  required?: boolean;
}

interface Blueprint {
  id: string;
  name: string;
  keywords: string[];
  tables: TableDefinition[];
  relations: RelationDefinition[];
  assumptions: string[];
}

const auditColumns: ColumnDefinition[] = [
  {
    name: "created_at",
    dataType: "TIMESTAMP",
    required: true,
    defaultValue: "CURRENT_TIMESTAMP",
  },
  {
    name: "updated_at",
    dataType: "TIMESTAMP",
    required: true,
    defaultValue: "CURRENT_TIMESTAMP",
  },
];

const blueprints: Blueprint[] = [
  {
    id: "automotive-services",
    name: "Automotive services",
    keywords: [
      "samochod",
      "motoryzac",
      "warsztat",
      "mechanik",
      "automotive",
      "vehicle service",
      "car service",
      "usług",
    ],
    assumptions: [
      "A customer can register more than one vehicle.",
      "Service orders preserve the price charged at the time of service.",
      "Products used during a service are recorded separately.",
    ],
    tables: [
      {
        name: "customers",
        columns: [
          { name: "full_name", dataType: "VARCHAR(255)", required: true },
          { name: "email", dataType: "VARCHAR(255)", unique: true },
          { name: "phone", dataType: "VARCHAR(50)" },
        ],
      },
      {
        name: "vehicles",
        columns: [
          { name: "vin", dataType: "VARCHAR(50)", unique: true },
          { name: "make", dataType: "VARCHAR(100)", required: true },
          { name: "model", dataType: "VARCHAR(100)", required: true },
          {
            name: "registration_number",
            dataType: "VARCHAR(50)",
            unique: true,
          },
          { name: "production_year", dataType: "INTEGER" },
        ],
      },
      {
        name: "services",
        columns: [
          { name: "name", dataType: "VARCHAR(255)", required: true },
          { name: "description", dataType: "TEXT" },
          { name: "base_price_cents", dataType: "INTEGER", required: true },
          {
            name: "is_active",
            dataType: "BOOLEAN",
            required: true,
            defaultValue: "true",
          },
        ],
      },
      {
        name: "service_orders",
        columns: [
          { name: "status", dataType: "VARCHAR(20)", required: true },
          { name: "scheduled_at", dataType: "TIMESTAMP" },
          { name: "completed_at", dataType: "TIMESTAMP" },
          { name: "total_cents", dataType: "INTEGER", required: true },
          { name: "notes", dataType: "TEXT" },
        ],
      },
      {
        name: "service_order_items",
        columns: [
          { name: "quantity", dataType: "INTEGER", required: true },
          { name: "unit_price_cents", dataType: "INTEGER", required: true },
        ],
      },
      {
        name: "products",
        columns: [
          { name: "sku", dataType: "VARCHAR(50)", unique: true },
          { name: "name", dataType: "VARCHAR(255)", required: true },
          { name: "price_cents", dataType: "INTEGER", required: true },
          {
            name: "stock",
            dataType: "INTEGER",
            required: true,
            defaultValue: "0",
          },
        ],
      },
      {
        name: "used_products",
        columns: [
          { name: "quantity", dataType: "INTEGER", required: true },
          { name: "unit_price_cents", dataType: "INTEGER", required: true },
        ],
      },
    ],
    relations: [
      {
        source: "vehicles",
        column: "customer_id",
        target: "customers",
        onDelete: "RESTRICT",
      },
      {
        source: "service_orders",
        column: "customer_id",
        target: "customers",
        onDelete: "RESTRICT",
      },
      {
        source: "service_orders",
        column: "vehicle_id",
        target: "vehicles",
        onDelete: "RESTRICT",
      },
      {
        source: "service_order_items",
        column: "service_order_id",
        target: "service_orders",
        onDelete: "CASCADE",
      },
      {
        source: "service_order_items",
        column: "service_id",
        target: "services",
        onDelete: "RESTRICT",
      },
      {
        source: "used_products",
        column: "service_order_id",
        target: "service_orders",
        onDelete: "CASCADE",
      },
      {
        source: "used_products",
        column: "product_id",
        target: "products",
        onDelete: "RESTRICT",
      },
    ],
  },
  {
    id: "saas-billing",
    name: "SaaS billing",
    keywords: [
      "subscription",
      "subscriptions",
      "subskrypc",
      "organization",
      "organisation",
      "organizac",
      "plan",
      "invoice",
      "faktur",
    ],
    assumptions: [
      "Organizations own memberships, subscriptions and invoices.",
      "Money is stored in integer minor units to avoid rounding errors.",
      "Membership roles and lifecycle states are stored as text values.",
    ],
    tables: [
      {
        name: "organizations",
        columns: [
          { name: "name", dataType: "VARCHAR(255)", required: true },
          {
            name: "slug",
            dataType: "VARCHAR(100)",
            required: true,
            unique: true,
          },
        ],
      },
      {
        name: "members",
        columns: [
          {
            name: "email",
            dataType: "VARCHAR(255)",
            required: true,
            unique: true,
          },
          { name: "full_name", dataType: "VARCHAR(255)" },
          {
            name: "role",
            dataType: "VARCHAR(50)",
            required: true,
            defaultValue: "'member'",
          },
          {
            name: "status",
            dataType: "VARCHAR(20)",
            required: true,
            defaultValue: "'invited'",
          },
        ],
      },
      {
        name: "plans",
        columns: [
          { name: "name", dataType: "VARCHAR(100)", required: true },
          {
            name: "code",
            dataType: "VARCHAR(50)",
            required: true,
            unique: true,
          },
          { name: "amount_cents", dataType: "INTEGER", required: true },
          {
            name: "currency",
            dataType: "VARCHAR(20)",
            required: true,
            defaultValue: "'USD'",
          },
          { name: "billing_interval", dataType: "VARCHAR(20)", required: true },
          {
            name: "is_active",
            dataType: "BOOLEAN",
            required: true,
            defaultValue: "true",
          },
        ],
      },
      {
        name: "subscriptions",
        columns: [
          {
            name: "status",
            dataType: "VARCHAR(50)",
            required: true,
            defaultValue: "'active'",
          },
          {
            name: "current_period_start",
            dataType: "TIMESTAMP",
            required: true,
          },
          { name: "current_period_end", dataType: "TIMESTAMP", required: true },
          {
            name: "cancel_at_period_end",
            dataType: "BOOLEAN",
            required: true,
            defaultValue: "false",
          },
        ],
      },
      {
        name: "invoices",
        columns: [
          {
            name: "invoice_number",
            dataType: "VARCHAR(50)",
            required: true,
            unique: true,
          },
          { name: "status", dataType: "VARCHAR(20)", required: true },
          { name: "amount_cents", dataType: "INTEGER", required: true },
          { name: "currency", dataType: "VARCHAR(20)", required: true },
          { name: "issued_at", dataType: "TIMESTAMP", required: true },
          { name: "due_at", dataType: "TIMESTAMP" },
        ],
      },
      {
        name: "payments",
        columns: [
          { name: "provider", dataType: "VARCHAR(50)", required: true },
          {
            name: "provider_reference",
            dataType: "VARCHAR(255)",
            unique: true,
          },
          { name: "status", dataType: "VARCHAR(20)", required: true },
          { name: "amount_cents", dataType: "INTEGER", required: true },
          { name: "currency", dataType: "VARCHAR(20)", required: true },
          { name: "paid_at", dataType: "TIMESTAMP" },
        ],
      },
    ],
    relations: [
      {
        source: "members",
        column: "organization_id",
        target: "organizations",
        onDelete: "CASCADE",
      },
      {
        source: "subscriptions",
        column: "organization_id",
        target: "organizations",
        onDelete: "CASCADE",
      },
      {
        source: "subscriptions",
        column: "plan_id",
        target: "plans",
        onDelete: "RESTRICT",
      },
      {
        source: "invoices",
        column: "organization_id",
        target: "organizations",
        onDelete: "RESTRICT",
      },
      {
        source: "invoices",
        column: "subscription_id",
        target: "subscriptions",
        onDelete: "RESTRICT",
      },
      {
        source: "payments",
        column: "invoice_id",
        target: "invoices",
        onDelete: "RESTRICT",
      },
    ],
  },
  {
    id: "commerce",
    name: "Online store",
    keywords: [
      "store",
      "shop",
      "ecommerce",
      "e-commerce",
      "sklep",
      "product",
      "produkt",
      "order",
      "zamów",
    ],
    assumptions: [
      "Orders preserve item prices at purchase time.",
      "Payments belong to orders.",
      "Products can belong to one category.",
    ],
    tables: [
      {
        name: "customers",
        columns: [
          {
            name: "email",
            dataType: "VARCHAR(255)",
            required: true,
            unique: true,
          },
          { name: "full_name", dataType: "VARCHAR(255)", required: true },
        ],
      },
      {
        name: "categories",
        columns: [
          { name: "name", dataType: "VARCHAR(100)", required: true },
          {
            name: "slug",
            dataType: "VARCHAR(100)",
            required: true,
            unique: true,
          },
        ],
      },
      {
        name: "products",
        columns: [
          {
            name: "sku",
            dataType: "VARCHAR(50)",
            required: true,
            unique: true,
          },
          { name: "name", dataType: "VARCHAR(255)", required: true },
          { name: "price_cents", dataType: "INTEGER", required: true },
          {
            name: "stock",
            dataType: "INTEGER",
            required: true,
            defaultValue: "0",
          },
        ],
      },
      {
        name: "orders",
        columns: [
          { name: "status", dataType: "VARCHAR(50)", required: true },
          { name: "total_cents", dataType: "INTEGER", required: true },
        ],
      },
      {
        name: "order_items",
        columns: [
          { name: "quantity", dataType: "INTEGER", required: true },
          { name: "unit_price_cents", dataType: "INTEGER", required: true },
        ],
      },
      {
        name: "payments",
        columns: [
          { name: "status", dataType: "VARCHAR(20)", required: true },
          { name: "amount_cents", dataType: "INTEGER", required: true },
          {
            name: "provider_reference",
            dataType: "VARCHAR(255)",
            unique: true,
          },
        ],
      },
    ],
    relations: [
      {
        source: "products",
        column: "category_id",
        target: "categories",
        onDelete: "SET NULL",
        required: false,
      },
      {
        source: "orders",
        column: "customer_id",
        target: "customers",
        onDelete: "RESTRICT",
      },
      {
        source: "order_items",
        column: "order_id",
        target: "orders",
        onDelete: "CASCADE",
      },
      {
        source: "order_items",
        column: "product_id",
        target: "products",
        onDelete: "RESTRICT",
      },
      {
        source: "payments",
        column: "order_id",
        target: "orders",
        onDelete: "RESTRICT",
      },
    ],
  },
  {
    id: "booking",
    name: "Booking system",
    keywords: [
      "booking",
      "reservation",
      "rezerw",
      "appointment",
      "wizy",
      "hotel",
      "room",
      "pokój",
    ],
    assumptions: [
      "Availability is derived from bookings.",
      "Payments are retained when a booking is removed.",
      "Booking status is explicit.",
    ],
    tables: [
      {
        name: "customers",
        columns: [
          {
            name: "email",
            dataType: "VARCHAR(255)",
            required: true,
            unique: true,
          },
          { name: "full_name", dataType: "VARCHAR(255)", required: true },
        ],
      },
      {
        name: "resources",
        columns: [
          { name: "name", dataType: "VARCHAR(255)", required: true },
          { name: "resource_type", dataType: "VARCHAR(50)", required: true },
          {
            name: "is_active",
            dataType: "BOOLEAN",
            required: true,
            defaultValue: "true",
          },
        ],
      },
      {
        name: "bookings",
        columns: [
          { name: "starts_at", dataType: "TIMESTAMP", required: true },
          { name: "ends_at", dataType: "TIMESTAMP", required: true },
          {
            name: "status",
            dataType: "VARCHAR(20)",
            required: true,
            defaultValue: "'confirmed'",
          },
        ],
      },
      {
        name: "payments",
        columns: [
          { name: "amount_cents", dataType: "INTEGER", required: true },
          { name: "status", dataType: "VARCHAR(20)", required: true },
          { name: "paid_at", dataType: "TIMESTAMP" },
        ],
      },
    ],
    relations: [
      {
        source: "bookings",
        column: "customer_id",
        target: "customers",
        onDelete: "RESTRICT",
      },
      {
        source: "bookings",
        column: "resource_id",
        target: "resources",
        onDelete: "RESTRICT",
      },
      {
        source: "payments",
        column: "booking_id",
        target: "bookings",
        onDelete: "RESTRICT",
      },
    ],
  },
];

function scoreBlueprint(description: string, blueprint: Blueprint): number {
  const keywordScore = blueprint.keywords.reduce(
    (score, keyword) => score + (description.includes(keyword) ? 1 : 0),
    0,
  );
  const strongDomainMatch: Record<string, RegExp> = {
    "automotive-services":
      /samochod|motoryzac|warsztat|mechanik|automotive|vehicle service|car service/,
    commerce: /sklep|store|shop|e-?commerce/,
    "saas-billing":
      /saas|subskrypc|subscription|organizac|organisation|organization/,
    booking: /rezerw|booking|reservation|appointment|wizy|hotel/,
  };
  return (
    keywordScore + (strongDomainMatch[blueprint.id]?.test(description) ? 3 : 0)
  );
}

function makeColumn(id: string, definition: ColumnDefinition): Column {
  return {
    id,
    name: definition.name,
    dataType: definition.dataType,
    isPrimaryKey: false,
    isNotNull: definition.required ?? false,
    isUnique: definition.unique ?? false,
    isIndex: definition.indexed ?? definition.unique ?? false,
    isForeignKey: false,
    defaultValue: definition.defaultValue,
  };
}

export function buildSchemaFromDescription(
  description: string,
  options: DescriptionOptions,
): GeneratedSchema {
  const normalized = description.trim().toLowerCase();
  if (normalized.length < 20) {
    throw new Error("Describe the main entities and what they need to do.");
  }

  const ranked = blueprints
    .map((blueprint) => ({
      blueprint,
      score: scoreBlueprint(normalized, blueprint),
    }))
    .sort((a, b) => b.score - a.score);
  const selected = ranked[0];
  if (!selected || selected.score < 2) {
    throw new Error(
      "Add a little more context, for example the users, records and processes the database should support.",
    );
  }

  let sequence = 0;
  const nextId = (prefix: string) => `${prefix}-${++sequence}`;
  const tableByName = new Map<string, Table>();

  const tables = selected.blueprint.tables.map((definition, index) => {
    const tableId = nextId("table");
    const columns: Column[] = [
      {
        id: nextId("column"),
        name: "id",
        dataType: "UUID",
        isPrimaryKey: true,
        isNotNull: true,
        isUnique: false,
        isIndex: false,
        isForeignKey: false,
        defaultValue: "gen_random_uuid()",
      },
      ...definition.columns.map((column) =>
        makeColumn(nextId("column"), column),
      ),
      ...(options.includeAuditColumns
        ? auditColumns.map((column) => makeColumn(nextId("column"), column))
        : []),
    ];
    const table: Table = {
      id: tableId,
      name: definition.name,
      columns,
      position: {
        x: 70 + (index % 3) * 360,
        y: 70 + Math.floor(index / 3) * 330,
      },
    };
    tableByName.set(definition.name, table);
    return table;
  });

  const relations: Relation[] = [];
  for (const definition of selected.blueprint.relations) {
    const source = tableByName.get(definition.source);
    const target = tableByName.get(definition.target);
    const targetId = target?.columns.find((column) => column.isPrimaryKey);
    if (!source || !target || !targetId) continue;

    const sourceColumn = makeColumn(nextId("column"), {
      name: definition.column,
      dataType: targetId.dataType,
      required: definition.required ?? true,
      indexed: true,
    });
    sourceColumn.isForeignKey = true;
    sourceColumn.foreignKey = {
      referencedTableId: target.id,
      referencedColumnId: targetId.id,
      onDelete: definition.onDelete,
    };
    source.columns.splice(1, 0, sourceColumn);
    relations.push({
      id: nextId("relation"),
      sourceTableId: source.id,
      sourceColumnId: sourceColumn.id,
      targetTableId: target.id,
      targetColumnId: targetId.id,
      onDelete: definition.onDelete,
    });
  }

  const addFeatureTable = (
    name: string,
    columns: ColumnDefinition[],
    parentName: string,
    foreignKeyName: string,
  ) => {
    if (tableByName.has(name)) return;
    const parent = tableByName.get(parentName);
    const parentId = parent?.columns.find((column) => column.isPrimaryKey);
    if (!parent || !parentId) return;
    const table: Table = {
      id: nextId("table"),
      name,
      columns: [
        {
          id: nextId("column"),
          name: "id",
          dataType: "UUID",
          isPrimaryKey: true,
          isNotNull: true,
          isUnique: false,
          isIndex: false,
          isForeignKey: false,
          defaultValue: "gen_random_uuid()",
        },
        ...columns.map((column) => makeColumn(nextId("column"), column)),
        ...(options.includeAuditColumns
          ? auditColumns.map((column) => makeColumn(nextId("column"), column))
          : []),
      ],
      position: {
        x: 70 + (tables.length % 3) * 360,
        y: 70 + Math.floor(tables.length / 3) * 330,
      },
    };
    const foreignKey = makeColumn(nextId("column"), {
      name: foreignKeyName,
      dataType: parentId.dataType,
      required: true,
      indexed: true,
    });
    foreignKey.isForeignKey = true;
    foreignKey.foreignKey = {
      referencedTableId: parent.id,
      referencedColumnId: parentId.id,
      onDelete: "RESTRICT",
    };
    table.columns.splice(1, 0, foreignKey);
    tables.push(table);
    tableByName.set(name, table);
    relations.push({
      id: nextId("relation"),
      sourceTableId: table.id,
      sourceColumnId: foreignKey.id,
      targetTableId: parent.id,
      targetColumnId: parentId.id,
      onDelete: "RESTRICT",
    });
  };

  if (
    /inventory|stock|warehouse|magazyn/.test(normalized) &&
    tableByName.has("products")
  ) {
    addFeatureTable(
      "inventory_movements",
      [
        { name: "quantity_change", dataType: "INTEGER", required: true },
        { name: "reason", dataType: "VARCHAR(100)", required: true },
      ],
      "products",
      "product_id",
    );
  }
  if (
    /shipping|shipment|delivery|wysył|dostaw/.test(normalized) &&
    tableByName.has("orders")
  ) {
    addFeatureTable(
      "shipments",
      [
        { name: "status", dataType: "VARCHAR(20)", required: true },
        { name: "tracking_number", dataType: "VARCHAR(100)", unique: true },
        { name: "shipped_at", dataType: "TIMESTAMP" },
      ],
      "orders",
      "order_id",
    );
  }
  if (
    /account|login|kont|użytkown/.test(normalized) &&
    tableByName.has("customers")
  ) {
    addFeatureTable(
      "customer_accounts",
      [
        { name: "password_hash", dataType: "VARCHAR(255)", required: true },
        {
          name: "is_active",
          dataType: "BOOLEAN",
          required: true,
          defaultValue: "true",
        },
      ],
      "customers",
      "customer_id",
    );
  }

  return {
    projectName: selected.blueprint.name,
    tables,
    relations,
    summary: `${tables.length} tables and ${relations.length} relationships`,
    assumptions: selected.blueprint.assumptions,
  };
}
