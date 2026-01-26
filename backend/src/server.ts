import express from "express"
import cors from "cors"
require('dotenv').config()

import { loginAuthentication } from "./middleware/secureMiddleware";
import { checkLogin, createNewUser, fetchAllTemplates, updateUserTemplate, createNewUserTemplate, deleteTemplateById } from "./services/db-actions"
import { randomBytes } from "crypto"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { registerGameHandlers } from "./sockets/gameHandler"
import { checkIfGameIdExist, checkUserForActiveSession, getLiveGames, startGame } from "./lib/game-manager";
import { db } from "./db/database";

const PORT = process.env.PORT || 4000
const app = express();
const httpServer = createServer(app)
const io = new Server()


app.use(cors({
  origin: process.env.FRONTEND_URL, // Nur dein echtes Frontend darf anfragen
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
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

app.post("/api/templates/all", loginAuthentication, async (req, res) => {
  const { owner_id } = req.body
  const result = await fetchAllTemplates(owner_id)
  console.log("Owner templates: ", result)
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

app.get("/api/livegames", async (req, res) => {
  const liveGames = await getLiveGames()

  return res.send({ liveGames })
})

app.get("/api/game/from-session/:session_id", loginAuthentication, async (req, res) => {
    const { session_id } = req.params;
    const game = db.prepare(`SELECT id FROM live_games WHERE session_id = ? AND ended_at IS NULL`).get(session_id) as { id: string } | undefined

    if (!game) return res.status(404).send({ success: false, message: "Session not found." });

    return res.send({ success: true, game_id: game.id });
});

app.post("/api/game/verify", async (req, res)=> {
  const { game_id_url } = req.body

  try {
    const info = await checkIfGameIdExist(game_id_url)
    if(info) return res.send({ success: true })
    else return res.send({success: false})
  } catch(err){
    console.log("SERVER-TS using GAME-MANAGER Service: ", err)
  }
})

app.post("/api/game/start", loginAuthentication, async (req, res) => {
  const { template, owner_id } = req.body

  //Check if user already stared a game
  const alreadyStarted = await checkUserForActiveSession(owner_id)
  console.log("Host hast already started a Game with IDStarted Game ID: ", alreadyStarted)

  if (alreadyStarted) return res.send({ success: false, message: "User already started a game.", game_id: alreadyStarted })

  try {
    const info = await startGame(template, owner_id)
    if (info.success) {
      console.log("Game with session ID: ", info.session_id, "started.")
      return res.send({ success: true, game_id: info.game_id, session_id: info.session_id })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).send({ success: false, message: "Server error." })
  }

})


io.on("startGame", (data) => {
  console.log("Game started with data: ", data)
})

io.on("joinGame", (data) => {
  console.log("Player joined game with data: ", data)
})








// .env => BACKEND
//FRONTEND_URL=http://localhost:3000
//JWT_SECRET=c426a049b495b92e2fa250961d99ef62b36f8c97fd99d742e105c2141e08388bb81f8dd4a5a4ecd0864dd05760dff2944cb1e71e9802b013f958ea62b8f651a5

//.env.local => FRONTEND
//NEXT_PUBLIC_API_URL=http://localhost:4000
