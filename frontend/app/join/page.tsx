"use client"


import { useRouter } from "next/navigation";
import { useToasts } from "../hooks/useToasts";
import RollOutHeader from "../components/RollOutHeader";
import Input from "../components/Input";
import { motion } from "framer-motion";
import { useRef } from "react";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { AnimatePresence } from "framer-motion";
import Header from "../components/Header";


export default function JoinPage() {
    const { toasts, addToast } = useToasts()
    const inputRef = useRef<(HTMLInputElement | null)>(null)

    const router = useRouter()


    async function joinRoom() {
        console.log(inputRef.current?.value)

        router.push(`/room/${inputRef.current?.value}`)
    }

    return <>
        <div className=" flex flex-col w-[80vw] h-[80vh] gap-20 items-center justify-center ">
            <Header></Header>
            <AnimatePresence>

                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 250,
                        damping: 20,
                    }}
                    className="flex flex-col h-fit gap-2 absolute">
                    <span className="text-center font-extrabold"></span>
                    <div className="flex flex-col top-32 p-2 h-fit text-white font-bold text-2xl shadow-black/20 shadow-sm  backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl">
                        <div className="flex w-100 h-20 gap-1 rounded-2xl p-2">

                            <Input placeholder="Room-Code" className="text-center text-white rounded-xl" ref={inputRef}></Input>
                        </div>
                        <Button onClick={joinRoom} className="w-fill m-2">Join</Button>
                    </div>
                </motion.div>
            </AnimatePresence>

        </div >
        <Footer></Footer>
    </>
}