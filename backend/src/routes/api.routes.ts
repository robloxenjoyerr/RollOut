import { Router } from "express"
import gameRouter from "./game.routes"
import userRouter from "./user.routes"

const apiRouter = Router()


apiRouter.use("/user", userRouter)
apiRouter.use("/game", gameRouter)
apiRouter.post("/clearClient", (req, res) => {
    res.clearCookie("clientId", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.NODE_ENV === "production" ? ".rollout.live" : undefined,
    })
    res.json({ ok: true })
})

export default apiRouter