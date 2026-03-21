# Umsetzungsplan: Buy2Sell

## Was wir bauen
Self-hosted Reselling-Tracker: Hauls importieren, Artikel verwalten, Verkäufe tracken, Labels drucken, Profit analysieren. Stack: Next.js 14 + Tailwind, Server Actions + Prisma, PostgreSQL 16, @react-pdf/renderer.

## Getroffene Entscheidungen
| # | Entscheidung | Wahl | Kategorie |
|---|---|---|---|
| 1 | Frontend Framework | Next.js + Tailwind (Fullstack) | Technisch |
| 2 | Backend & API | Server Actions + Prisma | Technisch |
| 3 | Datenbank | PostgreSQL | Technisch |
| 4 | Import-Mechanismus | Smart Paste + Manuelles Ergänzen | Interaktion |
| 5 | Artikel-Detailansicht | Kompakte Card + Slide-Over | Visuell |
| 6 | Dashboard-Layout | KPI-First + Haul-Drilldown | Visuell |
| 7 | Label-PDF-Generation | @react-pdf/renderer (Server-side) | Technisch |

## Umsetzungsschritte

### Sprint 1: Fundament (Prio: Kritisch)
- [ ] **T-001** Next.js Projekt initialisieren (App Router, src/, Tailwind)
- [ ] **T-002** Docker Compose aufsetzen (Postgres 16 + Dev Container)
- [ ] **T-003** Prisma Schema deployen + initiale Migration
- [ ] **T-004** Seed-Datei: Platforms (eBay, Kleinanzeigen, Vinted, Lokal) + Demo-Tags
- [ ] **T-005** Basis-Layout: Sidebar-Navigation + Header

### Sprint 2: Haul-Management (Prio: Hoch)
- [ ] **T-006** Haul erstellen (Name, Source, Datum, Gesamtkosten)
- [ ] **T-007** Haul-Liste mit Übersicht (Anzahl Items, Kosten, Status)
- [ ] **T-008** Haul-Detailseite mit Item-Liste
- [ ] **T-009** Haul bearbeiten + löschen (Cascade)

### Sprint 3: Smart Paste Import (Prio: Hoch)
- [ ] **T-010** Paste-Textarea mit Parser (Tab/Komma/Newline Detection)
- [ ] **T-011** Preview-Tabelle: geparste Zeilen vor Import anzeigen
- [ ] **T-012** Feld-Mapping: Spalten zu Item-Feldern zuordnen
- [ ] **T-013** Bulk-Insert via Server Action
- [ ] **T-014** Manuelles Item-Anlegen (Fallback-Formular)

### Sprint 4: Item-Verwaltung (Prio: Hoch)
- [ ] **T-015** Item-Grid mit kompakten Cards (Bild, Titel, Status, Preis)
- [ ] **T-016** Slide-Over Detail-Panel (alle Felder editierbar)
- [ ] **T-017** Status-Workflow (UNLISTED → LISTED → SOLD etc.)
- [ ] **T-018** Bild-Upload (lokal speichern, Primary setzen, Sortierung)
- [ ] **T-019** Tag-Management (erstellen, zuweisen, filtern)
- [ ] **T-020** Filter & Suche (Status, Kategorie, Tags, Freitext)

### Sprint 5: Verkaufs-Tracking (Prio: Hoch)
- [ ] **T-021** Sale erstellen (Preis, Plattform, Gebühren, Versand)
- [ ] **T-022** Item-Status automatisch auf SOLD setzen bei Sale
- [ ] **T-023** Profit-Berechnung pro Item (VK - EK - Gebühren - Versand)
- [ ] **T-024** Sale-Historie pro Item im Slide-Over

### Sprint 6: Dashboard (Prio: Mittel)
- [ ] **T-025** KPI-Cards: Gesamtprofit, ROI, Items verkauft, Avg. Marge
- [ ] **T-026** Haul-Drilldown: Profit pro Haul, Items sold vs. unsold
- [ ] **T-027** Plattform-Breakdown: Umsatz + Gebühren pro Kanal
- [ ] **T-028** Zeitraum-Filter (Woche, Monat, Quartal, Custom)

### Sprint 7: Labels (Prio: Mittel)
- [ ] **T-029** Label-Layout: QR-Code + Item-ID + Kurzname (4x8 Grid)
- [ ] **T-030** PDF-Generation via @react-pdf/renderer (Server Action)
- [ ] **T-031** Label-Auswahl: alle Items eines Hauls oder manuell selektieren
- [ ] **T-032** "Gedruckt"-Flag pro Item setzen

### Sprint 8: Polish & Extras (Prio: Niedrig)
- [ ] **T-033** Responsive Design (Mobile-tauglich)
- [ ] **T-034** Dark Mode (Tailwind dark:)
- [ ] **T-035** Bulk-Aktionen (Status ändern, Tags setzen, löschen)
- [ ] **T-036** Export: Verkaufsdaten als CSV
- [ ] **T-037** Einstellungen-Seite (Standard-Plattform, Währung)
