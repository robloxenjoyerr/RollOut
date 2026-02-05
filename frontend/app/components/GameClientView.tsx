"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Loading from "./Loading"
import { useToasts } from "../hooks/useToasts"
import { useSocket } from "../hooks/useSocket"
import { GamePhase, Template } from "../lib/types"

import ToastContainer from "./ToastContainer"

interface GameClientViewProps {
    game_id: string
    game_phase: GamePhase
    game_template: Template
}

interface Client {
    socket_id: string
}

export default function GameClientView({ game_id, game_phase, game_template }: GameClientViewProps) {
    const { toasts, addToast } = useToasts()
    const { socket } = useSocket({ game_id })
    const router = useRouter()

    // Verwende den neuen Namen 'currentPhase', um Verwirrung zu vermeiden
    const [currentPhase, setCurrentPhase] = useState<GamePhase>(game_phase);
    const [clients, setClients] = useState<Client[]>([]); // Besser als null

    useEffect(() => {
        if (!socket) return

        // --- Event Handlers ---
        const onConnect = () => {
            console.log("Connected with socket ID:", socket.id);
            socket.emit("joinGame", { game_id, socket_id: socket.id });
            setCurrentPhase(game_phase)
            console.log(currentPhase)
        }
        

        const onPlayerJoined = () => {
            // Optional: Wenn du die Liste der Clients auch hier brauchst,
            // sollte der Server sie senden.
            addToast("Another client connected!", "info");
        }

        const onGameStarted = () => {
            addToast("The game has started!", "success");
            // WICHTIG: Aktualisiere den Zustand, um die Ansicht zu ändern!
            setCurrentPhase({phase: "in-progress"});
        }

        const onGameEnded = () => {
            addToast("Game ended", "info")
            console.log("ENDED")
            router.push('/join');
        };

        // --- Listener registrieren ---
        socket.on("connect", onConnect);
        socket.on("playerJoined", onPlayerJoined);
        socket.on("gameStarted", onGameStarted);
        socket.on("gameEnded", onGameEnded);

        // --- Kritische Cleanup-Funktion ---
        return () => {
            console.log("Cleaning up client listeners...");
            socket.off("connect", onConnect);
            socket.off("playerJoined", onPlayerJoined);
            socket.off("gameStarted", onGameStarted);
            socket.off("gameEnded", onGameEnded);
        };
    }, [socket, game_id, addToast, router, game_phase]); // router als Abhängigkeit hinzugefügt

    // --- JSX mit der korrekten Zustandsüberprüfung ---
    
    // Fall 1: Lobby-Ansicht
    if (currentPhase.phase === "waiting-lobby") {
        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>
                <div className="flex flex-col gap-10 absolute top-25 left-45 ">
                    <div className="flex flex-col">
                        <span className="text-black font-bold text-7xl select-none ">Game Lobby</span>
                        <span className="text-gray-500 font-light text-2xl select-none">Waiting for the host to start the game...</span>
                    </div>
                    {/* Die Client-Liste ist für den normalen Client vielleicht nicht relevant */}
                </div>
            </div>
        )
    }

    // Fall 2: Spiel läuft
    if (currentPhase.phase === "in-progress") {
        return (
            <div>
                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>
                <div className="flex flex-col gap-10 absolute top-25 left-45 ">
                    <div className="flex flex-col">
                        <span className="text-black font-bold text-7xl select-none ">Game is running!</span>
                    </div>
                    <div className="flex text-black flex-row gap-4 flex-wrap">
                        ...Next
                    </div>
                </div>
            </div>
        )
    }

    // Fallback für andere oder initiale Zustände
    return (
        <div className="text-black">
             ...Waiting
        </div>
    )
}
