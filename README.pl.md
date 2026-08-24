# VisualDB Studio

Wizualny projektant schematów PostgreSQL działający lokalnie w przeglądarce.

[English version](README.md) | [Uruchom aplikację](https://milekv.github.io/visualdb-studio/)

[![CI](https://github.com/milekv/visualdb-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/milekv/visualdb-studio/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

![VisualDB Studio - kreator schematu](assets/screenshots/02-schema-builder.png)

VisualDB Studio pozwala tworzyć tabele i relacje na interaktywnym diagramie, sprawdzać jakość projektu i wygenerować gotowy skrypt PostgreSQL. Projekt nie wymaga konta ani backendu. Schemat jest zapisywany w pamięci lokalnej przeglądarki.

## Szybki start

1. Otwórz [demo](https://milekv.github.io/visualdb-studio/).
2. Wybierz szablon lub dodaj pierwszą tabelę ręcznie.
3. Zdefiniuj kolumny, klucz główny i relacje.
4. Uruchom walidację oraz ocenę schematu.
5. Otwórz podgląd SQL i pobierz skrypt.

## Najważniejsze funkcje

- Interaktywny diagram tabel oparty na React Flow.
- Kolumny PostgreSQL z PK, FK, UNIQUE, INDEX, NOT NULL i DEFAULT.
- Relacje z obsługą `ON DELETE`.
- Deterministyczne sugestie relacji na podstawie nazw kolumn.
- Walidacja brakujących kluczy, duplikatów, typów FK i indeksów.
- Punktacja schematu z konkretnymi zaleceniami.
- Szablony oraz lokalny generator schematu z opisu.
- Generator `CREATE TABLE`, constraintów i indeksów.
- Eksport SQL i projektu.
- Automatyczny zapis projektu w `localStorage`.

## Screenshoty

| Start | Rozbudowa schematu |
| --- | --- |
| ![Ekran startowy](assets/screenshots/01-home.png) | ![Rozbudowa schematu](assets/screenshots/03-smart-expand.png) |

| Generator SQL | Ocena jakości |
| --- | --- |
| ![Generator SQL](assets/screenshots/04-sqlgenerator.png) | ![Ocena schematu](assets/screenshots/05-schema-score.png) |

Wszystkie obrazy pochodzą z działającej aplikacji.

## Uruchomienie lokalne

Wymagany jest Node.js 22.

```bash
git clone https://github.com/milekv/visualdb-studio.git
cd visualdb-studio
npm ci
npm run dev
```

Kontrola jakości:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Architektura

```text
src/components   interfejs, canvas, modale i panele
src/lib          generator SQL, walidacja, punktacja i sugestie
src/store        stan projektu i lokalna persystencja Zustand
src/types        model tabel, kolumn i relacji
```

Cała logika projektowa działa po stronie klienta. Aplikacja nie wysyła schematu na serwer.

## Ograniczenia

- Generator SQL jest ukierunkowany na PostgreSQL.
- Sugestie są regułowe i nie zastępują przeglądu projektu przez człowieka.
- Projekt nie łączy się bezpośrednio z produkcyjną bazą danych.

## Licencja

MIT. Szczegóły w pliku [LICENSE](LICENSE).
