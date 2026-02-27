
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"
import { cookies } from "next/headers"

// => FIX: when joining as normal client, clientId is undefined => client doesnt get registered in client array and doesnt get rendered for hostview and clientview


export default async function Page({ params }: { params: { roomCode: string } }) {
    const { roomCode } = await params;
    const cookieStore = await cookies()
    let clientId = cookieStore.get("clientId")?.value
    
    try {
        const res = await apiFetch(`/api/game/verify/${roomCode}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(clientId ? { "Cookie": `clientId=${clientId}` } : {})
            },
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        console.log("RES: ", res)

        if (!res.valid) {
            return redirect("/join");
        } 

        if(!clientId){
            clientId = res.clientId
        }

        if (res.isHost) {
            return <GameHostView roomCode={roomCode} roomConfig={res} client_id={clientId && clientId || ""} />;
        } else {
            return <GameClientView roomCode={roomCode} roomConfig={res} client_id={clientId && clientId || ""} />;
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error  // redirect durchlassen
        console.error("game/id ERROR : ", error)
        console.log("REDERECTING TO /")
        return redirect("/join")
    }


}

