// export const Modes = [
//     "wheel",
//     "random",
//     "plinko",
//     "casino"
// ]

export type Mode = "wheel" | "random" | "plinko" | "casino"
export const Modes = [
    "random",
    "wheel",
    "plinko",
    "casino"
]
export type PersonState = "unrolled" | "rolled";
export type GamePhase = "unstarted" | "waiting-lobby" | "in-progress" | "finished";

export interface Client {
    clientId: string,
    name: string,
    isRolled: boolean,
    isHost: boolean,
    state: PersonState,
    socket_id: string,
    avatar?: string
}

