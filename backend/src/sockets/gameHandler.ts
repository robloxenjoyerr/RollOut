import { Socket, Server } from "socket.io";
import prisma from "../lib/prisma-client";
import { findRoomByClient, findRoomByGameCode, updateRoomStatus, deleteRoom, getRoomClients } from "../services/db-actions";

export const registerGameHandlers = (io: Server, socket: Socket) => {
  const client = socket.data.client

  console.log(`[GameHandler] Initial client ${client.name} (${client.clientId}) socket registered`)


  const getClientsWithoutHost = (room: any) => {
    const clients = room.game?.clients ?? room.clients
    const hostId = room.game?.hostId ?? room.hostId

    return clients
      .filter((c: any) => c.clientId !== hostId)
      .map((c: any) => ({ ...c, isHost: false }))
  }

  socket.on("getGameState", async (clientId: string) => {
    const room = await findRoomByClient(clientId)

    if (!room) {
      return io.to(client.gameId).emit("error", { message: "Could not find Room for ClientId: ", clientId })
    }
    console.log("ROOMNAME: ", room.game.roomName)

    
    io.to(client.gameId).emit("gameStateUpdate", {
      status: room.game.status,
      roomName: room.game.roomName,
      clients: getClientsWithoutHost(room),
      allowLateRoll: room.game.allowLateRoll

    })
  })

  const hostDisconnectTimers = new Map<string, NodeJS.Timeout>()

  socket.on("disconnect", async () => {

    console.log(`[GameHandler] Client ${client.name} disconnected from room ${client.gameId}`)

    const room = await findRoomByClient(client.clientId)

    if (!room) {
      console.log(`[GameHandler - socket.disconnect] Client ${client} is not in Room with gameId ${client.gameId}`)
      return io.to(client.gameId).emit("error", { message: "Could not disconnect from a Room you were not in before." })
    }

    const isHost = room.game.hostId === client.clientId

    if (isHost) {
      console.log(`[GameHandler - socket.disconnect] HOST has disconnected from Room ${room.game.roomCode}`)

      await prisma.liveGames.update({
        where: { id: room.game.id },
        data: {
          hostLeft: true,
          hostLeftAt: new Date()
        }
      })

      io.to(room.game.id).emit("hostDisconnected", {
        message: "HOST left. Room will close in 5 minutes if HOST doesn't return."
      })

      const timer = setTimeout(async () => {
        const stillGone = await prisma.liveGames.findUnique({
          where: { id: room.game.id }
        })

        if (stillGone?.hostLeft) {
          await deleteRoom(room.game.id)
          io.to(room.game.id).emit("roomClosed", {
            reason: "host_disconnected"
          })
        }
      }, 1000 * 60 * 5) // * 5 => 5min

      hostDisconnectTimers.set(room.game.id, timer)
    }
    else {
      io.to(client.gameId).emit("clientDisconnected", {
        clientId: client.clientId,
        name: client.name,
        clients: getClientsWithoutHost(room)
      });
    }
  });

  socket.on("joinRoom", async (data: { roomCode: string, clientId: string }) => {
    const { roomCode } = data;

    console.log(`[GameHandler] joinRoom event from ${client.name}: roomCode=${roomCode}`)

    // Find the actual room by code
    const room = await findRoomByGameCode(roomCode)

    if (!room) {
      console.log(`[GameHandler] Room ${roomCode} not found!`)
      socket.emit("error", { message: "Room not found" });
      return
    }

    if (room.hostLeft && room.hostId === client.clientID) {
      console.log(`[GameHandler] HOST reconnected! Canceling grace-period.`)

      if (hostDisconnectTimers.has(room.id)) {
        clearTimeout(hostDisconnectTimers.get(room.id)!)
        hostDisconnectTimers.delete(room.id)
      }

      await prisma.liveGames.update({
        where: { id: room.id },
        data: {
          hostLeft: false,
          hostLeftAt: null
        }
      })
      io.to(room.id).emit("hostReconnected", {
        clientId: client.clientId,
        name: client.name,
        clients: getClientsWithoutHost(room)
      })

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
    io.to(room.id).emit("clientJoined", {
      clientId: client.clientId,
      name: client.name,
      isHost: room.hostId === client.clientId,
      clients: getClientsWithoutHost(room)
    });

    console.log(`[GameHandler] Broadcast clientJoined for ${client.name} to room ${room.id}`)


    socket.emit("gameStateUpdate", {
      status: room.status,
      clients: getClientsWithoutHost(room)
    });

  });

  socket.on("startGame", async (data) => {
    try {
      const { roomCode, clientId } = data

      const room = await findRoomByClient(clientId)

      if (room && room?.game.clients.length <= 2) {
        return io.to(client.gameId).emit("startGameError", { message: `Not enough Clients. Need atleast ${3 - room.game.clients.length} more.` })
      }
      else if(!room){
        
        return io.to(client.gameId).emit("startGameError", { message: "Room was not found." })
      }

      console.log(`[GameHandler] startGame event received from ${client.name} in room ${client.gameId}`)
      if (!roomCode || !clientId) {
        console.log("[GameHandler] startGame Event failed, either roomCode or clientId was not provided.")
        return io.to(client.gameId).emit("startGameError", { message: "Either roomCode or ClientId was not provided." })
      }

      const clientInRoomAndHost = await findRoomByClient(clientId)

      if (!clientInRoomAndHost) {
        return io.to(client.gameId).emit("startGameError", { message: "Client is not in provided Room or is not Host." })
      }
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
      return io.to(client.gameId).emit("startGameError", { message: "An Error occurred inside the GameHandler." })
    }
  });

  socket.on("toggleLateJoin", async () => {
    try {
      const room = await findRoomByClient(client.clientId)
      if (!room) return io.to(client.gameId).emit("error", { message: "Could not toggle Late Join." })

      const newValue = !room.game.allowLateRoll
      await prisma.liveGames.update({
        where: { id: room.game.id },
        data: { allowLateRoll: newValue }
      })

      io.to(client.gameId).emit("toggleLateJoinUpdated", {
        allowLateRoll: newValue,
        message: newValue
          ? "New joined Clients can now be rolled again."
          : "New joined Clients can now only spectate."
      })

    } catch (err) {
      console.error(err)
    }
  })

  socket.on("stopGame", async (data: any) => {
    try {
      const { roomCode, clientId } = data
      const room = await findRoomByClient(clientId)

      if (!room) return io.to(client.gameId).emit("error", { message: "Could not stop Room. Room not found." })

      await deleteRoom(client.gameId)

      io.to(client.gameId).emit("gameEnded", { message: "Game has ended!" });
    } catch (err) {
      console.error(err)
    }

  });

  socket.on("rollNext", async ({ clientId }) => {
    try {
      console.log("[GameHandler] Rolling Next Client NOW!")

      const room = await findRoomByClient(clientId)
      const clients = room?.game.clients

      console.log("[GameHandler] Current clients: ", clients)
      if (!room || !clients) return io.to(client.gameId).emit("rollNextError", { message: "Could not roll next => Either room or clients is undefined." })


      const hostId = room.game.hostId
      const clientsWithHostFlag = clients.map(c => ({
        ...c,
        isHost: c.clientId === hostId
      }))

      const unrolledClients = clientsWithHostFlag.filter(
        c => c.isRolled === false && c.clientId !== hostId
      )

      if (unrolledClients.length === 0){
        await deleteRoom(client.gameId)
        return io.to(client.gameId).emit("gameEnded", { message: "All Clients have been Rolled. Closing in 5s." })
      } 

      const randomInt = Math.floor(Math.random() * unrolledClients.length)
      const nextRolled = unrolledClients[randomInt]


      await prisma.client.update({
        where: { id: nextRolled.id },
        data: { isRolled: true }
      })

      // Nach dem Update nochmal aus DB holen - korrekte Liste
      const updatedClients = unrolledClients.filter(c => c.id !== nextRolled.id)

      const segmentAngle = 360 / unrolledClients.length
      const margin = segmentAngle * 0.15
      const randomOffset = margin + Math.random() * (segmentAngle - margin * 2)

      console.log("randomOffset:", randomOffset, "segmentAngle:", segmentAngle, "unrolledClients.length:", unrolledClients.length)

      return io.to(client.gameId).emit("nextRolled", { nextRolled, unrolledClients: updatedClients, randomOffset })

    } catch (err) {
      console.error("[GameHandler] Try-Catch Error: ", err)
    }
  });
};
