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
    const [rotation, setRotation] = useState(0)
    const [isSpinning, setIsSpinning] = useState<boolean>(false)
    const { gameState, rollNext, startGame, stopGame } = useGameState({
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
                clients={gameState.clients}
                mode={gameState.mode}
                rotation={gameState.rotation}
                currentRolledClient={gameState.currentRolled}
                isHost={isHost}
                clientId={clientId}
                isSpinning={gameState.isSpinning}
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