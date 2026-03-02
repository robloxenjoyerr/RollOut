import { useRouter } from "next/navigation";

export default function Footer() {
    const router = useRouter()
    return (
        <footer className="w-full h-14 absolute justify-center bottom-0 bg-black/20 backdrop-blur-md border-t-2 border-white/5 flex items-center px-8 select-none">
            {/* Linke Seite: Copyright */}
            <div className="text-white/30 text-xs font-medium absolute left-5">
                © {new Date().getFullYear()} <span className="text-(--accent-cyan)">RollOut</span>
            </div>

            {/* Rechte Seite: Rechtliches */}
            <div className="flex gap-6 items-center">
                <a
                    href="/impressum"
                    className="text-white/40 hover:text-(--accent-cyan) text-xs transition-colors cursor-pointer"
                >
                    Impressum
                </a>
                <a
                    href="/datenschutz"
                    className="text-white/40 hover:text-(--accent-cyan) text-xs transition-colors cursor-pointer"
                >
                    Datenschutz
                </a>
                <a
                    href="/agb"
                    className="text-white/40 hover:text-(--accent-cyan) text-xs transition-colors cursor-pointer"
                >
                    AGB
                </a>

                {/* Kleiner Status-Indikator (optionaler Eyecatcher) */}
                <div className="ml-4 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-white/50 uppercase tracking-widest">RollOut Status</span>
                </div>

                <a
                    href="https://buymeacoffee.com/deinname"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-indigo-400 animate-pulse hover:border-(--accent-indigo) transition-all cursor-pointer"
                >
                    <span className="text-white/40 group-hover:text-(--accent-blue) transition-colors">
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                        >
                            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                            <line x1="6" y1="1" x2="6" y2="4" />
                            <line x1="10" y1="1" x2="10" y2="4" />
                            <line x1="14" y1="1" x2="14" y2="4" />
                        </svg>
                    </span>
                    <span className="text-[10px] flex text-white/40 group-hover:text-white transition-colors uppercase tracking-wider">
                       
                        Support Dev
                    </span>
                </a>
                <span onClick={() => router.push("/news")} className="text-white/40 group-hover:text-white border border-white/10 bg-white/5 p-1 transition-colors text-[10px] select-none hover:cursor-pointer hover:border-gray-400 w-fit self-center flex text-center backdrop-blur-md px-2 rounded-xl uppercase">
                    Checkout all new features here! 📢
                </span>
            </div>
        </footer>
    );
}