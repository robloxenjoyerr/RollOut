import { randomBytes } from "node:crypto"
import { GamePhase, Person, Mode, Template } from "../services/db-actions"
import { db } from "../db/database"
import { idFromToken } from "./services"

interface Client {
    id: string,
    socket_id: string,
}

export interface LiveGame {
    id: string,
    name: string,
    host_id: string,
    session_id: string,
    phase: GamePhase,
    mode: Mode,
    clients: Client[],
    rolled: Person[],
    unrolled: Person[]
}


export async function getLiveGames() {
    return db.prepare(`
            SELECT * FROM live_games WHERE ended_at IS NULL ORDER BY created_at DESC
        `).all()
}

export async function startGame(template: Template, user_id: string) {


    const session_id = randomBytes(8).toString("hex")
    const game_id = randomBytes(8).toString("hex")

    const stmt = db.prepare(`
        INSERT INTO live_games (id, name, host_id, session_id, phase, template_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `)

    stmt.run(game_id, template.name, user_id, session_id, "waiting-lobby", template.id, Date.now())

    return { success: true, game_id: game_id, session_id: session_id }
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
        SELECT id, host_id
        FROM live_games
        WHERE id = ? AND ended_at IS NULL
        LIMIT 1
    `).get(id) as { id: string; host_id: string } | undefined


    return game ?? null
}

export async function getTemplateFromGameId(game_id: string) {
    const template = db.prepare(`
        SELECT t.id, t.owner_id, t.name, t.persons, t.mode 
        FROM templates t
        JOIN live_games lg ON lg.template_id = t.id
        WHERE lg.id = ? AND lg.ended_at IS NULL
        LIMIT 1
    `).get(game_id) as { id: string, owner_id: string, name: string, persons: string, mode: Mode } | undefined;

    return template || null;
}

export async function getGamePhaseFromLiveGame(game_id: string){
    const info = await checkIfGameIdExist(game_id)
    if(!info) return null
    const game_phase = db.prepare(`
            SELECT phase FROM live_games WHERE id = ? AND ended_at IS NULL LIMIT 1
        `).get(info.id) as {game_phase: GamePhase}

    if(!game_phase) return null
    return game_phase
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
        return true
    } catch (error) {
        console.error("Failed to update game phase:", error);
        return false
        throw error;
    }
}