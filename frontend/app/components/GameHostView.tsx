"use client"
import { apiFetch } from "../lib/api"
import Button from "./Button"
export default function GameHostView(){
    async function stopGame(){
        const res = await apiFetch("/api/game/stop", {
            method: "POST",
        })

        if(res.success){
            console.log(res.message)
        }
    }

    return(
        <div>
            <span className="text-green-600 font-bold text-3xl">This is the Game Host View</span>
            <Button onClick={stopGame}>Stop Game</Button>
        </div>
    )
}