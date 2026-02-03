import { randomBytes } from "node:crypto"
import { GamePhase, Person, Mode, Template } from "../services/db-actions"
import { db } from "../db/database"

interface Client {
    id: string,
    socket_id: string,
    host: boolean
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

    const initialClients = JSON.stringify([])
    const session_id = randomBytes(8).toString("hex")
    const game_id = randomBytes(8).toString("hex")

    const stmt = db.prepare(`
        INSERT INTO live_games (id, name, host_id, session_id, clients, phase, mode, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `)

    stmt.run(game_id, template.name, user_id, session_id, initialClients, "waiting-lobby", template.mode, Date.now())

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
        SELECT id, host_id, clients
        FROM live_games
        WHERE id = ? AND ended_at IS NULL
        LIMIT 1
    `).get(id) as { id: string; host_id: string, clients: string } | undefined


    return game ?? null
}

export async function addClientToGame(newClient: Client, game_id: string): Promise<{success: boolean, error?: string}> {
    try {
        const game = db.prepare(`
                SELECT clients, host_id 
                FROM live_games
                WHERE id = ? AND ended_at IS NULL
            `).get(game_id) as { clients: string; host_id: string } | undefined;
    
        if(!game) {
            return {success:false, error: "Game not found! Game-Manager"}
        }

        if (game.host_id === newClient.id) {
            return { success: false, error: "Host cannot join their own game as a client." };
        }
    
        const clientsArr: Client[] = JSON.parse(game.clients || '[]');
        const clientExists = clientsArr.some(client => client.id === newClient.id);
        
        if(clientExists){
            console.log("Client already in Game!");
            return{success: true}
        }
        
        clientsArr.push(newClient);
        
        const newClientsJson = JSON.stringify(clientsArr);
        const updateStmt = db.prepare(`
                UPDATE live_games
                SET clients = ?
                WHERE id = ?
            `);
        
        const info = updateStmt.run(newClientsJson, game_id);
        
        if(info.changes === 1){
            return{success: true}
        } else {
            return{success: false, error: "Failed to update game."}
        }

    } catch(err){
        console.error("addClientToGame Error:", err); // Logge den echten Fehler!
        return{success: false, error: "An unexpected error occurred."}
    }
}