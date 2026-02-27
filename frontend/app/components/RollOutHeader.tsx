"use client"
import { useRouter } from "next/navigation"
import Shuffle from "./Shuffle"

export default function RollOutHeader() {
    const router = useRouter()
    return (
        <span onClick={() => router.push("/")} className="absolute top-5">
            <Shuffle
                className="self-center text-8xl font-extrabold text-blue-300 drop-shadow-lg tracking-tight hover:scale-105 transition-all duration-300 ease-out"
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
        </span>

    )
}