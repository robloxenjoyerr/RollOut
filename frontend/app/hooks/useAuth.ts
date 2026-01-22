import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthState = "loading" | "authenticated" | "unauthenticated"

export function useAuth() {
    const [state, setState ] = useState<AuthState>("loading")
    const router = useRouter()

    function getToken() {
        return typeof window === "undefined" ? null : localStorage.getItem("login_token")
    }

    function getUser() {
        const token = getToken()

        if(!token) return null

        try {
            return JSON.parse(atob(token.split(".")[1]))
        }
        catch
        {
            return null
        }
    }

    useEffect(()=> {
        const check = () => {
            const user = getUser()
            if(!user || Date.now() >= user.exp * 1000) {
                localStorage.removeItem("login_token")
                setState("unauthenticated")
                router.push("/login")
            } else {
                setState("authenticated")
            }
        }

        check()
        console.log("Checking login status now.")
        const i = setInterval(check, 10000)
        return () => clearInterval(i)
    }, [])
    
    return { state, user: getUser(), token: getToken() }
}