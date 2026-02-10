import { db } from "../db/database";
import { Router } from "express";
import { idFromToken } from "../lib/services";
import { loginAuthentication } from "../middleware/secureMiddleware";
import { startGame, checkUserForActiveSession, checkIfGameIdExist, stopGame, getLiveGameById, getTemplateFromGameId } from "../lib/game-manager";


const gameRouter = Router()


gameRouter.get("/from-session/:session_id", loginAuthentication, async (req, res) => {
    const { session_id } = req.params;
    const game = db.prepare(`SELECT id FROM live_games WHERE session_id = ? AND ended_at IS NULL`).get(session_id) as { id: string } | undefined

    if (!game) return res.status(404).send({ success: false, message: "Session not found." });

    return res.send({ success: true, game_id: game.id });
});

gameRouter.post("/verify", async (req, res) => {
    const { game_id_url } = req.body
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1]
    const user_id = idFromToken(token)
    try {
        const info = await checkIfGameIdExist(game_id_url)
        if (!info) return res.send({ success: false })

        const { id, host_id } = info
        const game = await getLiveGameById(id)
        const game_template = await getTemplateFromGameId(id)
        if(!game) return res.send({ success: false, message: "Couldnt get a valid GamePhase from DB function."})

        if (id) {
            if (user_id === host_id) return res.send({ success: true, host: true, game_phase: game.phase, game_template: game_template })
            else return res.send({ success: true, host: false, game_phase: game.phase, game_template: game_template })
        }
        else return res.send({ success: false })
    } catch (err) {
        console.log("gameRouter /verify ERROR: ", err)
    }
})

gameRouter.post("/start", loginAuthentication, async (req, res) => {
    const { template, owner_id, host } = req.body
    const alreadyStarted = await checkUserForActiveSession(owner_id)
    console.log("Host already started a game with ID: ", alreadyStarted)

    if (alreadyStarted) return res.send({ success: false, message: "User already started a game.", game_id: alreadyStarted })

    try {
        const info = await startGame(template, owner_id)
        if (info.success) {
            console.log("Game with gameID: ", info.game_id, "started.")
            return res.send({ success: true, game_id: info.game_id, session_id: info.session_id, host: true })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ success: false, message: "Server error." })
    }
})

gameRouter.post("/stop", loginAuthentication, async (req, res) => {
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