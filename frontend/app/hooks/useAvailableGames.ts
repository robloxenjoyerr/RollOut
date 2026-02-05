import { useState, useEffect } from "react";
import { LiveGame } from "../lib/types";
import { apiFetch } from "../lib/api";
import { s } from "framer-motion/client";

export function useAvailableGames() {
    const [liveGames, setLiveGames] = useState<LiveGame[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const timer = 3000;

    async function fetchLiveGames(showLoading = false) {
        try {
            if (showLoading) setLoading(true); // Nur beim ersten Mal oder gezielt Loading zeigen
            const res = await apiFetch("/api/livegames", {
                method: "GET",
                redirectAuth: false
            });
            setLiveGames(res.liveGames || []);
        } catch (err) {
            console.log("ERROR: ", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // 1. Sofort beim Mount laden
        fetchLiveGames(true);

        // 2. Intervall einrichten
        const interval = setInterval(() => {
            fetchLiveGames(false); // Im Hintergrund laden ohne jedes Mal den Spinner zu zeigen
        }, timer);

        // 3. Cleanup: Intervall löschen, wenn Komponente verlassen wird
        return () => clearInterval(interval);
    }, []); // Das leere Array sorgt dafür, dass dieser Effekt NUR einmal läuft

    return { liveGames, loading, error };
}