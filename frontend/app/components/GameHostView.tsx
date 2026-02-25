"use client"

import { redirect, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { apiFetch } from "../lib/api"
import { GamePhase, Template } from "../lib/types"
import { Person } from "../lib/types"
import { useAuth } from "../hooks/useAuth"
import { useSocket } from "../hooks/useSocket"
import { useToasts } from "../hooks/useToasts"

import Button from "./Button"
import ToastContainer from "./ToastContainer"
import Wheel from "./Wheel"
import Loading from "./Loading"

interface GameHostViewProps {
    game_id: string
    game_phase: GamePhase
}

interface Client {
    socket_id: string
}

export default function GameHostView({ game_id, game_phase }: GameHostViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id, isNormalClient: false })
    const { token } = useAuth()
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [rotation, setRotation] = useState(0)
    const [pendingUpdate, setPendingUpdate] = useState<any>(null)
    const [currentPhase, setCurrentPhase] = useState<GamePhase>(game_phase)
    const [currentRolled, setCurrentRolled] = useState<null | Person>(null)
    const [availablePersons, setAvailablePersons] = useState<any[]>([])
    const [isSpinning, setIsSpinning] = useState<boolean>(false)


    useEffect(() => {
        if (!socket) return

        const onConnect = () => {
            console.log("Connected to GameID: ", game_id, "with socketID: ", socket.id)
            socket.emit("getGameState", game_id)
            socket.emit("joinGame", { game_id, socket_id: socket.id })
        }

        const onGameStateUpdate = (data: any) => {
            const parsedPersons: Person[] = data.persons || []
            const unrolledPersons = parsedPersons.filter(p => p.state === "unrolled")

            setCurrentPhase({ phase: data.phase })
            setPendingUpdate(unrolledPersons)
            setAvailablePersons(parsedPersons)
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
            setCurrentPhase({ phase: "in-progress" })
        }

        const onGameStartError = () => {
            addToast("Error starting the game.", "error")
        }

        const onGameEnded = () => {
            addToast("Game ended.", "info")
            router.push('/host')
        }


        const onNextRolled = (data: any) => {
            const { unrolledPersons, nextRolled } = data

            const effectivePersons = pendingUpdate ? pendingUpdate : availablePersons

            const winnerIndex = effectivePersons.findIndex((p: Person) => p.id === nextRolled.id)

            if (winnerIndex !== -1) {
                setIsSpinning(true)
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
                    setIsSpinning(false);
                }, 4000);
            }

            setPendingUpdate(unrolledPersons.filter((p: any) => p.state === "unrolled"))
            setCurrentRolled(null)
            setTimeout(() => {
                setCurrentRolled(nextRolled)
            }, 3000)
        }

        const onAllRolled = (data: any) => {

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
                        stopGame().then(info => {
                            if (info) {
                                addToast("Game ended.", "info");
                                router.push('/host');
                            }
                        });
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
    }, [socket, game_id, addToast, router, game_phase, availablePersons, rotation])

    const rollNext = () => {
        if (!socket || isSpinning) return
        setCurrentRolled(null)
        socket.emit("rollNext", { game_id })
    }


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

            return true
        }
        else return null
    }

    async function startGame() {
        if (!socket) return
        socket.emit("startGame", { game_id, token })
    }

    if (!currentPhase) redirect(`/game/${game_id}`)

    if (currentPhase.phase === "waiting-lobby") {

        return (
            <div>
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
            <>
                <AnimatePresence>
                    <ToastContainer toasts={toasts}></ToastContainer>
                </AnimatePresence>
                <AnimatePresence>
                    <div className="flex flex-col gap-10 absolute items-center justify-center w-screen h-screen box-content overflow-hidden m-0 p-0">
                        <div className="flex flex-col">
                            <span className="text-black font-bold text-7xl select-none ">Game is running!</span>
                        </div>
                        <div className="flex text-black flex-row gap-4 flex-wrap">
                            {/* Wheel */}

                            <div className="flex flex-col items-center gap-10">
                                <Wheel persons={availablePersons} rotation={rotation} />
                            </div>
                        </div>
                    </div>
                </AnimatePresence>
                <div className="absolute bottom-5 left-5 flex gap-5">
                    <Button disabled={isSpinning} onClick={rollNext}>Roll Next</Button>
                    <Button onClick={stopGame}>Stop Game</Button>
                </div>
            </ >

        )
    }
    else {
        return (
            <div className="text-black">
                <Loading></Loading>
            </div>
        )
    }
}

