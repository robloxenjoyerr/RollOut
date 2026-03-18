"use client";

import Link from "next/link"
import { ReactNode, useState } from "react"
import { twMerge } from "tailwind-merge"


interface ButtonProps {
    children: ReactNode;
    textColor?: string,
    marginx?: string,
    marginy?: string,
    size?: number,
    className?: string | undefined,
    href?: string,
    disabled?: boolean,
    disabledTimer?: number | null,
    type?: "submit" | "reset" | "button" | undefined,
    [key: string]: any
}

export default function Button({
    children,
    textColor = "white",
    padding = "p-4",
    margin = "m-2",
    className = "",
    href,
    disabled = false,
    disabledTimer = null,
    type = undefined,
    onClick,
    ...props
}: ButtonProps) {
    const [timerDisabled, setTimerDisabled] = useState(false)

    const isDisabled = disabled || timerDisabled  // ← außen oder timer

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        if (isDisabled) return
        onClick?.(e)

        if (disabledTimer) {
            setTimerDisabled(true)
            setTimeout(() => setTimerDisabled(false), disabledTimer)
        }
    }

    const style = twMerge(
        "flex items-center justify-center select-none font-semibold text-center rounded-2xl shadow-md transition-all duration-150 ease-in-out",
        padding,                    
        `text-${textColor}`,
        isDisabled
            ? "opacity-50 cursor-not-allowed bg-gray-500/50"
            : "bg-transparent cursor-pointer active:scale-95",
        !isDisabled && className    
    )



    if (href) {
        return (
            <Link href={isDisabled ? "" : href} type={type} className={style} {...props} >
                {children}
            </Link>
        )
    }

    return (
        <button className={style} type={type} onClick={handleClick} {...props}>
            {children}
        </button>
    )
}