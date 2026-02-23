import { randomBytes } from "node:crypto"
import { GamePhase, Person, Mode, Template } from "../services/db-actions.js"
import { db } from "../db/database.js"

interface Client {
    id: string,
    socket_id: string,
    host: boolean
}

export interface LiveGame {
    id: string,
    name: string,
    host_id: string,
    clients: Client[],
    mode: Mode,
    phase: GamePhase,
    creted_at: string
}


export async function getLiveGames() {
    try{
        return db.prepare(`
                SELECT * FROM live_games WHERE ended_at IS NULL ORDER BY created_at DESC
            `).all()
    } catch(err){
        console.error("Game-Manager ERROR: ", err)
    }
}

export async function getLiveGameById(game_id: string) {
    try {
        const gameRow = db.prepare(`
            SELECT * 
            FROM live_games 
            WHERE id = ? AND ended_at IS NULL
        `).get(game_id) as { phase: GamePhase, mode: Mode, persons: string } | undefined;

        if (!gameRow) {
            console.error(`getLiveGameById: Spiel mit ID ${game_id} nicht gefunden.`);
            return null;
        }

        return {
            phase: gameRow.phase,
            mode: gameRow.mode,
            persons: JSON.parse(gameRow.persons)
        };

    } catch (error) {
        console.error("Fehler in getLiveGameById:", error);
        return null;
    }
}


export async function startGame(roomConfig: any) {

    const game_id = randomBytes(8).toString("hex")

    const stmt = db.prepare(`
        INSERT INTO live_games (id, name, mode, phase, created_at)
        VALUES (?, ?, ?, ?, ?)
        `)

    stmt.run(game_id, roomConfig.name, roomConfig.mode, "waiting-lobby", Date.now())
    return { success: true, game_id: game_id}
}

export async function stopGame(game_id: string) {
    const stmt = db.prepare(`
            DELETE FROM live_games WHERE id = ? AND ended_at IS NULL 
        `)

    const info = stmt.run(game_id)

    if (info.changes === 1) return { success: true }
    else return { success: false }
}

export async function checkUserForActiveSession(user_id: string) {
    const game_id = db
        .prepare(`
          SELECT id
          FROM live_games
          WHERE host_id = ?
            AND ended_at IS NULL
          LIMIT 1
        `)
        .get(user_id) as Template

    return game_id?.id || null
}

export async function checkIfGameIdExist(id: string) {
    const game = db.prepare(`
        SELECT id, host_id, persons
        FROM live_games
        WHERE id = ? AND ended_at IS NULL
        LIMIT 1
    `).get(id) as { id: string; host_id: string, clients: string } | undefined


    return game ?? null
}

export async function getTemplateFromGameId(game_id: string) {
    const template = db.prepare(`
        SELECT t.id, t.owner_id, t.name, t.persons, t.mode 
        FROM templates t
        JOIN live_games lg ON lg.template_id = t.id
        WHERE lg.id = ? AND lg.ended_at IS NULL
        LIMIT 1
    `).get(game_id) as { id: string, owner_id: string, name: string, persons: Person, mode: Mode } | undefined;

    return {
        ...template,
        persons: typeof template?.persons === "string"
            ? JSON.parse(template.persons)
            : template?.persons
    } as Template
}

export async function setGamePhase(game_phase: GamePhase, game_id: string) {
    try {
        if (game_phase === "finished") {
            return db.prepare(`
                UPDATE live_games 
                SET phase = ?, ended_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `).run(game_phase, game_id);
        }


        return db.prepare(`
            UPDATE live_games SET phase = ? WHERE id = ?
        `).run(game_phase, game_id);

    } catch (error) {
        console.error("Failed to update game phase:", error);
        return false
    }
}

export async function updateLiveGame(game_id: string, personList: Person[]) {
    try {
        if (!game_id || !personList) return null

        const stmt = db.prepare(`
                UPDATE live_games
                SET persons = ?
                WHERE ended_at IS  NULL
            `)

        const info = stmt.run(JSON.stringify(personList))

        if (info.changes === 1) {
            console.log(info.changes)
            return true
        }
        else return null
    } catch (err) {
        console.error("game-manager updateLiveGame: ", err)
        return null
    }
}