"use client"

import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";

export default function LoginPage() {

    function TryLogin() {
        console.log("Logged in")
    }
    return <>

        <span className="font-bold text-2xl text-black">Login</span>
        <Card className="border-black/20" width="w-[15vw]" height="h-[30vh]" alignItems="" justifyContent="">
            <form onSubmit={TryLogin} action="" method="post" className="flex flex-col gap-2 justify-between">
                <Input className="text-black bg-black/10 shadow-none" required placeholder="Name"></Input>
                <Input className="text-black bg-black/10 shadow-none" required placeholder="Password"></Input>
                <Button>Login</Button>
            </form>
        </Card>
    </>
}