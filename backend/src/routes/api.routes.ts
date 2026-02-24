import { Router } from "express"
import gameRouter from "./game.routes.js"
import userRouter from "./user.routes.js"
import templateRouter from "./templates.routes.js"

const apiRouter = Router()


apiRouter.use("/user", userRouter)
apiRouter.use("/templates", templateRouter)
apiRouter.use("/game", gameRouter)

apiRouter.get("/livegames", async (req, res) => {
  
})

export default apiRouter