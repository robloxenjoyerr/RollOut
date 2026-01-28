import { Socket, Server } from "socket.io"

export const registerGameHandlers = (io: Server, socket: Socket) => {
    socket.on("joinGame", (data) => {
    const { game_id, socket_id } = data;
    console.log("Data roomCode: ", game_id)
    socket.join(game_id); // Erstellt/Tritt einem Raum bei
    
    console.log(`Client ${socket_id} ist Game ${game_id} beigetreten`);
    
    // Allen im Raum mitteilen, dass jemand da ist
    io.to(game_id).emit("playerJoined", { socket_id });
  });

  socket.on("startGame", (game_id) => {
    // Nur der Host sollte das dürfen (Validierung einbauen!)
    io.to(game_id).emit("gameStarted");
  });

  
}