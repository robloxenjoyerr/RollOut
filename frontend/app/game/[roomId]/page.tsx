
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"
import { cookies } from "next/headers"


export default async function Page({ params }: { params: { roomId: string } }) {
    const { roomId } = await params;
    const cookieStore = await cookies()
    const clientId = cookieStore.get("clientId")?.value

    try {
        const res = await apiFetch(`/api/game/verify/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(clientId ? { "Cookie": `clientId=${clientId}` } : {})
            },
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        console.log("RES: ", res)

        if (!res.valid) {
            console.log("REDERECTING TO /HOST")
            return redirect("/host");
        } 

        if (res.isHost) {
            return <GameHostView game_id={roomId} game_phase={res.status} client_id={clientId && clientId || res.id} />;
        } else {
            return <GameClientView game_id={roomId} game_phase={res.status} />;
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error  // redirect durchlassen
        console.error("game/id ERROR : ", error)
        console.log("REDERECTING TO /")
        return redirect("/")
    }


}

