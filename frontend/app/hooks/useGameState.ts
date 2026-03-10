// hooks/useGameState.ts
"use client"
import { useState, useEffect, useCallback } from "react"
import { useSocket } from "./useSocket"
import { useToasts } from "./useToasts"
import { GamePhase, Client, Mode } from "../lib/types"
import { chownSync } from "fs"
import { constrainedMemory } from "process"

interface UseGameStateProps {
  roomCode: string
  mode: string
  clientId: string
  isHost: boolean
}

interface GameState {
  status: GamePhase
  mode: string
  clients: Client[] | null
  rotation: number
  currentRolled: Client | null
  pendingUpdate: Client[] | null
  isSpinning: boolean
}

export function useGameState({ roomCode, mode, clientId, isHost }: UseGameStateProps) {
  const { socket } = useSocket({ roomCode, clientId })
  const { addToast } = useToasts()

  // ✅ Zentral verwalteter State
  const [gameState, setGameState] = useState<GameState>({
    status: "waiting-lobby",
    mode: mode,
    clients: [],
    rotation: 0,
    currentRolled: null,
    isSpinning: false,
    pendingUpdate: null
  })

  // ✅ Helper-Funktionen für State-Updates
  const updatePhase = useCallback((status: GamePhase) => {
    setGameState(prev => ({ ...prev, status }))
  }, [])

  const updateClients = useCallback((clients: Client[]) => {
    setGameState(prev => ({ ...prev, clients }))
  }, [])

  const updateRotation = useCallback((rotation: number) => {
    setGameState(prev => ({ ...prev, rotation }))
  }, [])

  const updateCurrentRolled = useCallback((person: Client | null) => {
    setGameState(prev => ({ ...prev, currentRolled: person }))
  }, [])

  // ✅ Zentrale Event-Handler
  const handleGameStateUpdate = useCallback((data: any) => {
    updatePhase(data.status)
    updateClients(data.clients || [])
    setGameState(prev => ({
      ...prev,
      availablePersons: data.availablePersons || prev.clients
    }))
  }, [updatePhase, updateClients])

  const handleClientJoined = useCallback((data: any) => {
    console.log("Someone joined!!!")
    updateClients(data.clients)
    addToast(`New Client ${data.name} has connected!`, "info")
    // ✅ FIX: Sende nur den String!
    socket?.emit("getGameState", clientId)
  }, [updateClients, addToast, socket, clientId])

  const handleClientDisconnected = useCallback((client: Client) => {
    addToast(`Client ${client.name} has disconnected.`, "info")
    setGameState(prev => ({
      ...prev,
      clients: prev.clients && prev.clients.filter(c => c.clientId !== client.clientId)
    }))
  }, [addToast])

  const handleGameStarted = useCallback((data: any) => {
    addToast("Game has started!", "success")
    updatePhase("in-progress")
  }, [addToast, updatePhase])

  const handleGameStartError = useCallback((data: any) => {
    addToast(`${data.message}`, "error")
  }, [addToast])

  const handleGameEnded = useCallback(() => {
    addToast("Game ended.", "info")
    updatePhase("finished")
  }, [addToast, updatePhase])

  const handleHostDisconnected = (data: any) => {
    addToast(`${data.message}`, "warning")
  }

  const handleNextRolled = useCallback((data: any) => {
    const { unrolledClients, nextRolled } = data

    console.log("Next rolled: ", nextRolled)

    setGameState(prev => {
      const updatedClients = prev.clients?.map(c =>
        c.clientId === nextRolled.clientId ? { ...c, isRolled: true } : c
      ) || []

      const unrolledClients = updatedClients.filter(c => !c.isRolled && !c.isHost)
      const winnerIndex = unrolledClients.findIndex(c => c.clientId === nextRolled.clientId)

      // Rotation berechnen
      const segmentAngle = 360 / (unrolledClients.length + 1) // +1 weil winner noch drin war
      const extraSpins = 360 * 5
      const currentNormalized = prev.rotation % 360
      const targetAngle = 270 - (winnerIndex * segmentAngle) - (segmentAngle / 2)
      let diff = targetAngle - currentNormalized
      const finalRotation = prev.rotation + extraSpins + (diff < 0 ? diff + 360 : diff)

      return {
        ...prev,
        clients: updatedClients,
        isSpinning: true,
        rotation: finalRotation,
        currentRolled: null
      }
    })


    setTimeout(() => {
      updateCurrentRolled(nextRolled)
      setGameState(prev => ({ ...prev, isSpinning: false }))
    }, 4000)
  }, [gameState.pendingUpdate, gameState.clients, gameState.rotation, updateRotation, updateCurrentRolled])

  const handleAllRolled = useCallback(() => {
    setTimeout(() => {
      addToast("All persons have been rolled! Game is getting closed in 5 seconds.", "success")
      updateCurrentRolled(null)

      let secondsLeft = 5
      const countdownInterval = setInterval(() => {
        if (secondsLeft > 0) {
          addToast(`Game closing in: ${secondsLeft}`, "info")
        }

        if (secondsLeft <= 0) {
          clearInterval(countdownInterval)
        }
        secondsLeft--
      }, 1000)
    }, 3000)
  }, [addToast, updateCurrentRolled])

  const handleRollNextError = useCallback(() => {
    addToast("ERROR with rolling Next Client", "error")
  }, [addToast])

  // ✅ Socket-Setup einmalig
  useEffect(() => {
    if (!socket) return

    // Registriere alle Listener
    const listeners = {
      gameStateUpdate: handleGameStateUpdate,
      clientJoined: handleClientJoined,
      clientDisconnected: handleClientDisconnected,
      gameStarted: handleGameStarted,
      gameStartError: handleGameStartError,
      gameEnded: handleGameEnded,
      nextRolled: handleNextRolled,
      allPersonsRolled: handleAllRolled,
      hostDisconnected: handleHostDisconnected,
      rollNextError: handleRollNextError
    }

    Object.entries(listeners).forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    // Initial connection
    const onConnect = () => {
      console.log(`[useGameState] Connected! Emitting ${isHost ? 'roomCode' : 'clientId'}`)
      socket.emit("getGameState", clientId)
    }

    socket.on("connect", onConnect)

    if (socket.connected) {
      onConnect()
    }

    // ✅ Cleanup: Entferne ALLE Listener
    return () => {
      Object.keys(listeners).forEach(event => {
        socket.off(event)
      })
      socket.off("connect", onConnect)
    }
  }, [socket, roomCode, clientId])

  return {
    gameState,
    socket,
    // ✅ Helper-Funktionen für Components
    rollNext: () => {
      if (!socket || gameState.isSpinning) return
      updateCurrentRolled(null)
      socket.emit("rollNext", { roomCode, clientId })
    },
    startGame: () => {
      if (!socket) return
      socket.emit("startGame", { roomCode, clientId })
    },
    stopGame: async () => {
      // API-Call + Socket-Emit
      if (!socket) return
      socket.emit("stopGame", { roomCode })
    }
  }
}