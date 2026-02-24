import { randomBytes } from "node:crypto"
import { GamePhase, Person, Mode } from "../services/db-actions.js"

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


