"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button"
import Card from "../components/Card"
import Input from "../components/Input"
import { apiFetch } from "../lib/api"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion";
import ToastContainer from "../components/ToastContainer";
import { useToasts } from "../hooks/useToasts";
import { useEffect } from "react"
import RollOutHeader from "../components/RollOutHeader"
import Cookies from "js-cookie"

interface UserCredentials {
    username: string,
    password: string,
    password_validity: string
}

export default function RegisterPage() {
    const { toasts, addToast } = useToasts()
    const router = useRouter()
    const [userCredentials, setUserCredentials] = useState<UserCredentials>({ username: "", password: "", password_validity: "" })
    const token = Cookies.get("login_token")

    useEffect(() => {
            const token = Cookies.get("login_token")
            if (token){
                window.location.href = "/host"
            }
        })

    async function TryRegister(e: React.ChangeEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            if (userCredentials.password !== userCredentials.password_validity) return "Password must be the same."
            console.log("Trying to register.")
            const res = await apiFetch("/api/user/register", {
                method: "POST",
                body: JSON.stringify({ username: userCredentials.username, password: userCredentials.password })
            })

            if (res.success) {
                console.log("Successfully registered.")
                console.log("Login Token: ", res.token)
                setUserCredentials({ username: "", password: "", password_validity: "" })
                Cookies.set("login_token", res.token)
                router.push("/host")

            } else {
                console.log("Couldnt Register.")
            }
        } catch (err) {
            addToast(`Backend Error: ${err}`, "error")
        }
    }

    if (token) {
        router.push("/host")
    } else {

        return <>
            <RollOutHeader/>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>
            <span className="font-bold text-2xl text-black">Register</span>
            <Card className="border-black/20 overflow-hidden" width="w-[15vw]" height="h-fit" alignItems="" justifyContent="">
                <form onSubmit={TryRegister} action="" method="post" className="flex flex-col gap-2 justify-between">
                    <Input valid={!userCredentials.username ? false : true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserCredentials({ ...userCredentials, username: e.target.value })} value={userCredentials.username} className="text-black bg-black/10 shadow-none" placeholder="Username"></Input>
                    <Input valid={!userCredentials.password ? false : true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserCredentials({ ...userCredentials, password: e.target.value })} value={userCredentials.password} className="text-black bg-black/10 shadow-none" placeholder="Password"></Input>
                    <Input valid={!userCredentials.password_validity ? false : true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserCredentials({ ...userCredentials, password_validity: e.target.value })} value={userCredentials.password_validity} className="text-black bg-black/10 shadow-none" placeholder="Verify password"></Input>
                    <Button type="submit" className="flex items-center justify-center ">Register</Button>
                    <span className="group w-35 h-5 flex self-center items-center justify-center gap-1">
                        <span className="text-xs select-none ">Already registered?</span>
                        <Link href={"/login"} className="text-gray-600 text-xs hover:text-gray-800 text-10 transition duration-150 ease-in-out group-hover:text-cyan-400 ">Login</Link>
                    </span>
                </form>
            </Card>
        </>
    }

}