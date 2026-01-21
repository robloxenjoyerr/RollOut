import { AnimatePresence, motion } from "framer-motion"
interface Toast {
    id: string,
    message: string,
    type: "success" | "error" | "info"
}

export default function ToastContainer({ toasts }: { toasts: Toast[] }) {
    return (

        <div className="flex gap-2 flex-col-reverse mr-2 fixed inset-1 w-50 h-100 top-auto left-auto items-start transition-colors duration-150 ease-in-out pointer-events-none bg-black/0">
            <AnimatePresence>
                {toasts && toasts.map((toast, index) => (
                    <motion.div key={toast.id} className="mb-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        layout={true}
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 20,
                           
                        }}
                    >
                        <div className={`px-4 py-2 rounded-md shadow-md text-white pointer-events-auto ${toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"}`}>
                            {toast.message}
                        </div>
                    </motion.div>

                ))}
            </AnimatePresence>
        </div>
    )

}