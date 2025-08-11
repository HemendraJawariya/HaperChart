import React, { useEffect, useState } from 'react'
import dp from "../assets/dp.webp"
import VideoPlayer from './VideoPlayer'
import { GoHeart, GoHeartFill, GoBookmarkFill } from "react-icons/go"
import { MdOutlineComment, MdOutlineBookmarkBorder, MdDelete } from "react-icons/md"
import { IoSendSharp } from "react-icons/io5"
import { FaEllipsisV } from "react-icons/fa"
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setPostData } from '../redux/postSlice'
import { setUserData } from '../redux/userSlice'
import FollowButton from './FollowButton'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function Post({ post }) {
  const { userData } = useSelector(state => state.user)
  const { postData } = useSelector(state => state.post)
  const { socket } = useSelector(state => state.socket)
  const [showComment, setShowComment] = useState(false)
  const [message, setMessage] = useState("")
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLike = async () => {
    try {
      const { data: updatedPost } = await axios.get(
        `${serverUrl}/api/post/like/${post._id}`,
        { withCredentials: true }
      )
      const updatedPosts = postData.map(p => p._id === post._id ? updatedPost : p)
      dispatch(setPostData(updatedPosts))
    } catch (err) {
      console.error(err)
    }
  }

  const handleComment = async () => {
    try {
      const { data: updatedPost } = await axios.post(
        `${serverUrl}/api/post/comment/${post._id}`,
        { message },
        { withCredentials: true }
      )
      const updatedPosts = postData.map(p => p._id === post._id ? updatedPost : p)
      dispatch(setPostData(updatedPosts))
      setMessage("")
    } catch (err) {
      console.error(err.response || err)
    }
  }

  const handleSaved = async () => {
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/post/saved/${post._id}`,
        { withCredentials: true }
      )
      dispatch(setUserData(data))
    } catch (err) {
      console.error(err.response || err)
    }
  }

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return
    try {
      await axios.delete(
        `${serverUrl}/api/post/${post._id}`,
        { withCredentials: true }
      )
      toast.success("Post deleted successfully!")
      const filtered = postData.filter(p => p._id !== post._id)
      dispatch(setPostData(filtered))
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete post")
    }
  }

  useEffect(() => {
    socket?.on("likedPost", updatedData => {
      const updated = postData.map(p =>
        p._id === updatedData.postId ? { ...p, likes: updatedData.likes } : p
      )
      dispatch(setPostData(updated))
    })

    socket?.on("commentedPost", updatedData => {
      const updated = postData.map(p =>
        p._id === updatedData.postId ? { ...p, comments: updatedData.comments } : p
      )
      dispatch(setPostData(updated))
    })

    return () => {
      socket?.off("likedPost")
      socket?.off("commentedPost")
    }
  }, [socket, postData, dispatch])

  return (
    <div className="w-[90%] flex flex-col gap-[10px] bg-white items-center shadow-2xl shadow-[#00000058] rounded-2xl pb-[20px]">
      {/* Header */}
      <div className="w-full h-[80px] flex justify-between items-center px-[10px]">
        <div
          className="flex items-center gap-[10px] md:gap-[20px] cursor-pointer"
          onClick={() => navigate(`/profile/${post.author?.userName}`)}
        >
          <div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden">
            <img
              src={post.author?.profileImage || dp}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="w-[150px] font-semibold truncate">
            {post.author.userName}
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          {userData._id !== post.author._id ? (
            <FollowButton
              tailwind="px-[10px] minw-[60px] md:min-w-[100px] py-[5px] h-[30px] md:h-[40px] bg-[black] text-white rounded-2xl text-[14px] md:text-[16px]"
              targetUserId={post.author._id}
            />
          ) : (
            <div className="relative">
              <FaEllipsisV
                className="text-black cursor-pointer"
                onClick={() => setMenuOpen(o => !o)}
              />
              {menuOpen && (
                <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md p-2 z-50 shadow-lg">
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700"
                  >
                    <MdDelete /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Media */}
      <div className="w-[90%] flex items-center justify-center">
        {post.mediaType === "image" && (
          <img
            src={post.media}
            alt=""
            className="w-[80%] rounded-2xl object-cover"
          />
        )}
        {post.mediaType === "video" && (
          <div className="w-[80%] flex flex-col items-center">
            <VideoPlayer media={post.media} />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="w-full h-[60px] flex justify-between items-center px-[20px] mt-[10px]">
        <div className="flex items-center gap-[10px]">
          <div className="flex items-center gap-[5px]">
            {!post.likes.includes(userData._1d) ? (
              <GoHeart
                className="w-[25px] h-[25px] cursor-pointer"
                onClick={handleLike}
              />
            ) : (
              <GoHeartFill
                className="w-[25px] h-[25px] cursor-pointer text-red-600"
                onClick={handleLike}
              />
            )}
            <span>{post.likes.length}</span>
          </div>
          <div
            className="flex items-center gap-[5px] cursor-pointer"
            onClick={() => setShowComment(c => !c)}
          >
            <MdOutlineComment className="w-[25px] h-[25px]" />
            <span>{post.comments.length}</span>
          </div>
        </div>

        <div onClick={handleSaved}>
          {!userData.saved.includes(post._id) ? (
            <MdOutlineBookmarkBorder className="w-[25px] h-[25px] cursor-pointer" />
          ) : (
            <GoBookmarkFill className="w-[25px] h-[25px] cursor-pointer" />
          )}
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="w-full px-[20px] flex items-center gap-[10px]">
          <h1 className="font-semibold">{post.author.userName}</h1>
          <p>{post.caption}</p>
        </div>
      )}

      {/* Comments */}
      {showComment && (
        <div className="w-full flex flex-col gap-[30px] pb-[20px]">
          {/* New Comment Input */}
          <div className="w-full h-[80px] flex items-center px-[20px] relative">
            <div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden">
              <img
                src={post.author?.profileImage || dp}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <input
              type="text"
              placeholder="Write comment..."
              className="w-[90%] border-b-2 border-gray-500 px-[10px] h-[40px] outline-none"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button
              className="absolute right-[20px] top-1/2 transform -translate-y-1/2"
              onClick={handleComment}
            >
              <IoSendSharp className="w-[25px] h-[25px]" />
            </button>
          </div>

          {/* Existing Comments */}
          <div className="w-full max-h-[300px] overflow-auto">
            {post.comments.map((com, idx) => (
              <div
                key={idx}
                className="w-full flex items-center gap-[20px] px-[20px] py-[10px] border-b border-gray-200"
              >
                <div className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden">
                  <img
                    src={com.author.profileImage || dp}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <p>{com.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  )
}

export default Post
