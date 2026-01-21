import express from "express";
import cors from "cors"
require('dotenv').config()

import { loginAuthentication } from "./middleware/secureMiddleware";
import { checkLogin, createNewUser, fetchAllTemplates, updateUserTemplate, createNewUserTemplate, deleteTemplateById } from "./services/db-actions";
import { randomBytes } from "crypto"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { registerGameHandlers } from "./sockets/gameHandler";


const PORT = process.env.PORT || 4000
const app = express();
const httpServer = createServer(app)
const io = new Server()


app.use(cors({
  origin: process.env.FRONTEND_URL // Nur dein echtes Frontend darf anfragen
}));

app.use(express.json());

app.get("/", (_req, res) => {
  console.log("test")
  console.log("test")
  console.log("test")
  return res.send("Backend läuft 🚀");
})

httpServer.listen(PORT, () => {
  console.log("Backend listening on http://localhost:4000");
})

io.on("connection", (socket) => {
  registerGameHandlers(io, socket)
})

app.post("/api/user/create", async (req, res) => {
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

app.post("/api/user/login", async (req, res) => {
  console.log("Checking Login.")

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

app.post("/api/templates/all", loginAuthentication, async (req, res) => {
  const { owner_id } = req.body
  const result = await fetchAllTemplates(owner_id)

  return res.json(result)
})

app.post("/api/templates/update", loginAuthentication, async (req, res) => {
  try {
    const { updatedTemplate, owner_id } = req.body

    console.log("Template to be updated: ", updatedTemplate)

    if (!updatedTemplate) return res.send({ success: false, message: "Error: Template given to API is either empty or damaged." })

    const template = await updateUserTemplate(owner_id, updatedTemplate.id, updatedTemplate)

    if (template) return res.send({ success: true, message: "Template has been updated.", template })
    else return res.send({ success: false, message: "Error: Could not update the template." })

  } catch (err) {
    console.log(err)
  }
})

app.post("/api/templates/create", loginAuthentication, async (req, res) => {
  const { newTemplate, owner_id } = req.body
  console.log("new template: ", newTemplate, "owner id: ", owner_id)
  if (!newTemplate || !owner_id) return res.send({ success: false, message: "New Template or ownerId is missing." })

  newTemplate.id = randomBytes(8).toString("hex")
  
  try {
    console.log("Template ID: ", newTemplate.id)
    const success = await createNewUserTemplate(owner_id, newTemplate)
    if (success) return res.send({ success: true, message: "New user template successfully created.", template: success.template })
    else return res.send({ success: false, message: "Error: Could not create new user template." })
  } catch (err) {
    console.log(err)
  }

})

app.post("/api/templates/delete", loginAuthentication, async (req, res) => {
  const { template_id, owner_id } = req.body
  if (!template_id || !owner_id) return res.send({ success: false, message: "Error: Could not delete requested template." })

  try {
    const success = await deleteTemplateById(template_id, owner_id)
    if (success) {
      return res.send({ success: true, message: "Template has been deleted successfully." })
    } else return res.send({ success: false, message: "Failed to delete Template. Error with DB function." })
  } catch (err) {
    return res.send({ error: err })
  }
})





io.on("startGame", (data) => {
  console.log("Game started with data: ", data)
})

io.on("joinGame", (data) => {
  console.log("Player joined game with data: ", data)
})

io.on