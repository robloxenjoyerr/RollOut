"use client"

import { redirect, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { apiFetch } from "../lib/api"
import { GamePhase, Template } from "../lib/types"
import { useAuth } from "../hooks/useAuth"
import { useSocket } from "../hooks/useSocket"
import { useToasts } from "../hooks/useToasts"

import Button from "./Button"
import ToastContainer from "./ToastContainer"
import { span } from "framer-motion/client"

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
    const { token } = useAuth()
    const [currentPhase, setCurrentPhase] = useState<GamePhase>(game_phase);
    const [currentGameTemplate, setCurrentGameTemplate] = useState<Template>(game_template)
    const router = useRouter()
    const [currentRolled, setCurrentRolled] = useState(null)
    const [clients, setClients] = useState<Client[]>([]) // Initialize with an empty array

    useEffect(() => {
        if (!socket) return

        // --- Event Handlers ---
        // It's good practice to define handlers outside the listener setup
        // so they can be easily referenced for removal.
        const onConnect = () => {
            console.log("Connected to GameID: ", game_id, "with socketID: ", socket.id)
            setCurrentPhase({phase: game_phase.phase})
            socket.emit("joinGame", { game_id, socket_id: socket.id })
        }

        const onPlayerJoined = (data: { current_clients: Client[] }) => {
            setClients(data.current_clients || [])
            addToast("New Client connected!", "info")
        }

        const onPlayerDisconnected = (data: { socket_id: string, current_clients: Client[] }) => {
            addToast(`Client with ID: ${data.socket_id} disconnected.`, "info")
            setClients(data.current_clients || [])
        }

        const onGameStarted = () => {
            addToast("Game has started!", "success")
            setCurrentPhase({phase: "in-progress"})
            console.log("persons: ", currentGameTemplate.persons)
            // Potentially update game phase state here if needed
        }

        const onGameStartError = () => {
            addToast("Error starting the game.", "error")
        }

        const onGameEnded = () => {
            addToast("Game ended.", "info")
            router.push('/host')
        }

        const onNextRolled = (data: any) => {
            const {person} = data
            console.log(person)
            setCurrentRolled(person)
        }

        // --- Registering Listeners ---
        socket.on("connect", onConnect)
        socket.on("playerJoined", onPlayerJoined)
        socket.on("playerDisconnected", onPlayerDisconnected)
        socket.on("gameStarted", onGameStarted)
        socket.on("gameStartError", onGameStartError)
        socket.on("gameEnded", onGameEnded)
        socket.on("nextRolled", onNextRolled)

        // --- CRITICAL: Cleanup Function ---
        // This function runs when the component unmounts or dependencies change.
        // It's crucial to remove ALL listeners to prevent memory leaks.
        return () => {
            console.log("Cleaning up socket listeners...")
            socket.off("connect", onConnect)
            socket.off("playerJoined", onPlayerJoined)
            socket.off("playerDisconnected", onPlayerDisconnected)
            socket.off("gameStarted", onGameStarted)
            socket.off("gameStartError", onGameStartError)
            socket.off("gameEnded", onGameEnded)
        }
        // The dependency array should only include values that, when changed,
        // require the effect to be re-run.
    }, [socket, game_id, addToast, router, game_phase])

    async function stopGame() {
        const res = await apiFetch("/api/game/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: game_id }),
            redirectAuth: false
        })

        if (res.success && socket) {
            socket.emit("stopGame", { game_id })
            addToast("Game stopped", "info")


            socket.on("gameEnded", () => {
                console.log("ENDD")
                router.push("/host")
            })
        }
    }

    async function startGame() {
        if (!socket) return
        socket.emit("startGame", { game_id, token })
    }

    async function rollNext() {
        socket?.emit("rollNext", {game_id})
    }
    if (!currentPhase) redirect(`/game/${game_id}`)

    if (currentPhase.phase === "waiting-lobby") {

        return (
            <div>
                {/* AnimatePresence is only needed for components that will be removed from the DOM */}
                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>

                <div className="flex flex-col gap-10 absolute top-25 left-45 ">
                    <div className="flex flex-col">
                        <span className="text-black font-bold text-7xl select-none ">Game Lobby</span>
                        <span className="text-gray-500 font-light text-2xl select-none">
                            Clients currently connected - start whenever you're ready!
                        </span>
                    </div>

                    <div className="flex flex-row gap-4 flex-wrap">
                        {/* AnimatePresence correctly wraps the list of items that will be added/removed */}
                        <AnimatePresence>
                            {clients.map((client) => (
                                <motion.span
                                    className="text-black font-bold rounded-2xl border-2 border-black/20 p-3 select-none bg-black/5"
                                    key={client.socket_id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                >
                                    {`Client ID: ${client.socket_id}`}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="absolute bottom-5 left-5 flex gap-5">
                    <Button onClick={startGame}>Start Game</Button>
                    <Button onClick={stopGame}>Stop Game</Button>
                </div>
            </div>
        )
    }
    else if (currentPhase.phase === "in-progress") {
        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts}></ToastContainer>
                </AnimatePresence>
                <AnimatePresence>
                    <div className="flex flex-col gap-10 absolute top-25 left-45 ">
                        <div className="flex flex-col">
                            <span className="text-black font-bold text-7xl select-none ">Game is running!</span>
                        </div>
                        <div className="flex text-black flex-row gap-4 flex-wrap">
                            {Array.isArray(currentGameTemplate) && currentGameTemplate.persons.map((person)=> (
                                <span key={person.id} className="text-black">{person.name}</span>
                            ))}
                            <span className="text-black">{currentRolled}</span>
                        </div>
                    </div>
                </AnimatePresence>
                <div className="absolute bottom-5 left-5 flex gap-5">
                    <Button onClick={rollNext}>Roll Next</Button>
                    <Button onClick={stopGame}>Stop Game</Button>
                </div>
            </div >

        )
    }
    else {
        return (
            <div className="text-black">
                123123
            </div>
        )
    }
}

