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
    unrolledClients: Client[] | null
    isHost: boolean
    isSpinning: boolean
    onRollNext: () => void
    onStopGame: () => void
}
export default function GameInProgress({ clients, mode, rotation, currentRolledClient, unrolledClients, isHost, isSpinning, onRollNext, onStopGame }: GameInProgressProps) {
    const { toasts, addToast } = useToasts()
    const router = useRouter()

    return <>
        <AnimatePresence>
            <ToastContainer toasts={toasts}></ToastContainer>
        </AnimatePresence>
        <AnimatePresence>
            <div className="flex flex-col gap-10 absolute items-center justify-center w-screen h-screen box-content overflow-hidden m-0 p-0">
                <div className="flex flex-col">
                    <span className="text-black font-bold text-7xl select-none ">Game is running!</span>
                </div>
                <div className="flex text-black flex-row gap-4 flex-wrap">
                    {/* Wheel */}

                    <div className="flex flex-col items-center gap-10">
                        <Wheel persons={clients} rotation={rotation} />
                    </div>
                </div>
            </div>
        </AnimatePresence>
        {isHost

            ?
            <div className="absolute bottom-5 left-5 flex gap-5">
                <Button disabled={isSpinning} onClick={onRollNext}>Roll Next</Button>
                <Button onClick={onStopGame}>Stop Game</Button>
            </div>

            :
            ""
        }

    </>
}