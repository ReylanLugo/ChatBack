import { Schema, model } from "mongoose";

const ChatSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    messages: [{
        type: Schema.Types.ObjectId,
        ref: "Message",
    }],
    users: [{
        type: String,
        required: true,
        ref: "User",
    }],
})

export const Chat = model("Chat", ChatSchema);