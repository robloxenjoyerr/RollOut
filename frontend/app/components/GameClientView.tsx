"use client"
import { redirect } from "next/navigation"
import { apiFetch } from "../lib/api"
import Button from "./Button"
import { io, Socket } from "socket.io-client"
import { useState, useEffect } from "react"
import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"
import { AnimatePresence, isCSSVariableToken } from "framer-motion"
import { useSocket } from "../hooks/useSocket"

interface GameClientViewProps {
    game_id: string
}

export default function GameClientView({ game_id }: GameClientViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id })

    useEffect(()=> {
        if(!socket) return

        socket.on("connect", () => {
            socket.emit("joinGame", { game_id, socket_id: socket.id })

            socket.on("playerJoined", () => {
                addToast("New Client connected!", "info")
            })

            socket.on("gameStarted", () => {
                addToast("Rolling has started!", "success")
            })
        })

    }, [socket, game_id, addToast])

    return (
        <div>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>
            <span className="text-red-600 font-bold text-3xl">This is the Game Client View</span>
        </div>
    )
}