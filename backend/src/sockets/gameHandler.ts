import { Socket, Server } from "socket.io"
import gameRouter from "../routes/game.routes";



export const registerGameHandlers = (io: Server, socket: Socket) => {
  let currentGameId: string | null = null

  function getCurrentClients(){
  if(!currentGameId) return 
  const room = io.sockets.adapter.rooms.get(currentGameId);
  const clientList = room ? Array.from(room).map(id => ({ socket_id: id })) : [];
  return clientList
}

  socket.on("joinGame", (data) => {
    const { game_id, socket_id } = data;
    currentGameId = game_id
    console.log("Data roomCode: ", game_id)
    socket.join(game_id); // Erstellt/Tritt einem Raum bei

    
    io.to(game_id).emit("playerJoined", { socket_id, current_clients: getCurrentClients() });




  });

  socket.on("disconnect", (data) => {
    if(!currentGameId) return
    console.log("User disconnected fully from GameID: ", currentGameId)

    io.to(currentGameId).emit("playerDisconnected", {socket_id: socket.id, current_clients: getCurrentClients()})
  });

  socket.on("startGame", (data) => {
    const { game_id } = data
    console.log("Starting Game")
    // Nur der Host sollte das dürfen (Validierung einbauen!)
    const roomSockets = io.sockets.adapter.rooms.get(game_id)
    console.log("Socket in room: ", roomSockets?.size ?? 0)
    io.to(game_id).emit("gameStarted");
  });

}