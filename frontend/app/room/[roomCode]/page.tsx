
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"
import { cookies } from "next/headers"


// => FIX: when joining as normal client, clientId is undefined => client doesnt get registered in client array and doesnt get rendered for hostview and clientview


export default async function Page({ params, searchParams }: { params: { roomCode: string }, searchParams: { username?: string } }) {
    const cookieStore = await cookies()
    const { roomCode } = await params;
    const userName = await searchParams.username
    const clientId = cookieStore.get("clientId")?.value

    try {
        console.log(`[roomCode/page.tsx]: Verifying with roomCode ${roomCode} and username ${userName}`)
        const res = await apiFetch(`/api/game/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(clientId ? { "Cookie": `clientId=${clientId}` } : {})
            },
            body: JSON.stringify({ roomCode: roomCode, userName: userName }),
            credentials: "include",
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        console.log("RES: ", res)


        if (res.isHost) {
            return <GameHostView roomCode={roomCode} roomConfig={res} clientId={res.clientId} />;
        } else {
            return <GameClientView roomCode={roomCode} roomConfig={res} clientId={res.clientId} />;
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error  // redirect durchlassen
        console.error("game/id ERROR : ", error)
        console.log("REDERECTING TO /join")
        console.log("/VERIFY: roomCode received in /room/page.tsx:", roomCode)
        return redirect("/join")
    }


}

