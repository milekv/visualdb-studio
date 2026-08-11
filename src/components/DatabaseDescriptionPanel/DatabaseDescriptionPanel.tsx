import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Table2, Link2, FileText } from 'lucide-react';
import { useSchemaStore } from '../../store/schemaStore';
import type { Table, Relation } from '../../types/schema';

interface DatabaseDescriptionPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DatabaseDescriptionPanel({ isOpen, onClose }: DatabaseDescriptionPanelProps) {
  const { tables, relations } = useSchemaStore();

  // Generate human-readable description
  const description = useMemo(() => {
    if (tables.length === 0) {
      return null;
    }

    const parts: string[] = [];

    // Overview
    parts.push(`Baza danych zawiera ${tables.length} tabel${tables.length === 1 ? 'ę' : tables.length < 5 ? 'e' : 'i'}.`);

    // Describe tables
    for (const table of tables) {
      const pkColumn = table.columns.find(c => c.isPrimaryKey);
      const fkColumns = table.columns.filter(c => c.isForeignKey);

      let tableDesc = `Tabela "${table.name}"`;

      // What it stores
      if (table.name.endsWith('s') || table.name.endsWith('es')) {
        // Plural, likely stores items
        const singularName = table.name.replace(/es$/, '').replace(/s$/, '');
        tableDesc += ` przechowuje ${getPolishPlural(singularName)}`;
      } else {
        tableDesc += ` przechowuje rekordy`;
      }

      // Key columns
      if (pkColumn) {
        tableDesc += ` z kluczem głównym ${pkColumn.name}`;
      }

      // Foreign key relations
      if (fkColumns.length > 0) {
        const fkRefs = fkColumns.map(fk => {
          const refTable = tables.find(t => t.id === fk.foreignKey?.referencedTableId);
          return refTable ? `"${refTable.name}"` : '';
        }).filter(Boolean);

        if (fkRefs.length > 0) {
          tableDesc += ` i powiązana z tabel${fkRefs.length === 1 ? 'ą' : 'ami'} ${fkRefs.join(', ')}`;
        }
      }

      parts.push(tableDesc + '.');
    }

    // Describe relations
    if (relations.length > 0) {
      parts.push(`\nRelacje w bazie:`);

      for (const rel of relations) {
        const sourceTable = tables.find(t => t.id === rel.sourceTableId);
        const targetTable = tables.find(t => t.id === rel.targetTableId);
        const sourceCol = sourceTable?.columns.find(c => c.id === rel.sourceColumnId);
        const targetCol = targetTable?.columns.find(c => c.id === rel.targetColumnId);

        if (sourceTable && targetTable && sourceCol && targetCol) {
          const relationDesc = getRelationDescription(
            sourceTable.name,
            sourceCol.name,
            targetTable.name,
            targetCol.name,
            rel.onDelete
          );
          parts.push(`• ${relationDesc}`);
        }
      }
    }

    // Summary of purpose
    parts.push('\n' + getPurposeSummary(tables, relations));

    return parts.join('\n');
  }, [tables, relations]);

  // Get relation statistics
  const stats = useMemo(() => {
    const pkCount = tables.reduce((sum, t) => sum + t.columns.filter(c => c.isPrimaryKey).length, 0);
    const fkCount = tables.reduce((sum, t) => sum + t.columns.filter(c => c.isForeignKey).length, 0);
    const indexCount = tables.reduce((sum, t) => sum + t.columns.filter(c => c.isIndex).length, 0);
    const uniqueCount = tables.reduce((sum, t) => sum + t.columns.filter(c => c.isUnique).length, 0);
    const totalColumns = tables.reduce((sum, t) => sum + t.columns.length, 0);

    return { pkCount, fkCount, indexCount, uniqueCount, totalColumns };
  }, [tables]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="w-96 bg-slate-900/95 border-l border-slate-700/50 flex flex-col backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Opis bazy danych</h3>
          </div>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-2xl font-bold text-blue-400">{tables.length}</div>
              <div className="text-xs text-slate-400">Tabel</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-2xl font-bold text-amber-400">{relations.length}</div>
              <div className="text-xs text-slate-400">Relacji</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
              <div className="text-2xl font-bold text-green-400">{stats.totalColumns}</div>
              <div className="text-xs text-slate-400">Kolumn</div>
            </div>
          </div>

          {/* Description */}
          {description && (
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/30">
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          )}

          {/* Tables detail */}
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Szczegóły tabel</p>
            {tables.map(table => {
              const fkCols = table.columns.filter(c => c.isForeignKey);

              return (
                <div
                  key={table.id}
                  className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Table2 className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">{table.name}</span>
                    <span className="text-xs text-slate-500 ml-auto">
                      {table.columns.length} kolumn
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {getTablePurpose(table)}
                  </p>
                  {fkCols.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {fkCols.map(fk => {
                        const refTable = tables.find(t => t.id === fk.foreignKey?.referencedTableId);
                        return (
                          <span
                            key={fk.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] rounded bg-blue-500/20 text-blue-300"
                          >
                            <Link2 className="w-2.5 h-2.5" />
                            {fk.name} → {refTable?.name || '?'}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quick stats */}
          <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Klucze główne:</span>
                <span className="text-amber-400">{stats.pkCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Klucze obce:</span>
                <span className="text-blue-400">{stats.fkCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Indeksy:</span>
                <span className="text-green-400">{stats.indexCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unique:</span>
                <span className="text-violet-400">{stats.uniqueCount}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper functions
function getPolishPlural(name: string): string {
  const mappings: Record<string, string> = {
    user: 'użytkowników',
    users: 'użytkowników',
    product: 'produkty',
    products: 'produkty',
    order: 'zamówienia',
    orders: 'zamówienia',
    customer: 'klientów',
    customers: 'klientów',
    category: 'kategorie',
    categories: 'kategorie',
    post: 'posty/artykuły',
    posts: 'posty/artykuły',
    comment: 'komentarze',
    comments: 'komentarze',
    payment: 'płatności',
    payments: 'płatności',
    booking: 'rezerwacje',
    bookings: 'rezerwacje',
    room: 'pokoje',
    rooms: 'pokoje',
    trainer: 'trenerów',
    trainers: 'trenerów',
    exercise: 'ćwiczenia',
    exercises: 'ćwiczenia',
    student: 'studentów',
    students: 'studentów',
    course: 'kursy',
    courses: 'kursy',
    teacher: 'nauczycieli',
    teachers: 'nauczycieli',
    book: 'książki',
    books: 'książki',
    author: 'autorów',
    authors: 'autorów',
    reader: 'czytelników',
    readers: 'czytelników',
    item: 'elementy',
    items: 'elementy',
  };
  return mappings[name.toLowerCase()] || `rekordy typu "${name}"`;
}

function getRelationDescription(
  sourceTable: string,
  sourceCol: string,
  targetTable: string,
  targetCol: string,
  onDelete: string
): string {
  const onDeletePolish = {
    'CASCADE': 'przy usunięciu nadrzędnego usuwane są podrzędne',
    'SET NULL': 'przy usunięciu nadrzędnego wartość staje się NULL',
    'RESTRICT': 'nie można usunąć nadrzędnego jeśli istnieją podrzędne',
    'NO ACTION': 'brak automatycznej akcji przy usunięciu',
  };

  return `"${sourceTable}.${sourceCol}" odwołuje się do "${targetTable}.${targetCol}" (${onDeletePolish[onDelete as keyof typeof onDeletePolish] || onDelete})`;
}

function getTablePurpose(table: Table): string {
  const name = table.name.toLowerCase();
  const columns = table.columns;

  // Determine purpose based on table name and structure
  if (name.includes('user') || name.includes('customer') || name.includes('klient')) {
    return 'Przechowuje dane użytkowników/klientów systemu.';
  }
  if (name.includes('product') || name.includes('produkt')) {
    return 'Przechowuje katalog produktów z cenami i stanami.';
  }
  if (name.includes('order') || name.includes('zamowien') || name.includes('zamówień')) {
    if (name.includes('item')) {
      return 'Tabela łącząca - powiązanie zamówień z produktami (wiele-do-wielu).';
    }
    return 'Przechowuje zamówienia klientów.';
  }
  if (name.includes('payment') || name.includes('płatnoś')) {
    return 'Przechowuje historię płatności.';
  }
  if (name.includes('categor') || name.includes('kategori')) {
    return 'Przechowuje kategorie dla produktów/postów.';
  }
  if (name.includes('post') || name.includes('artykul') || name.includes('blog')) {
    return 'Przechowuje treści artykułów/postów.';
  }
  if (name.includes('comment') || name.includes('komentarz')) {
    return 'Przechowuje komentarze użytkowników.';
  }
  if (name.includes('booking') || name.includes('rezerwacj')) {
    return 'Przechowuje rezerwacje.';
  }
  if (name.includes('room') || name.includes('pokoj')) {
    return 'Przechowuje dostępne pokoje/usługi.';
  }

  // Check if it's a junction table
  const fkColumns = columns.filter(c => c.isForeignKey);
  if (fkColumns.length >= 2) {
    return 'Tabela łącząca - relacja wiele-do-wielu.';
  }

  return `Przechowuje dane typu "${table.name}".`;
}

function getPurposeSummary(tables: Table[], relations: Relation[]): string {
  if (tables.length === 0) return '';

  // Try to infer the domain from table names
  const names = tables.map(t => t.name.toLowerCase()).join(' ');

  if (names.includes('product') || names.includes('order') || names.includes('ecommerce') || names.includes('sklep')) {
    return '📊 Ten schemat tworzy system e-commerce z obsługą produktów, zamówień i płatności.';
  }
  if (names.includes('post') || names.includes('comment') || names.includes('blog')) {
    return '📝 Ten schemat tworzy system blogowy z artykułami, komentarzami i kategoriami.';
  }
  if (names.includes('customer') || names.includes('deal') || names.includes('crm')) {
    return '💼 Ten schemat tworzy system CRM do zarządzania klientami i sprzedażą.';
  }
  if (names.includes('booking') || names.includes('room') || names.includes('hotel')) {
    return '🏨 Ten schemat tworzy system rezerwacji hotelowych/pokoi.';
  }
  if (names.includes('student') || names.includes('course') || names.includes('teacher')) {
    return '🎓 Ten schemat tworzy system edukacyjny do zarządzania studentami i kursami.';
  }
  if (names.includes('trainer') || names.includes('exercise') || names.includes('workout') || names.includes('fitness')) {
    return '💪 Ten schemat tworzy system zarządzania siłownią/fitness.';
  }
  if (names.includes('book') || names.includes('author') || names.includes('loan')) {
    return '📚 Ten schemat tworzy system biblioteczny.';
  }

  return `📦 Ten schemat definiuje ${tables.length} tabel${tables.length === 1 ? 'ę' : tables.length < 5 ? 'e' : 'i'} z ${relations.length} relacj${relations.length === 1 ? 'ją' : relations.length < 5 ? 'ami' : 'jami'}.`;
}
