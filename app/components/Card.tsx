"use client"

import Link from "next/link"
import { ReactNode } from "react"

interface CardProps {
    children: ReactNode,
    display?: string,
    flexDirection?: string,
    gap?: string,
    width?: string,
    height?: string,
    padding?: string,
    margin?: string,
    border?: string,
    alignItems?: string,
    justifyContent?: string,
    boxSizing?: string,
    labelText?: string,
    labelClassName?: string,
    autoMarginOn?: boolean,
    isStyled?: boolean,
    shadowOn?: boolean,
    overflowAutoOn?: boolean,
    hideScrollbar?: boolean,
    href?:string,
    className?: string,
    [key: string]: any
}

export default function Card({
    children,
    display = "flex",
    flexDirection = "flex-col",
    gap = "gap-1",
    width = "w-full",
    height = "h-auto",
    padding = "p-2",
    margin = "m-0",
    border = "border-0",
    alignItems = "items-stretch",
    justifyContent = "justify-center",
    boxSizing = "box-border",
    autoMarginOn = true,
    isStyled = true,
    shadowOn = true,
    overflowAutoOn = true,
    hideScrollbar = false,
    labelText = "",
    labelClassName = "",
    href = "",
    className = ``,
    onClick,
    ...props
}: CardProps) {

    function handleClick(){
        onClick?.()
    }
    const visualStyle = `transition-all ease-in-out duration-150 bg-white text-black border-2 rounded-2xl shadow-sm ${className}`

    const styling = `
        ${display} ${flexDirection} ${gap} ${padding} 
        ${justifyContent} ${alignItems} ${boxSizing} 
        ${width} ${height} 
        ${autoMarginOn ? 'mx-auto' : margin} 
        ${hideScrollbar && overflowAutoOn ? 'hide-scrollbar' : ''} 
        ${overflowAutoOn ? 'overflow-y-auto' : ''} 
        ${isStyled ? visualStyle : ''} 
    `.trim().replace(/\s+/g, ' ')
    
    if (href){
        return <Link href={href} className={styling} {...props}>
            {children}
        </Link>
    }

    return (
        <div onClick={handleClick} className={styling} {...props}>
            {children}
        </div>
    )
}
