import { apiFetch } from "@/app/lib/api"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"
import GameHostView from "@/app/components/GameHostView"



export default async function Page({ params }: {params: { id: string }} ) {
    const { id } = await params
   

    const res = await apiFetch("/api/game/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        cache: "no-store",
        body: JSON.stringify({game_id_url: id})
    })

    console.log(res.host)

    if(!res.success) return redirect("/")
    if(res.host === true){
        return <GameHostView game_id={id}/>
    } 
    else return <GameClientView/>
}