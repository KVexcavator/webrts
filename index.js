const express = require("express")
const WebSocket = require("ws")
const http = require("http")
const {v4: uuidv4} = require("uuid")
const { sign } = require("crypto")

const app = express()
const port = process.env.PORT || 9000
// инициализация http сервера
const server = http.createServer(app)
// инициализация экземпляра WebSocket
const wss = new WebSocket.Server({server})

let users = {}

const sendTo = (connection, message) => {
  connection.send(JSON.stringify(message))
}

const sendToAll = (clients, type, {id, name: userName}) =>
  Object.values(clients).forEach(client => {
    if(client.name !== userName){
      client.send(
        JSON.stringify({
          type,
          user: {id, userName}
        })
      )
    }
  })

wss.on("connection", ws => {
  ws.on("message", msg => {
    let data
    // проверяем что JSON
    try {
      data = JSON.parse(msg)
    } catch (e) {
      console.log("Invalid JSON")
      data = {}
    }
    const {type, name, offer, answer} = data
    // обработчик сообщений в зависимости от типа
    switch(type){
      // когда юзер пробует зарегистрироваться
      case "login":
        // отклик на неправильное имя
        if(users[name]){
          sendTo(ws, {
            type: "login",
            success: false,
            message: "Username is unavailable"
          })
        } else {
          const id = uuidv4()
          const loggedIn = Object.values(
            users
          ).map(({id, name: userName}) => ({id, userName}))
          users[name] = ws
          ws.name = name
          ws.id = id
          sendTo(ws, {
            type: "login",
            success: true,
            users: loggedIn
          })
          sendToAll(users, "updateUsers", ws)
        }
        break
      case "offer":
        // проверка, сущетвует ли пользователь, которому нужно отправить сообщение
        const offerRecipient = users[name]
        if(!!offerRecipient) {
          sendTo(offerRecipient, {
            type: "offer",
            offer,
            name: ws.name 
          })
        } else {
          sendTo(ws, {
            type: "error",
            message: `User ${name} does not exist!`
          })
        }
        break
      case "answer":
        // существует ли пользователь, которому надо отправить ответ
        const answerRecipient = users[name]
        if(!!answerRecipient){
          sendTo(answerRecipient, {
            type: "answer",
            answer
          })
        } else {
          sendTo(ws, {
            type: "error",
            message: `User ${name} does not exist!`
          })
        }
        break
      default:
        sendTo(ws, {
          type: "error",
          message: "Command not found: " + type
        })
        break
    }
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