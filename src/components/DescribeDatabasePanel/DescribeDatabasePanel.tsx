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
import {
  buildSchemaFromDescription,
  type GeneratedSchema,
} from "../../lib/schemaFromDescription";
import { useSchemaStore } from "../../store/schemaStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}
type Mode = "describe" | "guided";
type Domain = "commerce" | "saas" | "booking" | "custom";
const examples = [
  "Sklep z rowerami, klientami, produktami, zamówieniami i płatnościami.",
  "SaaS dla zespołów z organizacjami, członkami, planami i fakturami.",
  "System rezerwacji wizyt z klientami, terminami i płatnościami.",
];
const domains: Record<Domain, { label: string; detail: string }> = {
  commerce: {
    label: "Online store",
    detail: "Products, customers, orders and payments",
  },
  saas: { label: "SaaS", detail: "Teams, plans, subscriptions and billing" },
  booking: {
    label: "Booking",
    detail: "Customers, resources and reservations",
  },
  custom: { label: "Custom", detail: "Start from your own description" },
};

export function DescribeDatabasePanel({ isOpen, onClose }: Props) {
  const [mode, setMode] = useState<Mode>("describe");
  const [description, setDescription] = useState(examples[0]);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("bicycle_store");
  const [domain, setDomain] = useState<Domain>("commerce");
  const [tableCount, setTableCount] = useState("not-sure");
  const [features, setFeatures] = useState(["payments", "inventory"]);
  const [audit, setAudit] = useState(true);
  const [generated, setGenerated] = useState<GeneratedSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { loadProject } = useSchemaStore();
  const chars = useMemo(() => description.trim().length, [description]);
  if (!isOpen) return null;

  const guidedDescription = `${domains[domain].label} named ${name}. ${domains[domain].detail}. Include ${features.join(", ")}.`;
  const create = (source: string, projectName?: string) => {
    setError(null);
    setBusy(true);
    window.setTimeout(() => {
      try {
        const result = buildSchemaFromDescription(source, {
          includeAuditColumns: audit,
        });
        const finalResult = projectName ? { ...result, projectName } : result;
        loadProject(
          finalResult.tables,
          finalResult.relations,
          finalResult.projectName,
        );
        setGenerated(finalResult);
      } catch (cause) {
        setGenerated(null);
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not create the schema.",
        );
      } finally {
        setBusy(false);
      }
    }, 300);
  };
  const toggle = (feature: string) =>
    setFeatures((items) =>
      items.includes(feature)
        ? items.filter((item) => item !== feature)
        : [...items, feature],
    );
  const steps = ["Basics", "Data", "Workflows", "Review"];

  return (
    <motion.aside
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -16, opacity: 0 }}
      className="flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-slate-700/70 bg-[#0d1b2a] lg:w-[430px]"
      aria-label="Create a database"
    >
      <header className="border-b border-slate-700/70 px-6 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-50">
              Create a database
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Start with your own words or follow a short setup.
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
        <div className="mt-5 flex gap-6" role="tablist">
          {(["describe", "guided"] as Mode[]).map((item) => (
            <button
              key={item}
              role="tab"
              aria-selected={mode === item}
              onClick={() => {
                setMode(item);
                setGenerated(null);
                setError(null);
              }}
              className={`relative pb-3 text-sm ${mode === item ? "text-cyan-300" : "text-slate-400 hover:text-slate-200"}`}
            >
              {item === "describe" ? "Describe it" : "Guided setup"}
              {mode === item && (
                <motion.span
                  layoutId="mode"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan-400"
                />
              )}
            </button>
          ))}
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <AnimatePresence mode="wait">
          {mode === "describe" ? (
            <motion.div
              key="describe"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
            >
              <label
                htmlFor="database-description"
                className="text-sm font-medium text-slate-200"
              >
                What are you building?
              </label>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Write naturally. Mention the people, things and actions that
                matter.
              </p>
              <div className="relative mt-3">
                <textarea
                  id="database-description"
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setError(null);
                  }}
                  className="h-44 w-full resize-none rounded-lg border border-slate-600 bg-[#101f30] px-4 py-3 text-[13px] leading-6 text-slate-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                  maxLength={1200}
                />
                <span className="absolute bottom-3 right-3 text-[10px] text-slate-500">
                  {chars}/1200
                </span>
              </div>
              <p className="mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-500">
                Try an example
              </p>
              <div className="mt-2 space-y-1">
                {examples.map((example) => (
                  <button
                    key={example}
                    onClick={() => setDescription(example)}
                    className="w-full border-l-2 border-slate-700 px-3 py-1.5 text-left text-xs leading-5 text-slate-400 transition hover:border-cyan-500 hover:text-slate-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <Audit checked={audit} onChange={setAudit} />
              <Primary
                busy={busy}
                disabled={chars < 20}
                onClick={() => create(description)}
                label="Build schema"
              />
            </motion.div>
          ) : (
            <motion.div
              key="guided"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
            >
              <nav
                className="mb-6 flex items-center"
                aria-label="Setup progress"
              >
                {steps.map((label, index) => (
                  <div
                    key={label}
                    className="flex min-w-0 flex-1 items-center last:flex-none"
                  >
                    <button
                      title={label}
                      onClick={() => index <= step && setStep(index)}
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] ${index < step ? "border-cyan-400 bg-cyan-400 text-slate-950" : index === step ? "border-cyan-400 text-cyan-300" : "border-slate-600 text-slate-500"}`}
                    >
                      {index < step ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        index + 1
                      )}
                    </button>
                    {index < 3 && (
                      <span
                        className={`h-px flex-1 ${index < step ? "bg-cyan-500/60" : "bg-slate-700"}`}
                      />
                    )}
                  </div>
                ))}
              </nav>
              <AnimatePresence mode="wait">
                <motion.section
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.18 }}
                >
                  {step === 0 && (
                    <>
                      <Field label="Database name">
                        <input
                          value={name}
                          onChange={(e) =>
                            setName(
                              e.target.value
                                .replace(/[^a-zA-Z0-9_]/g, "_")
                                .toLowerCase(),
                            )
                          }
                          className="h-11 w-full rounded-md border border-slate-600 bg-[#101f30] px-3 font-mono text-sm text-slate-100 focus:border-cyan-500"
                        />
                      </Field>
                      <p className="mt-5 text-sm font-medium text-slate-200">
                        What are you building?
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {(Object.keys(domains) as Domain[]).map((item) => (
                          <button
                            key={item}
                            onClick={() =>
                              item === "custom"
                                ? setMode("describe")
                                : setDomain(item)
                            }
                            className={`min-h-20 rounded-md border p-3 text-left transition ${domain === item ? "border-cyan-400 bg-cyan-400/5" : "border-slate-700 bg-[#101f30] hover:border-slate-500"}`}
                          >
                            <span className="text-sm font-medium text-slate-100">
                              {domains[item].label}
                            </span>
                            <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                              {domains[item].detail}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <p className="text-sm font-medium text-slate-200">
                        Approximate table count
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        This guides complexity. It never locks the result.
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        {["3-6", "7-12", "13-20", "not-sure"].map((value) => (
                          <button
                            key={value}
                            onClick={() => setTableCount(value)}
                            className={`h-11 rounded-md border text-xs ${tableCount === value ? "border-cyan-400 text-cyan-300" : "border-slate-700 text-slate-400"}`}
                          >
                            {value === "not-sure"
                              ? "I'm not sure"
                              : `${value} tables`}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <p className="text-sm font-medium text-slate-200">
                        Which workflows matter?
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Choose everything the first version should support.
                      </p>
                      <div className="mt-4 space-y-1">
                        {[
                          "payments",
                          "inventory",
                          "user accounts",
                          "shipping",
                          "reporting",
                        ].map((feature) => (
                          <label
                            key={feature}
                            className="flex h-11 items-center gap-3 border-b border-slate-800 text-sm text-slate-300"
                          >
                            <input
                              type="checkbox"
                              checked={features.includes(feature)}
                              onChange={() => toggle(feature)}
                              className="h-4 w-4 border-slate-600 bg-slate-900 text-cyan-500"
                            />
                            {feature[0].toUpperCase() + feature.slice(1)}
                          </label>
                        ))}
                      </div>
                    </>
                  )}
                  {step === 3 && (
                    <Review
                      name={name}
                      domain={domains[domain].label}
                      tableCount={tableCount}
                      features={features}
                      audit={audit}
                    />
                  )}
                </motion.section>
              </AnimatePresence>
              <div className="mt-8 flex gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="flex h-11 w-12 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800"
                    aria-label="Previous"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() =>
                    step < 3
                      ? setStep(step + 1)
                      : create(guidedDescription, name || domains[domain].label)
                  }
                  disabled={busy || (step === 0 && !name)}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-cyan-400 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-500"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : step === 3 ? (
                    <Database className="h-4 w-4" />
                  ) : null}
                  {busy ? (
                    "Building schema..."
                  ) : step === 3 ? (
                    "Create database"
                  ) : (
                    <>
                      Continue <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="mt-3 text-center text-[10px] leading-4 text-slate-500">
          Everything runs in your browser. No upload, account or API key.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-5 text-amber-200"
          >
            {error}
          </div>
        )}
        {generated && <Understanding result={generated} />}
      </div>
    </motion.aside>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-200">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
function Audit({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="mt-5 flex items-center gap-2.5 text-xs text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 border-slate-600 bg-slate-900 text-cyan-500"
      />
      Include created_at and updated_at
    </label>
  );
}
function Primary({
  busy,
  disabled,
  onClick,
  label,
}: {
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-400 text-sm font-semibold text-slate-950 hover:bg-cyan-300 disabled:bg-slate-700 disabled:text-slate-500"
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {busy ? "Building schema..." : label}
    </button>
  );
}
function Review({
  name,
  domain,
  tableCount,
  features,
  audit,
}: {
  name: string;
  domain: string;
  tableCount: string;
  features: string[];
  audit: boolean;
}) {
  return (
    <>
      <h3 className="text-sm font-semibold text-slate-100">
        Review your setup
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        You can change every table after creation.
      </p>
      <dl className="mt-4 divide-y divide-slate-800">
        {[
          ["Name", name],
          ["Type", domain],
          [
            "Size",
            tableCount === "not-sure"
              ? "Choose for me"
              : `${tableCount} tables`,
          ],
          ["Workflows", features.join(", ") || "Core workflow only"],
          ["Audit fields", audit ? "Included" : "Not included"],
        ].map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-3">
            <dt className="text-xs text-slate-500">{label}</dt>
            <dd className="max-w-[240px] text-right text-xs text-slate-200">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}
function Understanding({ result }: { result: GeneratedSchema }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t border-slate-700 pt-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">
          What we understood
        </h3>
        <span className="flex items-center gap-1 text-[11px] text-emerald-400">
          <Check className="h-3.5 w-3.5" /> Ready to edit
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-400">
        A {result.projectName.toLowerCase()} with {result.summary}.
      </p>
      <div className="mt-3 divide-y divide-slate-800">
        {result.tables.map((table) => (
          <div
            key={table.id}
            className="flex items-center justify-between py-2"
          >
            <span className="font-mono text-xs text-slate-300">
              {table.name}
            </span>
            <span className="text-[10px] text-slate-600">
              {table.columns.length} columns
            </span>
          </div>
        ))}
      </div>
      <h4 className="mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        Assumptions
      </h4>
      <ul className="mt-2 space-y-2">
        {result.assumptions.map((item) => (
          <li
            key={item}
            className="border-l-2 border-slate-700 pl-3 text-[11px] leading-4 text-slate-400"
          >
            {item}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}
