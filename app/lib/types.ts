export type Phase = "unstarted" | "waiting-lobby" | "in-progress" | "finished";
export type Mode = "random" | "wheel" | "plinko" | "casino";
export type PersonState = "unrolled" | "rolled";


export interface Person {
    id: string;
    name: string;
    state: PersonState;
    avatar?: string;
}

export interface Template {
    id: string
    owner_id: string
    name: string
    persons: Person[]
    mode: Mode
    state: Phase
}