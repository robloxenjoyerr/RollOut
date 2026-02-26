import { Socket, Server } from "socket.io";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const client = socket.data.client
  const gameId = client.gameId  // ← statt currentGameId

  io.to(gameId).emit("playerJoined", { 
    clientId: client.clientId, 
    name: client.name, 
    isHost: client.isHost 
  });

  socket.on("disconnect", () => {
    io.to(gameId).emit("playerDisconnected", { 
      clientId: client.clientId, 
      name: client.name 
    });
  });

  socket.on("startGame", async () => {

  });

  socket.on("stopGame", () => {
    io.to(gameId).emit("gameEnded");
  });


  socket.on("rollNext", async () => {

  });
};
