
import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"
import { cookies } from "next/headers"
import { useSearchParams } from "next/navigation"


// => FIX: when joining as normal client, clientId is undefined => client doesnt get registered in client array and doesnt get rendered for hostview and clientview


export default async function Page({ params }: { params: { roomCode: string } }) {
    const searchParams = useSearchParams()
    const { roomCode } = params;
    const userName = searchParams.get("username")

    try {
        const res = await apiFetch(`/api/game/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({roomCode: roomCode, userName: userName}),
            credentials: "include",
            redirectAuth: false // so apiFetch doesnt redirect by itself
        });

        console.log("RES: ", res)


        if (res.isHost) {
            return <GameHostView roomCode={roomCode} roomConfig={res}/>;
        } else {
            return <GameClientView roomCode={roomCode} roomConfig={res} />;
        }
    } catch (error: any) {
        if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error  // redirect durchlassen
        console.error("game/id ERROR : ", error)
        console.log("REDERECTING TO /join")
        return redirect("/join")
    }


}

