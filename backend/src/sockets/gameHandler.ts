import { Socket, Server } from "socket.io"
import { getTemplateFromGameId, setGamePhase } from "../lib/game-manager";
import { Person, Template } from "../services/db-actions";


export const registerGameHandlers = (io: Server, socket: Socket) => {
  let currentGameId: string | null = null
  let persons: Person[] = []
  let gameTemplate: Template | null = null

  function getCurrentClients() {
    if (!currentGameId) return
    const room = io.sockets.adapter.rooms.get(currentGameId);
    const clientList = room ? Array.from(room).map(id => ({ socket_id: id })) : [];
    return clientList
  }

  function getNextPerson() {
    try {
      if (!persons || persons.length === 0) return null

      const unrolled = persons.filter((p) => p.state === "unrolled")
      if (unrolled.length === 0) return null

      const randomInt = Math.floor(Math.random() * unrolled.length)
      const nextRolled = unrolled[randomInt]

      persons = persons.map((p) =>
        p.id === nextRolled.id ? { ...p, state: "rolled" } : p
      )

      const remainingUnrolled = persons.filter((p) => p.state === "unrolled")
      const isLast = remainingUnrolled.length === 0

      console.log("Next rolled: ", nextRolled.name)

      return {
        nextRolled,
        personsLeft: persons,
        isLast
      }
    } catch (err) {
      console.error(err)
    }

  }

  socket.on("joinGame", async (data) => {
    const { game_id, socket_id, host } = data;
    currentGameId = game_id
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
      gameTemplate = template
      persons = gameTemplate.persons
      io.to(game_id).emit("gameStarted", { template });
    }
  });

  socket.on("stopGame", async (data) => {
    const { game_id } = data

    io.to(game_id).emit("gameEnded")
  })

  socket.on("rollNext", async (data) => {
    const { game_id } = data
    if (!gameTemplate) return null

    const info = getNextPerson()

    if (!info) return io.to(game_id).emit("allPersonsRolled", { message: "All persons have been rolled." })

    io.to(game_id).emit("nextRolled", {
      unrolledPersons: info.personsLeft,
      nextRolled: info.nextRolled
    });

    if (info?.isLast) {
      console.log("Last person has been rolled.")
      io.to(game_id).emit("allPersonsRolled", { message: "All persons have been rolled.", lastPerson: info.nextRolled})
    }

  });


}