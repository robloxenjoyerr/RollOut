
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"


export default async function Page({ params }: { params: { roomId: string } }) {
    const { roomId } = await params;

    try {
        const res = await apiFetch(`/api/game/verify/${roomId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        if (!res.valid) return redirect("/");

        if (res.isHost) {
            return <GameHostView game_id={roomId} game_phase={res.game_phase}  />;
        } else {
            return <GameClientView game_id={roomId} game_phase={res.game_phase}  />;
        }
    } catch (error) {
        // Tun als ob Antwort erfolgreich, aber "host" ist false.
        console.error("game/id ERROR : ", error)
    }


}

