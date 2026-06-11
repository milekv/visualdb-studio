<p align="center">
  <img src="public/logo.png" width="700" alt="VisualDB Studio Logo" />
</p>

<h1 align="center">VisualDB Studio</h1>

<p align="center">
  Inteligentny wizualny kreator schematów baz danych dla PostgreSQL.
</p>

<p align="center">
  Projektuj bazy danych • Twórz relacje • Generuj SQL • Rozbudowuj schemat jednym kliknięciem
</p>

<p align="center">
  <a href="https://milekv.github.io/visualdb-studio/">
    <img src="https://img.shields.io/badge/🌐_Otwórz_aplikację-VisualDB_Studio-7c3aed?style=for-the-badge">
  </a>
</p>

<p align="center">

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square\&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square\&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=flat-square\&logo=vite)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-4169E1?style=flat-square\&logo=postgresql)

</p>

---

## 🚀 Czym jest VisualDB Studio?

VisualDB Studio to nowoczesna aplikacja webowa umożliwiająca projektowanie relacyjnych baz danych w sposób wizualny.

Zamiast ręcznie pisać dziesiątki instrukcji SQL, użytkownik tworzy tabele, relacje i zależności na interaktywnym diagramie. Aplikacja automatycznie generuje gotowy kod PostgreSQL oraz pomaga projektować poprawne i skalowalne schematy.

Projekt został stworzony jako połączenie:

* narzędzia do modelowania baz danych,
* generatora SQL,
* systemu inteligentnych sugestii,
* edukacyjnego kreatora dla początkujących.

---

## ✨ Najważniejsze możliwości

### 🎨 Wizualne projektowanie bazy

* tworzenie tabel na interaktywnym canvasie,
* przeciąganie i rozmieszczanie elementów,
* definiowanie kolumn i typów danych,
* obsługa PK, FK, UNIQUE, INDEX oraz NOT NULL,
* automatyczne wykrywanie relacji.

### 🔗 Budowanie relacji

* relacje między tabelami,
* wizualne połączenia kolumna → kolumna,
* szybkie tworzenie tabel powiązanych,
* automatyczne tworzenie kluczy obcych.

### 🧠 Inteligentne wspomaganie

* generator schematu z opisu tekstowego,
* automatyczne sugestie rozbudowy bazy,
* wykrywanie potencjalnych problemów,
* rekomendacje indeksów,
* analiza jakości projektu.

### ⚡ Generowanie SQL

VisualDB Studio automatycznie generuje:

* CREATE TABLE,
* PRIMARY KEY,
* FOREIGN KEY,
* UNIQUE,
* NOT NULL,
* DEFAULT,
* CREATE INDEX.

---

## 📸 Zrzuty ekranu

### Projektowanie schematu

![Projektowanie schematu](assets/screenshots/01-builder.png)

### Generator SQL

![Generator SQL](assets/screenshots/02-sql-generator.png)

### Rozbudowa schematu

![Rozbudowa schematu](assets/screenshots/03-smart-expand.png)

### Ocena jakości projektu

![Schema Score](assets/screenshots/04-schema-score.png)

---

## 🛠️ Technologie

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

### Zarządzanie stanem

* Zustand

### Diagramy i Canvas

* React Flow

### Animacje

* Framer Motion

### Ikony

* Lucide React

---

## 🚀 Uruchomienie lokalne

Sklonuj repozytorium:

```bash
git clone https://github.com/milekv/visualdb-studio.git
```

Przejdź do katalogu projektu:

```bash
cd visualdb-studio
```

Zainstaluj zależności:

```bash
npm install
```

Uruchom aplikację:

```bash
npm run dev
```

Budowa wersji produkcyjnej:

```bash
npm run build
```

---

## 📂 Struktura projektu

```text
src
├── components
├── lib
├── store
├── types
└── App.tsx
```

Najważniejsze moduły:

* sqlGenerator.ts
* schemaValidator.ts
* relationDetector.ts
* smartSuggestions.ts
* descriptionParser.ts
* schemaScore.ts

---

## 👨‍💻 Autor

**Miłosz Kordziński**

GitHub: https://github.com/milekv
