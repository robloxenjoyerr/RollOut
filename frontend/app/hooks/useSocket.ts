import React, { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie"; // Direktimport statt useAuth
import { getClientIdFromCookie } from "../lib/services";

interface useSocketProps {
    roomCode: string;
    clientId: string
}

export function useSocket({ roomCode, clientId }: useSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // IP Adresse bestimmen
        const url = process.env.NEXT_PUBLIC_API_URL!
        
        console.log(`[useSocket] Creating socket: url=${url}, clientId=${clientId}, roomCode=${roomCode}`)
        
        // Verbindung aufbauen
        const newSocket = io(url!, {
            auth: { clientId } // Token mitschicken falls vorhanden
        });

        newSocket.on("connect", () => {
            console.log(`[useSocket] Connected! Socket ID: ${newSocket.id}`)
            // Tell the server which room this client is joining
            newSocket.emit("joinRoom", { roomCode, clientId })
        })

        newSocket.on("connect_error", (error) => {
            console.error(`[useSocket] Connect error:`, error)
        })

        newSocket.on("disconnect", (reason) => {
            console.log(`[useSocket] Disconnected! Reason: ${reason}`)
        })

        setSocket(newSocket);

        return () => {
            console.log(`[useSocket] Cleanup - disconnecting socket`)
            newSocket.disconnect();
        };
    }, [roomCode, clientId]);

    return {
        socket,
        setSocket
    };
}