import { Router } from "express";
import { createRoom, findRoomByClient, verifyRoom } from "../services/db-actions";
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
            const clientId = req.cookies?.clientId
            console.log("hostID from req.cookies.hostiD: ", clientId)
            const isHost = clientId && clientId === info.hostId
            return res.send({ valid: true, isHost: isHost, status: info.status })
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

gameRouter.post("/join", async (req, res) => {
    const { roomId, playerName } = req.body
    const clientId = getOrCreateClientId(req, res)

    // Schon in diesem Raum? → Rejoin
    const existingClient = await prisma.client.findFirst({
        where: { clientId, gameId: roomId }
    })

    if (existingClient) {
        return res.send({ 
            success: true, 
            rejoin: true,
            clientDbId: existingClient.id 
        })
    }

    try {
        const client = await prisma.client.create({
            data: {
                clientId,
                name: playerName,
                gameId: roomId,
                isHost: false
            }
        })

        return res.send({ success: true, rejoin: false, clientDbId: client.id })
    } catch (err) {
        console.error("gameRouter ERROR /join:", err)
        res.status(500).send({ error: true })
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