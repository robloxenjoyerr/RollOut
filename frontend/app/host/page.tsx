"use client"
import Button from "../components/Button"
import Card from "../components/Card"
import Input from "../components/Input"
import { apiFetch } from "../lib/api"
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react"
import { Mode } from "../lib/types"
import { Modes } from "../lib/types"

interface RoomConfig {
    roomName: string | undefined,
    privateRoom: boolean | undefined
    gameMode: Mode
}

export default function Host() {
    const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null)
    const [selectedMode, setSelectedMode] = useState<Mode>("wheel");
    const roomNameRef = useRef<HTMLInputElement>(null)
    const privateRoomRef = useRef<HTMLInputElement>(null)
    const router = useRouter()


    async function startGame() {
        try {
            const currentRoomConfig = {
                roomName: roomNameRef.current?.value,
                mode: selectedMode,
                isPrivate: privateRoomRef.current?.checked,
            }

            const res = await apiFetch("/api/game/start", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                redirectAuth: false,
                credentials: "include",
                body: JSON.stringify({ roomConfig: currentRoomConfig })
            })
            if (res) {
                router.push(`/room/${res.roomCode}`)
            }
            else{
                router.push("/")
            }
        }
        catch (err) {
            console.log(err)
        }
    }

    return (

        <Card className="text-white font-bold text-l shadow-black/20 shadow-sm  backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl" alignItems="center" width="w-fit" gap="gap-5" height="h-fit" justifyContent="around">
            <div className="flex flex-col items-center ">
                <span className="items-center justify-items-center">Host a Room</span>
            </div >
            <div className="flex flex-row gap-5 w-fit">
                <div className="flex flex-col gap-3 justify-center w-30">
                    <Input placeholder="Room Name" width="w-full" id="roomName" className="text-white" ref={roomNameRef} />
                    <div className="flex flex-row h-fit w-full border-2 p-2 border-black/20 rounded-2xl">
                        <label className="w-full mr-2 select-none" htmlFor="is-private">Private</label>
                        <Input type="checkbox" width="w-5" height="h-4" className="self-center" id="is-private" ref={privateRoomRef}/>
                    </div>
                </div>
                <div className="flex flex-col gap-3 h-full w-30 border-2 p-2 border-black/20 rounded-2xl">
                    <label className="w-25 select-none justify-items-center items-center" htmlFor="is-private">Game mode</label>
                    <select
                        id="modeSelect"
                        onChange={((e: React.ChangeEvent<HTMLSelectElement>)=> setSelectedMode(e.target.value as Mode))}
                        value={selectedMode}
                        className="border-none border-black/20 rounded-2xl p-0 w-full h-full"
                    >
                        {Modes && Modes.map((m) => {
                            return (
                                <option key={m} className="bg-black/5 border-2 border-black rounded-2xl" value={m}>{m}</option>
                            )
                        })}
                    </select>
                </div>
            </div>
            <Button className="w-full h-15 items-center justify-items-center" onClick={startGame}>Host</Button>

        </Card>
    )
}