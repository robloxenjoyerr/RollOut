import { useToasts } from "../hooks/useToasts"
import Button from "./Button"
import ToastContainer from "./ToastContainer"
import { AnimatePresence, motion } from "framer-motion"

interface GameFinishedProps {
    isHost: boolean
    onStopGame: () => void
    onResetRoom: () => void

}



export default function GameFinished({ isHost, onStopGame, onResetRoom }: GameFinishedProps) {
    const { toasts, addToast } = useToasts()
    return <>
        <div className="flex flex-col gap-2 lg:gap-3 lg:w-52 xl:w-64 shrink-0 shadow-black/20 shadow-sm bg-white/15 border border-white/30 rounded-3xl p-3 lg:p-4 max-h-48 lg:max-h-96">
            <span className="font-bold uppercase self-center text-xs tracking-widest text-slate-400">Everyone has been rolled!</span>
            {isHost
                ?
                <div className="flex flex-col gap-2 overflow-y-auto">
                    <AnimatePresence>
                        <div className="flex gap-5 w-fit">
                            <Button className="w-full">Reroll</Button>
                            <Button className="w-full" onClick={onStopGame}>Close Room</Button>
                        </div>
                    </AnimatePresence>
                </div>
                :

                <div className="flex flex-col gap-2 overflow-y-auto">
                    <AnimatePresence>
                        <span className="self-center animate-pulse">Waiting for Host..</span>
                    </AnimatePresence>
                </div>

            }

        </div>
        <ToastContainer toasts={toasts} />
    </>
} 