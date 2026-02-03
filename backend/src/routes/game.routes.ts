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


// in game.routes.ts

gameRouter.post("/verify", async (req, res) => {
    const { game_id_url } = req.body;
    // ... (Token und User-ID holen, wie gehabt)
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
        return res.status(401).send({ success: false, error: "Unauthorized" });
    }
    const user_id = idFromToken(token);
    if (!user_id) {
        return res.status(401).send({ success: false, error: "Invalid token" });
    }

    try {
        const gameInfo = await checkIfGameIdExist(game_id_url);
        if (!gameInfo) {
            return res.send({ success: false, error: "Game not found" });
        }

        const { host_id, clients } = gameInfo;

        // ✅ Schritt 1: Rollenbestimmung (einfach und direkt)
        // Wenn deine User-ID die Host-ID ist, BIST du der Host. Punkt.
        const shouldBeHost = (user_id === host_id);

        // ✅ Schritt 2: Anwesenheitsverfolgung (unabhängig von der Rolle)
        // Füge den User zur Client-Liste hinzu, wenn er noch nicht drin ist.
        // Das ist nur, damit die anderen Clients wissen, dass dieser User (egal ob Host oder nicht) online ist.
        const clientsArr: { id: string, socket_id: string }[] = JSON.parse(clients || '[]');
        const userAlreadyInGame = clientsArr.some(client => client.id === user_id);

        if (!userAlreadyInGame) {
            const newClient = { id: user_id, socket_id: "pending" };
            clientsArr.push(newClient);
            const newClientsJson = JSON.stringify(clientsArr);
            
            db.prepare(`
                UPDATE live_games
                SET clients = ?
                WHERE id = ?
            `).run(newClientsJson, game_id_url);
        }

        // ✅ Schritt 3: Sende das Ergebnis der Rollenbestimmung
        return res.send({ success: true, host: shouldBeHost });

    } catch (err) {
        console.log("gameRouter /verify ERROR: ", err);
        res.status(500).send({ success: false, error: "Internal server error" });
    }
});




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