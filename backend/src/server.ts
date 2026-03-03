import dotenv from "dotenv"
dotenv.config()
import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { registerGameHandlers } from "./sockets/gameHandler"
import apiRouter from "./routes/api.routes";
import cookieParser from "cookie-parser"
import prisma from "./lib/prisma-client"

const PORT = process.env.PORT || 4000
const app = express();
const httpServer = createServer(app)

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  "https://rollout.live",
  "https://www.rollout.live"
].filter((origin): origin is string => typeof origin === "string" && origin.length > 0)

console.log(allowedOrigins)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log("CORS blocked for Origin: ", origin)
      callback(new Error("Not allowed by CORS."))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json())
app.use(cookieParser())

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
})

app.get("/", (_req, res) => {
  return res.send("This is the RollOut Backend-API.")
})

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 Minuten
//   max: 200, // max 200 Requests pro IP
//   message: "Zu viele Anfragen – bitte später erneut versuchen"
// })

// app.use("/api", limiter)

app.use("/api", apiRouter)

httpServer.listen({ port: PORT, host: "0.0.0.0" }, () => {
  console.log(`Backend is listening on Port ${PORT}`, "\n")
})


io.on("connection", async (socket) => {
  const clientId = socket.handshake.auth.clientId

  console.log("Server.ts: clientId: ", clientId, "\n")
  if (!clientId) {
    socket.disconnect()
    return
  }

  const client = await prisma.client.findUnique({
    where: { clientId },
    include: { game: true }
  })

  if (!client) {
    console.log("Disconnecting again..", "\n")
    socket.disconnect()
    return
  }

  // Ab hier: client ist verifiziert
  socket.join(client.gameId) // Raum beitreten
  socket.data.client = client // für spätere Events

  registerGameHandlers(io, socket)
})
