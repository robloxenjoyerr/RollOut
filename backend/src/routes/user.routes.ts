import { Router } from "express";
import { createNewUser } from "../services/db-actions";
import { randomBytes } from "node:crypto";
import { checkLogin } from "../services/db-actions";

const userRouter = Router()

userRouter.post("/register", async (req, res) => {
  console.log("Creating new User...")
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Username or Password missing." })
    }
    else console.log("Username and Password are valid.")

    const result = await createNewUser(randomBytes(8).toString("hex"), username, password)

    if (result.success) {
      console.log("New User Created.")
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        token: result.token
      })
    }
  } catch (err: any) {
    return res.status(400).json({ error: err.message })
  }
})

userRouter.post("/login", async (req, res) => {
  console.log("AUTH HEADER:", req.headers.authorization)
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: "Username or Password missing." })
    }

    const result = await checkLogin(username, password)

    if (result.success) {
      return res.status(201).json({ success: true, message: "Logged in successfully!", token: result.token })
    }
    else {
      return res.status(401).json({ success: false, message: "Wrong Login-Credentials" })
    }

  } catch (err) {
    console.log(err)
  }
})

export default userRouter