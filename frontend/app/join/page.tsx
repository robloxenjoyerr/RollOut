"use client"


import { useRouter } from "next/navigation";
import { useToasts } from "../hooks/useToasts";
import Input from "../components/Input";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import Button from "../components/Button";
import Footer from "../components/Footer";
import { AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import { apiFetch } from "../lib/api";
import Cookies from "js-cookie";
import ToastContainer from "../components/ToastContainer";

export default function JoinPage() {
    const { toasts, addToast } = useToasts()
    const gameCodeRef = useRef<(HTMLInputElement | null)>(null)
    const userNameRef = useRef<(HTMLInputElement | null)>(null)
    const router = useRouter()
    const [enteringUsername, setEnteringUsername] = useState<boolean>(false)
    const [username, setUsername] = useState<string | null>(null)

    async function verifyRoom() {
        const roomCode = gameCodeRef.current?.value
        const userName = userNameRef.current?.value
        if (!roomCode) return null

        try {
            const data = await apiFetch("/api/game/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ roomCode: roomCode, userName: userName }),
                redirectAuth: false // so apiFetch doesnt redirect by itself
            })

            if (!data.valid) {
                addToast(data.message, "error")
                setEnteringUsername(false)
                return
            }
            else {
                console.log("RES: ", data)
                setEnteringUsername(true)
            }

        } catch (err) {
            console.log(err)
        }
    }

    async function joinRoom() {
        const roomCode = gameCodeRef.current?.value
        const userName = userNameRef.current?.value
        if(!roomCode || !userName || !username) {
            addToast("Either Room-Code or Username was invalid.", "error")
            return
        }
        router.push(`/room/${roomCode}?username=${encodeURIComponent(username)}`)
    }

    return <>
        <div className=" flex flex-col w-[80vw] h-[80vh] gap-20 items-center justify-center ">
            <Header></Header>
            <AnimatePresence>
                {enteringUsername

                    ? <motion.div
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

                                <Input placeholder="Username" autoComplete="off" onChange={(e: React.ChangeEvent<HTMLInputElement>)=> setUsername(e.target.value)} className="text-center text-white rounded-xl" ref={userNameRef}></Input>
                            </div>
                            <Button onClick={joinRoom} className="w-fill m-2">Enter</Button>
                        </div>
                    </motion.div>

                    : <motion.div
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

                                <Input placeholder="Game-Code" autoComplete="off" className="text-center text-white rounded-xl" ref={gameCodeRef}></Input>
                            </div>
                            <Button onClick={verifyRoom} className="w-fill m-2">Join</Button>
                        </div>
                    </motion.div>
                }
            </AnimatePresence>

        </div >
        <ToastContainer toasts={toasts}></ToastContainer>
        <Footer></Footer>
    </>
}