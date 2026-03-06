import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma-client";
import { randomBytes } from "node:crypto";
import { constrainedMemory } from "node:process";


export type RoomStatus = "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino";
type ClientType = Awaited<ReturnType<typeof prisma.liveGames.findUnique>>
type LiveGameType = Awaited<ReturnType<typeof prisma.liveGames.findUnique>>;



export async function createRoom(roomConfig: LiveGameType, hostId: string) {
  console.log("[DB-ACTIONS - createRoom] Trying to create new Room with config: ", roomConfig, "\n")
  if (!roomConfig) {
    console.error("[DB-ACTIONS - createRoom] ERROR: roomConfig is undefined")
    return null
  }

  return await prisma.liveGames.create({
    data: {
      roomName: roomConfig.roomName,
      mode: roomConfig.mode,
      isPrivate: roomConfig.isPrivate,
      status: "waiting-lobby",
      hostId: hostId,
      roomCode: randomBytes(3).toString("hex").toUpperCase()
    }
  })
}

export async function verifyRoom(roomCode: string) {
  if (!roomCode) {
    console.error("[DB-ACTIONS - verifyRoom] ERROR: roomCode is undefined.")
    return null
  }

  const roomVerified = await prisma.liveGames.findUnique({
    where: { roomCode: roomCode }
  })

  if(!roomVerified){
    console.error("[DB-ACTIONS - verifyRoom] ERROR: Room could not be verified.")
  }

  return roomVerified
}

export async function findRoomByClient(clientId: string) {
  if (!clientId) {
    console.error("[DB-ACTIONS - findRoomByClient] ERROR: clientId is undefined.")
    return null
  }
  console.log("findROomByClientId CLIENTID: ", clientId)
  const client = await prisma.client.findUnique({
    where: { clientId },
    include: {
      game: {
        include: {
          clients: true // <- alle Clients des Spiels laden
        }
      }
    }
  })

  if (!client) {
    console.error("[DB-ACTIONS - findRoomByClient] ERROR: client could not be found.")
    return null
  }

  console.log("[DB-ACTIONS - findRoomByClient] Client found! Is already in Game: ", client.game ? true : false, "\n")

  return {
    game: client.game,
    isHost: client.game.hostId === clientId,
    userName: client.name
  }
}


export async function updateRoomStatus(roomCode: string, newStatus: RoomStatus) {
  if (!roomCode || !newStatus) {
    console.error("[DB-ACTIONS - updateRoomStatus] ERROR: Either roomCode or newStatus is undefined.")
    return null
  }

  return await prisma.liveGames.update({
    where: { roomCode: roomCode },
    data: { status: newStatus }
  })
}

export async function findRoomByGameCode(roomCode: string) {
  if (!roomCode) {
    console.error("[DB-ACTIONS - findRoomByGameCode] ERROR: roomCode is undefined.")
    return null
  }
  return await prisma.liveGames.findUnique({
    where: { roomCode: roomCode }
  })
}

export async function deleteGame(id: string) {
  return await prisma.liveGames.delete({
    where: { id }
  })
}


export async function addClientToGame(gameId: string, clientData: { clientId: string; username: string; isHost?: boolean }) {
  if (!gameId || !clientData) {
    console.error("[DB-ACTIONS - addClientToGame] ERROR: Either gameId or clientData is missing.")
  }
  return await prisma.client.create({
    data: {
      clientId: clientData.clientId,
      name: clientData.username || `NoNameProvided-${randomBytes(2).toString("hex").toUpperCase()}`,
      gameId: gameId,
      isHost: clientData.isHost
    }
  })
}

// export async function findClientBy
