
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientLobbyView"
import GameHostView from "@/app/components/GameHostLobbyView"


export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params;
    let res;

    try {
        res = await apiFetch("/api/game/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ game_id_url: id }),
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });
    } catch (error) {
        // Tun als ob Antwort erfolgreich, aber "host" ist false.
        res = { success: true, host: false };
    }

    if (!res || !res.success) return redirect("/");
    console.log("host?: ", res.host)

    if (res.host === true) {
        return <GameHostView game_id={id} />;
    } else {
        return <GameClientView game_id={id} />;
    }
}

