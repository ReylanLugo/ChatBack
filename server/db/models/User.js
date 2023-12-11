import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    chats: [{
        type: String,
        ref: "Chat",
    }]
})

export const User = model("User", UserSchema);