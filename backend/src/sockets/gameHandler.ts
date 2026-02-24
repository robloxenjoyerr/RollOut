import { Socket, Server } from "socket.io";
import { PersonState, Person } from "../services/db-actions.js";

async function rollNextPersonAndUpdateDB(game_id: string) {
  try {
    // 1. HOL DEN AKTUELLEN STAND IMMER FRISCH AUS DER DATENBANK
  } catch(err){
    console.log(err)
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
    
  });

  socket.on("stopGame", (data) => {
    const { game_id } = data;
    io.to(game_id).emit("gameEnded");
  });


  socket.on("rollNext", async (data) => {
    const { game_id } = data;

    console.log(`"rollNext" für Spiel ${game_id} empfangen.`);
    const result = await rollNextPersonAndUpdateDB(game_id);

    
  });
};
