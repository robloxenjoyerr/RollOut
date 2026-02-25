
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"
import { cookies } from "next/headers"


export default async function Page({ params }: { params: { roomId: string } }) {
    const { roomId } = await params;
    const cookieStore = await cookies()
    const hostId = cookieStore.get("hostId")?.value

    console.log("hostID page.tsx roomId: ", hostId)

    try {
        const res = await apiFetch(`/api/game/verify/${roomId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(hostId ? { "Cookie": `hostId=${hostId}` } : {})
            },
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        console.log("RES: ", res)

        if (!res.valid) return redirect("/host");

        if (res.isHost) {
            return <GameHostView game_id={roomId} game_phase={res.game_phase} />;
        } else {
            return <GameClientView game_id={roomId} game_phase={res.game_phase} />;
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error  // redirect durchlassen
        console.error("game/id ERROR : ", error)
        return redirect("/")
    }


}

