import { Router } from "express"
import gameRouter from "./game.routes"
import userRouter from "./user.routes"
import templateRouter from "./templates.routes"

const apiRouter = Router()


apiRouter.use("/user", userRouter)
apiRouter.use("/templates", templateRouter)
apiRouter.use("/game", gameRouter)

apiRouter.get("/livegames", async (req, res) => {
  
})

export default apiRouter