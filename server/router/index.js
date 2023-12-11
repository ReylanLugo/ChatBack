import express from "express";
import { Login, NewUser, UpdateUser } from "../db/controllers/UserController.js";
import { getChats, NewChat, registerintoChat, removeUserChats, getUsersInChat } from "../db/controllers/ChatController.js";
import { getMessages } from "../db/controllers/MessageController.js";

const router = express.Router();

router.post("/user",NewUser);
router.put("/user", UpdateUser);
router.post("/login",Login);

router.post("/user/chats", registerintoChat);
router.put("/user/chats", removeUserChats);

//Chats
router.get("/chats",getChats);
router.post("/chats", NewChat);
router.get("/chats/:name/users", getUsersInChat);

//Message
router.post("/messages", getMessages)


export default router;