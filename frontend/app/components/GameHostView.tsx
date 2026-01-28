"use client"
import { redirect } from "next/navigation"
import { apiFetch } from "../lib/api"
import Button from "./Button"
import { io, Socket } from "socket.io-client"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import { useAuth } from "../hooks/useAuth"
import ToastContainer from "./ToastContainer"
import { AnimatePresence } from "framer-motion"

interface GameHostViewProps {
    game_id: string
}

export default function GameHostView({ game_id }: GameHostViewProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const { token } = useAuth()
    const { toasts, addToast } = useToasts()

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
            auth: {
                token: token
            }
        })
        setSocket(newSocket)

        newSocket.on("connect", () => {
            console.log("Connected to GameID: ", game_id, "with socketID: ", newSocket.id)
            newSocket.emit("joinGame", { game_id, socket_id: newSocket.id })

            newSocket.on("playerJoined", () => {
                addToast("New Client connected!", "info")
            })
        })

        return () => { newSocket.disconnect() }
    }, [game_id])
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

    return (
        <div>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>
            <span className="text-green-600 font-bold text-3xl">This is the Game Host View</span>
            <Button onClick={stopGame}>Stop Game</Button>
        </div>
    )
}