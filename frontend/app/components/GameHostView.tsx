"use client"
import { redirect } from "next/navigation"
import { apiFetch } from "../lib/api"
import Button from "./Button"
import { io, Socket } from "socket.io-client"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"
import { AnimatePresence } from "framer-motion"
import { useSocket } from "../hooks/useSocket"


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

    useEffect(() => {
        if (!socket) return

        socket.on("connect", () => {
            console.log("Connected to GameID: ", game_id, "with socketID: ", socket.id)
            socket.emit("joinGame", { game_id, socket_id: socket.id })

            socket.on("playerJoined", (data) => {
                const { socket_id, current_clients } = data; // Achte darauf, dass der Key mit dem Backend übereinstimmt!

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
            })
        })
    }, [socket, game_id, addToast, clients])



    async function stopGame() {
        const res = await apiFetch("/api/game/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ game_id: game_id })
        })

        if (res.success) {
            redirect("/host")
        }
    }

    async function startGame() {
        if (!socket) return
        socket.emit("startGame", { game_id })

    }

    return (
        <div>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>
            <div className="flex flex-col absolute top-25 left-45 ">
                <span className="text-black font-bold text-7xl select-none ">Game-Lobby</span>
                <span className="text-gray-500 font-light text-2xl select-none">Clients currently connected in this game - start whenever your ready!</span>
            </div>
            <div className="flex flex-row gap-4 ">
                <div className="h-full w-full  flex-wrap items-start justify-self-start">
                    {clients && clients.map((client, i) => (
                        <span
                            className="text-black font-bold rounded-2xl border-2 border-black/20 p-3 select-none bg-black/5"
                            key={client.socket_id}
                        >
                            {`Client ID: ${client.socket_id}`}
                        </span>
                    ))}
                </div>

            </div>
            <div className="absolute bottom-5 left-5 flex gap-5">
                <Button onClick={startGame}>Start Game</Button>
                <Button onClick={stopGame}>Stop Game</Button>
            </div>

        </div>
    )
}