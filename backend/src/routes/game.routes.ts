import { Router } from "express";
import { createRoom, findRoomByClient, verifyRoom } from "../services/db-actions";
import { randomBytes } from "node:crypto";
import { isTokenHeader } from "hono/utils/jwt/jwt";

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
            return res.send({ valid: true, isHost: !!isHost })
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
    const hostIdCookie = req.cookies?.hostId

    if(hostIdCookie){
        const alreadyInRoom = await findRoomByClient(hostIdCookie)

        if (alreadyInRoom) {
            return res.send({ roomId: alreadyInRoom.id, alreadyInRoom: true })
        }
    }


    const hostId = hostIdCookie || randomBytes(8).toString("hex")
    try {
        const info = await createRoom(roomConfig, hostId)
        if (!info) return res.status(500).send({ error: true })

        if (info) {
            res.cookie("hostId", hostId, {
                httpOnly: true,
                secure: true,
                sameSite: "none", // ← none statt strict für cross-domain
                domain: ".rollout.live",  // ← auf Hauptdomain setzen
                maxAge: 1000 * 60 * 60 * 1
            })
            return res.send({ roomId: info.id })
        }
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