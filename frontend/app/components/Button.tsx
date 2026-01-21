"use client";

import Link from "next/link"
import { ReactNode } from "react"

interface ButtonProps{
    children: ReactNode;
    textColor?: string,
    marginx?: string,
    marginy?: string,
    size?: number,
    className?: string | undefined,
    href?: string,
    disabled?: boolean,
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
    type=undefined,
    onClick,
    ...props
}: ButtonProps) {
    function handleClick(e: React.MouseEvent<HTMLButtonElement>){
        if (!disabled) onClick?.(e)
    }

    const style = `select-none ${padding} text-${textColor} font-semibold rounded-xl shadow-md transition-all duration-150 ease-in-out ${disabled ? "opacity-50 cursor-not-allowed bg-gray-500/50" : `transition-all duration-150 ease-in-out bg-blue-400 hover:bg-blue-500 cursor-pointer active:scale-95 ${className}` } 
`;

    if(href){
        return(
            <Link href={disabled ? "" : href} type={type} className={style} {...props} >
                {children}
            </Link>
        )
    }

    return(
        <button className={style} type={type} onClick={handleClick} {...props}>
            {children}
        </button>
    )
}