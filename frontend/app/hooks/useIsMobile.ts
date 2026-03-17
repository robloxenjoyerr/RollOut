import { useState, useEffect } from "react";

export default function useIsMobile(breakpoint = 768){
    const [isMobile, setIsMobile] = useState<boolean>(false)

    useEffect(()=> {
        const check = () => { setIsMobile(window.innerWidth < breakpoint)}
        check()

        window.addEventListener("resize", check)    
    }, [breakpoint])

    return isMobile
}

