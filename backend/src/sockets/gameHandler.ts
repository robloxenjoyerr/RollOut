import { Socket, Server } from "socket.io";
import prisma from "../lib/prisma-client";
import { findRoomByClient, findRoomByGameCode, updateRoomStatus } from "../services/db-actions";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const client = socket.data.client

  console.log(`[GameHandler] Initial client ${client.name} (${client.clientId}) socket registered`)

  socket.on("joinRoom", async (data: { roomCode: string, clientId: string }) => {
    const { roomCode } = data;

    console.log(`[GameHandler] joinRoom event from ${client.name}: roomCode=${roomCode}`)

    // Find the actual room by code
    const room = await prisma.liveGames.findUnique({
      where: { roomCode },
      include: { clients: true }
    })

    if (!room) {
      console.log(`[GameHandler] Room ${roomCode} not found!`)
      socket.emit("error", { message: "Room not found" });
      return
    }

    console.log(`[GameHandler] Found room ${roomCode} with ID ${room.id}`)

    // If the client is in a different room, leave it
    if (client.gameId !== room.id) {
      console.log(`[GameHandler] Client was in room ${client.gameId} already, moving to ${room.id}`)
      socket.leave(client.gameId)
    }

    // Join the correct room
    socket.join(room.id)
    console.log(`[GameHandler] Client ${client.name} joined room ${room.id}`)

    // Broadcast that this client joined
    socket.to(room.id).emit("clientJoined", {
      clientId: client.clientId,
      name: client.name,
      isHost: room.hostId === client.clientId,
      clients: room.clients
    });

    console.log(`[GameHandler] Broadcast clientJoined for ${client.name} to room ${room.id}`)


    socket.emit("gameStateUpdate", {
      status: room.status,
      clients: room.clients
    });

  });

  socket.on("getGameState", async (clientId: string) => {
    const room = await findRoomByClient(clientId)

    if (!room) {
      return io.to(client.gameId).emit("error", { message: "Could not find Room for ClientId: ", clientId })
    }

    io.to(client.gameId).emit("gameStateUpdate", {
      status: room.game.status,
      clients: room.game.clients
    })
  })

  socket.on("disconnect", async () => {
    console.log(`[GameHandler] Client ${client.name} disconnected from room ${client.gameId}`)

    const room = await findRoomByClient(client.clientId)

    if (!room) {
      console.log(`[GameHandler - socket.disconnect] Client ${client} is not in Room with gameId ${client.gameId}`)
      return io.to(client.gameId).emit("error", { message: "Could not disconnect from a Room you were not in before." })
    }

    console.log("game clients: ", room.game.clients)

    io.to(client.gameId).emit("clientDisconnected", {
      clientId: client.clientId,
      name: client.name,
      clients: room.game.clients
    });
  });

  socket.on("startGame", async (data) => {
    const { roomCode, clientId } = data

    console.log(`[GameHandler] startGame event received from ${client.name} in room ${client.gameId}`)
    if (!roomCode || !clientId) {
      console.log("[GameHandler] startGame Event failed, either roomCode or clientId was not provided.")
      return io.to(client.gameId).emit("startGameError", { message: "ERROR: Either roomCode or ClientId was not provided." })
    }

    const clientInRoomAndHost = await findRoomByClient(clientId)

    if (!clientInRoomAndHost) {
      return io.to(client.gameId).emit("startGameError", { message: "ERROR: Client is not in provided Room or is not Host." })
    }


    try {
      const updatedRoomStatus = await updateRoomStatus(roomCode, "in-progress")
      if (!updatedRoomStatus) {
        console.log("[GameHandler] Room-Status update failed => provided roomCode was invalid.")
      }

      if (updatedRoomStatus?.status !== "in-progress") {
        console.log("[GameHandler] Room-Status update failed => Room-Status was not successfully updated to 'in-progress'.")
      }

      console.log(`[GameHandler] Game Start was successful. Broadcasting gameStarted to room ${client.gameId} now.`)
      io.to(client.gameId).emit("gameStarted", { status: "in-progress" })

    } catch (err) {
      console.log("[GameHandler] Try-Catch Error: ", err)
      return io.to(client.gameId).emit("startGameError", { message: "ERROR: An Error occurred inside the GameHandler." })
    }
  });

  socket.on("stopGame", () => {
    io.to(client.gameId).emit("gameEnded");
  });

  socket.on("rollNext", async () => {

  });
};
