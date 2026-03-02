import { useRouter } from "next/navigation";
import Shuffle from "./Shuffle";
import ShinyText from "./ShinyText";
import { use } from "react";

interface HeaderProps{
    useRedirect?: boolean
}

export default function Header({useRedirect = false}:HeaderProps) {
    const router = useRouter()
    return (
        <header className="w-full h-14  absolute justify-center top-0 bg-black/20 backdrop-blur-md border-b-2 border-white/5 flex items-center px-8 select-none">
            <div className="absolute left-3 flex gap-2 justify-center items-center">
                <img width={30} src="/favicon.ico"></img>
                <span onClick={() => router.push("/")} className="uppercase text-[0.75rem] text-cyan-300 font-bold hover:cursor-pointer">Home</span>
            </div>
            <ShinyText
                className={`text-4xl tracking-widest  uppercase font-extrabold`}
                text="RollOut"
                speed={2}
                delay={3}
                color="#63acb8"
                shineColor="#ffffff"
                spread={120}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
                disabled={false}
            />
        </header>
    );
}