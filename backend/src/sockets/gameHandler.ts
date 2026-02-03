import { Socket, Server } from "socket.io"
import { validateToken } from "../lib/services"
import { addClientToGame } from "../lib/game-manager"
import { randomBytes } from "node:crypto"

export const registerGameHandlers = (io: Server, socket: Socket) => {
  let currentGameId: string | null = null

  function getCurrentClients(){
  if(!currentGameId) return 
  const room = io.sockets.adapter.rooms.get(currentGameId);
  const clientList = room ? Array.from(room).map(id => ({ socket_id: id })) : [];
  return clientList
}

  socket.on("joinGame", async (data) => {
    const { game_id, socket_id, host } = data;
    currentGameId = game_id
    
    const res = await addClientToGame({id: randomBytes(4).toString("hex"), socket_id: socket_id, host: host}, game_id)
    console.log("joingame res: ",res.success) // =>>>>>>>> ALWAYS FALSE
    if(res.success){
       socket.join(game_id); // Erstellt/Tritt einem Raum bei
       io.to(game_id).emit("playerJoined", { socket_id, current_clients: getCurrentClients() });
    }

  });

  socket.on("disconnect", (data) => {
    if(!currentGameId) return
    console.log("User disconnected fully from GameID: ", currentGameId)

    io.to(currentGameId).emit("playerDisconnected", {socket_id: socket.id, current_clients: getCurrentClients()})
  });

  socket.on("startGame", (data) => {
    const { game_id, token } = data
    const info = validateToken(token)
    const roomSockets = io.sockets.adapter.rooms.get(game_id)
    console.log(info)
    if(info) {
      io.to(game_id).emit("gameStarted");
    }
    else {
      io.to(game_id).emit("gameStartError")
    }
  });

  socket.on("stopGame", (data)=> {
    const {game_id } = data
    socket.to(game_id).emit("gameEnded")
  })

}