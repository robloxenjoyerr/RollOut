"use client"
import { useGameState } from "../hooks/useGameState"
import Loading from "./Loading"
import WaitingLobby from "./WaitingLobby"
import GameInProgress from "./GameInProgress"
import GameFinished from "./GameFinished"
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
    const { gameState, toasts, addToast, rollNext, wheelClients, rollHistory, rotation, isSpinning, startGame, stopGame, toggleLateJoin } = useGameState({
        roomCode,
        mode,
        clientId,
        isHost
    })
    if(!gameState.status) return <Loading></Loading>
    if (gameState.status === "waiting-lobby") {
        return (
            <WaitingLobby
                roomName={gameState.roomName}
                clients={gameState.clients}
                toasts={toasts}
                addToast={addToast}
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
                roomCode={roomCode}
                toasts={toasts}
                addToast={addToast}
                clients={wheelClients}
                mode={gameState.mode}
                rotation={rotation}
                currentRolledClient={gameState.currentRolled}
                rollHistory={rollHistory}
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