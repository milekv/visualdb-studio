import { describe, expect, it } from "vitest";
import { buildSchemaFromDescription } from "./schemaFromDescription";
import { validateSchema } from "./schemaValidator";

describe("schema from description", () => {
  it("builds a coherent SaaS billing schema", () => {
    const generated = buildSchemaFromDescription(
      "A subscription platform with organizations, members, plans, subscriptions, invoices and payments.",
      { includeAuditColumns: true },
    );

    expect(generated.projectName).toBe("SaaS billing");
    expect(generated.tables.map((table) => table.name)).toEqual([
      "organizations",
      "members",
      "plans",
      "subscriptions",
      "invoices",
      "payments",
    ]);
    expect(generated.relations).toHaveLength(6);
    expect(validateSchema(generated.tables, generated.relations)).toEqual([]);
  });

  it("keeps foreign key types aligned with UUID primary keys", () => {
    const generated = buildSchemaFromDescription(
      "An online store with customers, products, categories, orders, order items and payments.",
      { includeAuditColumns: false },
    );
    const foreignKeys = generated.tables.flatMap((table) =>
      table.columns.filter((column) => column.isForeignKey),
    );

    expect(foreignKeys.length).toBeGreaterThan(0);
    expect(
      foreignKeys.every(
        (column) => column.dataType === "UUID" && column.isIndex,
      ),
    ).toBe(true);
  });

  it("requires enough context instead of returning a fake generic schema", () => {
    expect(() =>
      buildSchemaFromDescription("A database", { includeAuditColumns: true }),
    ).toThrow();
    expect(() =>
      buildSchemaFromDescription(
        "A system for unusual unknown things and records",
        { includeAuditColumns: true },
      ),
    ).toThrow();
  });

  it("understands an informal Polish store description and adds requested workflows", () => {
    const result = buildSchemaFromDescription(
      "Chcę bazę, bo tworzę sklep z rowerami, klientami, płatnościami, magazynem, kontami i dostawą.",
      { includeAuditColumns: true },
    );

    expect(result.tables.map((table) => table.name)).toEqual(
      expect.arrayContaining([
        "customers",
        "products",
        "orders",
        "payments",
        "inventory_movements",
        "customer_accounts",
        "shipments",
      ]),
    );
  });

  it("does not mistake an automotive service company for an online store", () => {
    const result = buildSchemaFromDescription(
      "firma samochodowa która oferuje usługi z klientami produktami samochodami i cenami",
      { includeAuditColumns: true },
    );

    expect(result.projectName).toBe("Automotive services");
    expect(result.tables.map((table) => table.name)).toEqual(
      expect.arrayContaining([
        "customers",
        "vehicles",
        "services",
        "service_orders",
        "service_order_items",
        "products",
        "used_products",
      ]),
    );
    expect(result.tables.map((table) => table.name)).not.toContain("orders");
  });
});
