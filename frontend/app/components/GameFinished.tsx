import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"

export default function GameFinished(){
    const {toasts, addToast} = useToasts()
    console.log("GAME-FINISHED-VIEW")
    return<>
        <span className="text-white font-bold text-2xl">Room is closing in 5s..</span>
        <ToastContainer toasts={toasts}/>
    </>
}