import { useToasts } from "../hooks/useToasts"
import ToastContainer from "./ToastContainer"

export default function GameFinished(){
    const {toasts, addToast} = useToasts()
    console.log("GAME-FINISHED-VIEW")
    return<>
       <h1>Everyone has been rolled!</h1>
        <ToastContainer toasts={toasts}/>
    </>
}