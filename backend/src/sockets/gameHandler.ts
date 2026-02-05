import { Socket, Server } from "socket.io"
import { getTemplateFromGameId, setGamePhase } from "../lib/game-manager";



export const registerGameHandlers = (io: Server, socket: Socket) => {
  let currentGameId: string | null = null
  let unrolledPersons: any[] = [];
  let rolledPersons: any[] = [];

  function getCurrentClients() {
    if (!currentGameId) return
    const room = io.sockets.adapter.rooms.get(currentGameId);
    const clientList = room ? Array.from(room).map(id => ({ socket_id: id })) : [];
    return clientList
  }

  socket.on("joinGame", async (data) => {
    const { game_id, socket_id, host } = data;
    currentGameId = game_id
    console.log("Data roomCode: ", game_id)
    socket.join(game_id); // Erstellt/Tritt einem Raum bei


    io.to(game_id).emit("playerJoined", { socket_id, current_clients: getCurrentClients() });




  });

  socket.on("disconnect", (data) => {
    if (!currentGameId) return
    console.log("User disconnected fully from GameID: ", currentGameId)

    io.to(currentGameId).emit("playerDisconnected", { socket_id: socket.id, current_clients: getCurrentClients() })
  });

  socket.on("startGame", async (data) => {
    const { game_id } = data

    // Only Host => need validation
    const changedGamePhase = await setGamePhase("in-progress", game_id)
    if (changedGamePhase) {
      const template = await getTemplateFromGameId(game_id)
      if (!template) return io.to(game_id).emit("gameStartError", { message: "Could not get template from game_id. Undefined" })

      unrolledPersons.push(template.persons)

      io.to(game_id).emit("gameStarted", { template });
    }
  });

  socket.on("stopGame", async (data) => {
    const { game_id } = data

    io.to(game_id).emit("gameEnded")
  })

  socket.on("rollNext", async (data) => {
    const { game_id } = data;

    // 1. Überprüfen, ob noch Personen zum Ziehen übrig sind.
    if (unrolledPersons.length === 0) {
      // Wenn keine Personen mehr übrig sind, informiere die Clients.
      io.to(game_id).emit("allPersonsRolled", { message: "All persons have been rolled." });
      return;
    }

    // 2. Wähle eine zufällige Person aus der Liste der "unrolled".
    const randomIndex = Math.floor(Math.random() * unrolledPersons.length);

    // WICHTIG: .splice entfernt das Element aus dem Array und gibt es zurück.
    // Das ist eine atomare Operation: Person wird ausgewählt UND entfernt.
    const selectedPerson = unrolledPersons.splice(randomIndex, 1)[0];

    // 3. Füge die gezogene Person zur "rolled" Liste hinzu.
    if (selectedPerson) {
      rolledPersons.push(selectedPerson);
    }

    // 4. Sende die gezogene Person an den Game Room.
    // Es ist auch nützlich, die verbleibende Anzahl mitzuschicken.
    console.log("slected: ", selectedPerson)
    io.to(game_id).emit("nextRolled", {
      person: selectedPerson,
      remaining: unrolledPersons.length
    });

    console.log(unrolledPersons.length)
    console.log(selectedPerson)
  });


}