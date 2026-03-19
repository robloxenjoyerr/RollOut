// hooks/useGameState.ts
"use client"
import { useState, useEffect, useCallback } from "react"
import { useSocket } from "./useSocket"
import { useToasts } from "./useToasts"
import { GamePhase, Client, Mode } from "../lib/types"
import { useWheelState } from "./useWheelState"
import { apiFetch } from "../lib/api"
import { useRouter } from "next/navigation"

interface UseGameStateProps {
  roomCode: string
  mode: string
  clientId: string
  isHost: boolean
}

interface GameState {
  status: GamePhase
  roomName: string
  mode: string
  clients: Client[] | null
  rotation: number
  currentRolled: Client | null
  pendingUpdate: Client[] | null
  isSpinning: boolean
}

export function useGameState({ roomCode, mode, clientId, isHost }: UseGameStateProps) {
  const { wheelClients, rotation, isSpinning, initWheel, spinTo } = useWheelState()
  const router = useRouter()
  const { socket } = useSocket({ roomCode, clientId })
  const { toasts, addToast } = useToasts()
  const [rollHistory, setRollHistory] = useState<Client[] | null>(null)

  // ✅ Zentral verwalteter State
  const [gameState, setGameState] = useState<GameState>({
    status: "waiting-lobby",
    roomName: "",
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
    setGameState(prev => ({ ...prev, roomName: data.roomName }))
    console.log("CLIENTS:", data.clients)
    setRollHistory(data.rollHistory || [])
    updatePhase(data.status)
    updateClients(data.clients || [])
    initWheel(data.clients || [])  // ← wheel initialisieren
  }, [updatePhase, updateClients])

  const handleClientJoined = useCallback((data: any) => {
    console.log("Someone joined!!!")
    updateClients(data.clients)
    addToast(`Client ${data.name} has connected!`, "info")
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
    console.log(data.message)
  }, [addToast])

  const handleHostDisconnected = (data: any) => {
    addToast(`${data.message}`, "warning")
  }

  const handleNextRolled = useCallback((data: any) => {
    console.log("handleNextRolled", data)  // ← kommt das Event an?

    spinTo(data.nextRolled, data.randomOffset)  // ← alles im wheel hook

    setTimeout(() => {
      addToast(`Next Rolled is ${data.nextRolled.name}`, "info")
      setRollHistory(prev => [...(prev ?? []), data.nextRolled])
    }, 8000) // =>>>>>>>>>>>>> DELAY TO DISPLAY NEXTROLLED VIA TOASTMESSAGE
  }, [spinTo])

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

  const handleToggleLateJoinUpdate = useCallback((data: any) => {
    addToast("This Function is still in development", "info")
  }, [addToast])

  const handleRoomClosed = useCallback(async (data: any) => {
    addToast(data.message, "info")
    await apiFetch("/api/clearClient", { method: "POST", credentials: "include" })

    let timer = 5

    const interval = setInterval(() => {
      addToast(`Room Closing in ${timer}`, "info")
      console.log()
      timer -= 1


      if (timer < 0) {
        clearInterval(interval)
      }
    }, 1000) // ✅ 1 Sekunde
    setTimeout(() => {
      clearInterval(interval)
      router.push(isHost ? "/host" : "/join")
    }, 5000)
  }, [addToast])

  const handleGameEnded = useCallback(async (data: any) => {

    addToast(data.message, "info")
    updatePhase("finished")

  }, [addToast, updatePhase])

  const handleRoomReseted = useCallback((data: any) => {
    if (data.valid) {
      addToast("Room reseted successfully", "info")
      updatePhase("in-progress")
    }
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
      startGameError: handleGameStartError,
      gameEnded: handleGameEnded,
      roomClosed: handleRoomClosed,
      roomReseted: handleRoomReseted,
      nextRolled: handleNextRolled,
      allPersonsRolled: handleAllRolled,
      hostDisconnected: handleHostDisconnected,
      rollNextError: handleRollNextError,
      toggleLateJoinUpdated: handleToggleLateJoinUpdate
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
    toasts,
    addToast,
    wheelClients,
    rollHistory,
    rotation,
    isSpinning,
    // ✅ Helper-Funktionen für Components
    rollNext: () => {
      if (!socket || isSpinning) return
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
      socket.emit("stopGame", { roomCode, clientId })
    },
    resetRoom: async () => {
      if (!socket) return
      socket.emit("resetRoom", { roomCode, clientId })
    },
    toggleLateJoin: async () => {
      if (!socket) return
      console.log("toggling late join now")
      socket.emit("toggleLateJoin", { roomCode, clientId })
    }
  }
}