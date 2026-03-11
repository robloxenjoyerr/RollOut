"use client"
import { useGameState } from "../hooks/useGameState"
import Loading from "./Loading"
import WaitingLobby from "./WaitingLobby"
import GameInProgress from "./GameInProgress"
import GameFinished from "./GameFinished"
import { useSocket } from "../hooks/useSocket"
import { Client } from "../lib/types"
import { useState } from "react"

interface GameViewProps {
    roomCode: string
    mode: string
    clientId: string
    roomConfig: any
    isHost: boolean
}

export default function GameView({ roomCode, mode, clientId, roomConfig, isHost }: GameViewProps) {
    const [clients, setClients] = useState<Client[]>([])
    const { gameState, toasts, rollNext, wheelClients, rotation, isSpinning, startGame, stopGame, toggleLateJoin } = useGameState({
        roomCode,
        mode,
        clientId,
        isHost
    })
    if(!gameState.status) return <Loading></Loading>
    if (gameState.status === "waiting-lobby") {
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

    if (gameState.status === "in-progress") {
        return (
            <GameInProgress
                toasts={toasts}
                clients={wheelClients}
                mode={gameState.mode}
                rotation={rotation}
                currentRolledClient={gameState.currentRolled}
                isHost={isHost}
                clientId={clientId}
                isSpinning={isSpinning}
                onToggleLateJoin={toggleLateJoin}
                onRollNext={rollNext}
                onStopGame={stopGame}
            />
        )
    }

    if(gameState.status === "finished"){
        return(
            <GameFinished /> 
        )
    }

    return <Loading />
}