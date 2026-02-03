import { useState, useEffect } from "react";
import { LiveGame } from "../lib/types";
import { apiFetch } from "../lib/api";
import { time } from "console";

export function useAvailableGames() {
    const [liveGames, setLiveGames] = useState<LiveGame[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    let timer = 1000
    useEffect(() => {
        async function fetchLiveGames() {
            try {
                setLoading(true);
                const res = await apiFetch("/api/livegames", {
                    method: "GET",
                    redirectAuth: false
                });
                console.log(res)
                // Annahme: res hat die Struktur { live_games: [...] }
                setLiveGames(res.liveGames || []);
            } catch (err) {
                console.log("ERROR: ", err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        }


        const timeout = setInterval(fetchLiveGames, timer)
        return () => {
            clearInterval(timeout)
        }



    }, []); // Leeres Array = nur beim Mount ausführen

    return {
        liveGames,
        loading,
        error
    };
}