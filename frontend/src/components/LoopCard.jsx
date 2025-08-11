import React, { useEffect, useRef, useState } from 'react';
import { FiVolume2, FiVolumeX } from 'react-icons/fi';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { MdOutlineComment } from 'react-icons/md';
import { MdDelete } from 'react-icons/md';
import { GoHeart, GoHeartFill } from 'react-icons/go';
import dp from '../assets/dp.webp';
import FollowButton from './FollowButton';
import { useDispatch, useSelector } from 'react-redux';
import { setLoopData } from '../redux/loopSlice';
import axios from 'axios';
import { serverUrl } from '../App';

function LoopCard({ loop }) {
  const videoRef = useRef();
  const commentRef = useRef();
  const menuRef = useRef();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMute, setIsMute] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const { userData } = useSelector((state) => state.user);
  const { socket } = useSelector((state) => state.socket);
  const { loopData } = useSelector((state) => state.loop);
  const dispatch = useDispatch();

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    }
  };

  const handleLikeOnDoubleClick = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1200);
    if (!loop.likes?.includes(userData._id)) handleLike();
  };

  const handleClick = () => {
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleLike = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/loop/like/${loop._id}`, { withCredentials: true });
      const updatedLoop = result.data;
      const updatedLoops = loopData.map((p) => (p._id === loop._id ? updatedLoop : p));
      dispatch(setLoopData(updatedLoops));
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async () => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/loop/comment/${loop._id}`,
        { message },
        { withCredentials: true }
      );
      const updatedLoop = result.data;
      const updatedLoops = loopData.map((p) => (p._id === loop._id ? updatedLoop : p));
      dispatch(setLoopData(updatedLoops));
      setMessage('');
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      const ok = window.confirm('Delete this loop? This action cannot be undone.');
      if (!ok) return;
      // Adjust endpoint here if your backend differs (e.g., /api/loop/delete/:id)
      await axios.delete(`${serverUrl}/api/loop/${loop._id}`, { withCredentials: true });
      const updatedLoops = loopData.filter((p) => p._id !== loop._id);
      dispatch(setLoopData(updatedLoops));
    } catch (error) {
      console.log(error);
    } finally {
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setShowComment(false);
      }
    };
    if (showComment) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showComment]);

  // Close the menu on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [menuOpen]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const video = videoRef.current;
        if (!video) return;
        if (entry.isIntersecting) {
          video.play();
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );
    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  useEffect(() => {
    socket?.on('likedLoop', (updatedData) => {
      const updatedLoops = loopData.map((p) =>
        p._id === updatedData.loopId ? { ...p, likes: updatedData.likes } : p
      );
      dispatch(setLoopData(updatedLoops));
    });
    socket?.on('commentedLoop', (updatedData) => {
      const updatedLoops = loopData.map((p) =>
        p._id === updatedData.loopId ? { ...p, comments: updatedData.comments } : p
      );
      dispatch(setLoopData(updatedLoops));
    });

    return () => {
      socket?.off('likedLoop');
      socket?.off('commentedLoop');
    };
  }, [socket, loopData, dispatch]);

  return (
    <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden'>

      {showHeart && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
          <GoHeartFill className='w-[100px] h-[100px] text-white drop-shadow-2xl' />
        </div>
      )}

      {/* Comments Drawer */}
      <div
        ref={commentRef}
        className={`absolute z-[200] bottom-0 w-full h-[500px] p-[10px] rounded-t-4xl bg-[#0e1718] transform transition-transform duration-500 ease-in-out left-0 shadow-2xl shadow-black ${
          showComment ? 'translate-y-0' : 'translate-y-[100%]'
        }`}
      >
        <h1 className='text-white text-[20px] text-center font-semibold'>Comments</h1>

        <div className='w-full h-[350px] overflow-y-auto flex flex-col gap-[20px]'>
          {loop.comments.length === 0 && (
            <div className='text-center text-white text-[20px] font-semibold mt-[50px]'>
              No Comments Yet
            </div>
          )}

          {loop.comments?.map((com, index) => (
            <div key={com._id || index} className='w-full flex flex-col gap-[5px] border-b-[1px] border-gray-800 justify-center pb-[10px] mt-[10px]'>
              <div className='flex justify-start items-center md:gap-[20px] gap-[10px]'>
                <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
                  <img src={com.author?.profileImage || dp} alt='' className='w-full object-cover' />
                </div>
                <div className='w-[150px] font-semibold text-white truncate'>{com.author?.userName}</div>
              </div>
              <div className='text-white pl-[60px]'>{com.message}</div>
            </div>
          ))}
        </div>

        <div className='w-full fixed bottom-0 h-[80px] flex items-center justify-between px-[20px] py-[20px]'>
          <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
            <img src={loop.author?.profileImage || dp} alt='' className='w-full object-cover' />
          </div>
          <input
            type='text'
            className='px-[10px] border-b-2 border-b-gray-500 w-[90%] text-white placeholder:text-white outline-none h-[40px]'
            placeholder='Write comment...'
            onChange={(e) => setMessage(e.target.value)}
            value={message}
          />
          {message && (
            <button className='absolute right-[20px] cursor-pointer' onClick={handleComment}>
              <IoSendSharp className='w-[25px] h-[25px] text-white' />
            </button>
          )}
        </div>
      </div>

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMute}
        loop
        src={loop?.media}
        className='w-full max-h-full'
        onClick={handleClick}
        onTimeUpdate={handleTimeUpdate}
        onDoubleClick={handleLikeOnDoubleClick}
      />

      {/* Top-right controls: menu + volume */}
      <div
        className='absolute top-[20px] right-[20px] z-[300] flex items-center gap-[10px]'
        onClick={(e) => e.stopPropagation()}
      >
        {/* 3-dot menu */}
        <div className='relative' ref={menuRef}>
          <button
            aria-label='More options'
            className='w-[32px] h-[32px] flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition'
            onClick={() => setMenuOpen((p) => !p)}
          >
            <HiOutlineDotsHorizontal className='w-[20px] h-[20px] text-white' />
          </button>

          {menuOpen && loop.author?._id === userData._id && (
            <div className='absolute top-[40px] right-0 w-[160px] bg-gray-800 text-white rounded-md shadow-lg border border-white/10'>
              <button
                className='w-full text-left px-3 py-2 text-red-400 hover:text-red-500 hover:bg-white/5 flex items-center gap-2'
                onClick={handleDelete}
              >
                <MdDelete className='w-[18px] h-[18px]' />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Volume toggle */}
        <button
          className='w-[32px] h-[32px] flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition'
          onClick={() => setIsMute((prev) => !prev)}
        >
          {!isMute ? (
            <FiVolume2 className='w-[20px] h-[20px] text-white font-semibold' />
          ) : (
            <FiVolumeX className='w-[20px] h-[20px] text-white font-semibold' />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className='absolute bottom-0 w-full h-[5px] bg-gray-900'>
        <div
          className='h-full bg-white transition-all duration-200 ease-linear'
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Bottom section */}
      <div className='w-full absolute h-[100px] bottom-[10px] p-[10px] flex flex-col gap-[10px]'>
        <div className='flex items-center gap-[5px]'>
          <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
            <img src={loop.author?.profileImage || dp} alt='' className='w-full object-cover' />
          </div>
          <div className='w-[120px] font-semibold truncate text-white'>{loop.author.userName}</div>
          <FollowButton
            targetUserId={loop.author?._id}
            tailwind={'px-[10px] py-[5px] text-white border-2 text-[14px] rounded-2xl border-white'}
          />
        </div>

        <div className='text-white px-[10px]'>{loop.caption}</div>

        <div className='absolute right-0 flex flex-col gap-[20px] text-white bottom-[150px] justify-center px-[10px]'>
          <div className='flex flex-col items-center cursor-pointer'>
            <div onClick={handleLike}>
              {!loop.likes.includes(userData._id) && <GoHeart className='w-[25px] cursor-pointer h-[25px]' />}
              {loop.likes.includes(userData._id) && (
                <GoHeartFill className='w-[25px] cursor-pointer h-[25px] text-red-600' />
              )}
            </div>
            <div>{loop.likes.length}</div>
          </div>

          <div className='flex flex-col items-center cursor-pointer' onClick={() => setShowComment(true)}>
            <div>
              <MdOutlineComment className='w-[25px] cursor-pointer h-[25px]' />
            </div>
            <div>{loop.comments.length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoopCard;
