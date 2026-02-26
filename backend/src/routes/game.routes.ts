import { Router } from "express";
import { createRoom, findRoomByClient, verifyRoom } from "../services/db-actions";
import { randomBytes } from "node:crypto";
import { isTokenHeader } from "hono/utils/jwt/jwt";
import { getOrCreateClientId } from "../lib/services";
import prisma from "../lib/prisma-client";

const gameRouter = Router()

gameRouter.post("/verify/:roomId", async (req, res) => {
    const { roomId } = req.params
    console.log("roomId:", roomId)
    console.log("cookies:", req.cookies)
    try {
        const info = await verifyRoom(roomId)

        if (info) {
            const hostId = req.cookies?.hostId
            console.log("hostID from req.cookies.hostiD: ", hostId)
            const isHost = hostId && hostId === info.hostId
            return res.send({ valid: true, isHost: !!isHost, status: info.status })
        }
        else {
            return res.send({ valid: false, isHost: false })
        }
    } catch (err) {
        console.error("gameRouter ERROR : /verify : ", err)
        return res.status(500).send({ valid: false, isHost: false })
    }
})

gameRouter.post("/start", async (req, res) => {
    const { roomConfig } = req.body
    const clientId = getOrCreateClientId(req, res)

    const alreadyInRoom = await findRoomByClient(clientId)
    if (alreadyInRoom) {
        return res.send({ roomId: alreadyInRoom.id, alreadyInRoom: true })
    }

    try {
        const room = await createRoom(roomConfig, clientId)
        if (!room) return res.status(500).send({ error: true })
        
        await prisma.client.create({
            data: {
                clientId,          // Cookie-Wert
                name: roomConfig.hostName ?? "Host",
                gameId: room.id,
                isHost: true
            }
        })

        return res.send({ roomId: room.id})

    } catch (err) {
        console.error("gameRouter ERROR : /start : ", err)
    }
})

gameRouter.post("/stop", async (req, res) => {
    const { game_id } = req.body
    try {

    }
    catch (err) {
        console.error(err)
    }
})

export default gameRouter

// npx prisma generate