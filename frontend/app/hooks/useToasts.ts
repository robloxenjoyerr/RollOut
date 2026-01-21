import { useState } from "react";
import { randomBytes } from "crypto";

export type ToastType = "success" | "error" | "info";
const timer = 3000

export function useToasts() {
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([])

    function addToast(message: string, type: ToastType) {
        const id = randomBytes(8).toString("hex")
        setToasts((prevToasts) => [...prevToasts, { id, message, type }])

        setTimeout(() => {  
            setToasts((prevToasts) => [...prevToasts.filter((toast)=> toast.id !== id)])
        }, timer)
    }

    return { toasts, addToast }
}