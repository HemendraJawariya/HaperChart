import React, { useEffect, useState } from 'react'
import dp from "../assets/dp.webp"
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { FaEye, FaBars } from "react-icons/fa6"
import { MdDelete } from "react-icons/md"
import axios from "axios"
import { serverUrl } from "../App"
import VideoPlayer from './VideoPlayer'

function StoryCard({ storyData }) {
  const { userData } = useSelector(state => state.user)
  const [showViewers, setShowViewers] = useState(false)
  const [progress, setProgress] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          navigate("/")
          return 100
        }
        return prev + 1
      })
    }, 150)

    return () => clearInterval(interval)
  }, [navigate])

  const handleDeleteStory = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this story?")
    if (!confirmDelete) return

    try {
      const result = await axios.delete(`${serverUrl}/api/story/delete`, {
        withCredentials: true,
      })
      console.log(result.data)
      navigate("/")
    } catch (error) {
      console.error("Delete error:", error.response?.data?.message || error.message)
    }
  }

  return (
    <div className='w-full max-w-[500px] h-[100vh] border-x-2 border-gray-800 pt-[10px] relative flex flex-col justify-center'>

      {/* Top Bar */}
      <div className='flex items-center justify-between absolute top-[30px] px-[10px] w-full z-50'>
        <div className='flex items-center gap-[10px]'>
          <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
          <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
            <img src={storyData?.author?.profileImage || dp} alt="" className='w-full object-cover' />
          </div>
          <div className='w-[120px] font-semibold truncate text-white'>{storyData?.author?.userName}</div>
        </div>

        {/* Hamburger Icon + Dropdown */}
        {storyData?.author?.userName === userData?.userName && (
          <div className="relative">
            <FaBars className="text-white w-[25px] h-[25px] cursor-pointer" onClick={() => setMenuOpen(prev => !prev)} />
            {menuOpen && (
              <div className="absolute right-0 mt-2 bg-gray-900 border border-gray-700 rounded-md p-2">
                <button
                  className="text-red-500 flex items-center gap-2 hover:text-red-700"
                  onClick={handleDeleteStory}
                >
                  <MdDelete /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className='absolute top-[10px] w-full h-[5px] bg-gray-900'>
        <div className='h-full bg-white transition-all duration-200 ease-linear' style={{ width: `${progress}%` }}></div>
      </div>

      {/* Story Media */}
      {!showViewers && (
        <>
          <div className='w-full h-[90vh] flex items-center justify-center'>
            {storyData?.mediaType === "image" && (
              <div className='w-[90%] flex items-center justify-center'>
                <img src={storyData?.media} alt="" className='w-[80%] rounded-2xl object-cover' />
              </div>
            )}
            {storyData?.mediaType === "video" && (
              <div className='w-[80%] flex flex-col items-center justify-center'>
                <VideoPlayer media={storyData?.media} />
              </div>
            )}
          </div>

          {/* Viewers Preview */}
          {storyData?.author?.userName === userData?.userName && (
            <div className='absolute w-full flex items-center gap-[10px] text-white h-[70px] bottom-0 p-2 left-0 cursor-pointer' onClick={() => setShowViewers(true)}>
              <div className='text-white flex items-center gap-[5px]'><FaEye />{storyData.viewers.length}</div>
              <div className='flex relative'>
                {storyData?.viewers?.slice(0, 3).map((viewer, index) => (
                  <div key={index} className={`w-[30px] h-[30px] border-2 border-black rounded-full cursor-pointer overflow-hidden absolute left-[${index * 20}px]`}>
                    <img src={viewer?.profileImage || dp} alt="" className='w-full object-cover' />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Viewers List */}
      {showViewers && (
        <>
          <div className='w-full h-[30%] flex items-center justify-center mt-[100px] cursor-pointer py-[30px] overflow-hidden' onClick={() => setShowViewers(false)}>
            {storyData?.mediaType === "image" && (
              <div className='h-full flex items-center justify-center'>
                <img src={storyData?.media} alt="" className='h-full rounded-2xl object-cover' />
              </div>
            )}
            {storyData?.mediaType === "video" && (
              <div className='h-full flex flex-col items-center justify-center'>
                <VideoPlayer media={storyData?.media} />
              </div>
            )}
          </div>

          <div className='w-full h-[70%] border-t-2 border-t-gray-800 p-[20px]'>
            <div className='text-white flex items-center gap-[10px]'><FaEye /><span>{storyData?.viewers?.length}</span><span>Viewers</span></div>
            <div className='w-full max-h-full flex flex-col gap-[10px] overflow-auto pt-[20px]'>
              {storyData?.viewers?.map((viewer, index) => (
                <div key={index} className='w-full flex items-center gap-[20px]'>
                  <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                    <img src={viewer?.profileImage || dp} alt="" className='w-full object-cover' />
                  </div>
                  <div className='w-[120px] font-semibold truncate text-white'>{viewer?.userName}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default StoryCard
