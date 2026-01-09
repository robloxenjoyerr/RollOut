"use client"

import { useState } from "react";

import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";

interface UserCredentials {
    username: string,
    password: string
}

export default function LoginPage() {
    const [userCredentials, setUserCredentials] = useState<UserCredentials>({ username: "", password: "" })
    const router = useRouter()
    const token = localStorage.getItem("login_token")

    async function TryLogin(e: React.ChangeEvent<HTMLFormElement>) {
        e.preventDefault()
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
        }
    }

    if (token) {
        router.push("/host")
    } else {
        return <>
            <span className="font-bold text-2xl text-black">Login</span>
            <Card className="border-black/20" width="w-[15vw]" height="h-fit" alignItems="" justifyContent="">
                <form onSubmit={TryLogin} action="" method="post" className="flex flex-col gap-2 justify-between">
                    <Input valid={!userCredentials.username ? false : true} onChange={(e) => setUserCredentials({ ...userCredentials, username: e.target.value })} value={userCredentials.username} className="text-black bg-black/10 shadow-none" placeholder="Username"></Input>
                    <Input valid={!userCredentials.password ? false : true} onChange={(e) => setUserCredentials({ ...userCredentials, password: e.target.value })} value={userCredentials.password} className="text-black bg-black/10 shadow-none" placeholder="Password"></Input>
                    <Button type="submit" >Login</Button>
                    <Button href="/register" className="flex items-center justify-center">Register</Button>
                </form>
            </Card>
        </>
    }


}