import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdDelete } from "react-icons/md";

const emojis = ["❤️", "😂", "🔥", "👍", "🥺", "👏"];

function SenderMessage({ message, onDelete, onReact }) {
  const { userData } = useSelector((state) => state.user);
  const scrollRef = useRef(null);
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message.message, message.image, message.reactions?.length]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current?.contains(e.target)) {
        setMenuOpen(false);
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const confirmDelete = () => {
    setMenuOpen(false);
    if (window.confirm("Delete this message?")) {
      onDelete?.(message._id);
    }
  };

  const handleEmojiClick = (emoji) => {
    onReact?.(message._id, emoji);
    setShowEmojiPicker(false);
  };

  const getDisplayName = (r) => {
    const currentId = userData?._id?.toString?.() || "";
    if (!r?.user) return "";
    // r.user can be an ObjectId string or populated user object
    if (typeof r.user === "string") {
      return r.user === currentId ? "You" : "";
    }
    if (typeof r.user === "object") {
      if (r.user?._id?.toString?.() === currentId) return "You";
      return r.user?.userName || r.user?.name || "";
    }
    return "";
  };

  return (
    <div
      ref={scrollRef}
      className="group relative ml-auto right-0 max-w-[60%] flex flex-col gap-2"
    >
      {/* Message Bubble */}
      <div
        className="bg-gradient-to-br from-[#9500ff] to-[#ff0095] rounded-t-2xl rounded-bl-2xl rounded-br-0 px-3 py-2 cursor-pointer shadow-[0_4px_18px_rgba(149,0,255,0.35)]"
        onClick={() => setShowEmojiPicker((p) => !p)}
      >
        {message.image && (
          <img
            src={message.image}
            alt="sent attachment"
            className="max-h-[260px] w-full object-cover rounded-xl mb-2"
          />
        )}
        {!!message.message && (
          <div className="text-[17px] text-white break-words whitespace-pre-wrap">
            {message.message}
          </div>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker bg-black/80 text-white backdrop-blur-md px-2 py-1 rounded-lg flex gap-2 z-[60] w-max">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              className="text-[20px] hover:scale-125 transition-transform"
              onClick={() => handleEmojiClick(emoji)}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Reaction Display */}
      {Array.isArray(message.reactions) && message.reactions.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm text-white">
          {message.reactions.map((r, i) => {
            const name = getDisplayName(r);
            return (
              <span
                key={`${r.emoji}-${i}`}
                className="bg-black/40 px-2 py-[2px] rounded-full"
                title={name ? `${r.emoji} by ${name}` : r.emoji}
              >
                {r.emoji} {name}
              </span>
            );
          })}
        </div>
      )}

      {/* Profile Image */}
      <div className="w-[30px] h-[30px] rounded-full overflow-hidden absolute right-[-25px] bottom-[-40px] border border-white/10">
        <img
          src={userData?.profileImage || ""}
          alt="You"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Hamburger menu - visible on hover */}
      <div className="absolute top-[5px] right-[5px] z-[50]" ref={menuRef}>
        <button
          className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Message options"
        >
          <HiOutlineDotsHorizontal className="w-[20px] h-[20px]" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-[160px] bg-black bg-opacity-90 backdrop-blur-md border border-gray-700 rounded-md shadow-xl z-[100]">
            <button
              onClick={confirmDelete}
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-900 text-left"
            >
              <MdDelete className="w-[18px] h-[18px]" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SenderMessage;
