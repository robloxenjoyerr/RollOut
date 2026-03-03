import { Socket, Server } from "socket.io";
import prisma from "../lib/prisma-client";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const client = socket.data.client
  
  console.log(`[GameHandler] Initial client ${client.name} (${client.clientId}) socket registered`)

  socket.on("joinRoom", async (data: { roomCode: string, clientId: string }) => {
    const { roomCode } = data;
    
    console.log(`[GameHandler] joinRoom event from ${client.name}: roomCode=${roomCode}`)
    
    // Find the actual room by code
    const room = await prisma.liveGames.findUnique({
      where: { roomCode }
    })
    
    if (!room) {
      console.log(`[GameHandler] Room ${roomCode} not found!`)
      return
    }
    
    console.log(`[GameHandler] Found room ${roomCode} with ID ${room.id}`)
    
    // If the client is in a different room, leave it
    if (client.gameId !== room.id) {
      console.log(`[GameHandler] Client was in room ${client.gameId}, moving to ${room.id}`)
      socket.leave(client.gameId)
    }
    
    // Join the correct room
    socket.join(room.id)
    console.log(`[GameHandler] Client ${client.name} joined room ${room.id}`)
    
    // Broadcast that this client joined
    io.to(room.id).emit("clientJoined", {
      clientId: client.clientId,
      name: client.name,
      isHost: client.name === "HOST"
    });

    console.log(`[GameHandler] Broadcast clientJoined for ${client.name} to room ${room.id}`)

    // Send current list of connected clients to this client
    const connectedRoom = io.sockets.adapter.rooms.get(room.id);
    if (connectedRoom) {
      const connectedClients: any[] = [];
      for (const socketId of connectedRoom) {
        const s = io.sockets.sockets.get(socketId);
        if (s?.data?.client) {
          connectedClients.push({
            clientId: s.data.client.clientId,
            name: s.data.client.name,
            isHost: s.data.client.name === "HOST"
          });
        }
      }
      console.log(`[GameHandler] Sending currentClients (${connectedClients.length} clients) to ${client.name}`)
      socket.emit("currentClients", connectedClients);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[GameHandler] Client ${client.name} disconnected from room ${client.gameId}`)
    io.to(client.gameId).emit("clientDisconnected", {
      clientId: client.clientId,
      name: client.name
    });
  });

  socket.on("getGameState", (roomCode: string) => {
    console.log(`[GameHandler] getGameState requested by ${client.name}`)
    io.to(client.gameId).emit("gameStateUpdate", {
      phase: "waiting-lobby",
      persons: []
    });
  });

  socket.on("startGame", async () => {
    console.log(`[GameHandler] startGame event received from ${client.name} in room ${client.gameId}`)
    console.log(`[GameHandler] Broadcasting gameStarted to room ${client.gameId}`)
    io.to(client.gameId).emit("gameStarted")
  });

  socket.on("stopGame", () => {
    io.to(client.gameId).emit("gameEnded");
  });

  socket.on("rollNext", async () => {

  });
};
