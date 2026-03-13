import { Client } from "../lib/types"
import { ToastType, useToasts } from "../hooks/useToasts"
import { motion, AnimatePresence } from "framer-motion"
import ToastContainer from "./ToastContainer"
import Overlay from "./Overlay"
import { useState } from "react"
import Button from "./Button"

interface WaitingLobbyProps {

    clients: Client[] | null
    isHost: boolean
    toasts: any
    roomCode: string
    roomName: string
    addToast: (message: string, type: ToastType) => void
    onStartGame: () => void
    onStopGame: () => void
}


export default function WaitingLobby({ clients = [], isHost = false, roomCode = "", roomName, onStartGame, onStopGame, toasts, addToast }: WaitingLobbyProps) {
    const [isGameEnding, setIsGameEnding] = useState<boolean>(false)
    console.log("WAITING-LOBBY-SCREEN")
    console.log(roomName)
    return <>
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



        <div className="relative w-full h-screen overflow-hidden ">
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
            <div className="relative z-10 flex flex-col h-screen select-none">
                {/* Header section */}
                <motion.div
                    className="flex flex-col items-center gap-2 md:mt-10 text-center px-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl md:text-7xl font-black bg-linear-to-r from-red-400 via-green-200 to-indigo-300 bg-clip-text text-transparent">
                        {roomName}
                    </h1>
                    <h2 className="text-3xl md:text-6xl font-black bg-linear-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent">
                        Waiting Lobby
                    </h2>
                    <p className="text-sm md:text-lg text-slate-400 font-light tracking-wide">
                        Waiting for Clients to join. Ready to start whenever you are!
                    </p>
                    <motion.span
                        className="px-4 py-2 rounded-2xl hover:cursor-pointer transition-all duration-250 ease-in-out active:scale-90 hover:bg-green-500/20 hover:border-green-400/50 hover:text-green-300 mt-3 text-3xl md:text-5xl font-bold text-blue-300 bg-blue-500/20 border border-blue-400/50"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        onClick={() => { navigator.clipboard.writeText(roomCode); addToast("RoomCode copied!", "info") }}
                    >
                        {roomCode}
                    </motion.span>
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
                                Clients Connected
                                <span className="ml-auto text-base font-normal text-slate-400">
                                    {clients && clients.length} {clients && clients.length === 1 ? <span className="font-bold">client</span> : <span className="font-bold">clients</span>}
                                </span>
                            </h2>
                        </div>

                        {/* Clients display */}
                        <div className="min-h-32 rounded-2xl backdrop-blur-xl bg-white/5 transition-all ease-in-out border border-white/10 p-8 shadow-2xl">
                            {clients && clients.length === 0 ? (
                                <motion.div
                                    layout
                                    key="empty"
                                    className="flex flex-col items-center justify-center h-32 text-slate-400"
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                >
                                    <div className="text-5xl mb-3">👥</div>
                                    <p className="text-lg font-medium">Waiting for the first Client...</p>
                                </motion.div>
                            ) : (
                                <motion.div

                                    key="clients"
                                    className="flex flex-row gap-4 flex-wrap"
                                    layout
                                >
                                    <AnimatePresence mode="popLayout">
                                        {clients && clients.map((client, index) => (
                                            <motion.div
                                                key={client.clientId}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.5, y: -20 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 2500,
                                                    damping: 150,
                                                    delay: index * 0.05
                                                }}
                                                className={`group relative px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 ${client.isHost
                                                    ? "bg-linear-to-r from-violet-500/30 to-purple-500/30 border border-violet-400/50 text-violet-300 shadow-lg shadow-violet-500/20"
                                                    : "bg-linear-to-r from-green-500/20 to-emerald-500/20 border border-green-400/50 text-green-300 shadow-lg shadow-green-500/20"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <>
                                                        <motion.span
                                                            className="inline-block text-lg"
                                                            animate={{ scale: [1, 1.2, 1] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                        <span className="select-none">{client.name}</span>
                                                    </>
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
                {isHost &&
                    <motion.div
                        className="mt-auto pb-8 flex gap-4 justify-center flex-wrap px-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <motion.button
                            onClick={onStartGame}
                            className="group relative hover:cursor-pointer px-8 py-4 rounded-xl font-bold text-lg text-white overflow-hidden"
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
                            onClick={() => setIsGameEnding(true)}
                            className="group hover:cursor-pointer relative px-8 py-4 rounded-xl font-bold text-lg text-white  overflow-hidden"
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
                }
            </div>
            <AnimatePresence>
                <ToastContainer toasts={toasts} />
            </AnimatePresence>
        </div>
    </>






}