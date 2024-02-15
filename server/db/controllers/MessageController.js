import { Chat } from "../models/Chat.js";
import { Message } from "../models/Message.js";

export async function getMessages(req, res) {
    const messages = await Message.find({ chat: req.body.chat })
    res.json(messages)
}

export async function getMessage(req, res) {
    const messages = await Message.find({ chat: req.params.chat })
    res.json(messages)
}

export async function postMessage(req, res) {
    const newMessage = new Message(req.body);
    const savedMessage = await newMessage.save();
    const chat = await Chat.findOne({ name: req.body.chat });
    chat.messages.push(savedMessage._id);
    const savedChat = await chat.save();
    res.json(savedMessage);
    console.log(req.body);
}