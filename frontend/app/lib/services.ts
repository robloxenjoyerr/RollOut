export function getClientIdFromCookie(): string | null {
    return document.cookie
        .split("; ")
        .find(row => row.startsWith("clientId="))
        ?.split("=")[1] ?? null
}