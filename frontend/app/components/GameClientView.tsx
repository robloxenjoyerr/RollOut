"use client"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"
import { AnimatePresence } from "framer-motion"
import { useSocket } from "../hooks/useSocket"
import { redirect } from "next/navigation"
import { GamePhase } from "../lib/types"
import { Client } from "../lib/types"
import { Template } from "../lib/types"
import { useRouter } from "next/navigation"

interface GameClientViewProps {
    game_id: string
    game_phase: GamePhase
    game_template: Template
}

export default function GameClientView({ game_id, game_phase, game_template }: GameClientViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id })
    const [clients, setClients] = useState<Client[] | null>(null)
    const [gameState, setGameState] = useState<GamePhase>(game_phase)
    const [gameTemplate, setGameTemplate] = useState<Template | null>(game_template)
    const [newPerson, setNewPerson] = useState("")
    const router = useRouter()

    useEffect(() => {
        if (!socket) return

        socket.on("connect", () => {
            console.log("dwadw", game_phase)
            socket.emit("joinGame", { game_id, socket_id: socket.id })
            console.log(game_phase)
            socket.on("playerJoined", (data) => {
                const { current_clients } = data
                if (current_clients) setClients(current_clients)
                addToast("New Client connected!", "info")
            })

            socket.on("gameStarted", async (data) => {
                const { template } = data
                setGameTemplate(template)
                setGameState("in-progress")
                addToast("Rolling has started!", "success")
            })

            socket.on("gameStopped", () => {
                console.log("SRTOPPED")
                router.push("/join")
            })

            socket.on("nextRolled", (data)=> {
                setNewPerson(data.person.name)
                console.log(newPerson)
            })
        })

    }, [socket, game_id, addToast])

    if (gameState === "waiting-lobby") {

        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts}></ToastContainer>
                </AnimatePresence>
                <div className="flex flex-col absolute top-25 left-45 ">
                    <span className="text-black font-bold text-7xl select-none ">Game-Lobby</span>
                    <span className="text-gray-500 font-light text-2xl select-none">Clients currently connected in this game - start whenever your ready!</span>
                </div>
                <div className="flex flex-row gap-4 ">
                    <div className="h-full w-full  flex-wrap items-start justify-self-start">
                        {clients && clients.map((client, i) => (
                            <span
                                className="text-black font-bold rounded-2xl border-2 border-black/20 p-3 select-none bg-black/5"
                                key={client.socket_id}
                            >
                                {`Client ID: ${client.socket_id}`}
                            </span>
                        ))}
                    </div>

                </div>
            </div>
        )
    }
    else if (gameState === "in-progress") {
        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts}></ToastContainer>
                </AnimatePresence>
                <div className="flex flex-col absolute top-25 left-45 ">
                    <span className="text-black font-bold text-7xl select-none ">Game is ongoing, See who gets picked!</span>
                </div>
                <div className="flex flex-col gap-1 ">
                    <div className="h-full w-fit flex flex-row gap-3 text-black  flex-wrap items-start justify-self-start">
                        <span className="text-black bg-black/20 w-fit p-2 rounded-2xl">Persons inside Pool:</span>
                        {gameTemplate && (typeof gameTemplate.persons === "string"
                            ? JSON.parse(gameTemplate.persons)
                            : gameTemplate.persons
                        ).map((person: any, i: number) => (
                            <span className="rounded-xl bg-black/20 p-1 m-1" key={i}>{`${person.name}`}</span>
                        ))}
                    </div>
                    <div className="text-black bg-black/20 w-fit p-2 rounded-2xl ">
                        Next Rolled: {newPerson}
                    </div>
                </div>
            </div>
        )
    }
    else {
        redirect(`/game/${game_id}`)
    }
}
