"use client"

import { useRef } from "react"
import Button from "./Button";
import { forwardRef, useImperativeHandle } from "react"
import { useState } from "react";

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
    onChangeValue?: (e: React.ChangeEvent<HTMLInputElement>) => void
    valid?: boolean,
    shadowOn?: boolean,
    isStyled?: boolean,
    className?: string,
    [key: string]: any
}


const Input = forwardRef<HTMLInputElement, InputProps>(({
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
    onChangeValue,
    valid = true,
    shadowOn = true,
    isStyled = true,
    className = "",
    ...props
}, ref) => { // <--- Hier kommt der äußere Ref rein
    const [internalValid, setInternalValid] = useState(true)
    const inputRef = useRef<HTMLInputElement>(null)

    // Das hier verbindet den äußeren Ref mit unserem inneren inputRef
    useImperativeHandle(ref, () => inputRef.current!);

    const isCurrentValid = internalValid && valid
    const base = `${width} ${height} ${paddingx} ${paddingy} ${marginx} ${marginy}`
    const styling = `${shadowOn ? 'shadow-lg' : ''} backdrop-blur-3xl ${isCurrentValid ? "bg-black/5 focus:bg-black/20" : "bg-red-200 border-2 border-red-500 focus:bg-red-200 "} border-2 border-black/20 rounded-2xl focus:outline-none text-black transition-all duration-200 ${className}`
    
    // Style ohne das zusätzliche className am Ende, da es schon im styling-String ist
    const style = `${base} ${styling}`

    function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
        e?.preventDefault()
        const input = inputRef.current
        if(!input) return;

        const value = input.value.trim()
        if (value.length === 0) {
            onEmptyValue?.(value)
            input.focus()
            return
        }

        onButtonClick?.(value)
        input.value = ""
        input.focus()
    }

    function handleOnChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setInternalValid(value.trim().length > 0)
        onChangeValue?.(e)
    }

    // JSX Struktur
    if (buttonText) {
        return (
            <div className={`flex ${position} ${width} ${height} gap-2 items-center h-full`}>
                <input
                    ref={inputRef}
                    placeholder={placeholder}
                    className={style} // Hier war das doppelte className
                    onChange={handleOnChange}
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
            className={style}
            onChange={handleOnChange} // Jetzt triggert auch das normale Input die Validierung
            {...props}
        />
    )
})

Input.displayName = "Input"
export default Input