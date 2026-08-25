# VisualDB Studio

Wizualny projektant schematów PostgreSQL działający lokalnie w przeglądarce.

[English version](README.md) | [Uruchom aplikację](https://milekv.github.io/visualdb-studio/)

[![CI](https://github.com/milekv/visualdb-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/milekv/visualdb-studio/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-18-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![License](https://img.shields.io/badge/license-MIT-green)

![VisualDB Studio - konfigurator bazy danych](assets/screenshots/06-guided-setup.png)

VisualDB Studio pozwala tworzyć tabele i relacje na interaktywnym diagramie, sprawdzać jakość projektu i wygenerować gotowy skrypt PostgreSQL. Projekt nie wymaga konta ani backendu. Schemat jest zapisywany w pamięci lokalnej przeglądarki.

## Szybki start

1. Otwórz [demo](https://milekv.github.io/visualdb-studio/).
2. Przejdź przez konfigurator: projekt, zastosowanie, dane, funkcje, reguły i podsumowanie.
3. Sprawdź liczbę tabel i relacji w aktualizowanym planie.
4. Utwórz schemat i dopracuj tabele na diagramie.
5. Uruchom walidację, sprawdź ocenę jakości i pobierz SQL.

## Najważniejsze funkcje

- Interaktywny diagram tabel oparty na React Flow.
- Kolumny PostgreSQL z PK, FK, UNIQUE, INDEX, NOT NULL i DEFAULT.
- Relacje z obsługą `ON DELETE`.
- Deterministyczne sugestie relacji na podstawie nazw kolumn.
- Walidacja brakujących kluczy, duplikatów, typów FK i indeksów.
- Punktacja schematu z konkretnymi zaleceniami.
- Sześciostopniowy konfigurator dla sklepu, serwisu samochodowego, SaaS i rezerwacji.
- Opcjonalne płatności, magazyn, wysyłki, konta, załączniki, powiadomienia, komentarze, lokalizacje, tagi i dziennik zmian.
- Konfigurowalne pola audytowe oraz soft delete.
- Generator `CREATE TABLE`, constraintów i indeksów.
- Eksport SQL i projektu.
- Automatyczny zapis projektu w `localStorage`.

## Screenshoty

| Konfigurator bazy                                            | Diagram schematu                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| ![Konfigurator bazy](assets/screenshots/01-guided-setup.png) | ![Diagram schematu](assets/screenshots/02-schema-canvas.png) |

| Podgląd SQL                                           | Ocena jakości                                             |
| ----------------------------------------------------- | --------------------------------------------------------- |
| ![Podgląd SQL](assets/screenshots/03-sql-preview.png) | ![Ocena schematu](assets/screenshots/04-schema-score.png) |

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
- Konfigurator obejmuje obecnie cztery sprawdzone rodzaje systemów.
- Sugestie są regułowe i nie zastępują przeglądu projektu przez człowieka.
- Projekt nie łączy się bezpośrednio z produkcyjną bazą danych.

## Licencja

MIT. Szczegóły w pliku [LICENSE](LICENSE).
