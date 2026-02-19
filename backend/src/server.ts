import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { registerGameHandlers } from "./sockets/gameHandler"
import apiRouter from "./routes/api.routes";

const PORT = process.env.PORT || 4000
const app = express();
const httpServer = createServer(app)

const allowedOrigins = [
  process.env.CORS_ORIGIN,
].filter((origin): origin is string => typeof origin === "string" && origin.length > 0)

const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    }
})


app.use(cors({
  origin: allowedOrigins, 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json())

app.get("/", (_req, res) => {
  return res.send("Backend läuft 🚀")
})
app.use("/api", apiRouter)

httpServer.listen({port: PORT, host: "0.0.0.0"}, () => {
  console.log("Backend listening on http://localhost:4000")
})



io.on("connection", (socket) => {
  registerGameHandlers(io, socket)
})













// .env => BACKEND
//FRONTEND_URL=http://localhost:3000
//JWT_SECRET=c426a049b495b92e2fa250961d99ef62b36f8c97fd99d742e105c2141e08388bb81f8dd4a5a4ecd0864dd05760dff2944cb1e71e9802b013f958ea62b8f651a5

//.env.local => FRONTEND
//NEXT_PUBLIC_API_URL=http://localhost:4000

// BACKEND => Render.com FRONTEND => Vercel.com


// Absolut. Das ist eine hervorragende Entscheidung, die dein Projekt auf ein professionelles Level hebt. Die Umstellung auf Prisma und PostgreSQL ist ein sehr strukturierter Prozess. Ich werde dich durch **jeden einzelnen Schritt** führen, von der Installation bis zum Umschreiben deiner Funktionen.

// Folge dieser Anleitung genau, und du wirst am Ende eine saubere, robuste und produktionsreife Backend-Architektur haben.

// ---

// ### Phase 0: Vorbereitung

// #### Schritt 1: Erstelle deine PostgreSQL-Datenbank

// Bevor wir Code schreiben, brauchen wir eine Datenbank. Wir nutzen **Supabase**, weil es dir eine kostenlose PostgreSQL-Datenbank mit einer einfach zu kopierenden Verbindungs-URL gibt.

// 1.  **Account erstellen**: Gehe zu [Supabase.com](https://supabase.com) und erstelle einen kostenlosen Account (am besten mit deinem GitHub-Konto).
// 2.  **Neues Projekt erstellen**:
//     *   Erstelle eine neue "Organization".
//     *   Klicke auf "New Project" und gib ihm einen Namen (z.B. `mein-spiel-backend`).
//     *   Generiere ein sicheres Passwort und **speichere es gut ab**.
//     *   Wähle eine Region in deiner Nähe (z.B. "Frankfurt").
//     *   Warte ein paar Minuten, bis das Projekt bereit ist.
// 3.  **Verbindungs-URL kopieren**:
//     *   Gehe in deinem Projekt zu "Settings" (das Zahnrad-Symbol).
//     *   Klicke auf "Database".
//     *   Scrolle runter zum Abschnitt "Connection string".
//     *   Kopiere die **URI**. Sie sieht so aus: `postgresql://postgres:[DEIN-PASSWORT]@db.xyz.supabase.co:5432/postgres`.

// #### Schritt 2: Konfiguriere deine `.env`-Datei

// In deinem **Backend-Projekt**, öffne die `.env`-Datei und füge die Verbindungs-URL hinzu. **Ersetze `[DEIN-PASSWORT]` durch das Passwort, das du in Supabase gespeichert hast.**

// ```env
// # .env im Backend

// # Alte Variablen
// FRONTEND_URL_LOCAL=http://localhost:3000
// FRONTEND_URL_NETWORK=...
// JWT_SECRET=...

// # +++ NEUE VARIABLE +++
// # Ersetze die URL mit deiner von Supabase
// DATABASE_URL="postgresql://postgres:[DEIN-PASSWORT]@db.xyz.supabase.co:5432/postgres"
// ```
// **WICHTIG:** Stelle sicher, dass deine `.gitignore`-Datei den Eintrag `.env` enthält, damit du deine Geheimnisse nicht versehentlich auf GitHub hochlädst!

// ---

// ### Phase 1: Prisma in dein Projekt integrieren

// #### Schritt 3: Installiere die Prisma-Bibliotheken

// Öffne ein Terminal in deinem Backend-Projektverzeichnis und führe diese Befehle aus:

// ```bash
// # Prisma CLI als Entwicklungswerkzeug installieren
// npm install prisma --save-dev

// # Prisma Client als normalen Abhängigkeit installieren
// npm install @prisma/client
// ```

// #### Schritt 4: Initialisiere Prisma

// Dieser Befehl erstellt die grundlegende Prisma-Konfiguration für dich:

// ```bash
// npx prisma init
// ```

// Das macht zwei Dinge:
// 1.  Es erstellt einen neuen Ordner `prisma` mit einer Datei namens `schema.prisma`.
// 2.  Es fügt die `DATABASE_URL` zu deiner `.env`-Datei hinzu (was du schon manuell gemacht hast).

// ---

// ### Phase 2: Dein Datenmodell definieren

// #### Schritt 5: Bearbeite die `schema.prisma`-Datei

// Das ist der wichtigste Schritt. Hier beschreibst du, wie deine Datenbanktabellen aussehen sollen. Öffne `prisma/schema.prisma` und ersetze den Inhalt mit dem folgenden Modell. Ich habe die Struktur aus deinem Code abgeleitet.

// ```prisma
// // prisma/schema.prisma

// // Definiert den Datenbank-Provider (PostgreSQL)
// datasource db {
//   provider = "postgresql"
//   url      = env("DATABASE_URL") // Holt die URL aus deiner .env Datei
// }

// // Definiert, dass der Prisma Client generiert werden soll
// generator client {
//   provider = "prisma-client-js"
// }

// // +++ DEIN DATENMODELL +++

// // Modell für ein laufendes Spiel
// model Game {
//   id        String     @id @default(cuid()) // Eindeutige ID für jedes Spiel
//   phase     String     // z.B. "waiting-lobby", "in-progress"
//   template  Template   @relation(fields: [templateId], references: [id])
//   templateId Int
//   createdAt DateTime   @default(now())
// }

// // Modell für ein Spiel-Template
// model Template {
//   id      Int      @id @default(autoincrement()) // Einfache, hochzählende ID
//   name    String
//   persons Person[] // Ein Template hat VIELE Personen
//   games   Game[]   // Ein Template kann für VIELE Spiele verwendet werden
// }

// // Modell für eine Person innerhalb eines Templates
// model Person {
//   id         String   @id @default(cuid()) // Eindeutige ID für jede Person
//   name       String
//   template   Template @relation(fields: [templateId], references: [id])
//   templateId Int
// }
// ```

// #### Schritt 6: "Migriere" deine Datenbank

// Jetzt sagst du Prisma, es soll dieses Modell nehmen und die entsprechenden Tabellen (`Game`, `Template`, `Person`) in deiner Supabase-Datenbank erstellen.

// Führe diesen Befehl im Terminal aus:
// ```bash
// npx prisma migrate dev --name init
// ```
// *   Prisma vergleicht dein Schema mit der leeren Datenbank.
// *   Es erstellt eine SQL-Datei für die "Migration" (die Änderungen).
// *   Es führt diese SQL-Datei auf deiner Supabase-Datenbank aus.
// *   Es generiert den TypeScript-sicheren Prisma Client für dich.

// Wenn das erfolgreich war, hast du jetzt die richtigen Tabellen in der Cloud!

// ---

// ### Phase 3: Den Prisma-Client verwenden

// #### Schritt 7: Erstelle eine zentrale Prisma-Client-Instanz

// Das ist eine Best Practice, um zu vermeiden, dass zu viele Datenbankverbindungen geöffnet werden. Erstelle eine neue Datei, z.B. `lib/prisma.ts`.

// ```typescript
// // lib/prisma.ts

// import { PrismaClient } from '@prisma/client'

// // Erstelle eine globale Variable, um den Client zu halten
// const globalForPrisma = global as unknown as { prisma: PrismaClient }

// // Prüfe, ob der Client schon existiert, ansonsten erstelle ihn
// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ['query'], // Zeigt jede DB-Abfrage in der Konsole an (super für's Debuggen)
//   })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
// ```

// ---

// ### Phase 4: Deinen Code umschreiben (Refactoring)

// Jetzt ersetzen wir deine alten Datenbankfunktionen durch die neuen, sauberen Prisma-Abfragen.

// #### Schritt 8: Passe deine `game-manager.ts` Datei an

// ```typescript
// // lib/game-manager.ts

// // Importiere den neuen Prisma-Client
// import { prisma } from './prisma';

// // --- NEUE VERSION VON getTemplateFromGameId ---
// export async function getTemplateFromGameId(gameId: string) {
//   try {
//     const game = await prisma.game.findUniqueOrThrow({
//       where: { id: gameId },
//       // "include" ist wie ein JOIN in SQL.
//       // Es holt das verknüpfte Template UND dessen verknüpfte Personen in EINER Abfrage.
//       include: {
//         template: {
//           include: {
//             persons: true,
//           },
//         },
//       },
//     });
//     // Gib das vollständige Template-Objekt zurück
//     return game.template;
//   } catch (error) {
//     console.error(`Template für Spiel ${gameId} konnte nicht gefunden werden:`, error);
//     return null;
//   }
// }

// // --- NEUE VERSION VON setGamePhase ---
// export async function setGamePhase(phase: string, gameId: string) {
//   try {
//     const updatedGame = await prisma.game.update({
//       where: { id: gameId },
//       data: { phase: phase },
//     });
//     return updatedGame;
//   } catch (error) {
//     console.error(`Phase für Spiel ${gameId} konnte nicht auf "${phase}" gesetzt werden:`, error);
//     return null;
//   }
// }
// ```

// #### Schritt 9: Passe deinen `gameHandler.ts` an

// Hier sehen wir jetzt die Vorteile. Der Handler-Code wird viel sauberer.

// ```typescript
// // sockets/gameHandler.ts

// import { Socket, Server } from "socket.io";
// import { getTemplateFromGameId, setGamePhase } from "../lib/game-manager";

// export const registerGameHandlers = (io: Server, socket: Socket) => {
//   let currentGameId: string | null = null;
  
//   // HINWEIS: Dieser In-Memory-Zustand ist immer noch ein Problem für die Produktion.
//   // Der nächste Schritt wäre, auch diesen in die Datenbank oder Redis auszulagern.
//   let unrolledPersons: any[] = [];
//   let rolledPersons: any[] = [];

//   // ... (getCurrentClients, joinGame, disconnect bleiben gleich) ...

//   socket.on("startGame", async (data) => {
//     const { game_id } = data;
//     const changedGamePhase = await setGamePhase("in-progress", game_id);

//     if (changedGamePhase) {
//       // Diese Funktion nutzt jetzt Prisma!
//       const template = await getTemplateFromGameId(game_id);

//       if (!template) {
//         return io.to(game_id).emit("gameStartError", { message: "Template konnte nicht geladen werden." });
//       }

//       // Initialisiere den In-Memory-Zustand aus der Datenbank
//       unrolledPersons = template.persons || [];
//       rolledPersons = [];

//       io.to(game_id).emit("gameStarted", { template });
//     }
//   });

//   // ... (stopGame, rollNext bleiben vorerst gleich, da sie den In-Memory-State nutzen) ...
// };
// ```

// ---

// ### Phase 5: Nächste Schritte

// 1.  **Daten in die Datenbank bekommen (Seeding)**: Deine Datenbank ist jetzt leer. Du kannst ein kleines "Seed"-Skript erstellen, das Prisma nutzt, um deine Templates und Personen in die Datenbank zu laden. [Prisma Seeding Dokumentation](https://www.prisma.io/docs/guides/database/seeding-the-database).

// 2.  **Alle anderen Datenbankfunktionen umschreiben**: Gehe deinen restlichen Code durch und ersetze alle alten Datenbankaufrufe durch Prisma-Abfragen (`prisma.create`, `prisma.findMany` etc.).

// 3.  **Deployment**: Wenn alles lokal funktioniert, kannst du dein Backend (jetzt mit Prisma) auf Render deployen. Du musst nur die `DATABASE_URL` als Environment Variable in Render eintragen.

// Das ist ein großer, aber sehr lohnender Prozess. Nimm dir Zeit für jeden Schritt. Die Prisma-Dokumentation ist exzellent, wenn du bei spezifischen Abfragen nicht weiterkommst. Viel Erfolg