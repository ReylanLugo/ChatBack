import { Chat } from "../models/Chat.js";
import { User } from "../models/User.js";
import { activeUsers } from "../../index.js";
import { Message } from "../models/Message.js";

export const NewChat = async (req, res) => {
  const newChat = new Chat({
    icon: req.body.icon,
    iconBg: req.body.iconBg,
    name: req.body.name,
    type: req.body.type,
    description: req.body.description,
    users: [req.body.user],
  });
  const user = await User.findOne({ username: req.body.user });
  user.chats.push(req.body.name);
  const savedUser = await user.save();
  const savedChat = await newChat.save();
  res.json({ 
    icon: savedChat.icon,
    iconBg: savedChat.iconBg,
    name: savedChat.name,
   });
};

export const registerintoChat = async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  user.chats.push(req.body.chat);
  const savedUser = await user.save();
  const chat = await Chat.findOne({ name: req.body.chat });
  chat.users.push(req.params.username);
  const savedChat = await chat.save();
  //TODO: send notification to user that he has been added to the chat
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


//new
export const getMyChats = async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  let chatlist = [];
  for (const chat of user.chats) {
    const chatObj = await Chat.findOne({ name: chat });
    chatlist.push(
      {
        icon: chatObj.icon,
        iconBg: chatObj.iconBg,
        name: chatObj.name,
      }
    );
  }
  res.json(chatlist);
}

export const getNewChats = async (req, res) => {
  const user = await User.findOne({username: req.params.username});
  let chatlist = [];
  if (user) {
    const allChats = await Chat.find({name: { $not: { $in: user.chats } }});
    for (const chat of allChats) {
      chatlist.push({
        name: chat.name,
        icon: chat.icon,
        iconBg: chat.iconBg
      });
    }
    res.json(chatlist);
  }
}

export const getChatInfo = async (req, res) => {
  const chat = await Chat.findOne({ name: req.params.name });
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  res.json(chat);
}

export const updateChat = async (req, res) => {
  const chat = await Chat.findOne({ name: req.params.name });
  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }
  chat.icon = req.body.icon;
  chat.iconBg = req.body.iconBg;
  if (chat.name !== req.body.name) {
    const user = await User.find({ username: { $in: chat.users } });
    for (const us of user) {
      if (us.chats.includes(chat.name)) {
        us.chats[us.chats.indexOf(chat.name)] = req.body.name;
        const savedUser = await us.save();
      }
    }
    const messages = await Message.find({ chat: chat.name });
    for (const message of messages) {
      message.chat = req.body.name;
      const savedMessage = await message.save();
    }
    chat.name = req.body.name;
  }
  chat.description = req.body.description;
  const savedChat = await chat.save();
  res.json(savedChat);
}