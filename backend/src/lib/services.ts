import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!
console.log("JWT: ", JWT_SECRET)

export function idFromToken(token: string | undefined | null) {
    if(!token) return null
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; iat: number; exp: number }
        return decoded.id
    } catch(err) {
        console.log("services.ts, idFromToken ERROR: ", err)
        return null
    }
}

export function validateToken(token: string){
    if(!token) return null
    try{
        const decoded = jwt.verify(token, JWT_SECRET) as { exp: number }
        return decoded
    } catch(err){
        console.error("Token validation failed: ", err)
        return null
    }
}