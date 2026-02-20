import { Router } from "express";
import { stopGame } from "../lib/game-manager";


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
    try {

    } catch (err) {

    }
})

gameRouter.post("/stop", async (req, res) => {
    const { game_id } = req.body
    try {
        const info = await stopGame(game_id)
        if (info.success) {
            return res.send({ success: true, message: "Game stopped successfully" })
        }
        else {
            return res.send({ success: false, message: "Game could not be stopped. Already stopped or deleted." })
        }
    }
    catch (err) {
        console.error(err)
    }
})

export default gameRouter