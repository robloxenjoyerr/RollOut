export type Phase = "unstarted" | "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino" 
export const Modes = [
    "wheel",  
    "random", 
    "plinko",
    "casino"
]
export type PersonState = "unrolled" | "rolled";

export interface Person {
    id: string;
    name: string;
    state: PersonState;
    avatar?: string;
}



export interface Client {
    id: string,
    socket_id: string,
}

export interface Template {
    id: string
    owner_id: string
    name: string
    persons: Person[]
    mode: Mode
    state: Phase
}

export interface LiveGame {
    name: string,
    id: string,
    host_id: string,
    session_id: string, 
    phase: GamePhase,
    mode: Mode,
    clients: Client[],
    rolled: Person[],
    unrolled: Person[]
}

export type GamePhase = "unstarted" | "waiting" | "in-progress" | "finished";
