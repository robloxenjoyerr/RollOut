import { Router } from "express";
import { createRoom } from "../services/db-actions.js";
import { randomBytes } from "node:crypto";

const gameRouter = Router()

gameRouter.post("/verify", async (req, res) => {
   
    try {

    } catch (err) {

    }
})

gameRouter.post("/start", async (req, res) => {
    const { roomConfig } = req.body
    const hostId = randomBytes(8).toString("hex")
    try {
        const info = await createRoom(roomConfig, hostId)

        if(info){
            res.cookie("hostId", hostId, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 1000 * 60 * 60 * 1
            })
            return res.send({ roomId: info.id})
        }
    } catch (err) {
        console.log(err)
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