import { useState, useRef } from "react"
import { Client } from "../lib/types"

export function useWheelState() {
  const [wheelClients, setWheelClients] = useState<Client[]>([])
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const rotationRef = useRef(0)
  const pendingRemovalRef = useRef<string | null>(null)  // ← neu

  const initWheel = (clients: Client[]) => {
    setWheelClients(clients.filter(c => !c.isRolled && !c.isHost))
  }

  const spinTo = (nextRolled: Client, randomOffset: number) => {
    console.log("spinTo called", nextRolled, randomOffset)  // ← wird das aufgerufen?
    console.log("wheelClients", wheelClients)  // ← sind clients drin?
    setIsSpinning(true)

    setWheelClients(prev => {
      // ← vorherige Person erst jetzt entfernen
      const withoutPrevious = pendingRemovalRef.current
        ? prev.filter(c => c.clientId !== pendingRemovalRef.current)
        : prev

      const unrolledBefore = withoutPrevious.filter(c => !c.isRolled)
      const winnerIndex = unrolledBefore.findIndex(c => c.clientId === nextRolled.clientId)

      const segmentAngle = 360 / unrolledBefore.length
      const extraSpins = 360 * 8
      const currentNormalized = rotationRef.current % 360

      const targetAngle = 270 - (winnerIndex * segmentAngle) - randomOffset
      const diff = targetAngle - currentNormalized
      const finalRotation = rotationRef.current + extraSpins + (diff < 0 ? diff + 360 : diff)

      rotationRef.current = finalRotation
      setRotation(finalRotation)
      return withoutPrevious
    })

    setTimeout(() => {
      setIsSpinning(false)
      pendingRemovalRef.current = nextRolled.clientId  // ← merken für nächsten spin
    }, 4000)
  }

  return { wheelClients, rotation, isSpinning, initWheel, spinTo }
}