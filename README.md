# 💬 HaperChat

A full-stack real-time messaging app inspired by Instagram — built with React, Node.js, MongoDB, and Socket.IO. It supports emoji reactions, scoped message deletion, image sharing, and persistent conversations.

---

## 📸 Screenshots
*Modern chat interface with emoji reactions and image support*
![Chat UI](https://github.com/HemendraJawariya/HaperChart/blob/main/backend/public/Screenshot%20from%202025-08-12%2010-32-1.png)  
![Chat UI](https://github.com/HemendraJawariya/HaperChart/blob/main/backend/public/Screenshot%20from%202025-08-12%2010-32-3.png)
![Chat UI](https://github.com/HemendraJawariya/HaperChart/blob/main/backend/public/Screenshot%20from%202025-08-12%2010-32-4.png)
![Chat UI](https://github.com/HemendraJawariya/HaperChart/blob/main/backend/public/Screenshot%20from%202025-08-12%2010-33-0.png)
![Chat UI](https://github.com/HemendraJawariya/HaperChart/blob/main/backend/public/Screenshot%20from%202025-08-12%2010-33-2.png)
![Chat UI](https://github.com/HemendraJawariya/HaperChart/blob/main/backend/public/Screenshot%20from%202025-08-12%2010-33-3.png)
---

## ▶️ Demo

[![YouTube Demo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/YouTube_icon_%282017%29.svg/512px-YouTube_icon_%282017%29.svg.png)](https://www.youtube.com/@HCoded)  
Watch the full walkthrough on YouTube

---

## 🚀 Features

### ✅ Messaging
- Real-time text and image messages
- Smooth scroll and auto-focus on new messages
- Responsive UI with Tailwind CSS

### 😄 Emoji Reactions
- Tap to react with emojis like ❤️ 😂 🔥 👍 🥺 👏
- Each user can react once per message
- Toggle reaction by clicking the same emoji again
- Reactions are stored in MongoDB and synced across devices

### 🗑️ Message Deletion
- **Delete for me**: hides message only for the current user
- **Delete for everyone**: removes message from database and conversation
- Deletion state is stored in MongoDB (`deletedFor` array)
- Backend filters deleted messages per user on fetch

### 🖼️ Image Support
- Upload and preview images before sending
- Images stored and rendered inline with messages

### 🔄 Real-Time Sync
- Socket.IO integration for:
  - New messages
  - Emoji reactions
  - Message deletion
- Optimistic UI updates with backend confirmation

---

## 🧱 Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Frontend    | React, Redux, Tailwind CSS     |
| Backend     | Node.js, Express               |
| Database    | MongoDB + Mongoose             |
| Realtime    | Socket.IO                      |
| Auth        | JWT-based authentication       |
| Storage     | Multer for image uploads       |

---

## 📁 Project Structure

client/ ├── components/ │ ├── SenderMessage.jsx │ ├── ReceiverMessage.jsx ├── pages/ │ └── MessageArea.jsx ├── assets/ │ └── dp.webp ├── redux/ │ └── messageSlice.js ├── App.jsx ├── index.js

server/ ├── models/ │ ├── User.js │ ├── Message.js │ └── Conversation.js ├── controllers/ │ └── message.controllers.js ├── routes/ │ └── message.routes.js ├── socket.js ├── server.js


---

## 📦 API Endpoints

### Message
- `POST /api/message/send/:receiverId` — send message
- `GET /api/message/getAll/:receiverId` — fetch messages
- `DELETE /api/message/delete/:messageId?scope=me|everyone` — delete message

### Reaction
- `POST /api/message/reaction/:messageId` — react to a message

---

## 🧠 Backend Logic Highlights

### Message Schema

```js
{
  sender: ObjectId,
  receiver: ObjectId,
  message: String,
  image: String,
  reactions: [{ emoji, user, timestamp }],
  deletedFor: [ObjectId]
}
Reaction Controller
Stores one reaction per user per message

Toggles off if same emoji is clicked again

Emits messageReaction via socket

Delete Controller
scope="me" → adds user to deletedFor

scope="everyone" → deletes message and removes from conversation

Emits deleteMessage via socket

🧪 How to Run
Backend
bash
cd server
npm install
npm run dev
Frontend
bash
cd client
npm install
npm start
🛠️ Future Improvements
“This message was deleted” placeholder

Typing indicators

Read receipts

Group chats

Push notifications

👨‍💻 Author
Built by Hemendra — practical, detail-oriented, and persistent. Focused on building secure, user-friendly applications with delightful UI polish.
