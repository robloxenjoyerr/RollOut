"use client"

import Button from "../components/Button";
import Input from "../components/Input";
import Card from "../components/Card";
import { useEffect, useRef, useState } from 'react'
import { Overlay } from "../components/Overlay";
import SwitchMode from "../components/SwitchMode";


export default function Home() {
    const [isCreatingTemplate, setIsCreatingTemplate] = useState<boolean>(false)
    const [isEditingTemplate, setIsEditingTemplate] = useState<boolean>(false)

    async function fetchTemplates() {
        const res = await fetch(``)
    }

    useEffect(() => {
        const templates = fetchTemplates()
    }, [])

    return (
        <div className="flex flex-col w-[80vw] h-[80vh] gap-20">
            <div className="relative top-0">
                <div className="flex flex-row gap-4">
                    <h1 className="text-black font-bold text-7xl top-0 select-none">Your Templates</h1>
                    <Button className="w-15 h-15 self-center bg-blue-200 rounded-3xl" onClick={() => setIsCreatingTemplate(true)}>
                        <img src="/PlusImage.svg" alt="" />
                    </Button>
                </div>
                <h2 className="text-gray-500 font-light text-2xl select-none">Create and Manage your game templates here</h2>
            </div>
            {/* Create new Template */}
            <Overlay isOpen={isCreatingTemplate} onClose={() => setIsCreatingTemplate(false)} className="w-100 h-100">
                <div className="flex flex-row gap-2">

                    <Input placeholder="Template Name" className="" />
                    <SwitchMode className="bg-blue-200"></SwitchMode>
                </div>
            </Overlay>

            {/* Edit existing Templates */}
            <Overlay isOpen={isEditingTemplate} onClose={()=> setIsEditingTemplate(false)} className="w-100 h-100">
                <div className="flex flex-row gap-2">

                </div>
            </Overlay>
            <div className="h-160 flex flex-row flex-wrap gap-5 items-start">
                <Card onClick={() => setIsEditingTemplate(true)} height="h-30" flexDirection="flex-row" justifyContent="justify-between" gap="gap-4" autoMarginOn={false} padding="p-0" width="w-100" className={`group hover:cursor-pointer ${isEditingTemplate ? "" : "hover:border-blue-400 border-3 hover:scale-105 hover:bg-blue-50"}  border-black/20 p-4`}>
                    <div className="flex flex-col gap-4">
                        <span className="font-bold select-none">Template Name</span>
                        <div className="flex flex-row gap-3">
                            <div className="flex flex-row gap-2 rounded-sm bg-blue-200 w-fit p-1">
                                <img className="w-5 h-5" src="/Persons.svg" alt="" />
                                <p className="text-gray-500 select-none">0 people</p>
                            </div>
                            <div className="rounded-sm bg-blue-200 w-fit p-1 select-none text-gray-500">
                                random
                            </div>
                        </div>
                    </div>
                    <div>
                        <Button className="bg-transparent shadow-none opacity-0 hover:bg-black/5 active:bg-red-400 group-hover:opacity-100">
                            <img className="w-5 h-5 " src="/Bin.svg" alt="" />
                        </Button>
                    </div>
                </Card>

            </div>
            <dialog>
                Test
            </dialog>
        </div>
    )
}