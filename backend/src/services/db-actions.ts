import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import prisma from "../lib/prisma-client.js";

export type GamePhase = "unstarted" | "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino";
export type PersonState = "unrolled" | "rolled";
export type Person = {
    id: string,
    name: string,
    state: PersonState

}


export async function createRoom(roomName: string, mode: Mode){
    return await prisma.liveGames.create({
        data: { roomName, mode, clients: ""}
    })
}

export async function deleteGame(id: number) {
  return await prisma.liveGames.delete({
    where: { id }
  })
}

export async function getGame(id: number) {
  return await prisma.liveGames.findUnique({
    where: { id }
  })
}

export async function getAllGames() {
  return await prisma.liveGames.findMany()
}

export async function updateClients(id: number, clients: string) {
  return await prisma.liveGames.update({
    where: { id },
    data: { clients }
  })
}

