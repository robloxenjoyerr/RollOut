import { Socket, Server } from "socket.io";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const client = socket.data.client
  const gameId = client.gameId  // ← statt currentGameId

  // When a client joins, emit the clientJoined event to everyone in the room
  io.to(gameId).emit("clientJoined", { 
    clientId: client.clientId, 
    name: client.name, 
  });

  // Send current list of connected clients to the newly connected socket
  // so that when the host reconnects, they get the full client list
  const room = io.sockets.adapter.rooms.get(gameId);
  if (room) {
    const connectedClients: any[] = [];
    for (const socketId of room) {
      const s = io.sockets.sockets.get(socketId);
      if (s?.data?.client) {
        connectedClients.push({
          clientId: s.data.client.clientId,
          name: s.data.client.name,
        });
      }
    }
    // Send the full list to the newly connected client
    socket.emit("currentClients", connectedClients);
  }

  socket.on("disconnect", () => {
    io.to(gameId).emit("clientDisconnected", { 
      clientId: client.clientId, 
      name: client.name 
    });
  });

  socket.on("getGameState", (roomCode: string) => {
    // Send the current game state to the requesting client
    // For now, just send the list of connected clients
    const room = io.sockets.adapter.rooms.get(gameId);
    if (room) {
      const connectedClients: any[] = [];
      for (const socketId of room) {
        const s = io.sockets.sockets.get(socketId);
        if (s?.data?.client) {
          connectedClients.push({
            clientId: s.data.client.clientId,
            name: s.data.client.name,
          });
        }
      }
      socket.emit("currentClients", connectedClients);
    }
  });

  socket.on("startGame", async () => {
    io.to(gameId).emit("gameStarted")
  });

  socket.on("stopGame", () => {
    io.to(gameId).emit("gameEnded");
  });


  socket.on("rollNext", async () => {

  });
};
