"use client"

import { useEffect, useState } from "react";

import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import ToastContainer from "../components/ToastContainer";
import { useToasts } from "../hooks/useToasts";


interface UserCredentials {
    username: string,
    password: string
}

export default function LoginPage() {
    const { toasts, addToast } = useToasts()
    const [userCredentials, setUserCredentials] = useState<UserCredentials>({ username: "", password: "" })
    const router = useRouter()
    let token: string | null = ""

    useEffect(() => {
        token = localStorage.getItem("login_token")
    })

    async function TryLogin(e: React.ChangeEvent<HTMLFormElement>) {
        e.preventDefault()
        try {
            const res = await apiFetch("/api/user/login", {
                method: "POST",
                body: JSON.stringify({ username: userCredentials.username, password: userCredentials.password })
            })

            if (res.success) {
                localStorage.setItem("login_token", res.token)
                console.log("logged in")
                router.push("/host")
            }
            else {
                console.log("Wrong Login-Credentials!")
                addToast("Login Credentials are Wrong.", "error")
            }
        } catch (err) {
            addToast(`Backend Error: ${err}`, "error")
        }
    }

    if (token) {
        router.push("/host")
    } else {
        return <>
            <AnimatePresence>
                <ToastContainer toasts={toasts}></ToastContainer>
            </AnimatePresence>

            <span className="font-bold text-2xl text-black">Login</span>
            <Card className="border-black/20" width="w-[15vw]" height="h-fit" alignItems="" justifyContent="">
                <form onSubmit={TryLogin} action="" method="post" className="flex flex-col gap-2 justify-between">
                    <Input valid={!userCredentials.username ? false : true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserCredentials({ ...userCredentials, username: e.target.value })} value={userCredentials.username} className="text-black bg-black/10 shadow-none" placeholder="Username"></Input>
                    <Input valid={!userCredentials.password ? false : true} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserCredentials({ ...userCredentials, password: e.target.value })} value={userCredentials.password} className="text-black bg-black/10 shadow-none" placeholder="Password"></Input>
                    <Button type="submit" >Login</Button>
                    <span className="group w-35 h-5 flex self-center items-center justify-center gap-1">
                        <span className="text-xs select-none ">No account yet?</span>
                        <Link href={"/register"} className="text-gray-600 text-xs hover:text-gray-800 text-10 transition duration-150 ease-in-out group-hover:text-cyan-400">Register</Link>
                    </span>
                </form>
            </Card>
        </>
    }


}