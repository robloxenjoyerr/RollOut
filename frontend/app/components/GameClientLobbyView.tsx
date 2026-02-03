"use client"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"
import { AnimatePresence, motion } from "framer-motion"
import { useSocket } from "../hooks/useSocket"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"


interface GameClientViewProps {
    game_id: string
}


interface Client {
    socket_id: string
}


export default function GameClientView({ game_id }: GameClientViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id })
    const [clients, setClients] = useState<Client[] | null>(null)
    const router = useRouter()

    useEffect(() => {
        if (!socket) return

        socket.on("connect", () => {
            socket.emit("joinGame", { game_id, socket_id: socket.id })

            socket.on("playerJoined", () => {
                addToast("New Client connected!", "info")
            })

            socket.on("gameStarted", () => {
                addToast("Rolling has started!", "success")
            })

          
            const handleGameEnded = () => {
                router.push('/join');

            };
            socket.on("gameEnded", handleGameEnded)

            return () => {
                socket.off('game-ended', handleGameEnded);
            };
        })

    }, [socket, game_id, addToast])

    return (
        <div>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>
            <AnimatePresence>
                <div className="flex flex-col gap-10 absolute top-25 left-45 ">
                    <div className="flex flex-col">
                        <span className="text-black font-bold text-7xl select-none ">Game-Lobby</span>
                        <span className="text-gray-500 font-light text-2xl select-none">Clients currently connected in this game - start whenever your ready!</span>
                    </div>
                    <div className="flex flex-row gap-4 flex-wrap">
                        {clients && clients.map((client, i) => (
                            <motion.span
                                className="text-black font-bold rounded-2xl border-2 border-black/20 p-3 select-none bg-black/5"
                                key={client.socket_id}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 1.5 } }}
                                initial={{ opacity: 0, scale: 0.8 }} // Start-Zustand: Klein und unsichtbar
                                viewport={{ once: false, margin: "-5px" }}  // Verhindert, dass die Animation jedes Mal neu triggert (optional)
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                layout={true}

                            >
                                {`Client ID: ${client.socket_id}`}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </AnimatePresence>


        </div>
    )
}