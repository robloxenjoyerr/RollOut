"use client"
import { redirect } from "next/navigation"
import { apiFetch } from "../lib/api"
import Button from "./Button"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"
import { AnimatePresence, motion } from "framer-motion"
import { useSocket } from "../hooks/useSocket"
import { useAuth } from "../hooks/useAuth"
import { useRouter } from "next/navigation"

interface GameHostViewProps {
    game_id: string
}

interface Client {
    socket_id: string
}


export default function GameHostView({ game_id }: GameHostViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id, isNormalClient: false })
    const [clients, setClients] = useState<Client[] | null>(null)
    const { token } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!socket) return

        socket.on("connect", () => {
            console.log("Connected to GameID: ", game_id, "with socketID: ", socket.id)
            socket.emit("joinGame", { game_id, socket_id: socket.id })

            socket.on("playerJoined", (data) => {
                const { socket_id, current_clients } = data;

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

            socket.on("gameStarted", () => {
                addToast("Rolling has started!", "success")
                return <GameHostView game_id={game_id} />
            })


            socket.on("gameStartError", ()=> {
                addToast("error", "error")
            })

            const handleGameEnded = () => {
                alert("Der Host hat das Spiel beendet.");
                router.push('/host');

            };
            socket.on("gameEnded", handleGameEnded)

            return () => {
                socket.off('gameEnded', handleGameEnded);
            };
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
            
            addToast("Game stopped", "info")
            router.push("/host")
        }
    }

    async function startGame() {
        if (!socket) return
        socket.emit("startGame", { game_id, token })

    }

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
                        <AnimatePresence>

                            {clients && clients.map((client, i) => (
                                <motion.span
                                    className="text-black font-bold rounded-2xl border-2 border-black/20 p-3 select-none bg-black/5"
                                    key={client.socket_id}
                                    exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                                    initial={{ opacity: 0, scale: 0.8 }} // Start-Zustand: Klein und unsichtbar
                                    viewport={{ once: false, margin: "-5px" }}  // Verhindert, dass die Animation jedes Mal neu triggert (optional)
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                    layout={true}
                                >
                                    {`Client ID: ${client.socket_id}`}
                                </motion.span>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </AnimatePresence>
            <div className="absolute bottom-5 left-5 flex gap-5">
                <Button onClick={startGame}>Start Game</Button>
                <Button onClick={stopGame}>Stop Game</Button>
            </div>

        </div>
    )
}


// FIX => Multiple Tabs as Host