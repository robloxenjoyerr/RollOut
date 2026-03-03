import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma-client";
import { randomBytes } from "node:crypto";


export type RoomStatus = "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino";
type ClientType = Awaited<ReturnType<typeof prisma.liveGames.findUnique>>
type LiveGameType = Awaited<ReturnType<typeof prisma.liveGames.findUnique>>;



export async function createRoom(roomConfig: LiveGameType, hostId: string) {
  console.log("DB-ACTIONS.TS: Trying to create new Room with config: ", roomConfig, "\n")
  if (!roomConfig) return null

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
  if (!roomCode) return null

  return await prisma.liveGames.findUnique({
    where: { roomCode: roomCode }
  })
}

export async function findRoomByClient(clientId: string) {
  console.log("DB-ACTIONS.TS: Finding Room by ClientID: ", clientId, "\n")
  if (!clientId) return null

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

  if (!client) return false

  console.log("DB-ACTIONS.TS: findRoomByClient => Client already in game: ", client.game ? true : false, "\n")

  return {
    game: client.game,
    isHost: client.game.hostId === clientId,
    userName: client.name 
  }
}

export async function findRoomByGameCode(roomCode: string) {
  if (!roomCode) return null

  return await prisma.liveGames.findUnique({
    where: { roomCode: roomCode }
  })
}

export async function deleteGame(id: string) {
  return await prisma.liveGames.delete({
    where: { id }
  })
}

export async function getGame(id: string) {
  return await prisma.liveGames.findUnique({
    where: { id }
  })
}

export async function getAllGames() {
  return await prisma.liveGames.findMany({
    select: { id: true, roomName: true }
  })
}

export async function addClientToGame(gameId: string, clientData: { clientId: string; name: string; isHost?: boolean }) {
  return await prisma.client.create({
    data: {
      clientId: clientData.clientId,
      name: clientData.name,
      gameId, // Foreign Key zum Game 
    }
  });
}

