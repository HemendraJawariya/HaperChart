import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const emojis = ["❤️", "😂", "🔥", "👍", "🥺", "👏"];

function ReceiverMessage({ message, onReact }) {
  const scrollRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [message.message, message.image, message.reactions?.length]);

  const handleEmojiClick = (emoji) => {
    onReact?.(message._id, emoji);
    setShowEmojiPicker(false);
  };

  const getDisplayName = (r) => {
    const currentId = userData?._id?.toString?.() || "";
    if (!r?.user) return "";
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
      className="group relative ml-0 left-0 max-w-[60%] flex flex-col gap-2"
    >
      {/* Message Bubble */}
      <div
        className="bg-[#0f1111] border border-[#1f2324] rounded-t-2xl rounded-br-2xl rounded-bl-0 px-3 py-2 text-white cursor-pointer shadow-[0_6px_20px_rgba(0,0,0,0.35)]"
        onClick={() => setShowEmojiPicker((p) => !p)}
      >
        {message.image && (
          <img
            src={message.image}
            alt="received attachment"
            className="max-h-[260px] w-full object-cover rounded-xl mb-2"
          />
        )}
        {!!message.message && (
          <div className="text-[17px] break-words whitespace-pre-wrap">
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
                className="bg-white/10 px-2 py-[2px] rounded-full"
                title={name ? `${r.emoji} by ${name}` : r.emoji}
              >
                {r.emoji} {name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ReceiverMessage;
