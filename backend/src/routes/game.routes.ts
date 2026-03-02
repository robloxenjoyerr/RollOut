import { Router } from "express";
import { createRoom, findRoomByClient, verifyRoom } from "../services/db-actions";
import { getOrCreateClientId } from "../lib/services";
import prisma from "../lib/prisma-client";
import { randomUUID } from "node:crypto";

const gameRouter = Router()

gameRouter.post("/start", async (req, res) => {
    const { roomConfig } = req.body
    const clientId = getOrCreateClientId(req, res)


    const alreadyInRoom = await findRoomByClient(clientId)
    if (alreadyInRoom) {
        return res.send({ roomCode: alreadyInRoom.id, alreadyInRoom: true })
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

        return res.send({ roomId: room.id, roomCode: room.roomCode })

    } catch (err) {
        console.error("gameRouter ERROR : /start : ", err)
    }
})

gameRouter.post("/join/:roomCode", async (req, res) => {
    const { roomCode } = req.params
    // FIX BUG => HOST JOINS => OTHER PLAYER JOINS => GETS SHOWN => CLIENT REFRESH SITE => HOST DISAPPEARS IN "clients cucently conjnected list"

    try {
        const room = await verifyRoom(roomCode)
        console.log("Verifying Room response: ", room)
        if (room) {
            console.log("Room verified => is existing with roomCode: ", roomCode)
            let clientId = req.cookies?.clientId || randomUUID()

            res.cookie("clientId", clientId, {
                httpOnly: true,
                secure: true,
                sameSite: "none", // Wichtig für Cross-Origin
                maxAge: 1 * 24 * 60 * 60 * 1000 // 7 Tage
            })

            const alreadyInRoom = await prisma.client.findUnique({
                where: { clientId: clientId }
            })

            console.log("Is client in room already? : ", alreadyInRoom)

            if (!alreadyInRoom) {
                await prisma.client.create({
                    data: {
                        clientId,          // Cookie-Wert
                        name: "NoNameNoob", // clientName
                        gameId: room.id,
                        isHost: false
                    }
                })
            }



            const isHost = clientId && clientId === room.hostId
            return res.send({ valid: true, isHost: isHost, status: room.status, clientId: clientId })
        }
        else {
            return res.send({ valid: false, isHost: false })
        }
    } catch (err) {
        console.error("gameRouter ERROR : /verify : ", err)
        return res.status(500).send({ valid: false, isHost: false })
    }
})

gameRouter.post("/joinA/:roomCode", async (req, res) => {
    const { roomCode } = req.params
    let { clientName } = req.body
    const clientId = getOrCreateClientId(req, res)

    if(!clientName) clientName = "Bob"
    const game = await prisma.liveGames.findUnique({
        where: { roomCode: roomCode }
    })

    if (!game) return res.status(404).send({ error: "Room not found" })

    const existingClient = await prisma.client.findFirst({
        where: { clientId, gameId: game.id }
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
                name: clientName,
                gameId: roomCode,
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