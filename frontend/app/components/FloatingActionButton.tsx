"use client"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export default function FloatingActionButton() {
    const [isHovered, setIsHovered] = useState(false)
    const [isContacting, setIsContacting] = useState<boolean>(false)
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Logik zum Senden hier einfügen
        setIsContacting(false)
        setIsHovered(false)
    }

    return (
        <div className="fixed bottom-19 right-5 z-50 flex items-end justify-end select-none">
            <AnimatePresence mode="wait">
                {!isContacting ? (
                    <motion.div
                        key="button-trigger"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-3 flex-row-reverse"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {/* Der Button */}
                        <motion.div
                            onClick={() => setIsContacting(true)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-12 h-12 flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl cursor-pointer shadow-xl relative overflow-hidden group"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`transition-colors duration-300 ${isHovered ? 'text-yellow-400' : 'text-white/70'}`}
                            >
                                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A5 5 0 0 0 8 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                                <path d="M9 18h6" />
                                <path d="M10 22h4" />
                                <motion.g
                                    animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                >
                                    <line x1="12" y1="2" x2="12" y2="4" stroke="white" />
                                    <line x1="5" y1="5" x2="6.5" y2="6.5" stroke="white" />
                                    <line x1="17.5" y1="6.5" x2="19" y2="5" stroke="white" />
                                </motion.g>
                            </svg>
                        </motion.div>

                        {/* Der Hover-Text */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.span
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-white/5 backdrop-blur-lg border border-white/10 px-4 py-2 rounded-xl text-xs font-medium text-white/80 whitespace-nowrap"
                                >
                                    Got suggestions? <span onClick={() => setIsContacting(true)} className="text-(--accent-cyan) font-bold cursor-pointer hover:text-white">Contact us!</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    /* ZUSTAND 2: DAS FORMULAR */
                    <motion.div
                        key="contact-form"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-72 bg-black/40 backdrop-blur-2xl border border-white/20 p-5 rounded-3xl shadow-2xl flex flex-col gap-4"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">New Suggestion</span>
                            </div>
                            <button 
                                onClick={() => setIsContacting(false)} 
                                className="w-6 h-6 flex hover:cursor-pointer items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors text-xs"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                placeholder="Email address" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-all"
                            />
                            <textarea 
                                placeholder="Tell us what to add or improve..." 
                                required
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-400/50 transition-all resize-none"
                            />
                            <button 
                                type="submit"
                                className="bg-white hover:cursor-pointer text-black text-[10px] uppercase font-black py-3 rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                Send Message
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}