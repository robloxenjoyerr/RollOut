
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"
import { cookies } from "next/headers"
import GameView from "@/app/components/GameView"

// => FIX: when joining as normal client, clientId is undefined => client doesnt get registered in client array and doesnt get rendered for hostview and clientview


export default async function Page({ params, searchParams }: {
    params: Promise<{ roomCode: string }>,
    searchParams: Promise<{ username?: string, clientId?: string }>
}) {

    const cookieStore = await cookies()
    // Löse zuerst die Promises auf, um die Objekte zu bekommen
    const paramsData = await params;
    const searchParamsData = await searchParams;

    // Greife DANACH auf die Eigenschaften der aufgelösten Objekte zu
    const roomCode = paramsData.roomCode;
    const userName = searchParamsData.username;

    console.log("USERNAME FROM SEARCHPARAMS: ", userName)
    let clientId = searchParamsData.clientId;

    if (!clientId) {
        // Dann versuchen wir es aus dem Cookie zu holen
        const cookieClientId = cookieStore.get("clientId");
        if (cookieClientId) {
            clientId = cookieClientId.value; // <-- HIER IST DIE WICHTIGE ÄNDERUNG: .value anhängen!
            console.log("ClientId aus Cookie gefunden:", clientId);
        } else {
            console.log("Keine ClientId in searchParams oder Cookie gefunden.");
            // Hier könnte man ggf. eine neue ClientId generieren und das Cookie setzen,
            // aber das ist besser im Backend beim ersten API-Aufruf aufgehoben.
            redirect("/join")
        }
    }

    try {
        console.log(`[roomCode/page.tsx]: Verifying with roomCode ${roomCode} and username ${userName} and clientId ${clientId}`)
        const res = await apiFetch(`/api/game/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Cookie": `clientId=${clientId}`
            },
            body: JSON.stringify({ roomCode: roomCode, userName: userName }),
            credentials: "include",
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        console.log("RES: ", res)

        return <GameView roomCode={res.roomCode} clientId={res.clientId} roomConfig={res.roomConfig} isHost={res.isHost}/>
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error  // redirect durchlassen
        console.error("game/id ERROR : ", error)
        return redirect("/join")
    }


}

