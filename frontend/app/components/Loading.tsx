interface loadingProps {
    className?: string,
    [key: string | number]: any
}

export default function Loading({ className }: loadingProps) {
    return (
        <img className={`animate-spin w-30 h-30 ${className}`} src="/loading.svg"></img>
    )
}