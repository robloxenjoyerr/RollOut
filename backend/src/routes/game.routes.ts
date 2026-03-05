import { Router } from "express";
import { addClientToGame, createRoom, findRoomByClient, verifyRoom } from "../services/db-actions";
import { getOrCreateClientId } from "../lib/services";
import prisma from "../lib/prisma-client";
import { randomBytes, randomUUID } from "node:crypto";

// => FIX: Username doesnt get shown when joining as client

const gameRouter = Router()

gameRouter.post("/start", async (req, res) => {
    try {
        const { roomConfig } = req.body
        console.log("/START: Trying to start new Room with Config: ", roomConfig, "\n")

        const clientId = getOrCreateClientId(req, res)
        console.log("/START: ClientID is: ", clientId, "\n")
        if (!clientId) {
            console.log("/START: getOrCreateClientId ERROR => Returned NULL.", "\n")
            return null
        }

        const alreadyInRoom = await findRoomByClient(clientId)
        console.log(`/START: Is ClientID ${clientId} in a room already: `, alreadyInRoom, "\n")

        if (alreadyInRoom) {
            return res.send({ roomCode: alreadyInRoom.game.roomCode, reconnect: true })
        }

        console.log("/START: Trying to create new Room..", "\n")
        const room = await createRoom(roomConfig, clientId)
        console.log("/START: Room creation successful?: ", room ? true : false, "\n")

        if (!room) return res.status(500).send({ error: true })

        await prisma.client.create({
            data: {
                clientId,          // Cookie-Wert
                name: "HOST",
                gameId: room.id,
            }
        })

        return res.send({ roomId: room.id, roomCode: room.roomCode })

    } catch (err) {
        console.error("/START ERROR: ", err, "\n")
    }
})


gameRouter.post("/verify", async (req, res) => {
    try {
        const { roomCode, userName } = req.body
        const clientId = getOrCreateClientId(req, res)

        console.log(`/VERIFY: Verifying with roomCode ${roomCode} and username ${userName} `)
        if (!clientId) {
            console.log("/START: getOrCreateClientId ERROR => Returned NULL.", "\n")
            return res.status(400).send({ valid: false, message: "ClientID could not be determined." })
        }

        const room = await verifyRoom(roomCode)
        if (!room) return res.status(404).send({ valid: false, message: "Room not found." })
        console.log("/START: Client already in room: ", room) 
        console.log(`/START: Is ClientID ${clientId} in a room already: `, room.roomCode, "\n")

        const alreadyInRoom = await findRoomByClient(clientId)

        if (alreadyInRoom) {
            // if the caller supplied a userName and it's different from the
            // name we have stored, update the record so future joins show the
            // right name
            console.log(`/VERIFY: New Client with name ${userName} is already in a room with username: ${alreadyInRoom.userName}. Updating to new username ${userName}.`)
            if (userName && userName !== alreadyInRoom.userName) {
                console.log(`/VERIFY: updating username for ${clientId} to new username: ${userName}`)
                await prisma.client.update({
                    where: { clientId },
                    data: { name: userName }
                })
                alreadyInRoom.userName = userName
            }

            console.log("/VERIFY: Sending back client info: ", alreadyInRoom)
            return res.send({
                roomCode: alreadyInRoom.game.roomCode,
                reconnect: true,
                valid: true,
                isHost: alreadyInRoom.isHost,
                userName: alreadyInRoom.userName || `NoNameProvided-${randomBytes(2).toString("hex").toUpperCase()}`,
                status: alreadyInRoom.game.status,
                clientId
            })
        }
        // Client registrieren
        const newClient = await prisma.client.create({
            data: {
                clientId,
                name: userName || `NoNameProvided-${randomBytes(2).toString("hex").toUpperCase()}`,
                gameId: room.id,
            }
        })


        return res.send({
            valid: true,
            isHost: room.hostId === clientId,
            status: room.status,
            clientId,
            userName: newClient.name,
            roomCode: room.roomCode
        })

    } catch (err) {
        console.log(err)
        return res.status(404).send({ valid: false, message: "An Error has occurred in verify route." })
    }
})


gameRouter.post("/join", async (req, res) => {
    try {
        const { roomCode } = req.body
        const room = await verifyRoom(roomCode)
        console.log(`/JOIN: Room found with entered Code ${roomCode}: `, room, "\n")

        if (!room) {
            return res.status(404).send({ valid: false, message: "Room with specified Code doesn`t exist." })
        }

        return res.status(201).send({ valid: true })
    } catch (err) {
        console.error("gameRouter ERROR : /verify : ", err, "\n")
        return res.status(500).send({ valid: false, message: "An Error has occurred." })
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