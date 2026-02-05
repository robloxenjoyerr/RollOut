import { Socket, Server } from "socket.io"
import { getTemplateFromGameId, setGamePhase } from "../lib/game-manager";



export const registerGameHandlers = (io: Server, socket: Socket) => {
  let currentGameId: string | null = null

  function getCurrentClients() {
    if (!currentGameId) return
    const room = io.sockets.adapter.rooms.get(currentGameId);
    const clientList = room ? Array.from(room).map(id => ({ socket_id: id })) : [];
    return clientList
  }

  socket.on("joinGame", async (data) => {
    const { game_id, socket_id, host } = data;
    currentGameId = game_id
    console.log("Data roomCode: ", game_id)
    socket.join(game_id); // Erstellt/Tritt einem Raum bei


    io.to(game_id).emit("playerJoined", { socket_id, current_clients: getCurrentClients() });




  });

  socket.on("disconnect", (data) => {
    if (!currentGameId) return
    console.log("User disconnected fully from GameID: ", currentGameId)

    io.to(currentGameId).emit("playerDisconnected", { socket_id: socket.id, current_clients: getCurrentClients() })
  });

  socket.on("startGame", async (data) => {
    const { game_id } = data

    // Only Host => need validation
    const changedGamePhase = await setGamePhase("in-progress", game_id)
    if (changedGamePhase) {
      const template = await getTemplateFromGameId(game_id)
      if (!template) return io.to(game_id).emit("gameStartError", { message: "Could not get template from game_id. Undefined" })

      io.to(game_id).emit("gameStarted", { template });
    }
  });

  socket.on("gameStopped", async (data)=> {
    const {game_id} = data

    io.to(game_id).emit("gameStopped")
  })

  socket.on("rollNext", async (data)=> {
    const {game_id, persons} = data
    
    const randomIndex = Math.floor(Math.random() * persons.length);
    const selectedPerson = persons[randomIndex];
    io.to(game_id).emit("nextRolled", {person: selectedPerson})
  })
}