import { Chat } from "../models/Chat.js";
import { User } from "../models/User.js";
import { activeUsers } from "../../index.js";

export const NewChat = async (req, res) => {
  const newChat = new Chat({
    name: req.body.name,
    users: [req.body.user],
  });
  const user = await User.findOne({ username: req.body.user });
  user.chats.push(req.body.name);
  const savedUser = await user.save();
  const savedChat = await newChat.save();
  res.json({ result: savedChat.name });
};

export const registerintoChat = async (req, res) => {
  const user = await User.findOne({ username: req.body.user });
  user.chats.push(req.body.chat);
  const savedUser = await user.save();
  const chat = await Chat.findOne({ name: req.body.chat });
  chat.users.push(req.body.user);
  const savedChat = await chat.save();
  res.json({ name: req.body.chat });
};

export const removeUserChats = async (req, res) => {
  const user = await User.findOne({ username: req.body.user });
  const newChatList = user.chats.filter((chat) => chat !== req.body.name);
  user.chats = [...newChatList];
  const savedUser = await user.save();
  const chat = await Chat.findOne({ name: req.body.name });
  chat.users = chat.users.filter((user) => user !== req.body.user);
  const savedChat = await chat.save();
  res.json({ name: req.body.chat });
};

export const getChats = async (req, res) => {
  const chats = await Chat.find({});
  res.json(chats);
};

export const getUsersInChat = async (req, res) => {
  const chatname = req.params.name;
  const chat = await Chat.findOne({ name: chatname });
  if (chat) {
    const users = [];
    for (const us of activeUsers.keys()) {
      const info = activeUsers.get(us);
      if (info.chatId === chatname) {
        users.push(info.userId);
      }
    }
    const response = await User.find({ username: { $in: users } }, 'username avatar');
    const data = response.map((user) => {
      return {
        username: user.username,
        avatar: user.avatar
      }
    })
    
    res.json(JSON.stringify(data));
  }
}


