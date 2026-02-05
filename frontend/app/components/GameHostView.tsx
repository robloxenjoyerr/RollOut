"use client"
import { redirect } from "next/navigation"
import { apiFetch } from "../lib/api"
import Button from "./Button"
import { io, Socket } from "socket.io-client"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"
import { AnimatePresence } from "framer-motion"
import { useSocket } from "../hooks/useSocket"
import { GamePhase } from "../lib/types"
import { Template } from "../lib/types"

interface GameHostViewProps {
    game_id: string
    game_phase: GamePhase
    game_template: Template
}

interface Client {
    socket_id: string
}


export default function GameHostView({ game_id, game_phase, game_template }: GameHostViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id, isNormalClient: false })
    const [clients, setClients] = useState<Client[] | null>(null)
    const [gameState, setGameState] = useState<GamePhase | string>(game_phase)
    const [gameTemplate, setGameTemplate] = useState<Template | null>(game_template)
    const [newPerson, setNewPerson] = useState("")


    console.log("PHASE: ", gameState)
    useEffect(() => {
        if (!socket) return

        socket.on("connect", () => {
            console.log("Connected to GameID: ", game_id, "with socketID: ", socket.id)
            console.log(gameTemplate)
            socket.emit("joinGame", { game_id, socket_id: socket.id })

            socket.on("playerJoined", (data) => {
                const { socket_id, current_clients } = data; // Achte darauf, dass der Key mit dem Backend übereinstimmt

                if (current_clients) {
                    {
                        setClients(current_clients)
                    }
                }

                addToast("New Client connected!", "info");
            });

            socket.on("playerDisconnected", (data) => {
                const { socket_id, current_clients } = data

                addToast(`Client with ID: ${socket_id} disconnected.`, "info")
                setClients(current_clients)
            })

            socket.on("gameStarted", (data) => {
                const { template } = data
                setGameTemplate(template)
                setGameState("in-progress")
                addToast("Rolling has started!", "success")
                addToast(`Game Name: ${template.name}`, "info")
            })

            socket.on("nextRolled", (data) => {
                setNewPerson(data.person.name)
                console.log(newPerson)
            })
        })
    }, [socket, game_id, addToast, clients])



    async function stopGame() {
        const res = await apiFetch("/api/game/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: game_id }),
            redirectAuth: false
        })

        if (res.success) {
            if (socket) socket.emit("stopGame", { game_id, socket_id: socket.id })

            redirect("/host")
        }
    }

    async function rollNext() {
        if (!socket || !gameTemplate) return
        console.log("rolling")
        const personsArray = typeof gameTemplate.persons === "string"
            ? JSON.parse(gameTemplate.persons)
            : gameTemplate.persons;

        socket.emit("rollNext", {
            game_id: game_id,
            persons: personsArray
        });
    }

    async function startGame() {
        if (!socket) return
        socket.emit("startGame", { game_id })

    }

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
                <div className="absolute bottom-5 left-5 flex gap-5">
                    <Button onClick={startGame}>Start Game</Button>
                    <Button onClick={stopGame}>Stop Game</Button>
                </div>

            </div>
        )
    }
    else if (game_phase === "in-progress") {
        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts}></ToastContainer>
                </AnimatePresence>
                <div className="flex flex-col absolute top-25 left-45 ">
                    <span className="text-black font-bold text-7xl select-none ">Game is ongoing, See who gets picked!</span>
                </div>
                <div className="flex flex-row gap-4 ">
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
                <div className="absolute bottom-5 left-5 flex gap-5">
                    <Button onClick={rollNext}>Roll Next</Button>
                    <Button onClick={stopGame}>Stop Game</Button>
                </div>
            </div>
        )
    }
    else {
        redirect(`/game/${game_id}`)
    }
}