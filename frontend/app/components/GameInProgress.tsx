"use client"
import { useState } from "react"
import { useToasts } from "../hooks/useToasts"
import { useSocket } from "../hooks/useSocket"
import { Client } from "../lib/types"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import ToastContainer from "./ToastContainer"
import Button from "./Button"
import Wheel from "./Wheel"

interface GameInProgressProps {
    clients: Client[] | null
    mode: string
    rotation: number
    currentRolledClient: Client | null
    isHost: boolean
    clientId: string
    isSpinning: boolean
    toasts: any,
    onRollNext: () => void
    onStopGame: () => void
    onToggleLateJoin: () => void
}

export default function GameInProgress({ clients, toasts, mode, rotation, currentRolledClient, isHost, clientId, isSpinning, onRollNext, onStopGame, onToggleLateJoin }: GameInProgressProps) {
    const router = useRouter()

    console.log("GAME-IN-PROGRESS-VIEW")

    return <>
        <AnimatePresence>
            <ToastContainer toasts={toasts}></ToastContainer>
        </AnimatePresence>
        <AnimatePresence>
            <div className="flex flex-col gap-10 absolute items-center justify-center w-screen h-screen box-content overflow-hidden m-0 p-0">
                <div className="flex flex-col">
                    <h1 className="text-7xl absolute top-5 align-middle font-black bg-linear-to-r from-white via-blue-200 to-indigo-300 bg-clip-text text-transparent select-none">Game is running!</h1>
                    <span  className="text-white">{currentRolledClient?.name}</span>
                </div>
                <div className="flex text-black flex-row gap-4 flex-wrap">
                    {/* Wheel */}

                    <div className="flex flex-col items-center gap-10">
                        <Wheel clients={clients} rotation={rotation} />
                    </div>
                </div>
            </div>
        </AnimatePresence>
        {isHost

            ?
            <div className="absolute bottom-5 align-middle flex gap-5">
                <Button className="bg-red-500" disabledTimer={3000} onClick={onToggleLateJoin}>Allow Late Join</Button>
                <Button disabled={isSpinning} onClick={onRollNext}>Roll Next</Button>
                <Button onClick={onStopGame}>Stop Game</Button>
            </div>

            :
            ""
        }
    </>
}