"use client"

import { useState } from "react"

interface MapItemProps {
    content: string,
    onClick?: () => void
    style?: string,
    className?: string
    disappearAfterClick?: boolean
}

export default function MapItem({
    content, 
    onClick,
    style = `shadow-lg backdrop-blur-xl bg-white/5 border border-white/30 rounded-2xl m-1 select-none p-1 text-center cursor-pointer transition-all ease-in-out hover:bg-white/10`, 
    className = "",
    disappearAfterClick = true
}: MapItemProps) {
    const [exitAnimation, setExitAnimation] = useState<boolean | null>(false)

    style += exitAnimation ? " scale-0 opacity-0" : ""
    
    function handleClick() {
        if (disappearAfterClick) setExitAnimation(true)
        else onClick?.()
    }

    function handleAnimationEnd() {
        if (exitAnimation) {
            setTimeout(() => onClick?.(), 100)
        }
    }


    return (
        <span 
            className={`${style} ${className}`}
            onClick={handleClick}
            onTransitionEnd={handleAnimationEnd}
        >
            {content}
        </span>
    )
}