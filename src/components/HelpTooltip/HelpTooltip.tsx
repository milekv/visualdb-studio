import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface HelpContent {
  title: string;
  description: string;
  example?: string;
  tips?: string[];
}
const helpContent: Record<string, HelpContent> = {
  primaryKey: {
    title: 'Klucz główny (PK)',
    description: 'Unikalny identyfikator każdego wiersza w tabeli. Każda tabela powinna mieć dokładnie jeden klucz główny.',
    example: 'id SERIAL PRIMARY KEY',
    tips: [
      'Najczęściej używa się typu SERIAL lub UUID',
      'Automatycznie tworzy indeks',
      'Nie może mieć wartości NULL'
    ],
  },
  foreignKey: {
    title: 'Klucz obcy (FK)',
    description: 'Kolumna odnosząca się do klucza głównego innej tabeli. Tworzy relację między tabelami.',
    example: 'user_id INTEGER REFERENCES users(id)',
    tips: [
      'Używaj ON DELETE CASCADE dla zależnych danych',
      'Warto dodać INDEX dla wydajności JOIN',
      'Zapewnia integralność referencyjną'
    ],
  },
  unique: {
    title: 'UNIQUE',
    description: 'Ograniczenie zapewniające, że wszystkie wartości w kolumnie są unikalne.',
    example: 'email VARCHAR(255) UNIQUE',
    tips: [
      'Automatycznie tworzy indeks',
      'Używaj dla email, username, slug',
      'Pozwala na wartości NULL (tylko jeden)'
    ],
  },
  index: {
    title: 'INDEX',
    description: 'Struktura przyspieszająca wyszukiwanie danych. Użyteczne dla często filtrowanych kolumn.',
    example: 'CREATE INDEX idx_user_id ON orders(user_id)',
    tips: [
      'Dodaj dla kluczy obcych',
      'Przyspiesza WHERE i JOIN',
      'Spowalnia INSERT i UPDATE'
    ],
  },
  notNull: {
    title: 'NOT NULL',
    description: 'Ograniczenie wymagające, aby kolumna zawsze miała wartość.',
    example: 'name VARCHAR(255) NOT NULL',
    tips: [
      'Używaj dla wymaganych pól',
      'Rozważ wartość domyślną zamiast NULL'
    ],
  },
  dataType: {
    title: 'Typ danych',
    description: 'Określa jaki rodzaj danych może być przechowywany w kolumnie.',
    tips: [
      'SERIAL - auto-inkrementowany ID',
      'VARCHAR(n) - tekst o zmiennej długości',
      'NUMERIC(10,2) - dla cen i kwot',
      'TIMESTAMP - data i czas',
      'BOOLEAN - true/false',
      'JSONB - struktury JSON'
    ],
  },
  onDelete: {
    title: 'ON DELETE',
    description: 'Akcja wykonywana po usunięciu powiązanego rekordu.',
    tips: [
      'CASCADE - usuń powiązane rekordy',
      'SET NULL - ustaw NULL w kluczu obcym',
      'RESTRICT - zablokuj usunięcie',
      'NO ACTION - domyślna akcja'
    ],
  },
  timestamp: {
    title: 'Znaczniki czasu',
    description: 'Kolumny created_at i updated_at do śledzenia czasu utworzenia i modyfikacji.',
    example: 'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    tips: [
      'Pozwala śledzić historię zmian',
      'Użyteczne dla audytu',
      'Można automatycznie aktualizować updated_at'
    ],
  },
};

interface HelpTooltipProps {
  topic: keyof typeof helpContent;
  className?: string;
}

export function HelpTooltip({ topic, className = '' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = helpContent[topic];

  if (!content) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
      >
        <HelpCircle className="w-3 h-3 text-slate-400" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden left-0 top-full mt-2"
          >
            <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-blue-900/30 to-violet-900/30">
              <h4 className="font-semibold text-white text-sm">{content.title}</h4>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">{content.description}</p>

              {content.example && (
                <div className="p-2 rounded bg-slate-900/50 border border-slate-700/50">
                  <code className="text-xs text-blue-300 font-mono">{content.example}</code>
                </div>
              )}

              {content.tips && content.tips.length > 0 && (
                <div className="space-y-1">
                  {content.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
