import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
    message: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
        ref: "User",
    },
    chat: {
        type: String,
        required: true,
        ref: "Chat",
    }
})

export const Message = model("Message", MessageSchema);