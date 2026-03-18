import { Request, Response } from "express"
import { randomBytes, randomUUID } from "crypto"
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!
console.log("JWT: ", JWT_SECRET)

export function idFromToken(token: string | undefined | null) {
    if (!token) return null
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; iat: number; exp: number }
        return decoded.id
    } catch (err) {
        console.log("SERVICES.TS: idFromToken ERROR: ", err, "\n")
        return null
    }
}

// export function validateToken(token: string){
//     if(!token) return null
//     try{
//         const decoded = jwt.verify(token, JWT_SECRET) as { exp: number }
//         return decoded
//     } catch(err){
//         console.error("SERVICES.TS: validateToken ERROR: ", err)
//         return null
//     }
// }


export function getOrCreateClientId(req: Request, res: Response): string | null{
    try{
        const existing = req.cookies?.clientId
        console.log("SERVICES.TS: Does Client already have ClientID: ", existing ? true : false, "\n")
        
        if (existing) {
            console.log("SERVICES.TS: Client already has ClientId, sending back the existing one.")
            return existing
        }
        
        const newId = randomUUID()
        console.log("SERVICES.TS - WARN: No ClientId found, generating new ClientId now: ", newId, "\n")
        
        res.cookie("clientId", newId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            domain: process.env.NODE_ENV === "production"
                ? ".rollout.live"
                : undefined,
            maxAge: 1000 * 60 * 60 * 5, // 5 Stunden
        })
        
        return newId
    } catch(err){
        console.log("SERVICES.TS ERROR: Error with getting or creating new clientId: ", err, "\n")
        return null
    }
}

