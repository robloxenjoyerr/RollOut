import { db } from "../db/database";
import { Router } from "express";
import { idFromToken } from "../lib/services";
import { loginAuthentication } from "../middleware/secureMiddleware";
import { startGame, checkUserForActiveSession, checkIfGameIdExist, stopGame } from "../lib/game-manager";


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
    console.log("userID: ", user_id)
    try {
        const info = await checkIfGameIdExist(game_id_url)
        if (!info) return res.send({ success: false })

        const { id, host_id } = info
        
    

        if (id) {
            console.log("userID: ", user_id + " hostID: ", host_id)
            if (user_id === host_id) return res.send({ success: true, host: true })
            else return res.send({ success: true, host: false })
        }
        else return res.send({ success: false })
    } catch (err) {
        console.log("SERVER-TS using GAME-MANAGER Service: ", err)
    }
})

gameRouter.post("/start", loginAuthentication, async (req, res) => {
    const { template, owner_id, host } = req.body

    //Check if user already stared a game
    const alreadyStarted = await checkUserForActiveSession(owner_id)
    console.log("Host hast already started a Game with IDStarted Game ID: ", alreadyStarted)

    if (alreadyStarted) return res.send({ success: false, message: "User already started a game.", game_id: alreadyStarted })

    try {
        const info = await startGame(template, owner_id)
        if (info.success) {
            console.log("Game with session ID: ", info.session_id, "started.")
            return res.send({ success: true, game_id: info.game_id, session_id: info.session_id, host: true })
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send({ success: false, message: "Server error." })
    }

})

gameRouter.post("/stop", loginAuthentication, async (req, res)=> {
    const {game_id} = req.body
    try{
        const info = await stopGame(game_id)
        if(info.success){
            return res.send({success: true, message: "Game stopped successfully"})
        }
        else {
            return res.send({success: false, message: "Game could not be stopped. Already stopped or deleted."})
        }
    }
    catch(err){
        console.error(err)
    }
})

export default gameRouter