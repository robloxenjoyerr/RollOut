"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { apiFetch } from "../lib/api"
import { GamePhase } from "../lib/types"
import { Person } from "../lib/types"
import { useSocket } from "../hooks/useSocket"
import { useToasts } from "../hooks/useToasts"

import Button from "./Button"
import ToastContainer from "./ToastContainer"
import Wheel from "./Wheel"
import Loading from "./Loading"

import { Client } from "../lib/types"

import { getClientIdFromCookie } from "../lib/services"

interface GameHostViewProps {
    roomCode: string
    clientId: string
    roomConfig: any
}


export default function GameHostView({ roomCode, clientId, roomConfig }: GameHostViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ roomCode, clientId })
    const router = useRouter()
    const [clients, setClients] = useState<Client[]>([])
    const [rotation, setRotation] = useState(0)
    const [pendingUpdate, setPendingUpdate] = useState<any>(null)
    const [currentPhase, setCurrentPhase] = useState<GamePhase>(roomConfig.status)
    const [currentRolled, setCurrentRolled] = useState<null | Person>(null)
    const [availablePersons, setAvailablePersons] = useState<any[]>([])
    const [isSpinning, setIsSpinning] = useState<boolean>(false)


    useEffect(() => {
        if (!socket) {
            console.log("[GameHostView] Socket not yet initialized, returning early")
            return
        }
        
        console.log("[GameHostView] Socket created. Waiting for connection. Socket ID:", socket.id, "Connected:", socket.connected)

        const onConnect = () => {
            console.log("[GameHostView] NOW CONNECTED! Socket ID:", socket.id)
            socket.emit("getGameState", roomCode)
        }

        const onGameStateUpdate = (data: any) => {
            const parsedPersons: Person[] = data.persons || []
            const unrolledPersons = parsedPersons.filter(p => p.state === "unrolled")

            setCurrentPhase(data.phase)
            setPendingUpdate(unrolledPersons)
            setAvailablePersons(parsedPersons)
        }

        const onClientJoined = (client: Client) => {
            setClients((prev) => [...prev, client])
            console.log(clients)
            addToast(`New Client ${client.name} has connected!`, "info")
        }

        const onClientDisconnected = (client: Client) => {
            addToast(`Client ${client.name} has disconnected.`, "info")
            setClients((prev) => prev.filter(c => c.clientId !== client.clientId))
        }

        const onGameStarted = (data: any) => {
            addToast("Game has started!", "success")
            console.log("New GamePhase: ", data.status)
            setCurrentPhase(data.status)
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
        socket.on("clientJoined", (data) => onClientJoined(data))
        socket.on("clientDisconnected", (data) => onClientDisconnected(data))
        socket.on("currentClients", (clientList: Client[]) => setClients(clientList))
        socket.on("gameStarted", (data) => onGameStarted(data))
        socket.on("gameStartError", onGameStartError)
        socket.on("nextRolled", onNextRolled)
        socket.on("allPersonsRolled", onAllRolled)

        console.log("[GameHostView] Socket listeners registered")


        //  runs when the component unmounts or dependencies change
        // removing ALL listeners to prevent memory leaks
        return () => {
            console.log("Cleaning up socket listeners...")
            socket.off("connect", onConnect)
            socket.off("gameStateUpdate", onGameStateUpdate)
            socket.off("clientJoined", onClientJoined)
            socket.off("clientDisconnected", onClientDisconnected)
            socket.off("currentClients")
            socket.off("gameStarted", onGameStarted)
            socket.off("gameStartError", onGameStartError)
            socket.off("nextRolled", onNextRolled)
            socket.off("allPersonsRolled", onAllRolled)
        }
        // The dependency array should only include values that when changed require the effect to be re-run.
    }, [socket, roomConfig, roomCode])


    const rollNext = () => {
        if (!socket || isSpinning) return
        setCurrentRolled(null)
        socket.emit("rollNext", { roomCode })
    }


    async function stopGame() {
        const res = await apiFetch("/api/game/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: roomCode }),
            redirectAuth: false
        })

        if (res.success && socket) {
            socket.emit("stopGame", { roomCode })
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
        socket.emit("startGame", { roomCode, clientId })
    }

    if (currentPhase === "waiting-lobby") {

        return (
            <div className="relative w-full h-screen overflow-hidden bg-linear-to-r from-slate-950 via-slate-900 to-slate-950">
                {/* Animated background gradient blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                        animate={{
                            x: [0, 50, -50, 0],
                            y: [0, -50, 50, 0],
                        }}
                        transition={{ duration: 8, repeat: Infinity }}
                    />
                    <motion.div
                        className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
                        animate={{
                            x: [0, -50, 50, 0],
                            y: [0, 50, -50, 0],
                        }}
                        transition={{ duration: 10, repeat: Infinity }}
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col h-screen">
                    {/* Header section */}
                    <motion.div
                        className="flex flex-col gap-3 pt-16 px-12"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="flex items-baseline gap-3">
                            <h1 className="text-7xl font-black bg-linear-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent select-none">
                                Waiting Lobby
                            </h1>
                            <motion.span
                                className="px-4 py-2 rounded-full text-xl items-center text-center justify-center font-bold text-blue-300 bg-blue-500/20 border border-blue-400/50 backdrop-blur-sm"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                {roomCode}
                            </motion.span>
                        </div>
                        <p className="text-lg text-slate-400 font-light tracking-wide">
                            Waiting for players to join. Ready to start whenever you are!
                        </p>
                    </motion.div>

                    {/* Main content - centered */}
                    <div className="flex-1 flex flex-col items-center justify-center px-12">
                        {/* Clients grid */}
                        <motion.div
                            className="mb-16 w-full max-w-4xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white/80 flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-linear-to-r from-green-400 to-blue-500"></span>
                                    Players Connected
                                    <span className="ml-auto text-base font-normal text-slate-400">
                                        {clients.length} {clients.length === 1 ? "player" : "players"}
                                    </span>
                                </h2>
                            </div>

                            {/* Clients display */}
                            <div className="min-h-32 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 p-8 shadow-2xl">
                                {clients.length === 0 ? (
                                    <motion.div
                                        className="flex flex-col items-center justify-center h-32 text-slate-400"
                                        animate={{ opacity: [0.6, 1, 0.6] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <div className="text-5xl mb-3">👥</div>
                                        <p className="text-lg font-medium">Waiting for the first player...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        className="flex flex-row gap-4 flex-wrap"
                                        layout
                                    >
                                        <AnimatePresence mode="popLayout">
                                            {clients.map((client, index) => (
                                                <motion.div
                                                    key={client.clientId}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.5, y: -20 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 200,
                                                        damping: 20,
                                                        delay: index * 0.05
                                                    }}
                                                    className={`group relative px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
                                                        client.isHost
                                                            ? "bg-linear-to-r from-violet-500/30 to-purple-500/30 border border-violet-400/50 text-violet-300 shadow-lg shadow-violet-500/20"
                                                            : "bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 text-green-300 shadow-lg shadow-green-500/20"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {client.isHost ? (
                                                            <>
                                                                <span className="text-lg">👑</span>
                                                                <span className="font-bold tracking-wide">HOST</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <motion.span
                                                                    className="inline-block text-lg"
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                >
                                                                    🎮
                                                                </motion.span>
                                                                <span className="select-none">{client.name}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom action buttons */}
                    <motion.div
                        className="pb-12 px-12 flex gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <motion.button
                            onClick={startGame}
                            className="group relative px-8 py-4 rounded-xl font-bold text-lg text-white overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Background gradient */}
                            <div className="absolute inset-0 bg-linear-to-r from-green-500 via-emerald-500 to-green-600 group-hover:from-green-400 group-hover:via-emerald-400 group-hover:to-green-500 transition-all duration-300" />
                            {/* Animated shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: [-100, 100] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ width: "200%" }}
                            />
                            {/* Content */}
                            <div className="relative flex items-center gap-2 justify-center">
                                <span className="text-xl">🎲</span>
                                <span>Start Game</span>
                            </div>
                            {/* Shadow */}
                            <div className="absolute inset-0 bg-black/20 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>

                        <motion.button
                            onClick={stopGame}
                            className="group relative px-8 py-4 rounded-xl font-bold text-lg text-white overflow-hidden"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Background */}
                            <div className="absolute inset-0 bg-linear-to-r from-red-500 via-rose-500 to-red-600 group-hover:from-red-400 group-hover:via-rose-400 group-hover:to-red-500 transition-all duration-300" />
                            {/* Content */}
                            <div className="relative flex items-center gap-2 justify-center">
                                <span className="text-xl">⏹️</span>
                                <span>Stop Game</span>
                            </div>
                            {/* Shadow */}
                            <div className="absolute inset-0 bg-black/20 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.button>
                    </motion.div>
                </div>

                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>
            </div>
        )
    }
    else if (currentPhase === "in-progress") {
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
            <div className="text-red-600">
                <Loading></Loading>
                {currentPhase}
            </div>
        )
    }
}

