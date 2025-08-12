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

export const getAllMessages = async (req, res) => {
  try {
    const senderId = req.userId;
    const receiverId = req.params.receiverId;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    }).populate({
      path: "messages",
      populate: { path: "reactions.user", select: "userName name profileImage" }
    });

    const validMessages = (conversation?.messages || []).filter(
      m => m && !m.deletedFor.includes(senderId)
    );

    return res.status(200).json(validMessages);
  } catch (error) {
    return res.status(500).json({ message: `get Message error ${error}` });
  }
};



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
    const { messageId } = req.params;
    const scope = req.query.scope || "everyone"; // "me" or "everyone"
    const userId = req.userId;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    const isSender = String(message.sender) === String(userId);
    const isReceiver = String(message.receiver) === String(userId);
    if (!isSender && !isReceiver) return res.status(403).json({ message: "Not allowed" });

    if (scope === "me") {
      // Soft delete: hide for current user
      if (!message.deletedFor.includes(userId)) {
        message.deletedFor.push(userId);
        await message.save();
      }
      return res.status(200).json({ message: "Deleted for you" });
    }

    if (scope === "everyone") {
      if (!isSender) return res.status(403).json({ message: "Only sender can delete for everyone" });

      await Message.findByIdAndDelete(messageId);
      await Conversation.updateOne(
        { participants: { $all: [message.sender, message.receiver] } },
        { $pull: { messages: messageId } }
      );

      return res.status(200).json({ message: "Deleted for everyone" });
    }

    return res.status(400).json({ message: "Invalid scope" });
  } catch (error) {
    return res.status(500).json({ message: `Delete error: ${error}` });
  }
};

// controllers/message.controllers.js
export const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const userId = req.userId;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).json({ message: "Message not found" });

  const idx = message.reactions.findIndex(r => String(r.user) === String(userId));
  if (idx > -1) {
    if (message.reactions[idx].emoji === emoji) {
      message.reactions.splice(idx, 1);
    } else {
      message.reactions[idx].emoji = emoji;
      message.reactions[idx].timestamp = new Date();
    }
  } else {
    message.reactions.push({ emoji, user: userId });
  }

  await message.save();
  await message.populate("reactions.user", "userName name profileImage");

  return res.status(200).json({ messageId, reactions: message.reactions });
};


