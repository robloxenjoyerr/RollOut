"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import Loading from "./Loading"
import { useToasts } from "../hooks/useToasts"
import { useSocket } from "../hooks/useSocket"
import { GamePhase, Template } from "../lib/types"
import Wheel from "./Wheel"

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
    const [rotation, setRotation] = useState(0);
const [availablePersons, setAvailablePersons] = useState<any[]>(
    game_template.persons?.filter((p: any) => p.state === "unrolled") || []
);    const [currentPhase, setCurrentPhase] = useState<GamePhase>(game_phase);
    const [clients, setClients] = useState<Client[]>([]);
    const [currentRolled, setCurrentRolled] = useState<any>(null);
    const [pendingUpdate, setPendingUpdate] = useState<any>(null);
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
            setCurrentPhase({ phase: "in-progress" });
        }

        const onGameEnded = () => {
            addToast("Game ended", "info")
            console.log("ENDED")
            router.push('/join');
        };

        const onNextRolled = (data: any) => {
            const { unrolledPersons, nextRolled } = data;

            // 1. Wir bestimmen die Liste, mit der das Rad JETZT gleich rendern wird
            // Wenn wir ein pendingUpdate haben, ist das die neue Basis, sonst die aktuelle Liste.
            const effectivePersons = pendingUpdate ? pendingUpdate : availablePersons;

            // 2. Wir berechnen den Index auf der EFFEKTIVEN Liste
            const winnerIndex = effectivePersons.findIndex((p: any) => p.id === nextRolled.id);

            if (winnerIndex !== -1) {
                const segmentAngle = 360 / effectivePersons.length;
                const extraSpins = 360 * 5;
                const currentNormalized = rotation % 360;

                // Berechnung basierend auf der Liste, die gleich angezeigt wird
                const targetAngle = 270 - (winnerIndex * segmentAngle) - (segmentAngle / 2);

                let diff = (targetAngle - currentNormalized);
                const finalRotation = rotation + extraSpins + (diff < 0 ? diff + 360 : diff);

                // 3. Zuerst die Segmente aktualisieren, DAMIT das Rad die richtige Geometrie hat
                if (pendingUpdate) {
                    setAvailablePersons(pendingUpdate);
                }

                // 4. Dann die Rotation setzen
                setRotation(finalRotation);
            }

            // 5. Den Stand für das NÄCHSTE Mal im Hintergrund parken
            setPendingUpdate(unrolledPersons.filter((p: any) => p.state === "unrolled"));

            setCurrentRolled(null);
            setTimeout(() => {
                setCurrentRolled(nextRolled);
            }, 3000);
        };

        // --- Listener registrieren ---
        socket.on("connect", onConnect);
        socket.on("playerJoined", onPlayerJoined);
        socket.on("gameStarted", onGameStarted);
        socket.on("gameEnded", onGameEnded);
        socket.on("nextRolled", onNextRolled);

        // --- Kritische Cleanup-Funktion ---
        return () => {
            console.log("Cleaning up client listeners...");
            socket.off("connect", onConnect);
            socket.off("playerJoined", onPlayerJoined);
            socket.off("gameStarted", onGameStarted);
            socket.off("gameEnded", onGameEnded);
            socket.off("nextRolled", onNextRolled)
        };
    }, [socket, game_id, addToast, router, game_phase, availablePersons, rotation]); // router als Abhängigkeit hinzugefügt

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
            <div className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden">
                <AnimatePresence>
                    <ToastContainer toasts={toasts} />
                </AnimatePresence>

                <div className="flex flex-col items-center gap-12">
                    <h1 className="text-black font-bold text-6xl select-none">
                        Game has Started!
                    </h1>

                    {/* Das Rad */}
                    <div className="flex flex-col items-center gap-10">
                        <Wheel persons={availablePersons} rotation={rotation} />

                        {/* Anzeige des Gewinners */}
                        <div className="h-24"> {/* Feste Höhe verhindert Layout-Shift */}
                            <AnimatePresence mode="wait">
                                {currentRolled && (
                                    <motion.div
                                        key={currentRolled.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1.2, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="text-4xl font-black text-black bg-yellow-400 p-6 rounded-2xl shadow-2xl border-4 border-black"
                                    >
                                        🎉 {currentRolled.name}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
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
