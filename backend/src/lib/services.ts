import jwt from "jsonwebtoken";
// const JWT_SECRET = process.env.JWT_SECRET!
const JWT_SECRET = "c426a049b495b92e2fa250961d99ef62b36f8c97fd99d742e105c2141e08388bb81f8dd4a5a4ecd0864dd05760dff2944cb1e71e9802b013f958ea62b8f651a5"

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