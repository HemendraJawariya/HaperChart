import mongoose from "mongoose";



const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String },
  image: { type: String },
  reactions: [
    {
      emoji: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: Date
    }
  ],
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });


const Message=mongoose.model("Message",messageSchema)
export default Message