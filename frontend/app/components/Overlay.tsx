import { ReactNode } from "react"
import Button from "./Button"


interface OverlayProps {
    isOpen: boolean,
    onClose: any,
    children: ReactNode
    className?: string
    [key: string]: any
}



export default function Overlay({isOpen = false, onClose, children, className = "", ...props }: OverlayProps) {
    
    return (
        <div // HIER WAS GEÄNDERT BEI isOpen ? : 
            onClick={onClose}
            className={`fixed inset-0 flex justify-center items-center transition-colors duration-150 ease-in-out ${isOpen ? "opacity-100 pointer-events-auto bg-black/20" : "opacity-0 pointer-events-none"} `}
        >
            <div
                className={`bg-white rounded-xl border-2 border-black/30 shadow-md p-6 transition-all ease-in-out ${isOpen ? "scale-100 opacity-100" : "scale-125 opacity-0"} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <Button onClick={onClose} padding="p-0" className="hover:rotate-90 absolute top-0 right-0 rounded-md p-1 shadow-none bg-transparent h-7 w-7"><img src="/close.svg" alt="" /></Button>
                {children}
            </div>
        </div>
    )
}