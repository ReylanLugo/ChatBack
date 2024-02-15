import { User } from "../models/User.js";
import { activeUsers } from "../../index.js";

export const NewUser = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    res.json({ result: "User already exists" });
    return;
  }
  if (req.body.username.length < 6) {
    res.json({ result: "Username too short min 6 characters" });
    return;
  }
  if (req.body.password.length < 6) {
    res.json({ result: "Password too short min 6 characters" });
    return;
  }
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    avatar: req.body.avatar,
    email: req.body.email,
    name: req.body.name,
  });
  const savedUser = await newUser.save();
  res.json({
    result: savedUser.username,
    info: {
      avatar: newUser.avatar,
    },
  });
};

export const Login = async (req, res) => {
  let alreadyLogged = false;

  activeUsers.forEach((user) => {
    if (user.userId === req.body.username) {
      alreadyLogged = true;
    }
  });

  if (alreadyLogged) {
    return res.json({ result: "User already logged in" });
  }

  const user = await User.findOne({ username: req.body.username });
  !user && res.json({ result: "No user found" });
  if (user && user.password === req.body.password) {
    res.json({
      result: user.username,
      info: {
        avatar: user.avatar,
      },
    });
  }
  user &&
    user.password !== req.body.password &&
    res.json({ result: "Wrong password" });
};

export const UpdateUser = async (req, res) => {
  const user = await User.findOneAndUpdate(
    { username: req.body.username, password: req.body.password },
    {
      password: req.body.newPassword || req.body.password,
      avatar: req.body.avatar,
    },
    {
      new: true,
    }
  );
  if (user) {
    res.json({
      result: user.username,
      info: {
        avatar: user.avatar,
      },
    });
  } else {
    res.json({ result: "No user found" });
  }
};

export const checkUser = async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (user) {
    user.password === req.body.password && res.json({ result: user.username });
  } else {
    res.json({ result: false });
  }
}


export const getUsersData = async (req, res) => {
  const usersData = [];
  for (const user of req.body) {
    const userData = await User.findOne({ username: user }, "username avatar");
    usersData.push(userData);
  }
  res.json(usersData);
}