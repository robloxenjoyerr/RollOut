import { randomBytes } from "node:crypto"
import { GamePhase, Person, Mode, Template } from "../services/db-actions"
import { db } from "../db/database"

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
        INSERT INTO live_games (id, name, host_id, session_id, phase, mode, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `)

    stmt.run(game_id, template.name, user_id, session_id, "waiting-lobby", template.mode, Date.now())

    return { success: true, game_id: game_id, session_id: session_id }
}

export async function stopGame(){
    
}

export async function checkUserForActiveSession(user_id: string){
    const game = db
        .prepare(`
          SELECT *
          FROM live_games
          WHERE host_id = ?
            AND ended_at IS NULL
          LIMIT 1
        `)
        .get(user_id) as Template

    console.log("GAME: ", game)

    return game.id || null
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
