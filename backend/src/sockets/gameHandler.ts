import { Socket, Server } from "socket.io";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const client = socket.data.client
  const gameId = client.gameId  // ← statt currentGameId

  io.to(gameId).emit("clientJoined", { 
    clientId: client.clientId, 
    name: client.name, 
  });

  socket.on("disconnect", () => {
    io.to(gameId).emit("clientDisconnected", { 
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
