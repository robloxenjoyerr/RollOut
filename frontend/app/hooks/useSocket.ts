import React, { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./useAuth";

interface useSocketProps {
    game_id: string
    isNormalClient?: boolean
}

export function useSocket({ game_id, isNormalClient = true }: useSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const { token } = useAuth()

    useEffect(() => {
        const newSocket = isNormalClient
            ? io(process.env.NEXT_PUBLIC_API_URL_LOCAL! || process.env.NEXT_PUBLIC_API_URL_NETWORK!)
            : io(process.env.NEXT_PUBLIC_API_URL_LOCAL! || process.env.NEXT_PUBLIC_API_URL_NETWORK!, {
                auth: { token }
            })

        setSocket(newSocket)
        return () => {
            newSocket.disconnect()
        }
    }, [game_id, isNormalClient, token])

    return {
        socket,
        setSocket
    }
}
