"use client"
import { ToastType } from "../hooks/useToasts"
import { Client } from "../lib/types"
import { useRouter } from "next/navigation"
import { AnimatePresence, useScroll, useTime } from "framer-motion"
import ToastContainer from "./ToastContainer"
import Button from "./Button"
import { motion } from "framer-motion"
import Wheel from "./Wheel"
import useIsMobile from "../hooks/useIsMobile"
import { useEffect, useState } from "react"
import Overlay from "./Overlay"

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
    const [isAnimating, setIsAnimating] = useState<boolean>(false)
    const [isGameEnding, setIsGameEnding] = useState<boolean>(false)

    useEffect(() => {
        if (rollHistory && rollHistory?.length > 0) {
            setIsAnimating(true)
            setTimeout(() => {
                setIsAnimating(false)
            }, 3000)
        }
    }, [rollHistory])


    return <>

        <ToastContainer toasts={toasts} />
        <Overlay isOpen={isGameEnding} onClose={() => setIsGameEnding(false)}>
            <div className="flex flex-col gap-5">
                <span className="font-bold ">Do you really want to Stop?</span>
                <div className="flex gap-5 items-stretch">
                    <motion.button
                        onClick={onStopGame}
                        className="group relative hover:cursor-pointer px-8 py-4 rounded-xl font-bold text-lg text-white  overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-linear-to-r from-green-500 via-emerald-500 to-green-600 group-hover:from-green-400 group-hover:via-emerald-400 group-hover:to-green-500 transition-all duration-300" />
                        {/* Content */}
                        <div className="relative flex items-center gap-2 justify-center">
                            <span>Yes</span>
                        </div>
                        {/* Shadow */}
                        <div className="absolute inset-0 bg-black/20 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>
                    <motion.button
                        onClick={() => setIsGameEnding(false)}
                        className="group relative hover:cursor-pointer px-8 py-4 rounded-xl font-bold text-lg text-white  overflow-hidden"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {/* Background */}
                        <div className="absolute inset-0 bg-linear-to-r from-red-500 via-rose-500 to-red-600 group-hover:from-red-400 group-hover:via-rose-400 group-hover:to-red-500 transition-all duration-300" />
                        {/* Content */}
                        <div className="relative flex items-center gap-2 justify-center">
                            <span>No</span>
                        </div>
                        {/* Shadow */}
                        <div className="absolute inset-0 bg-black/20 rounded-xl blur-lg -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </motion.button>

                </div>
            </div>
        </Overlay>
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0] }}
                transition={{ duration: 8, repeat: Infinity }} />
            <motion.div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
                animate={{ x: [0, -50, 50, 0], y: [0, 50, -50, 0] }}
                transition={{ duration: 10, repeat: Infinity }} />
        </div>

        <div className="relative min-h-screen w-screen h-screen flex flex-col items-center px-4 py-4 gap-4 overflow-hidden">

            {/* Room Code */}
            <motion.span
                className="px-3 py-2 rounded-2xl hover:cursor-pointer transition-all duration-250 ease-in-out active:scale-90 hover:bg-green-500/20 hover:border-green-400/50 hover:text-green-300 mt-3 text-3xl md:text-5xl font-bold text-blue-300 bg-blue-500/20 border border-blue-400/50"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => { navigator.clipboard.writeText(roomCode); addToast("RoomCode copied!", "info") }}
            >
                {roomCode}
            </motion.span>
            <motion.span
                className="flex flex-col items-center gap-2 rounded-2xl border-2 p-2 select-none"
                animate={{
                    boxShadow: isAnimating
                        ? [
                            "0 0 0px rgba(96,165,250,0)",
                            "0 0 20px rgba(96,165,250,0.8)",
                            "0 0 0px rgba(96,165,250,0)"
                        ]
                        : "0 0 0px rgba(0,0,0,0)",
                    borderColor: isAnimating
                        ? [
                            "rgba(96,165,250,0.2)",
                            "rgba(96,165,250,1)",
                            "rgba(96,165,250,0.2)"
                        ]
                        : "rgba(255,255,255,0.1)"
                }}
                transition={{
                    duration: 1,
                    repeat: isAnimating ? Infinity : 0,
                    ease: "easeInOut"
                }}
            >
                <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400">Currently Rolled:</span>
                <span className="font-bold text-yellow-400  p-2 animate-pulse">{rollHistory && rollHistory.length > 0 ? rollHistory[rollHistory.length - 1]?.name : currentRolledClient?.name ?? "none"}</span>
            </motion.span>

            {/* Main area - responsiv */}

            {isMobile

                ?

                <div className="flex flex-col lg:flex-row w-full flex-1 min-h-0 px-2 lg:items-stretch lg:justify-between">

                    {/* Host Controls / Placeholder */}
                    <div className="lg:w-52 xl:w-64 shrink-0 flex justify-center">
                        {isHost ? (
                            <>
                                <span className="font-bold uppercase text-center self-center text-xs tracking-widest text-slate-400 hidden lg:block">Host Controls</span>
                                <Button disabled={isSpinning} onClick={onRollNext} className="bg-green-500  text-center hover:bg-green-400 h-10 text-sm">
                                    🎲 Roll Next
                                </Button>
                                <Button disabledTimer={3000} onClick={onToggleLateJoin} className="bg-indigo-500/30 border border-indigo-400/30 h-10 text-sm">
                                    🚪 Late Join
                                </Button>
                                <Button onClick={()=>setIsGameEnding(true)} className="bg-red-500/20 border border-red-400/30 text-red-300 h-10 text-sm">
                                    ⏹ Stop
                                </Button>
                            </>
                        ) : (
                            <div>
                            </div>

                        )}
                    </div>

                    {/* Wheel - Mitte */}
                    <div className="flex-1 flex flex-col items-center justify-center">
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
                        <div className="w-full max-w-[min(60vw,60vh)] aspect-square relative">
                            {isAnimating && (
                                <motion.div
                                    className="absolute inset-0 rounded-full pointer-events-none"
                                    initial={{ scale: 0.9, opacity: 0.8 }}
                                    animate={{ scale: 1.15, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        border: "4px solid rgba(250,204,21,0.8)"
                                    }}
                                />
                            )}

                            <Wheel clients={clients} rotation={rotation} />
                        </div>
                    </div>

                    {/* Roll History */}
                    <div className="lg:w-52 xl:w-64 shrink-0 ml-auto select-none">
                        <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400 select-none">Roll History</span>
                        <div className="flex-col-reverse gap-2 overflow-y-auto">
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
                    <div className="lg:w-52 xl:w-64 shrink-0">
                        {isHost && <>
                            <div className="flex flex-row lg:flex-col gap-2 lg:gap-3 lg:w-52 xl:w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4">
                                <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400 hidden lg:block">Host Controls</span>
                                <Button disabled={isSpinning} onClick={onRollNext} className="bg-green-500 hover:bg-green-400 h-10 text-sm">
                                    🎲 Roll Next
                                </Button>
                                <Button disabledTimer={3000} onClick={onToggleLateJoin} className="bg-indigo-500/30 border border-indigo-400/30 h-10 text-sm">
                                    🚪 Late Join
                                </Button>
                                <Button onClick={()=> setIsGameEnding(true)} className="bg-red-500/20 border border-red-400/30 text-red-300 h-10 text-sm">
                                    ⏹ Stop
                                </Button>
                            </div>
                        </>}
                    </div>

                    {/* Wheel - Mitte */}
                    <div className="flex flex-col items-center gap-2 flex-1 self-center w-fill h-fill">
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
                        <div className="w-fit aspect-square">
                            <Wheel clients={clients} rotation={rotation} />
                        </div>
                    </div>

                    {/* Roll History */}
                    <div className="flex-col flex gap-2 lg:gap-3 lg:w-52 xl:w-64 h-50 overflow-auto shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4 max-h-48 lg:max-h-96">
                        <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400">Roll History</span>
                        <div className="flex flex-col-reverse gap-2 overflow-y-auto">
                            <AnimatePresence>
                                {rollHistory && rollHistory.map((c, i) => (
                                    <motion.span
                                        key={c.clientId}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="text-white mr-2 text-center rounded-xl border bg-white/10 border-white/15 py-1.5 px-3 text-sm shrink-0"
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