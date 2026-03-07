"use client"
import { useGameState } from "../hooks/useGameState"
import Loading from "./Loading"
import WaitingLobby from "./WaitingLobby"
import GameInProgress from "./GameInProgress"
import { useSocket } from "../hooks/useSocket"
import { Client } from "../lib/types"
import { useState } from "react"

interface GameViewProps {
    roomCode: string
    clientId: string
    roomConfig: any
    isHost: boolean
}

export default function GameView({ roomCode, clientId, roomConfig, isHost }: GameViewProps) {
    const [clients, setClients] = useState<Client[]>([])
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState<boolean>(false)
    const { gameState, rollNext, startGame, stopGame } = useGameState({
        roomCode,
        clientId,
        isHost
    })
    if(!gameState.phase) return <Loading></Loading>
    if (gameState.phase === "waiting-lobby") {
        return (
            <WaitingLobby
                clients={gameState.clients}
                isHost={isHost}
                onStartGame={startGame}
                onStopGame={stopGame}
                roomCode={roomCode}
            />
        )
    }

    if (gameState.phase === "in-progress") {
        return (
            <GameInProgress
                clients={gameState.clients}
                rotation={gameState.rotation}
                currentRolledClient={gameState.currentRolled}
                unrolledClients={gameState.availablePersons}
                isHost={isHost}
                isSpinning={gameState.isSpinning}
                onRollNext={rollNext}
                onStopGame={stopGame}
            />
        )
    }

    return <Loading />
}