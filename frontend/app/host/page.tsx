"use client"
import Button from "../components/Button"
import Card from "../components/Card"
import Input from "../components/Input"
import { apiFetch } from "../lib/api"
import { useRouter } from "next/navigation";
import { useRef, useState } from "react"
import { Modes } from "../lib/types"
import Overlay from "../components/Overlay"
import { AnimatePresence, number } from "framer-motion"
import { motion } from "framer-motion"
import RollOutHeader from "../components/RollOutHeader"
import Footer from "../components/Footer"

interface RoomConfig {
    roomName: string | undefined,
    privateRoom: boolean | undefined
    gameMode: typeof Modes
}

export default function Host() {
    const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null)
    const [selectedMode, setSelectedMode] = useState<typeof Modes[number]>(Modes[0]);
    const roomNameRef = useRef<HTMLInputElement>(null)
    const privateRoomRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const [selectingMode, setSelectingMode] = useState<boolean>(false)

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
                console.log("Alredy in room?: ", res.alreadyInRoom)
                router.push(`/room/${res.roomCode}`)
            }

        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <>
            <RollOutHeader></RollOutHeader>
            <AnimatePresence>
                <Overlay className="w-50 h-70 flex flex-col" bgClassName="" isOpen={selectingMode} onClose={() => setSelectingMode(false)}>
                    {Modes && Modes.map((m) => (
                        <motion.span
                            className="text-white self-center w-full font-bold text-l shadow-black/20 shadow-sm p-2 m-2 rounded-2xl select-none bg-(--accent-indigo) hover:bg-(--accent-blue) hover:cursor-pointer overflow-auto"
                            key={m}
                            onClick={() => { setSelectedMode(m); setSelectingMode(false) }}
                        >
                            {m}
                        </motion.span>
                    ))}
                </Overlay>
            </AnimatePresence>
            <Card className="text-white font-bold text-l shadow-black/20 shadow-sm  backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl" alignItems="center" width="w-fit" gap="gap-5" height="h-fit" justifyContent="around">
                <div className="flex flex-col items-center ">
                    <span className="items-center justify-items-center">Host a Room</span>
                </div >
                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    <Input
                        placeholder="Room Name"
                        className="text-white h-12 "
                        ref={roomNameRef}
                    />
                    <div
                        onClick={() => setSelectingMode(true)}
                        className="flex items-center  justify-center border-2 border-white/10 bg-white/5 rounded-2xl cursor-pointer hover:bg-white/10 transition-all h-12 text-(--accent-blue)"
                    >
                        {selectedMode}
                    </div>
                    <div className="col-span-1 flex items-center justify-between border-2 border-white/10 bg-white/5 p-2 px-4 rounded-2xl h-12">
                        <label className="select-none cursor-pointer text-sm" htmlFor="is-private">Private</label>
                        <Input type="checkbox" width="w-5" height="h-4" id="is-private" ref={privateRoomRef} />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-white/30 italic gap-2">

                        <Button>Load Preset</Button>
                        <span className="border-2 w-20 h-full p-2 rounded-xl self-center text-center">no preset available</span>

                    </div>
                </div>
                <Button className="w-full h-15 items-center justify-items-center" onClick={startGame}>Host</Button>
            </Card>
            <Footer></Footer>
        </>
    )
}