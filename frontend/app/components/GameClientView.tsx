"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Loading from "./Loading"
import { useToasts } from "../hooks/useToasts"
import { useSocket } from "../hooks/useSocket"
import { GamePhase, Template } from "../lib/types"
import Wheel from "./Wheel"
import { Person } from "../lib/types"
import Cookies from "js-cookie"
import ToastContainer from "./ToastContainer"
import { Client } from "../lib/types"

interface GameClientViewProps {
    roomCode: string
    clientId: string
    roomConfig: any
}


export default function GameClientView({ roomCode, clientId, roomConfig }: GameClientViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ roomCode, clientId })
    const router = useRouter()
    const [rotation, setRotation] = useState(0);
    const [availablePersons, setAvailablePersons] = useState<any[]>([])
    const [currentPhase, setCurrentPhase] = useState<GamePhase>(roomConfig.status);
    const [clients, setClients] = useState<Client[]>([]);
    const [currentRolled, setCurrentRolled] = useState<any>(null);
    const [pendingUpdate, setPendingUpdate] = useState<any>(null);
    

    useEffect(() => {
        if (!socket) return

        const onConnect = () => {
            console.log("[GameClientView] Connected to GameID: ", roomCode, "with socketID: ", socket.id)
            socket.emit("getGameState", roomCode)
        }

        const onGameStateUpdate = (data: any) => {
            console.log("[GameClientView] onGameStateUpdate:", data)
            const parsedPersons: Person[] = data.persons || []
            const unrolledPersons = parsedPersons.filter(p => p.state === "unrolled")

            setCurrentPhase( data.phase )
            setPendingUpdate(unrolledPersons)
            setAvailablePersons(parsedPersons)
        }

        const onPlayerJoined = (data: { current_clients: Client[] }) => {
            console.log("[GameClientView] onPlayerJoined:", data)
            setClients(data.current_clients || [])
            addToast("New Client connected!", "info")
        }

        const onPlayerDisconnected = (data: { socket_id: string, current_clients: Client[] }) => {
            console.log("[GameClientView] onPlayerDisconnected:", data)
            addToast(`Client with ID: ${data.socket_id} disconnected.`, "info")
            setClients(data.current_clients || [])
        }

        const onGameStarted = () => {
            console.log("[GameClientView] onGameStarted received!")
            addToast("Game has started!", "success")
            setCurrentPhase("in-progress")
        }

        const onGameStartError = () => {
            console.log("[GameClientView] onGameStartError")
            addToast("Error starting the game.", "error")
        }

        const onGameEnded = () => {
            console.log("[GameClientView] onGameEnded")
            addToast("Game ended.", "info")
            router.push('/join')
        }


        const onNextRolled = (data: any) => {
            console.log("[GameClientView] onNextRolled:", data)
            const { unrolledPersons, nextRolled } = data

            const effectivePersons = pendingUpdate ? pendingUpdate : availablePersons

            const winnerIndex = effectivePersons.findIndex((p: Person) => p.id === nextRolled.id)

            if (winnerIndex !== -1) {
                const segmentAngle = 360 / effectivePersons.length
                const extraSpins = 360 * 5
                const currentNormalized = rotation % 360
                const targetAngle = 270 - (winnerIndex * segmentAngle) - (segmentAngle / 2)
                let diff = (targetAngle - currentNormalized)
                const finalRotation = rotation + extraSpins + (diff < 0 ? diff + 360 : diff)

                if (pendingUpdate) {
                    setAvailablePersons(pendingUpdate)
                }
                setRotation(finalRotation)

                setTimeout(() => {
                    // Und wir zeigen den Namen des Gewinners an.
                    setCurrentRolled(nextRolled);
                    // Erlaube den nächsten Klick
                }, 4000);
            }

            setPendingUpdate(unrolledPersons.filter((p: any) => p.state === "unrolled"))
            setCurrentRolled(null)
            setTimeout(() => {
                setCurrentRolled(nextRolled)
            }, 3000)
        }

        const onAllRolled = (data: any) => {
            console.log("[GameClientView] onAllRolled")

            setTimeout(() => {
                addToast("All persons have been rolled! Game is getting closed in 5 seconds.", "success")
                setCurrentRolled(null)

                let secondsLeft = 5
                const countdownInterval = setInterval(() => {
                    if (secondsLeft > 0) {
                        addToast(`Game closing in: ${secondsLeft}`, "info")
                    }

                    if (secondsLeft <= 0) {
                        clearInterval(countdownInterval);
                    }
                    secondsLeft--;
                }, 1000)

            }, 3000)
        }


        socket.on("connect", onConnect)
        socket.on("gameStateUpdate", onGameStateUpdate)
        socket.on("playerJoined", onPlayerJoined)
        socket.on("playerDisconnected", onPlayerDisconnected)
        socket.on("gameStarted", onGameStarted)
        socket.on("gameStartError", onGameStartError)
        socket.on("gameEnded", onGameEnded)
        socket.on("nextRolled", onNextRolled)
        socket.on("allPersonsRolled", onAllRolled)

        //  runs when the component unmounts or dependencies change
        // removing ALL listeners to prevent memory leaks
        return () => {
            console.log("Cleaning up socket listeners...")
            socket.off("connect", onConnect)
            socket.off("gameStateUpdate", onGameStateUpdate)
            socket.off("playerJoined", onPlayerJoined)
            socket.off("playerDisconnected", onPlayerDisconnected)
            socket.off("gameStarted", onGameStarted)
            socket.off("gameStartError", onGameStartError)
            socket.off("gameEnded", onGameEnded)
            socket.off("nextRolled", onNextRolled)
            socket.off("allPersonsRolled", onAllRolled)

        }
        // The dependency array should only include values that when changed require the effect to be re-run.
    }, [socket, roomCode, roomConfig])

    if (currentPhase === "waiting-lobby") {
        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>

                <div className="flex flex-col gap-10 absolute top-25 left-45 ">
                    <div className="flex flex-col">
                        <span className="text-black font-bold text-7xl select-none ">Game Lobby - {<span className="text-violet-500">{roomCode}</span>}</span>
                        <span className="text-gray-500 font-light text-2xl select-none">
                            Clients currently connected - start whenever you're ready!
                        </span>
                    </div>

                    <div className="flex flex-row gap-4 flex-wrap">
                        {/* AnimatePresence correctly wraps the list of items that will be added/removed */}
                        <AnimatePresence>
                            {clients.map((client) => (
                                <motion.span
                                    className={`${client.isHost ? "text-violet-400" : "text-green-400"} font-bold rounded-2xl border-2 ${client.isHost ? "border-violet-400/50" : "border-green-400/50"} p-3 select-none bg-black/5`}
                                    key={client.clientId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                >
                                    {`${client.isHost ? "HOST" : client.name}`}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        )
    }

    // Fall 2: Spiel läuft
    if (currentPhase === "in-progress") {
        return (
            <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>

                <div className="flex flex-col items-center gap-12">
                    <h1 className="text-black font-bold text-6xl select-none">
                        Game has Started!
                    </h1>

                    {/* Das Rad */}
                    <div className="flex flex-col items-center gap-10">
                        <Wheel persons={availablePersons} rotation={rotation} />

                        <div className="h-24">
                            <AnimatePresence mode="wait">
                                {currentRolled && (
                                    <motion.div
                                        key={currentRolled.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.2, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="text-4xl font-black text-black bg-yellow-400 p-6 rounded-2xl shadow-2xl border-4 "
                                    >
                                        🎉 {currentRolled.name}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="text-red-500">
            ERROR
        </div>
    )
}
