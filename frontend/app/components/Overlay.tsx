import { ReactNode } from "react"
import Button from "./Button"
import { motion } from "framer-motion" // Importieren

interface OverlayProps {
    isOpen: boolean,
    onClose: () => void,
    children: ReactNode,
    bgClassName?: string,
    className?: string
}

export default function Overlay({ isOpen, onClose, children, className = "", bgClassName = "" }: OverlayProps) {
    // Wenn isOpen false ist, rendern wir gar nichts. 
    // Das erlaubt AnimatePresence im Parent, die exit-Animation zu starten!
    if (!isOpen) return null;

    return (
        <motion.div
            // Hintergrund-Animation
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={onClose}
            className={`fixed inset-0 z-50 flex justify-center items-center backdrop-blur bg-black/30 ${bgClassName}`}
        >
            <motion.div
                // Fenster-Animation
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={`bg-(--background)/90 rounded-xl border-2 border-white/20 shadow-md p-6 relative ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                <Button 
                    onClick={onClose} 
                    padding="p-0" 
                    className="hover:rotate-90 absolute top-0 right-0 rounded-md p-1 shadow-none bg-none h-7 w-7"
                >
                    <img src="/close.svg" alt="close" />
                </Button>
                {children}
            </motion.div>
        </motion.div>
    )
}