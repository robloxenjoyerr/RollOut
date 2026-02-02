import React, { useState, useEffect } from "react";
import { Socket, io } from "socket.io-client";
import Cookies from "js-cookie"; // Direktimport statt useAuth

interface useSocketProps {
    game_id: string;
    isNormalClient?: boolean;
}

export function useSocket({ game_id, isNormalClient = true }: useSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Wir holen das Token direkt aus dem Cookie. 
        // Wenn es nicht da ist, ist es halt undefined, aber niemand redirectet uns!
        const token = Cookies.get("login_token");

        // IP Adresse bestimmen
        const url = process.env.NEXT_PUBLIC_API_URL_LOCAL || process.env.NEXT_PUBLIC_API_URL_NETWORK;

        // Verbindung aufbauen
        const newSocket = io(url!, {
            auth: { token: token || null } // Token mitschicken falls vorhanden
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [game_id]); // isNormalClient und token als Dependency entfernt, da wir direkt lesen

    return {
        socket,
        setSocket
    };
}