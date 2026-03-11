import { useState, useRef } from "react"
import { Client } from "../lib/types"

export function useWheelState() {
  const [wheelClients, setWheelClients] = useState<Client[]>([])
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const rotationRef = useRef(0)  // ← neu

  const initWheel = (clients: Client[]) => {
    setWheelClients(clients.filter(c => !c.isRolled && !c.isHost))
  }

  const spinTo = (nextRolled: Client) => {
    setIsSpinning(true)

    setWheelClients(prev => {
      const unrolledBefore = prev.filter(c => !c.isRolled)
      const winnerIndex = unrolledBefore.findIndex(c => c.clientId === nextRolled.clientId)

      const segmentAngle = 360 / unrolledBefore.length
      const extraSpins = 360 * 5
      const currentNormalized = rotationRef.current % 360  // ← ref
      const targetAngle = 270 - (winnerIndex * segmentAngle) - (segmentAngle / 2)
      const diff = targetAngle - currentNormalized
      const finalRotation = rotationRef.current + extraSpins + (diff < 0 ? diff + 360 : diff)

      rotationRef.current = finalRotation  // ← ref updaten
      setRotation(finalRotation)
      return prev
    })

    setTimeout(() => {
      setIsSpinning(false)
      setWheelClients(prev => prev.filter(c => c.clientId !== nextRolled.clientId))
    }, 4000)
  }

  return { wheelClients, rotation, isSpinning, initWheel, spinTo }
}