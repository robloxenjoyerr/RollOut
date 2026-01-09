"use client"

import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import { useEffect, useRef, useState } from 'react'
import { Overlay } from "../components/Overlay";
import SwitchMode from "../components/SwitchMode";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import { Template } from "../lib/types";
import MapItem from "../components/MapItem";
import { motion } from "framer-motion";

export default function Home() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
    const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false)
    const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false)
    const [isDeletingTemplate, setIsDeletingTemplate] = useState<boolean>(false)
    const [availableTemplates, setAvailableTemplates] = useState<Template[] | null>(null)
    const router = useRouter()


    useEffect(() => {
        function fetchTemplates() {
            const token = localStorage.getItem("login_token")
            if (!token || !isLoggedIn) return

            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                const ownerId = payload.id

                // Funktion außerhalb des IFs definieren, damit das Interval sie sieht
                const loadData = async () => {
                    console.log("Fetching templates for:", ownerId)
                    const res = await apiFetch("/api/templates/all", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ owner_id: ownerId })
                    })
                    setAvailableTemplates(res)
                };

                loadData()

                const interval = setInterval(loadData, 10000)
                return () => clearInterval(interval)

            } catch (e) {
                console.error("Error decoding token for templates", e)
            }
        }
        fetchTemplates()
    }, [isLoggedIn])


    // check if still logged in => login_token not expired
    useEffect(() => {
        const checkToken = () => {
            console.log("Checking token now.")
            const token = localStorage.getItem("login_token")
            console.log("token:", token)

            if (!token) {
                setIsLoggedIn(false)
                return false
            }

            try {
                // JWT Payload dekodieren (der mittlere Teil des Tokens)
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log("Vollständiges Payload-Objekt:", payload);
                const expiry = payload.exp * 1000; // exp ist in Sekunden, JS braucht Millisekunden

                console.log("expiring in:", expiry)
                console.log("current time:", Date.now())

                if (Date.now() >= expiry) {
                    console.log("Login Token timed out!")
                    localStorage.removeItem("login_token")
                    router.push("/login")
                } else {
                    setIsLoggedIn(true)
                }
            } catch (err) {
                localStorage.removeItem("login-token")
                setIsLoggedIn(false)
            }
        }
        checkToken()
        const interval = setInterval(checkToken, 10000)
        return () => clearInterval(interval)
    }, [])

    if (isLoggedIn === null) return <div>Loading...</div>

    if (!isLoggedIn) {
        return <>
            <Card className="mb-5" width="w-fit"><span>You are not logged in yet. Please login</span></Card>
            <div className="flex gap-4">
                <Button href="/login">Login</Button>
                <Button href="/register">Register</Button>
            </div>
        </>
    }

    if (!isLoggedIn) {
        return (
            <div className="flex flex-col items-center gap-4">
                <Card className="mb-5" width="w-fit">
                    <span>You are not logged in yet. Please login</span>
                </Card>
                <div className="flex gap-4">
                    <Button href="/login">Login</Button>
                    <Button href="/register">Register</Button>
                </div>
            </div>
        )
    }

    return <>
        <span onClick={() => window.location.href = "/"} className="hover:cursor-pointer absolute rounded-xs top-5 self-center select-none text-6xl hover:scale-110 transition-all duration-200 ease-in-out bg-gradient-to-r from-pink-500 via-yellow-500 to-blue-500 bg-[length:200%_200%] animate-gradient text-transparent bg-clip-text font-extrabold">RollOut</span>
        <div className=" flex flex-col w-[80vw] h-[80vh] gap-20">
            <div className="flex flex-col gap-2 relative top-0">
                <div className="flex flex-row gap-4">
                    <h1 className="text-black font-bold text-7xl top-0 select-none">Your Templates</h1>
                    <Button className="w-15 h-15 self-center bg-blue-200 rounded-3xl" onClick={() => setIsCreatingTemplate(true)}>
                        <img src="/PlusImage.svg" alt="" />
                    </Button>
                </div>
                <h2 className="text-gray-500 font-light text-2xl select-none">Create and Manage your game templates here - To Edit an existing Template simply click on it!</h2>
            </div>
            {/* Create new Template */}
            <Overlay isOpen={isCreatingTemplate} onClose={() => setIsCreatingTemplate(false)} className="z-50 w-100 h-100">
                <div className="flex flex-row gap-2">

                    <Input placeholder="Template Name" className="" />
                    <SwitchMode className="bg-blue-200"></SwitchMode>
                </div>
            </Overlay>

            {/* Edit existing Templates */}
            <Overlay isOpen={isEditingTemplate} onClose={() => setIsEditingTemplate(false)} className="z-50 w-100 h-100">
                <div className="flex flex-row gap-2">
                    Edit Template
                </div>
            </Overlay>

            {/* Delete confirmation */}
            <Overlay isOpen={isDeletingTemplate} onClose={() => setIsDeletingTemplate(false)} className="z-50 ">
                <div className="flex flex-row gap-2 h-fit w-fit">
                    <span>Are you sure that you want to permanently delete this Template?</span>
                </div>
            </Overlay>
            <div className="h-160 flex flex-row flex-wrap gap-5 items-start ">
                {availableTemplates ? availableTemplates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: index * 0.1 // Stagger-Effekt (nacheinander aufploppen)
                        }}
                    >
                        <Card onClick={() => setIsEditingTemplate(true)} height="h-30" flexDirection="flex-row" justifyContent="justify-between" gap="gap-4" autoMarginOn={false} padding="p-0" overflowAutoOn={false} width="w-100" className={`group hover:cursor-pointer ${isEditingTemplate ? "" : "hover:border-blue-400 border-3 hover:scale-105 hover:bg-blue-50"}  border-black/20 p-4`}>
                            <div className="flex flex-col gap-4">
                                <span className="font-bold select-none">Template Name</span>
                                <div className="flex flex-row gap-3">
                                    <div className="flex flex-row gap-2 rounded-sm bg-blue-200 w-fit p-1">
                                        <img className="w-5 h-5" src="/Persons.svg" alt="" />
                                        <p className="text-gray-500 select-none">{template.persons.length} Persons</p>
                                    </div>
                                    <div className="rounded-sm bg-blue-200 w-fit p-1 select-none text-gray-500">
                                        {template.mode}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col h-fit self-center gap-1">
                                <Button onClick={() => setIsDeletingTemplate(true)} className={`${isCreatingTemplate || isEditingTemplate || isDeletingTemplate ? "hidden" : "block"} h-fit w-fit p-0 bg-transparent shadow-none opacity-0 hover:bg-black/5 active:bg-red-400 group-hover:opacity-100`}>
                                    <img className="w-4 h-4 p-0" src="/Bin.svg" alt="" />
                                </Button>
                                <Button onClick={() => startGame("123")} className={`${isCreatingTemplate || isEditingTemplate || isDeletingTemplate ? "hidden" : "block"} bg-transparent shadow-none opacity-0 hover:bg-black/5 active:bg-green-400 group-hover:opacity-100`}>
                                    <img className="w-4 h-4 " src="/play-svgrepo-com.svg" alt="" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )) : <span className="text-black">Loading...</span>}
            </div>
            <dialog>
                Test
            </dialog>
        </div>
    </>
}