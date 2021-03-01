const express = require("express")
const WebSocket = require("ws")
const http = require("http")
const {v4: uuidv4} = require("uuid")

const app = express()
const port = process.env.PORT || 9000
// инициализация http сервера
const server = http.createServer(app)
// инициализация экземпляра WebSocket
const wss = new WebSocket.Server({server})

wss.on("connection", ws => {
  ws.on("message", msg => {
    console.log("Received  message: %s from client", msg)
  })
  // отклик при установлении соединения
  ws.send(
    JSON.stringify({
      type: "connect",
      message: "Ok, I'am a WebSocket server"
    })
  )
})

// старт сервера
server.listen(port, () =>{
  console.log(`Signalling Server rubbing on port: ${port}`)
})