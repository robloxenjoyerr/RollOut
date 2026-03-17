import { AnimatePresence, motion } from "framer-motion"
import { ToastType } from "../hooks/useToasts"
interface Toast {
    id: string,
    message: string,
    type: ToastType
}

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (

        <div className="flex gap-2 flex-col justify-end mr-2 fixed inset-1 w-50 h-70 top-auto left-auto items-end transition-colors duration-150 ease-in-out overflow-hidden pointer-events-none bg-black/0 mask-[linear-gradient(to_top,black_50%,transparent_100%)]">
            <AnimatePresence mode="popLayout">
                {[...toasts].reverse().map((toast, index) => (
                    <motion.div key={toast.id} className="mb-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        layout={true}
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 20,
                           
                        }}
                    >
                        <div className={`px-4 py-2 rounded-2xl shadow-md border-2 w-full border-black/20 bg-black/30 text-white pointer-events-auto ${toast.type === "success" ? "text-green-500" : toast.type === "error" ? "text-red-500" : toast.type === "info" ?"text-blue-500" : "text-yellow-500"}`}>
                            {toast.message}
                        </div>
                    </motion.div>

                ))}
            </AnimatePresence>
        </div>
    )

}