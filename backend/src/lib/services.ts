import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET!

export function idFromToken(token: string | undefined | null) {
    if(!token) return null

    console.log("TOKEN: ", token)
    try {
        
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; name: string; iat: number; exp: number }


        console.log("decoded: ",decoded.id)
        return decoded.id
    } catch(err) {
        console.log("ERROR: ", err)
        return null
    }

}