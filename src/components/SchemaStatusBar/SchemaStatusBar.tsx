import { AlertTriangle, CheckCircle2, Database } from 'lucide-react';
import { calculateSchemaScore } from '../../lib/schemaScore';
import { useSchemaStore } from '../../store/schemaStore';

export function SchemaStatusBar() {
  const { tables, relations, warnings } = useSchemaStore();
  const score = calculateSchemaScore(tables, relations);
  const errors = warnings.filter((warning) => warning.type === 'error').length;
  const warningCount = warnings.filter((warning) => warning.type === 'warning').length;

  return (
    <footer className="flex h-8 shrink-0 items-center justify-between border-t border-slate-700/70 bg-[#091522] px-4 text-[11px] text-slate-500">
      <div className="flex items-center gap-2">
        <Database className="h-3.5 w-3.5 text-cyan-400" />
        <span>PostgreSQL</span>
        <span className="text-slate-700">/</span>
        <span>{tables.length} tables</span>
        <span>{relations.length} relationships</span>
      </div>
      <div className="hidden items-center gap-5 sm:flex">
        <span>
          Schema score: <strong className={score.percentage >= 80 ? 'text-emerald-400' : 'text-amber-400'}>{score.percentage}/100</strong>
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 className={`h-3.5 w-3.5 ${errors === 0 ? 'text-emerald-400' : 'text-red-400'}`} />
          {errors} errors
        </span>
        <span className="flex items-center gap-1.5">
          <AlertTriangle className={`h-3.5 w-3.5 ${warningCount === 0 ? 'text-slate-600' : 'text-amber-400'}`} />
          {warningCount} warnings
        </span>
      </div>
    </footer>
  );
}
