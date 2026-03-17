"use client"
import { ToastType } from "../hooks/useToasts"
import { Client } from "../lib/types"
import { useRouter } from "next/navigation"
import { AnimatePresence } from "framer-motion"
import ToastContainer from "./ToastContainer"
import Button from "./Button"
import { motion } from "framer-motion"
import Wheel from "./Wheel"
import useIsMobile from "../hooks/useIsMobile"

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
    const isMobile = useIsMobile()

    console.log("GAME-IN-PROGRESS-VIEW")

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

        <div className="relative min-h-screen h-screen flex flex-col items-center px-4 py-4 gap-4 overflow-hidden">


            {/* Room Code */}
            <motion.span
                className="px-3 py-1.5 rounded-2xl cursor-pointer text-xl md:text-2xl font-bold text-blue-300 bg-blue-500/20 border border-blue-400/50 shrink-0"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => { navigator.clipboard.writeText(roomCode); addToast("RoomCode copied!", "info") }}
            >
                {roomCode}
            </motion.span>

            {/* Main area - responsiv */}

            {isMobile 
            
            ? 

             <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full flex-1 min-h-0 px-2">

                {/* Host Controls / Placeholder */}
                <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 lg:w-52 xl:w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4">
                    {isHost ? (
                        <>
                            <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400 hidden lg:block">Host Controls</span>
                            <Button disabled={isSpinning} onClick={onRollNext} className="bg-green-500 hover:bg-green-400 h-10 text-sm">
                                🎲 Roll Next
                            </Button>
                            <Button disabledTimer={3000} onClick={onToggleLateJoin} className="bg-indigo-500/30 border border-indigo-400/30 h-10 text-sm">
                                🚪 Late Join
                            </Button>
                            <Button onClick={onStopGame} className="bg-red-500/20 border border-red-400/30 text-red-300 h-10 text-sm">
                                ⏹ Stop
                            </Button>
                        </>
                    ) : (
                        <div>
                        </div>

                    )}
                </div>

                {/* Wheel - Mitte */}
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0 min-h-0">
                    <AnimatePresence mode="wait">
                        {currentRolledClient && (
                            <motion.div
                                key={currentRolledClient.clientId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-1 shrink-0"
                            >
                                <span className="text-slate-400 text-xs uppercase tracking-widest">Currently Rolling</span>
                                <span className="text-xl md:text-3xl font-black text-white">{currentRolledClient.name}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Wheel bekommt max-size damit es nicht überläuft */}
                    <div className="w-full max-w-[min(60vw,60vh)] aspect-square">
                        <Wheel clients={clients} rotation={rotation} />
                    </div>
                </div>

                {/* Roll History */}
                <div className="flex flex-col gap-2 lg:gap-3 lg:w-52 xl:w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4 max-h-48 lg:max-h-96">
                    <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400">Roll History</span>
                    <div className="flex flex-col gap-2 overflow-y-auto">
                        <AnimatePresence>
                            {rollHistory && rollHistory.map((c, i) => (
                                <motion.span
                                    key={c.clientId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="text-white text-center rounded-xl border bg-white/10 border-white/15 py-1.5 px-3 text-sm shrink-0"
                                >
                                    {i + 1}. {c.name}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        
            :

             <div className="flex flex-col lg:flex-row items-center justify-center gap-4 w-full flex-1 min-h-0 px-2">

                {/* Host Controls / Placeholder */}
                <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 lg:w-52 xl:w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4">
                    {isHost ? (
                        <>
                            <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400 hidden lg:block">Host Controls</span>
                            <Button disabled={isSpinning} onClick={onRollNext} className="bg-green-500 hover:bg-green-400 h-10 text-sm">
                                🎲 Roll Next
                            </Button>
                            <Button disabledTimer={3000} onClick={onToggleLateJoin} className="bg-indigo-500/30 border border-indigo-400/30 h-10 text-sm">
                                🚪 Late Join
                            </Button>
                            <Button onClick={onStopGame} className="bg-red-500/20 border border-red-400/30 text-red-300 h-10 text-sm">
                                ⏹ Stop
                            </Button>
                        </>
                    ) : (
                        <div>
                        </div>

                    )}
                </div>

                {/* Wheel - Mitte */}
                <div className="flex flex-col items-center gap-2 flex-1 min-w-0 min-h-0">
                    <AnimatePresence mode="wait">
                        {currentRolledClient && (
                            <motion.div
                                key={currentRolledClient.clientId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-1 shrink-0"
                            >
                                <span className="text-slate-400 text-xs uppercase tracking-widest">Currently Rolling</span>
                                <span className="text-xl md:text-3xl font-black text-white">{currentRolledClient.name}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Wheel bekommt max-size damit es nicht überläuft */}
                    <div className="w-full max-w-[min(60vw,60vh)] aspect-square">
                        <Wheel clients={clients} rotation={rotation} />
                    </div>
                </div>

                {/* Roll History */}
                <div className="flex flex-col gap-2 lg:gap-3 lg:w-52 xl:w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4 max-h-48 lg:max-h-96">
                    <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400">Roll History</span>
                    <div className="flex flex-col gap-2 overflow-y-auto">
                        <AnimatePresence>
                            {rollHistory && rollHistory.map((c, i) => (
                                <motion.span
                                    key={c.clientId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="text-white text-center rounded-xl border bg-white/10 border-white/15 py-1.5 px-3 text-sm shrink-0"
                                >
                                    {i + 1}. {c.name}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

            </div>
        }
        </div>
    </>
}