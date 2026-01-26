import { apiFetch } from "@/app/lib/api"
import { param } from "framer-motion/client"
import { redirect } from "next/navigation"
import GameClientView from "@/app/components/GameClientView"

export default async function Page({ params }: {params: { id: string }} ) {
    const { id } = await params

    const res = await apiFetch("/api/game/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        cache: "no-store",
        body: JSON.stringify({game_id_url: id})
    })

    if(!res.success) redirect("/")
    
    return <GameClientView/>
}