"use client"
import { ToastType } from "../hooks/useToasts"
import { Client } from "../lib/types"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import ToastContainer from "./ToastContainer"
import Button from "./Button"
import { motion } from "framer-motion"
import Wheel from "./Wheel"
import { useEffect } from "react"

interface GameInProgressProps {
    clients: Client[] | null
    mode: string
    roomCode: string
    rotation: number
    currentRolledClient: Client | null
    rollHistory: Client[] | null
    isHost: boolean
    clientId: string
    isSpinning: boolean
    toasts: any,
    addToast: (message: string, type: ToastType) => void
    onRollNext: () => void
    onStopGame: () => void
    onToggleLateJoin: () => void
}

export default function GameInProgress({ clients, toasts, addToast, mode, roomCode, rotation, rollHistory, currentRolledClient, isHost, clientId, isSpinning, onRollNext, onStopGame, onToggleLateJoin }: GameInProgressProps) {
    const router = useRouter()

    console.log("GAME-IN-PROGRESS-VIEW")

    useEffect(()=> {
        console.log(currentRolledClient)
    }, [currentRolledClient])

    return <>
        <ToastContainer toasts={toasts} />

        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
                transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
                animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
                transition={{ duration: 10, repeat: Infinity }} />
        </div>

        <div className="relative min-h-screen flex flex-col items-center px-4 py-6 gap-15 ">

            {/* Header */}
            <h1 className="text-4xl md:text-7xl font-black bg-linear-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent select-none text-center">
                Game is running!
            </h1>

            {/* Room Code */}
            <motion.span
                className="px-4 py-2 rounded-2xl cursor-pointer text-2xl md:text-4xl font-bold text-blue-300 bg-blue-500/20 border border-blue-400/50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => { navigator.clipboard.writeText(roomCode); addToast("RoomCode copied!", "info") }}
            >
                {roomCode}
            </motion.span>

            {/* Main area - Wheel + Sidebars */}
            <div className="flex flex-row items-center justify-between gap-35 w-full max-w-7xl px-4">

                {/* Host Controls - links | Platzhalter wenn kein Host */}
                {isHost ? (
                    <div className="flex flex-col gap-3 w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-4">
                        <span className="font-bold uppercase self-center text-sm tracking-widest text-slate-400">Host Controls</span>
                        <div className="flex flex-col gap-3">
                            <Button disabled={isSpinning} onClick={onRollNext} className="bg-green-500 hover:bg-green-400 h-12">
                                🎲 Roll Next
                            </Button>
                            <Button disabledTimer={3000} onClick={onToggleLateJoin} className="bg-indigo-500/30 border border-indigo-400/30">
                                🚪 Toggle Late Join
                            </Button>
                            <Button onClick={onStopGame} className="bg-red-500/20 border border-red-400/30 text-red-300">
                                ⏹ Stop Game
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="w-64 shrink-0" />
                )}

                {/* Wheel - Mitte */}
                <div className="flex flex-col items-center gap-4 flex-1">
                    <AnimatePresence mode="wait">
                        {currentRolledClient && (
                            <motion.div
                                key={currentRolledClient.clientId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <span className="text-slate-400 text-xs uppercase tracking-widest">Currently Rolling</span>
                                <span className="text-3xl font-black text-white">{currentRolledClient.name}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <Wheel clients={clients} rotation={rotation} />
                </div>

                {/* Roll History - rechts */}
                <div className="flex flex-col gap-3 w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-4">
                    <span className="font-bold uppercase self-center text-sm tracking-widest text-slate-400">Roll History</span>
                    <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
                        <AnimatePresence>
                            {rollHistory && rollHistory.map((c, i) => (
                                <motion.span
                                    key={c.clientId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`text-white text-center rounded-xl border ${currentRolledClient?.clientId === c.clientId ? "bg-yellow-400/50" : "bg-white/10"} border-white/15 py-2 px-3`}
                                >
                                    {i + 1}. {c.name}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        </div>
    </>
}