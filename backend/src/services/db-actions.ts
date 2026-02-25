import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma-client.js";
import { randomBytes } from "node:crypto";


export type RoomStatus = "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino";
type ClientType = Awaited<ReturnType<typeof prisma.liveGames.findUnique>>
type LiveGameType = Awaited<ReturnType<typeof prisma.liveGames.findUnique>>;



export async function createRoom(roomConfig: LiveGameType) {
  if(!roomConfig) return null

  return await prisma.liveGames.create({
    data: {
      roomName: roomConfig.roomName,
      mode: roomConfig.mode,
      isPrivate: roomConfig.isPrivate,
      status: "waiting-lobby",
      hostId: roomConfig.hostId,
      gameCode: roomConfig.isPrivate ? randomBytes(6).toString("hex").toUpperCase() : null
    }
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
  return await prisma.liveGames.findMany()
}

export async function addClientToGame(gameId: string, clientData: { id: string; name: string; isHost?: boolean }) {
  return await prisma.client.create({
    data: {
      id: clientData.id, // UUID
      name: clientData.name,
      isHost: clientData.isHost ?? false,
      gameId // Foreign Key zum Game
    }
  });
}

