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

interface GameClientViewProps {
    game_id: string
}

export default function GameClientView({ game_id }: GameClientViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket(game_id)

    useEffect(() => {
        const newSocket = io(process.env.NEXT_PUBLIC_API_URL)
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

    return (
        <div>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>
            <span className="text-red-600 font-bold text-3xl">This is the Game Client View</span>
        </div>
    )
}