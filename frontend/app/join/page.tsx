"use client"


import { useRouter } from "next/navigation";
import { useToasts } from "../hooks/useToasts";
import { useAvailableGames } from "../hooks/useAvailableGames";
import RollOutHeader from "../components/RollOutHeader";
import Input from "../components/Input";

import { useRef } from "react";


export default function JoinPage() {
    const { toasts, addToast } = useToasts()
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const router = useRouter()

    const handleChange = (index: number, value: string) => {
        if (value.length === 1 && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        if(index === 5 && value.length === 1){
            const allFilled = inputRefs && inputRefs.current.every(element => element?.value.length === 1);
            if(allFilled){
                const gameCode = inputRefs.current.map(element => element?.value).join("")
                joinGame(gameCode)
            }
        }
    }

    async function joinGame(roomCode: string) {
        router.push(`/room/${roomCode}`)
    }

    return <>
        <div className=" flex flex-col w-[80vw] h-[80vh] gap-20 items-center justify-center">
            <RollOutHeader />
            <div className="flex flex-col gap-2 absolute">
                <div className="flex flex-row justify-center items-center top-32 gap-4 text-black">
                    <div className="flex w-200 h-35 gap-5 rounded-2xl p-2">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <Input
                                className="text-center text-5xl "
                                id={i}
                                key={i}
                                maxLength="1"
                                ref={(el) => {inputRefs.current[i] = el}}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=> handleChange(i, e.target.value)}
                            />
                        ))}
                    </div>
                </div>
            </div>

        </div >
    </>
}