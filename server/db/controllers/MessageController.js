import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";

export async function getMessages(req, res) {
    const messages = await Message.find({ chat: req.body.chat })
    res.json(messages)
}