import { Socket, Server } from "socket.io"

export const registerGameHandlers = (io: Server, socket: Socket) => {
    socket.on("joinGame", (data) => {
    const { roomCode, playerName } = data;
    socket.join(roomCode); // Erstellt/Tritt einem Raum bei
    
    console.log(`Spieler ${playerName} ist Raum ${roomCode} beigetreten`);
    
    // Allen im Raum mitteilen, dass jemand da ist
    io.to(roomCode).emit("playerJoined", { playerName });
  });

  socket.on("startGame", (roomCode) => {
    // Nur der Host sollte das dürfen (Validierung einbauen!)
    io.to(roomCode).emit("gameStarted");
  });

  socket.on("submitAnswer", (data) => {
    // Logik für Punkteberechnung
  });
}