---
status: in-development
progress: 40
version: "0.1.0"
tags: [nextjs, prisma, flohmarkt, reselling]
scope: "Buy2Sell verwaltet Flohmarkt-Hauls, Artikel und Verkaufspreise inklusive Etikettendruck und PDF-Export"
last_updated: "2026-08-13"
next_steps:
  - Datenbank migrieren und mit Seed-Daten befüllen (prisma migrate dev + db:seed)
  - App per Docker-Compose starten und Kernflows (Haul anlegen, Artikel erfassen, Status ändern) durchtesten
  - Import-Mechanismus (Quellen wie 1688/Kleinanzeigen) mit echten Daten validieren
  - Etiketten-PDF und QR-Code-Ausdruck end-to-end prüfen
  - Verkaufs-/Profit-Übersicht im Dashboard vervollständigen
---

# Aktueller Stand
- Next.js 14 App mit Prisma-Schema (Haul, Item, Sale, Plattformen, Tags) und Postgres in Docker (Ports 2003/2004)
- Seiten für Dashboard, Hauls, Artikel, Import, Labels und Settings vorhanden, Glassmorphism-Dark-Mode-UI umgesetzt
- Server Actions für Artikel, Hauls, Verkäufe, Import und Bilder angelegt, Export-Route für PDF/CSV vorhanden
- Ein einziger Initial-Commit, kein README, keine Tests/Lint-Setup bisher
- Datenbank noch nicht migriert/geseedet, End-to-End-Flows ungetestet
