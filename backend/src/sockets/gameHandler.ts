import { Socket, Server } from "socket.io";

export const registerGameHandlers = (io: Server, socket: Socket) => {

  // Einzige "globale" Variable pro Verbindung ist die gameId für den Disconnect-Fall.
  let currentGameId: string | null = null;

  function getCurrentClients() {
    if (!currentGameId) return [];
    const room = io.sockets.adapter.rooms.get(currentGameId);
    return room ? Array.from(room).map(id => ({ socket_id: id })) : [];
  }


  socket.on("joinGame", (data) => {
    const { game_id, socket_id, hostId } = data;

    currentGameId = game_id;
    socket.join(game_id);
    io.to(game_id).emit("playerJoined", { socket_id, current_clients: getCurrentClients() });
  });

  socket.on("disconnect", () => {
    if (!currentGameId) return;
    io.to(currentGameId).emit("playerDisconnected", { socket_id: socket.id, current_clients: getCurrentClients() });
  });

  socket.on("startGame", async (data) => {
    
  });

  socket.on("stopGame", (data) => {
    const { game_id } = data;
    io.to(game_id).emit("gameEnded");
  });


  socket.on("rollNext", async (data) => {
    
    
  });
};
