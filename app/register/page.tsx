"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../components/Button"
import Card from "../components/Card"
import Input from "../components/Input"
import { apiFetch } from "../lib/api"

interface UserCredentials {
    username: string,
    password: string,
    password_validity: string
}

export default function RegisterPage() {
    const router = useRouter()
    const [userCredentials, setUserCredentials] = useState<UserCredentials>({ username: "", password: "", password_validity: "" })
    const token = localStorage.getItem("login_token")

    async function TryRegister(e: React.ChangeEvent<HTMLFormElement>) {
            e.preventDefault()
            
            if (userCredentials.password !== userCredentials.password_validity) return "Password must be the same."
            console.log("Trying to register.")
            const res = await apiFetch("/api/user/create", {
                method: "POST",
                body: JSON.stringify({ username: userCredentials.username, password: userCredentials.password })
            })

            if (res.success) {
                console.log("Successfully registered.")
                console.log("Login Token: ", res.token)
                setUserCredentials({username:"", password: "", password_validity: ""})
                localStorage.setItem("login_token", res.token)
                router.push("/host")
                
            } else {
                console.log("Couldnt Register.")
            }
        }

    if (token) {
        router.push("/host")
    } else {

        return <>
            <span className="font-bold text-2xl text-black">Register</span>
            <Card className="border-black/20" width="w-[15vw]" height="h-fit" alignItems="" justifyContent="">
                <form onSubmit={TryRegister} action="" method="post" className="flex flex-col gap-2 justify-between">
                    <Input valid={!userCredentials.username ? false : true} onChange={(e) => setUserCredentials({ ...userCredentials, username: e.target.value })} value={userCredentials.username} className="text-black bg-black/10 shadow-none" placeholder="Username"></Input>
                    <Input valid={!userCredentials.password ? false : true} onChange={(e) => setUserCredentials({ ...userCredentials, password: e.target.value })} value={userCredentials.password} className="text-black bg-black/10 shadow-none" placeholder="Password"></Input>
                    <Input valid={!userCredentials.password_validity ? false : true} onChange={(e) => setUserCredentials({ ...userCredentials, password_validity: e.target.value })} value={userCredentials.password_validity} className="text-black bg-black/10 shadow-none" placeholder="Verify password"></Input>
                    <Button type="submit" className="flex items-center justify-center">Register</Button>
                    <Button href="/login" className="flex items-center justify-center">Back</Button>
                </form>
            </Card>
        </>
    }

}