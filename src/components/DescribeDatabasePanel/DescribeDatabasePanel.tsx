import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Loader2,
  X,
} from "lucide-react";
import { buildSchemaFromDescription } from "../../lib/schemaFromDescription";
import { useSchemaStore } from "../../store/schemaStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
type Domain = "commerce" | "automotive" | "saas" | "booking";
type Feature =
  | "payments"
  | "inventory"
  | "shipping"
  | "accounts"
  | "files"
  | "notifications"
  | "comments"
  | "locations"
  | "tags"
  | "audit";

const steps = [
  "Project",
  "Use case",
  "Data",
  "Capabilities",
  "Rules",
  "Review",
];
const domains: Record<
  Domain,
  {
    label: string;
    detail: string;
    seed: string;
    core: string[];
    defaults: Feature[];
  }
> = {
  commerce: {
    label: "Online store",
    detail: "Sell products and manage orders",
    seed: "online store ecommerce shop",
    core: ["customers", "categories", "products", "orders", "order_items"],
    defaults: ["payments", "inventory", "shipping", "accounts"],
  },
  automotive: {
    label: "Automotive services",
    detail: "Customers, vehicles and service jobs",
    seed: "automotive car service workshop samochod",
    core: [
      "customers",
      "vehicles",
      "services",
      "service_orders",
      "service_order_items",
      "products",
    ],
    defaults: ["payments", "inventory", "accounts", "files"],
  },
  saas: {
    label: "SaaS billing",
    detail: "Organizations, plans and subscriptions",
    seed: "SaaS subscription organizations billing",
    core: ["organizations", "members", "plans", "subscriptions", "invoices"],
    defaults: ["payments", "notifications", "audit"],
  },
  booking: {
    label: "Booking system",
    detail: "Resources, time slots and reservations",
    seed: "booking reservation appointment customers",
    core: ["customers", "resources", "bookings"],
    defaults: ["payments", "accounts", "notifications"],
  },
};
const features: Array<{
  id: Feature;
  label: string;
  detail: string;
  domains?: Domain[];
}> = [
  {
    id: "payments",
    label: "Payments",
    detail: "Payment status, amount and provider reference",
  },
  {
    id: "inventory",
    label: "Inventory",
    detail: "Stock changes and their reasons",
    domains: ["commerce", "automotive"],
  },
  {
    id: "shipping",
    label: "Shipping",
    detail: "Tracking, carrier and delivery status",
    domains: ["commerce"],
  },
  {
    id: "accounts",
    label: "User accounts",
    detail: "Login credentials and account status",
  },
  {
    id: "files",
    label: "Files",
    detail: "Attachments linked to business records",
  },
  {
    id: "notifications",
    label: "Notifications",
    detail: "Channel, subject and delivery time",
  },
  {
    id: "comments",
    label: "Comments",
    detail: "Notes attached to the main workflow",
  },
  {
    id: "locations",
    label: "Locations",
    detail: "Branches, warehouses or service points",
  },
  { id: "tags", label: "Tags", detail: "Reusable labels for organization" },
  {
    id: "audit",
    label: "Audit log",
    detail: "Who changed which record and when",
  },
];
const featureText: Record<Feature, string> = {
  payments: "payments płatności",
  inventory: "inventory magazyn",
  shipping: "shipping dostawa",
  accounts: "user accounts login konta",
  files: "file attachments documents",
  notifications: "notifications powiadomienia",
  comments: "comments notes",
  locations: "locations lokalizacje",
  tags: "tags etykiety",
  audit: "audit log dziennik zmian",
};

export function DescribeDatabasePanel({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("new_database");
  const [domain, setDomain] = useState<Domain>("commerce");
  const [selected, setSelected] = useState<Feature[]>(
    domains.commerce.defaults,
  );
  const [auditColumns, setAuditColumns] = useState(true);
  const [softDelete, setSoftDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const { loadProject } = useSchemaStore();
  const availableFeatures = features.filter(
    (feature) => !feature.domains || feature.domains.includes(domain),
  );
  const source = `${domains[domain].seed}. ${selected.map((item) => featureText[item]).join(". ")}.`;
  const plan = useMemo(() => {
    try {
      return buildSchemaFromDescription(source, {
        includeAuditColumns: auditColumns,
        includeSoftDelete: softDelete,
      });
    } catch {
      return null;
    }
  }, [source, auditColumns, softDelete]);
  if (!isOpen) return null;

  const chooseDomain = (next: Domain) => {
    setDomain(next);
    setSelected(domains[next].defaults);
  };
  const toggle = (id: Feature) =>
    setSelected((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  const create = () => {
    if (!plan) return;
    setBusy(true);
    window.setTimeout(() => {
      loadProject(plan.tables, plan.relations, name || domains[domain].label);
      setBusy(false);
    }, 320);
  };

  return (
    <motion.aside
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -12, opacity: 0 }}
      className="flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-slate-700/70 bg-[#0d1b2a] lg:w-[440px]"
      aria-label="Database setup"
    >
      <header className="border-b border-slate-700/70 px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Create a database
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              A guided setup for a clean PostgreSQL starting point.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="border-b border-slate-700/70 px-6 py-4">
        <div className="flex items-center">
          {steps.map((label, index) => (
            <div
              key={label}
              className="flex min-w-0 flex-1 items-center last:flex-none"
            >
              <button
                title={label}
                onClick={() => index <= step && setStep(index)}
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[10px] transition ${index < step ? "border-cyan-400 bg-cyan-400 text-slate-950" : index === step ? "border-cyan-400 text-cyan-300" : "border-slate-600 text-slate-500"}`}
              >
                {index < step ? <Check className="h-3.5 w-3.5" /> : index + 1}
              </button>
              {index < steps.length - 1 && (
                <span
                  className={`h-px flex-1 transition-colors ${index < step ? "bg-cyan-500/70" : "bg-slate-700"}`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[9px] text-slate-600">
          <span>{steps[step]}</span>
          <span>
            Step {step + 1} of {steps.length}
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          <motion.section
            key={step}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.16 }}
          >
            {step === 0 && (
              <>
                <Heading
                  title="Name your project"
                  detail="This name is stored only in your browser and project export."
                />
                <Field label="Project name">
                  <input
                    autoFocus
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value.replace(/[^a-zA-Z0-9_ -]/g, ""),
                      )
                    }
                    className="control h-11 w-full rounded-md border border-slate-600 bg-[#101f30] px-3 font-mono text-sm text-slate-100 focus:border-cyan-500"
                    placeholder="customer_portal"
                  />
                </Field>
                <Info>
                  PostgreSQL is the current SQL target. Projects are saved
                  automatically in this browser.
                </Info>
              </>
            )}
            {step === 1 && (
              <>
                <Heading
                  title="Choose a use case"
                  detail="Start from a reviewed structure instead of an empty diagram."
                />
                <div className="space-y-2">
                  {(Object.keys(domains) as Domain[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => chooseDomain(item)}
                      className={`flex w-full items-start justify-between rounded-md border px-4 py-3 text-left transition ${domain === item ? "border-cyan-400 bg-cyan-400/5" : "border-slate-700 bg-[#101f30] hover:border-slate-500"}`}
                    >
                      <span>
                        <span className="block text-sm font-medium text-slate-100">
                          {domains[item].label}
                        </span>
                        <span className="mt-1 block text-[11px] text-slate-500">
                          {domains[item].detail}
                        </span>
                      </span>
                      {domain === item && (
                        <Check className="mt-1 h-4 w-4 text-cyan-400" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <Heading
                  title="Review core data"
                  detail="These tables form the minimum coherent model for this use case."
                />
                <div className="divide-y divide-slate-800 border-y border-slate-700">
                  {domains[domain].core.map((table) => (
                    <div
                      key={table}
                      className="flex h-10 items-center justify-between"
                    >
                      <span className="font-mono text-xs text-slate-300">
                        {table}
                      </span>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                  ))}
                </div>
                <Info>
                  Core tables cannot be removed here because their relationships
                  define the selected workflow. You can edit or delete them on
                  the canvas.
                </Info>
              </>
            )}
            {step === 3 && (
              <>
                <Heading
                  title="Choose capabilities"
                  detail="Every enabled option adds real tables, columns or relationships."
                />
                <div className="space-y-1">
                  {availableFeatures.map((feature) => (
                    <label
                      key={feature.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 transition ${selected.includes(feature.id) ? "border-cyan-500/50 bg-cyan-400/5" : "border-slate-800 hover:border-slate-600"}`}
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(feature.id)}
                        onChange={() => toggle(feature.id)}
                        className="mt-0.5 h-4 w-4 border-slate-600 bg-slate-900 text-cyan-500"
                      />
                      <span>
                        <span className="block text-xs font-medium text-slate-200">
                          {feature.label}
                        </span>
                        <span className="mt-0.5 block text-[10px] leading-4 text-slate-500">
                          {feature.detail}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            )}
            {step === 4 && (
              <>
                <Heading
                  title="Set data rules"
                  detail="Choose how generated records should behave."
                />
                <Rule
                  label="Created and updated timestamps"
                  detail="Adds created_at and updated_at to each table."
                  checked={auditColumns}
                  onChange={setAuditColumns}
                />
                <Rule
                  label="Soft delete"
                  detail="Adds an indexed deleted_at column instead of requiring immediate removal."
                  checked={softDelete}
                  onChange={setSoftDelete}
                />
                <div className="mt-5 border-t border-slate-700 pt-4">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                    Included safeguards
                  </p>
                  {[
                    "UUID primary keys",
                    "Indexed foreign keys",
                    "Matching FK types",
                    "Explicit ON DELETE rules",
                    "Unique business identifiers",
                  ].map((item) => (
                    <div
                      key={item}
                      className="mt-3 flex items-center gap-2 text-xs text-slate-300"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <Heading
                  title="Review the live plan"
                  detail="Nothing is final. Every table remains editable on the canvas."
                />
                <dl className="divide-y divide-slate-800 border-y border-slate-700">
                  <Summary label="Project" value={name || "Untitled project"} />
                  <Summary label="Use case" value={domains[domain].label} />
                  <Summary
                    label="Tables"
                    value={String(plan?.tables.length ?? 0)}
                  />
                  <Summary
                    label="Relationships"
                    value={String(plan?.relations.length ?? 0)}
                  />
                  <Summary
                    label="Capabilities"
                    value={`${selected.length} enabled`}
                  />
                  <Summary label="Naming" value="snake_case" />
                  <Summary label="Primary keys" value="UUID" />
                </dl>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selected.map((id) => (
                    <span
                      key={id}
                      className="rounded border border-slate-700 px-2 py-1 text-[10px] text-slate-400"
                    >
                      {features.find((item) => item.id === id)?.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
      <footer className="border-t border-slate-700 bg-[#0b1724] px-6 py-4">
        <div className="mb-3 flex items-center justify-between text-[10px]">
          <span className="text-slate-500">Live plan</span>
          <span className="font-mono text-slate-300">
            {plan?.tables.length ?? 0} tables · {plan?.relations.length ?? 0}{" "}
            relations
          </span>
        </div>
        <div className="flex gap-2">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex h-11 items-center gap-2 rounded-md border border-slate-700 px-4 text-xs text-slate-300 hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}
          <button
            onClick={() =>
              step < steps.length - 1 ? setStep(step + 1) : create()
            }
            disabled={busy || !name.trim()}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cyan-400 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-500"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : step === steps.length - 1 ? (
              <Database className="h-4 w-4" />
            ) : null}
            {busy ? (
              "Creating..."
            ) : step === steps.length - 1 ? (
              "Create database"
            ) : (
              <>
                Continue <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[9px] text-slate-600">
          Saved locally. No account, upload or API key.
        </p>
      </footer>
    </motion.aside>
  );
}

function Heading({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </div>
  );
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs font-medium text-slate-300">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
function Info({ children }: { children: ReactNode }) {
  return (
    <p className="mt-5 border-l-2 border-slate-700 pl-3 text-[11px] leading-5 text-slate-500">
      {children}
    </p>
  );
}
function Rule({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="mb-2 flex cursor-pointer items-start justify-between gap-4 rounded-md border border-slate-700 bg-[#101f30] p-4">
      <span>
        <span className="block text-sm font-medium text-slate-200">
          {label}
        </span>
        <span className="mt-1 block text-[11px] leading-4 text-slate-500">
          {detail}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 border-slate-600 bg-slate-900 text-cyan-500"
      />
    </label>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="max-w-[250px] text-right text-xs text-slate-200">
        {value}
      </dd>
    </div>
  );
}
