"use client"
import { useRouter } from "next/navigation"
import Shuffle from "./Shuffle"
import { ReactNode } from "react"

interface RollOutHeaderProps{
    children?: ReactNode
}

export default function RollOutHeader({children}: RollOutHeaderProps) {
    const router = useRouter()
    return (
        <span onClick={() => router.push("/")} className="absolute top-5 hover:cursor-pointer flex flex-col gap-3 items-center">
            <Shuffle
                className="self-center header-title header text-8xl font-extrabold text-neutral-100 drop-shadow-lg tracking-tight hover:scale-105 transition-all duration-300 ease-out"
                text="RollOut"
                shuffleDirection="right"
                duration={0.35}
                animationMode="evenodd"
                shuffleTimes={1}
                ease="power3.out"
                stagger={0.03}
                threshold={0.1}
                triggerOnce={true}
                triggerOnHover
                respectReducedMotion={true}
                loop={true}
                loopDelay={2} />
            {children}
        </span>

    )
}