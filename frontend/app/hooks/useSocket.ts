import React, { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./useAuth";

interface useSocketProps {
    game_id: string
    isNormalClient: boolean
}

export function useSocket({game_id, isNormalClient = true}: useSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null)

    if (isNormalClient) {
        useEffect(() => {
            const newSocket = io(process.env.NEXT_PUBLIC_API_URL)
            setSocket(newSocket)

            return () => { newSocket.disconnect() }
        }, [game_id])
    }
    else if (!isNormalClient) {
        const { token } = useAuth()
        useEffect(() => {
            const newSocket = io(process.env.NEXT_PUBLIC_API_URL, {
                auth: {
                    token: token
                }
            })
            setSocket(newSocket)

            return () => { newSocket.disconnect() }
        }, [game_id])
    }

    return{
        socket,
        setSocket
    }
}
