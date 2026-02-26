import React, { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie"; // Direktimport statt useAuth
import { getClientIdFromCookie } from "../lib/services";

interface useSocketProps {
    roomCode: string;
}

export function useSocket({ roomCode }: useSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // IP Adresse bestimmen
        const url = process.env.NEXT_PUBLIC_API_URL!

        const clientId = getClientIdFromCookie()

        
        // Verbindung aufbauen
        const newSocket = io(url!, {
            auth: { clientId } // Token mitschicken falls vorhanden
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [roomCode]); // isNormalClient und token als Dependency entfernt, da wir direkt lesen

    return {
        socket,
        setSocket
    };
}