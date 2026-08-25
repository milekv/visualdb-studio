import { useMemo, useState } from 'react';
import { Check, Database, Loader2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { buildSchemaFromDescription, type GeneratedSchema } from '../../lib/schemaFromDescription';
import { useSchemaStore } from '../../store/schemaStore';

interface DescribeDatabasePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const example = 'A subscription platform with organizations, members, plans, subscriptions, invoices and payments. Organizations can invite members with different roles.';

export function DescribeDatabasePanel({ isOpen, onClose }: DescribeDatabasePanelProps) {
  const [description, setDescription] = useState(example);
  const [includeAuditColumns, setIncludeAuditColumns] = useState(true);
  const [generated, setGenerated] = useState<GeneratedSchema | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { loadProject } = useSchemaStore();

  const characterCount = useMemo(() => description.trim().length, [description]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    setError(null);
    setIsGenerating(true);

    window.setTimeout(() => {
      try {
        const result = buildSchemaFromDescription(description, { includeAuditColumns });
        loadProject(result.tables, result.relations, result.projectName);
        setGenerated(result);
      } catch (generationError) {
        setGenerated(null);
        setError(generationError instanceof Error ? generationError.message : 'Could not create the schema.');
      } finally {
        setIsGenerating(false);
      }
    }, 280);
  };

  return (
    <motion.aside
      initial={{ x: -12, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -12, opacity: 0 }}
      className="flex h-full w-full shrink-0 flex-col overflow-hidden border-r border-slate-700/70 bg-[#0d1b2a] lg:w-[352px]"
      aria-label="Describe your database"
    >
      <div className="flex min-w-[352px] items-start justify-between border-b border-slate-700/70 px-5 py-5">
        <div>
          <h2 className="text-[17px] font-semibold leading-6 text-slate-50">Describe your database</h2>
          <p className="mt-1 max-w-[270px] text-xs leading-5 text-slate-400">
            Explain the data and workflow. You can edit every table after generation.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close description panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-w-[352px] flex-1 overflow-y-auto px-5 py-5">
        <label htmlFor="database-description" className="text-xs font-medium text-slate-300">
          What should the database support?
        </label>
        <div className="relative mt-2">
          <textarea
            id="database-description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError(null);
            }}
            className="h-40 w-full resize-none rounded-lg border border-slate-600 bg-[#101f30] px-3.5 py-3 text-[13px] leading-5 text-slate-100 placeholder:text-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
            placeholder="For example: a booking system with customers, rooms, reservations and payments..."
            maxLength={1200}
          />
          <span className="absolute bottom-2.5 right-3 text-[10px] tabular-nums text-slate-500">
            {characterCount}/1200
          </span>
        </div>

        <div className="mt-5 space-y-3">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Database engine</label>
            <div className="mt-1.5 flex h-10 items-center gap-2 rounded-md border border-slate-700 bg-[#101f30] px-3 text-sm text-slate-200">
              <Database className="h-4 w-4 text-cyan-400" />
              PostgreSQL
            </div>
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Naming style</label>
            <div className="mt-1.5 flex h-10 items-center rounded-md border border-slate-700 bg-[#101f30] px-3 font-mono text-xs text-slate-300">
              snake_case
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-300">
            <input
              type="checkbox"
              checked={includeAuditColumns}
              onChange={(event) => setIncludeAuditColumns(event.target.checked)}
              className="h-4 w-4 border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
            />
            Include created_at and updated_at
          </label>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || characterCount < 20}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-500 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
        >
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
          {isGenerating ? 'Building schema...' : 'Create schema'}
        </button>

        <p className="mt-2 text-center text-[10px] leading-4 text-slate-500">
          Runs locally. Nothing is uploaded and no API key is required.
        </p>

        {error && (
          <div role="alert" className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs leading-5 text-amber-200">
            {error}
          </div>
        )}

        {generated && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t border-slate-700/70 pt-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200">Generated plan</h3>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                <Check className="h-3.5 w-3.5" /> Ready to edit
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-50">{generated.summary}</p>
            <div className="mt-3 space-y-1.5">
              {generated.tables.map((table) => (
                <div key={table.id} className="flex items-center justify-between border-b border-slate-800 py-1.5 text-xs">
                  <span className="font-mono text-slate-300">{table.name}</span>
                  <span className="text-slate-600">{table.columns.length} columns</span>
                </div>
              ))}
            </div>
            <h4 className="mt-4 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Design assumptions</h4>
            <ul className="mt-2 space-y-2 text-[11px] leading-4 text-slate-400">
              {generated.assumptions.map((assumption) => (
                <li key={assumption} className="flex gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
                  {assumption}
                </li>
              ))}
            </ul>
          </motion.section>
        )}
      </div>
    </motion.aside>
  );
}
