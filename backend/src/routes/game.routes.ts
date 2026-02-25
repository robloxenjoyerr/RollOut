import { Router } from "express";
import { createRoom } from "../services/db-actions.js";

const gameRouter = Router()

gameRouter.post("/verify", async (req, res) => {
    const { game_id_url } = req.body
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1]

    try {

    } catch (err) {

    }
})

gameRouter.post("/start", async (req, res) => {
    const { roomConfig } = req.body
    try {
        const info = await createRoom(roomConfig)

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