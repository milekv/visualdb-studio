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
});
