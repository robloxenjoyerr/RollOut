import express from "express"
import cors from "cors"
import { Server } from "socket.io"
import { createServer } from "node:http"
import { registerGameHandlers } from "./sockets/gameHandler"
import apiRouter from "./routes/api.routes";

require('dotenv').config()
const PORT = process.env.PORT || 4000
const app = express();
const httpServer = createServer(app)
const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ["GET", "POST"]
    }
})


app.use(cors({
  origin: process.env.FRONTEND_URL, // Nur dein echtes Frontend darf anfragen
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json())

app.get("/", (_req, res) => {
  console.log("test")
  console.log("test")
  console.log("test")
  return res.send("Backend läuft 🚀")
})
app.use("/api", apiRouter)

httpServer.listen(PORT, () => {
  console.log("Backend listening on http://localhost:4000")
})

io.on("connection", (socket) => {
  registerGameHandlers(io, socket)
})













// .env => BACKEND
//FRONTEND_URL=http://localhost:3000
//JWT_SECRET=c426a049b495b92e2fa250961d99ef62b36f8c97fd99d742e105c2141e08388bb81f8dd4a5a4ecd0864dd05760dff2944cb1e71e9802b013f958ea62b8f651a5

//.env.local => FRONTEND
//NEXT_PUBLIC_API_URL=http://localhost:4000
