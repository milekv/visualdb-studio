# VisualDB Studio

**VisualDB Studio** to nowoczesny, wizualny kreator schematów baz danych PostgreSQL.
Aplikacja pozwala projektować bazę danych za pomocą intuicyjnego canvasu, tabel w formie pudełek, relacji między kolumnami oraz automatycznego generatora SQL.

Projekt powstał jako portfolio project pokazujący umiejętności z zakresu baz danych, projektowania schematów, SQL, Reacta oraz tworzenia narzędzi developerskich.

## Live demo

https://dataflow-visual-data-vq81.bolt.host

## Główne funkcje

* wizualny canvas do projektowania schematu bazy danych,
* dodawanie i edycja tabel,
* konfiguracja kolumn przez formularz,
* obsługa typów danych PostgreSQL,
* checkboxy dla `PK`, `FK`, `NOT NULL`, `UNIQUE`, `INDEX`,
* inteligentne generowanie struktury tabeli na podstawie jej nazwy,
* automatyczne wykrywanie relacji typu `user_id → users.id`,
* szybkie tworzenie powiązanych tabel,
* generowanie kodu SQL `CREATE TABLE`,
* generowanie indeksów dla wybranych kolumn,
* walidacja schematu bazy danych,
* panel sugestii ulepszeń,
* opis bazy danych w języku naturalnym,
* gotowe szablony baz danych,
* import i eksport projektu do JSON,
* automatyczny zapis projektu w localStorage,
* ciemny, nowoczesny interfejs.

## Technologie

Projekt został zbudowany z użyciem:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Flow
* Zustand
* Framer Motion
* Lucide React

## Dla kogo jest ten projekt?

VisualDB Studio może być użyteczne dla:

* osób uczących się projektowania baz danych,
* początkujących programistów,
* studentów,
* osób tworzących szybkie prototypy aplikacji,
* developerów chcących wygenerować początkowy schemat SQL,
* osób przygotowujących diagram ERD w prosty, wizualny sposób.

## Jak działa aplikacja?

1. Użytkownik dodaje nową tabelę.
2. W formularzu wpisuje nazwę tabeli i kolumny.
3. Aplikacja może automatycznie zaproponować typowe kolumny.
4. Użytkownik ustawia klucze główne, obce, indeksy i ograniczenia.
5. Tabele pojawiają się na canvasie jako wizualne pudełka.
6. Relacje pokazują połączenia między konkretnymi kolumnami.
7. Aplikacja generuje gotowy SQL PostgreSQL.

## Przykład wygenerowanego SQL

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_user_id_users_id
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
```

## Inteligentne funkcje

Aplikacja posiada prostą warstwę smart logic, która pomaga szybciej projektować schemat.

Przykłady:

* tabela `users` może automatycznie dostać kolumny `id`, `name`, `email`, `created_at`,
* kolumna `email` automatycznie sugeruje `VARCHAR(255)` i `UNIQUE`,
* kolumna `user_id` może zostać wykryta jako klucz obcy do `users.id`,
* dla kolumn FK aplikacja sugeruje dodanie indeksu,
* panel sugestii pokazuje problemy i możliwe ulepszenia schematu.

## Opis bazy danych

VisualDB Studio potrafi wygenerować opis zaprojektowanej bazy danych w języku naturalnym.
Opis zawiera informacje o tabelach, relacjach, kluczach oraz ogólnym przeznaczeniu schematu.

## Szablony

Aplikacja zawiera gotowe szablony baz danych, między innymi:

* sklep internetowy,
* blog,
* CRM,
* system rezerwacji,
* aplikacja SaaS,
* magazyn.

## Instalacja lokalna

Sklonuj repozytorium:

```bash
git clone https://github.com/milekv/visualdb-studio.git
```

Przejdź do folderu projektu:

```bash
cd visualdb-studio
```

Zainstaluj zależności:

```bash
npm install
```

Uruchom projekt lokalnie:

```bash
npm run dev
```

Zbuduj wersję produkcyjną:

```bash
npm run build
```

## Struktura projektu

```txt
src/
├── components/
│   ├── Canvas/
│   ├── TableNode/
│   ├── TableModal/
│   ├── PropertiesPanel/
│   ├── SqlPreview/
│   ├── ValidationPanel/
│   ├── SmartSuggestionsPanel/
│   ├── QuickRelationModal/
│   ├── RelatedTableMenu/
│   └── DatabaseDescriptionPanel/
├── lib/
│   ├── sqlGenerator.ts
│   ├── schemaValidator.ts
│   ├── tablePresets.ts
│   ├── relationDetector.ts
│   ├── smartSuggestions.ts
│   └── descriptionParser.ts
├── store/
│   └── schemaStore.ts
├── types/
│   └── schema.ts
└── App.tsx
```

## Co pokazuje ten projekt?

Ten projekt pokazuje umiejętności z kilku obszarów:

* projektowanie relacyjnych baz danych,
* generowanie SQL,
* modelowanie schematów,
* obsługa relacji `PK/FK`,
* praca z TypeScript,
* budowa aplikacji React,
* zarządzanie stanem aplikacji,
* projektowanie intuicyjnego UI,
* tworzenie narzędzi developerskich.

## Status projektu

Projekt jest rozwijany jako aplikacja portfolio.
Planowane dalsze funkcje:

* eksport do MySQL i SQLite,
* bardziej zaawansowany parser opisu bazy,
* import istniejącego SQL i generowanie diagramu,
* dokładniejsza analiza jakości schematu,
* zapisywanie projektów w chmurze,
* udostępnianie projektu linkiem.

## Autor

Miłosz Kordziński
GitHub: [@milekv](https://github.com/milekv)
