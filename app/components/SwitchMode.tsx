"use client"
import { ReactNode, useState } from "react"
import Button from "./Button";

const Modes = {
    random: "random",
    wheel: "wheel",
    plinko: "plinko",
    casino: "casino"
}

export type Mode = "random" | "wheel" | "plinko" | "casino";


interface SwitchModeProps {
    onChange?:(mode: Mode) => void
    className?: string
} 

export default function SwitchMode({ onChange, className="" }: SwitchModeProps) {
    const modeValues = Object.values(Modes) as Mode[]; // ["random", "wheel", "plinko", "casino"]
    const [currentIndex, setCurrentIndex] = useState(0);

    function changeMode() {
        const nextIndex = currentIndex < modeValues.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(nextIndex);
        onChange?.(modeValues[nextIndex]);
    }

    return (
        <Button className={className} onClick={changeMode}>
            {modeValues[currentIndex]}
        </Button>
    )
}