"use client"

import { use, useRef } from "react"
import Button from "./Button";

interface InputProps {
    position?: string,
    width?: string,
    height?: string,
    paddingx?: string,
    paddingy?: string,
    marginx?: string,
    marginy?: string,
    placeholder?: string,
    buttonText?: string,
    onButtonClick?: (value: string) => void,
    onEmptyValue?: (value: string) => void,
    onChange?: (value: string) => void
    valid?: boolean,
    shadowOn?: boolean,
    isStyled?: boolean,
    className?: string,
    [key: string]: any
}

export default function Input({
    position = "relative",
    width = "w-full",
    height = "h-auto",
    paddingx = "px-2",
    paddingy = "py-2",
    marginx = "mx-0",
    marginy = "my-0",
    placeholder = "",
    buttonText = "",
    onButtonClick,
    onEmptyValue,
    onChange,
    valid = false,
    shadowOn = true,
    isStyled = true,
    className = "",
    ...props
}: InputProps) {
    const base = `${width} ${height} ${paddingx} ${paddingy} ${marginx} ${marginy}`
    const styling = `${shadowOn ? 'shadow-lg' : ''} backdrop-blur-3xl ${valid ? "bg-white/5" : "bg-red/5"} border border-2 border-black/20 rounded-2xl focus:outline-none focus:bg-black/10 text-black transition-all duration-200 ${className}`
    const style = `${base} ${styling}`

    const inputRef = useRef<HTMLInputElement>(null)

    function handleButtonClick() {
        const input = inputRef.current

        if(!input) {
            onEmptyValue?.("")
            return
        }

        const value = input.value.trim()
        if (!value) {
            onEmptyValue?.(value)
            return
        }

        onButtonClick?.(value)

        input.value = ""
        input.focus()
    }

    if (buttonText) {
        return (
            <div className={`flex ${position} ${width} ${height} gap-1 items-center h-full overflow-none`}>
                <input
                    ref={inputRef}
                    placeholder={placeholder}
                    className={style + className}
                    onChange={e => onChange?.(e.target.value)}
                    {...props}
                />
                <Button onClick={handleButtonClick}>{buttonText}</Button>
            </div>
        )
    }

    return (
        <input
            ref={inputRef}
            placeholder={placeholder}
            className={style + className}
            onChange={e => onChange?.(e.target.value)}
            {...props}
        />
    )
}

