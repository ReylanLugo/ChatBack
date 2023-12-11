import { connectDB } from "./db/connection.js";
import express from "express";
import cors from "cors";
import { Chat } from "./db/models/Chat.js";
import { Message } from "./db/models/Message.js";
import router from "./router/index.js";
import { Server as SocketServer } from "socket.io";
import http from "http";
import morgan from "morgan";
import socket from "../frontend/src/helpers/socket.js";

connectDB();

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const port = process.env.PORT || 5000;
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api", router);

export const activeUsers = new Map();

// Manejo de la conexión con Socket.IO
io.on("connection", (socket) => {
  console.log("Nuevo cliente conectado");

  // Agregar usuario activo
  socket.on("addUser", (userId, chatId) => {
    activeUsers.set(socket.id, { userId, chatId });
    console.log(activeUsers);
    const usersInSameChat = Array.from(activeUsers.values()).filter(
      (user) => user.chatId === chatId
    );
    io.to(chatId).emit("activeUsers", usersInSameChat);
  });

  // Cambio de chat
  socket.on("changeChat", (body) => {
    // Salimos del grupo y lo notificamos a los usuarios adentro
    socket.leave(body.oldChat);
    io.to(body.oldChat).emit("inactiveUser", body.user);

    // Entramos al nuevo grupo y lo notificamos a los usuarios adentro
    activeUsers.set(socket.id, { userId: body.user, chatId: body.chat });
    socket.join(body.chat);
    const usersInSameChat = Array.from(activeUsers.values()).filter(
      (user) => user.chatId === body.chat
    );
    io.to(body.chat).emit("activeUsers", usersInSameChat);
  });

  // Eliminar usuario activo
  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
    io.emit("activeUsers", Array.from(activeUsers.values()));
  });

  socket.on("onDeleteMessage", (body) => {
    const chat = Chat.findOne({ name: body.chat }).then((res) => {
      res.messages = res.messages.filter((message) => message != body.id);
      res.save();
      Message.findByIdAndDelete(body.id).then(() => {
        console.log("Message deleted");
      });
    });
    io.to(body.chat).emit("onDeleteMessage", body.id);
  });

  socket.on("message", (body) => {
    const message = new Message({
      message: body.message,
      user: body.user,
      chat: body.chat,
    });
    message.save();
    const chat = Chat.updateOne(
      { name: body.chat },
      {
        $push: { messages: message._id },
      }
    ).then(() => {
      console.log("Chat actualizado");
    });
    socket.broadcast.emit("message", body);
  });
});

server.listen(port, () => {
  console.log(`Servidor Express en el puerto ${port}`);
});
