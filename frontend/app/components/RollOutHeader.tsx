"use client"
import {useRouter} from "next/navigation"

export default function RollOutHeader() {
    const router = useRouter()
    return (
        <span onClick={() => router.push("/")} className="hover:cursor-pointer absolute rounded-xs top-5 self-center select-none text-6xl hover:scale-110 transition-all duration-200 ease-in-out bg-linear-to-r from-pink-500 via-yellow-500 to-blue-500 bg-size-[200%_200%] animate-gradient text-transparent bg-clip-text font-extrabold">RollOut</span>
    )
}