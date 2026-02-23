import { Socket, Server } from "socket.io";
import { setGamePhase,  updateLiveGame,  getLiveGameById } from "../lib/game-manager.js";
import { PersonState, Person } from "../services/db-actions.js";

async function rollNextPersonAndUpdateDB(game_id: string) {
  try {
    // 1. HOL DEN AKTUELLEN STAND IMMER FRISCH AUS DER DATENBANK
    const currentGame = await getLiveGameById(game_id);
    if (!currentGame || !currentGame.persons) {
      console.error(`rollNextPerson: Spiel mit ID ${game_id} nicht in DB gefunden.`);
      return null;
    }

    const persons = currentGame.persons; // Das ist der einzig wahre Zustand

    // 2. Finde alle noch nicht gerollten Personen
    const unrolled = persons.filter((p: Person) => p.state === "unrolled");
    if (unrolled.length === 0) {
      return { allRolled: true }; // Spezieller Rückgabewert, wenn alle gerollt wurden
    }

    // 3. Wähle einen zufälligen Gewinner aus
    const randomInt = Math.floor(Math.random() * unrolled.length);
    const nextRolled = unrolled[randomInt];

    // 4. Erstelle die NEUE, aktualisierte Gesamtliste, indem der Status des Gewinners geändert wird
    const updatedPersonsList = persons.map((p: Person) =>
      p.id === nextRolled.id ? { ...p, state: "rolled" as PersonState } : p
    );

    // 5. SCHREIBE DEN NEUEN ZUSTAND ZURÜCK IN DIE DATENBANK
    const updateSuccessful = await updateLiveGame(game_id, updatedPersonsList);
    if (!updateSuccessful) {
      console.error(`rollNextPerson: DB-Update für Spiel ${game_id} ist fehlgeschlagen!`);
      return null; // Abbruch bei Fehler
    }

    // 6. Bereite die Daten für den Client vor
    const remainingUnrolled = updatedPersonsList.filter((p: Person) => p.state === "unrolled");

    console.log("Next rolled:", nextRolled.name, "| Remaining:", remainingUnrolled.length);

    return {
      allRolled: false,
      nextRolled: nextRolled,
      unrolledPersons: remainingUnrolled, // Die neue, kürzere Liste für die Anzeige
      isLast: remainingUnrolled.length === 0
    };

  } catch (err) {
    console.error("Schwerer Fehler in rollNextPersonAndUpdateDB:", err);
    return null;
  }
}


export const registerGameHandlers = (io: Server, socket: Socket) => {

  // Einzige "globale" Variable pro Verbindung ist die gameId für den Disconnect-Fall.
  let currentGameId: string | null = null;

  function getCurrentClients() {
    if (!currentGameId) return [];
    const room = io.sockets.adapter.rooms.get(currentGameId);
    return room ? Array.from(room).map(id => ({ socket_id: id })) : [];
  }

  socket.on('getGameState', async (game_id) => {
    // Dieser Handler ist gut. Er holt die Daten immer frisch.
    const currentGame = await getLiveGameById(game_id);
    if (currentGame) {
      socket.emit('gameStateUpdate', {
        phase: currentGame.phase,
        persons: currentGame.persons // `persons` ist hier der JSON-String aus der DB
      });
    }
  });

  socket.on("joinGame", (data) => {
    const { game_id, socket_id } = data;
    currentGameId = game_id;
    socket.join(game_id);
    io.to(game_id).emit("playerJoined", { socket_id, current_clients: getCurrentClients() });
  });

  socket.on("disconnect", () => {
    if (!currentGameId) return;
    console.log("User disconnected fully from GameID:", currentGameId);
    io.to(currentGameId).emit("playerDisconnected", { socket_id: socket.id, current_clients: getCurrentClients() });
  });

  socket.on("startGame", async (data) => {
    const { game_id } = data;
    // Host-Validierung sollte hier noch stattfinden.
    const changedGamePhase = await setGamePhase("in-progress", game_id);
    if (changedGamePhase) {
      // Wir müssen hier keinen State mehr speichern. Nur die Clients informieren.
      io.to(game_id).emit("gameStarted");
    } else {
      io.to(game_id).emit("gameStartError", { message: "Could not set game phase." });
    }
  });

  socket.on("stopGame", (data) => {
    const { game_id } = data;
    io.to(game_id).emit("gameEnded");
  });


  socket.on("rollNext", async (data) => {
    const { game_id } = data;

    console.log(`"rollNext" für Spiel ${game_id} empfangen.`);
    const result = await rollNextPersonAndUpdateDB(game_id);

    if (!result) {
      // Informiert den Client, dass etwas schiefgelaufen ist.
      return socket.emit("rollError", { message: "An internal error occurred while rolling." });
    }

    if (result.allRolled) {
      return io.to(game_id).emit("allPersonsRolled", { message: "All persons have been rolled." });
    }

    // Sende das erfolgreiche Ergebnis an alle im Raum.
    io.to(game_id).emit("nextRolled", {
      unrolledPersons: result.unrolledPersons,
      nextRolled: result.nextRolled
    });

    // Prüfe, ob das der letzte Wurf WAR.
    if (result.isLast) {
      console.log("Last person has been rolled.");
      io.to(game_id).emit("allPersonsRolled", { message: "All persons have been rolled.", lastPerson: result.nextRolled });
    }
  });
};
