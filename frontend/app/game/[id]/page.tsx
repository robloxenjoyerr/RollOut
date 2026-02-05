
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"


export default async function Page({ params }: { params: { id: string } }) {
    const { id } = await params;

    let res;

    try {
        res = await apiFetch("/api/game/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            body: JSON.stringify({ game_id_url: id }),
            redirectAuth: false // Wichtig, damit apiFetch nicht selbst redirectet
        });
    } catch (error) {
        // Wenn apiFetch einen Error wirft (z.B. 401), landen wir hier.
        // Wir tun so, als wäre die Antwort erfolgreich, aber "host" ist false.
        res = { success: true, host: false };
    }

    if (!res || !res.success) return redirect("/");

    
    console.log(res.game_phase)
    if (res.host === true) {
        return <GameHostView game_id={id} game_phase={res.game_phase} game_template={res.game_template}/>;
    } else {
        return <GameClientView game_id={id} game_phase={res.game_phase} game_template={res.game_template} />;
    }
}

// BUG => IF NOT LOGGED IN AN JOINING A RUNNING GAME, INSTANTLY GETS REDIRECTED TO /LOGIN