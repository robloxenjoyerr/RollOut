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
    const usernameInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const [enteringUsername, setEnteringUsername] = useState<boolean>(false)
    const [username, setUsername] = useState<string>("")
    const [roomCode, setRoomCode] = useState<string>("")
    const [clientId, setClientId] = useState<string>("");
    const [shakeFeedback, setShakeFeedback] = useState<boolean>(false)

    function shakeFeedbackTimeout() {
        setShakeFeedback(true)
        const timer = setTimeout(() => {
            setShakeFeedback(false)
        }, 500)

        
    }

    async function verifyRoom() {
        if (!roomCode){
            shakeFeedbackTimeout()
            return null
        }

        try {
            const data = await apiFetch("/api/game/join", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ roomCode: roomCode }),
                redirectAuth: false // so apiFetch doesnt redirect by itself
            })

            if (!data.valid) {
                console.log("JOIN RESPONSE: ", data)
                addToast(data.message, "error")
                shakeFeedbackTimeout()
                setEnteringUsername(false)
                return
            }
            else {
                console.log("RES: ", data)
                setClientId(data.clientId); // Speichere die ClientId
                setEnteringUsername(true)
                if (usernameInputRef.current) {
                    usernameInputRef.current.value = ""
                }
            }

        } catch (err) {
            console.log(err)
        }
    }

    async function joinRoom() {
        console.log(`roomCode: ${roomCode} and username: ${username}`)
        if (!roomCode || !username) {
            addToast("Either Room-Code or Username was invalid.", "error")
            shakeFeedbackTimeout()
            return
        }
        router.push(`/room/${roomCode}?username=${encodeURIComponent(username)}&clientId=${clientId}`)
    }

    return <>
        <div className=" flex flex-col w-[80vw] h-[80vh] gap-20 items-center justify-center ">
            <Header></Header>
            <AnimatePresence>
                {enteringUsername

                    ? <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            x: shakeFeedback ? [0, -10, 10, -10, 10, 0] : 0  // ← shake
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 20,
                            x: { duration: 0.4 }  // ← shake schneller als entry
                        }}
                        className="flex flex-col h-fit gap-2 absolute">
                        <span className="text-center font-extrabold"></span>
                        <div className="flex flex-col top-32 p-2 h-fit text-white font-bold text-2xl shadow-black/20 shadow-sm  backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl">
                            <div className="flex w-100 h-20 gap-1 rounded-2xl p-2">

                                <Input name="username-input" placeholder="Username" value={username} autoComplete="off" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)} className="text-center text-white rounded-xl"></Input>
                            </div>
                            <Button onClick={joinRoom} className="w-fill m-2">Enter</Button>
                        </div>
                    </motion.div>

                    : <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                            scale: 1,
                            opacity: 1,
                            x: shakeFeedback ? [0, -10, 10, -10, 10, 0] : 0  // ← shake
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 250,
                            damping: 20,
                            x: { duration: 0.4 }  // ← shake schneller als entry
                        }}
                        className="flex flex-col h-fit gap-2 absolute">
                        <span className="text-center font-extrabold"></span>
                        <div className="flex flex-col top-32 p-2 h-fit text-white font-bold text-2xl shadow-black/20 shadow-sm  backdrop-blur-md bg-white/15 border border-white/30 rounded-3xl">
                            <div className="flex w-100 h-20 gap-1 rounded-2xl p-2">

                                <Input name="roomcode-input" placeholder="Game-Code" autoComplete="off" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoomCode(e.target.value)} className="text-center text-white rounded-xl" ></Input>
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