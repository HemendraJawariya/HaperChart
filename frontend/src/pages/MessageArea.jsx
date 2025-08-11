import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { LuImage } from "react-icons/lu";
import { IoMdSend } from "react-icons/io";
import dp from "../assets/dp.webp"
import SenderMessage from '../components/SenderMessage';
import ReceiverMessage from '../components/ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMessages } from '../redux/messageSlice';

function MessageArea() {
  const { selectedUser, messages } = useSelector(state => state.message)
  const { userData } = useSelector(state => state.user)
  const { socket } = useSelector(state => state.socket)

  const navigate = useNavigate()
  const [input, setInput] = useState("")
  const dispatch = useDispatch()
  const imageInput = useRef()
  const [frontendImage, setFrontendImage] = useState(null)
  const [backendImage, setBackendImage] = useState(null)

  // Keep a ref of the latest messages to avoid stale closures in socket handlers
  const messagesRef = useRef(messages)
  useEffect(() => { messagesRef.current = messages }, [messages])

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input && !backendImage) return
    try {
      const formData = new FormData()
      formData.append("message", input)
      if (backendImage) {
        formData.append("image", backendImage)
      }
      const result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`, formData, { withCredentials: true })
      dispatch(setMessages([...messagesRef.current, result.data]))
      setInput("")
      setBackendImage(null)
      setFrontendImage(null)
    } catch (error) {
      console.log(error)
    }
  }

  const getAllMessages = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/message/getAll/${selectedUser._id}`, { withCredentials: true })
      // Ensure reactions array exists
      const safe = (result.data || []).map(m => ({ reactions: [], ...m }))
      dispatch(setMessages(safe))
    } catch (error) {
      console.log(error)
    }
  }

  // React to a message
  const handleReact = async (messageId, emoji) => {
    try {
      // Optimistic UI: update immediately
      const next = messagesRef.current.map(m => {
        if (m._id !== messageId) return m
        // Remove any previous reaction by this user, then add new one
        const withoutMine = (m.reactions || []).filter(r => {
          const uid = typeof r.user === 'object' ? r.user?._id : r.user
          return uid !== userData._id
        })
        const myUserObj = { _id: userData._id, name: userData.name, userName: userData.userName }
        return { ...m, reactions: [...withoutMine, { emoji, user: myUserObj }] }
      })
      dispatch(setMessages(next))

      // Server update (will also broadcast socket)
      await axios.post(`${serverUrl}/api/message/reaction/${messageId}`, { emoji }, { withCredentials: true })
    } catch (error) {
      console.log("Reaction error", error)
    }
  }

  // Delete a message
  const handleDelete = async (messageId) => {
    try {
      // Optimistic removal
      const next = messagesRef.current.filter(m => m._id !== messageId)
      dispatch(setMessages(next))

      await axios.delete(`${serverUrl}/api/message/${messageId}`, { withCredentials: true })
    } catch (error) {
      console.log("Delete error", error)
    }
  }

  useEffect(() => {
    getAllMessages()
  }, [])

  // Socket listeners: new message, reaction updates, delete updates
  useEffect(() => {
    if (!socket) return

    const onNewMessage = (mess) => {
      dispatch(setMessages([...messagesRef.current, { reactions: [], ...mess }]))
    }

    const onMessageReaction = ({ messageId, reactions }) => {
      const next = messagesRef.current.map(m => m._id === messageId ? { ...m, reactions } : m)
      dispatch(setMessages(next))
    }

    const onDeleteMessage = ({ messageId }) => {
      const next = messagesRef.current.filter(m => m._id !== messageId)
      dispatch(setMessages(next))
    }

    socket.on("newMessage", onNewMessage)
    socket.on("messageReaction", onMessageReaction)
    socket.on("deleteMessage", onDeleteMessage)

    return () => {
      socket.off("newMessage", onNewMessage)
      socket.off("messageReaction", onMessageReaction)
      socket.off("deleteMessage", onDeleteMessage)
    }
  }, [socket, dispatch])

  return (
    <div className='w-full h-[100vh] bg-black relative'>
      {/* Header */}
      <div className='w-full flex items-center gap-[15px] px-[20px] py-[10px] fixed top-0 z-[100] bg-black'>
        <div className='h-[80px] flex items-center gap-[20px] px-[20px]'>
          <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
        </div>

        <div className='w-[40px] h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden' onClick={() => navigate(`/profile/${selectedUser.userName}`)}>
          <img src={selectedUser.profileImage || dp} alt="" className='w-full object-cover' />
        </div>

        <div className='text-white text-[18px] font-semibold'>
          <div>{selectedUser.userName}</div>
          <div className='text-[14px] text-gray-400'>{selectedUser.name}</div>
        </div>
      </div>

      {/* Messages */}
      <div className='w-full h-[80%] pt-[100px] px-[40px] flex flex-col gap-[50px] overflow-auto bg-black'>
        {messages && messages.map((mess) =>
          mess.sender == userData._id ? (
            <SenderMessage
              key={mess._id}
              message={mess}
              currentUserId={userData._id}
              onReact={handleReact}
              onDelete={handleDelete}
            />
          ) : (
            <ReceiverMessage
              key={mess._id}
              message={mess}
              currentUserId={userData._id}
              onReact={handleReact}
              onDelete={handleDelete}
            />
          )
        )}
      </div>

      {/* Composer */}
      <div className='w-full h-[80px] fixed bottom-0 flex justify-center items-center bg-black z-[100]'>
        <form className='w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#131616] flex items-center gap-[10px] px-[20px] relative' onSubmit={handleSendMessage}>
          {frontendImage && (
            <div className='w-[100px] rounded-2xl h-[100px] absolute top-[-120px] right-[10px] overflow-hidden'>
              <img src={frontendImage} alt="" className='h-full object-cover' />
            </div>
          )}

          <input type="file" accept='image/*' hidden ref={imageInput} onChange={handleImage} />
          <input
            type="text"
            placeholder='Message'
            className='w-full h-full px-[20px] text-[18px] text-white outline-0 bg-transparent'
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <div onClick={() => imageInput.current?.click()}><LuImage className='w-[28px] h-[28px] text-white' /></div>
          {(input || frontendImage) && (
            <button className='w-[60px] h-[40px] rounded-full bg-gradient-to-br from-[#9500ff] to-[#ff0095] flex items-center justify-center cursor-pointer'>
              <IoMdSend className='w-[25px] h-[25px] text-white' />
            </button>
          )}
        </form>
      </div>



    </div>
  )
}

export default MessageArea
