import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getSocketId, io } from "../socket.js";

export const sendMessage=async (req,res)=>{
    try {
        const senderId=req.userId
        const receiverId=req.params.receiverId
        const {message}=req.body

        let image;
        if(req.file){
            image=await uploadOnCloudinary(req.file.path)
        }

        const newMessage=await Message.create({
            sender:senderId,
            receiver:receiverId,
            message,
            image
        })

        let conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        })
        if(!conversation){
            conversation=await Conversation.create({
                participants:[senderId,receiverId],
                messages:[newMessage._id]
            })
        }else{
conversation.messages.push(newMessage._id)
await conversation.save()
        }

const receiverSocketId=getSocketId(receiverId)
if(receiverSocketId){
io.to(receiverSocketId).emit("newMessage",newMessage)
}

return res.status(200).json(newMessage)
    } catch (error) {
        return res.status(500).json({message:`send Message error ${error}`})
    }
}

export const getAllMessages=async (req,res)=>{
    try {
         const senderId=req.userId
        const receiverId=req.params.receiverId
        const conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate("messages")

        return res.status(200).json(conversation?.messages)

    } catch (error) {
           return res.status(500).json({message:`get Message error ${error}`})
    }
}

export const getPrevUserChats=async (req,res)=>{
    try {
        const currentUserId=req.userId
        const conversations=await Conversation.find({
            participants:currentUserId
        }).populate("participants").sort({updatedAt:-1})

        const userMap={}    //562983u9:user
        conversations.forEach(conv => {
            conv.participants.forEach(user => {
               if(user._id!=currentUserId) {
                 userMap[user._id]=user
               }
            });
        });

        const previousUsers=Object.values(userMap)
        return res.status(200).json(previousUsers)

    } catch (error) {
          return res.status(500).json({message:`prev user error ${error}`})
    }
}



export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete" });
    }

    await Message.findByIdAndDelete(messageId);
    await Conversation.updateOne(
      { participants: { $all: [message.sender, message.receiver] } },
      { $pull: { messages: messageId } }
    );

    const receiverSocketId = getSocketId(message.receiver);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("deleteMessage", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: `Delete message error ${error}` });
  }
};

// controllers/message.controllers.js
export const reactToMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    // Remove previous reaction from this user
    message.reactions = message.reactions.filter(r => r.user.toString() !== userId);
    message.reactions.push({ emoji, user: userId });

    await message.save();

    // Optionally populate user data
    await message.populate("reactions.user", "userName name");

    return res.status(200).json({ messageId, reactions: message.reactions });
  } catch (error) {
    return res.status(500).json({ message: `React error: ${error}` });
  }
};

