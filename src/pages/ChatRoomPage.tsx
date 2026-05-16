import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Shield, MoreHorizontal } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeToMessages, sendMessage, markChatRead, Message } from "../services/chatService";
import { getUserProfile } from "../services/userService";
import { Avatar } from "../components/Avatar";
import { useLocation } from "wouter";

export function ChatRoomPage({ params }: { params: { chatId: string } }) {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const otherUid = params.chatId.split("_").find(u => u !== user.uid);
    if (otherUid) {
      getUserProfile(otherUid).then(setOtherUser);
    }

    // Mark as read initially
    markChatRead(params.chatId, user.uid);

    const unsub = subscribeToMessages(params.chatId, (msgs) => {
      setMessages(msgs.reverse());
      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
      }, 100);
      markChatRead(params.chatId, user.uid);
    });
    return unsub;
  }, [params.chatId, user]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || !user || !otherUser) return;
    const msg = text;
    setText("");
    try {
      await sendMessage(params.chatId, user.uid, otherUser.uid, msg);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628] relative z-[100]">
      <header className="px-4 py-3 bg-slate-50 dark:bg-[#0A1628] border-b border-slate-200 dark:border-white/5 flex flex-row items-center gap-3">
        <button onClick={() => setLocation("/chats")} className="p-2 -ml-2 text-slate-600 dark:text-slate-400 active:text-slate-900 dark:text-white transition-colors">
           <ArrowLeft size={20} />
        </button>
        <Avatar uri={otherUser?.photoURL} name={otherUser?.displayName || "User"} size={40} />
        <div className="flex-1 min-w-0">
           <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate">{otherUser?.displayName || "Loading..."}</h3>
           <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A3B8] dark:bg-[#00C4D8] animate-pulse" />
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Online</span>
           </div>
        </div>
        <button className="p-2 text-slate-600 dark:text-slate-500 dark:text-slate-400">
           <MoreHorizontal size={20} />
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 bg-slate-50 dark:bg-[#0A1628]"
      >
        <div className="flex flex-col items-center mb-6 px-10 text-center">
           <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 flex items-center justify-center mb-3">
              <Shield size={20} className="text-[#00A3B8] dark:text-[#00C4D8]" />
           </div>
           <p className="text-[11px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest leading-loose">
             Messages are end-to-end encrypted. Respect the privacy of your connections.
           </p>
        </div>

        {messages.map((m) => {
          const isMe = m.senderId === user?.uid;
          const timeText = m.createdAt?.seconds 
            ? new Date(m.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
            
          return (
            <div 
              key={m.id} 
              className={`max-w-[85%] flex flex-col ${isMe ? 'self-end items-end' : 'self-start items-start'}`}
            >
               <div className={`px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                 isMe 
                   ? 'bg-[#00A3B8] dark:bg-[#00C4D8] text-white dark:text-[#0A1628] font-medium rounded-tr-none shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20' 
                   : 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/5 rounded-tl-none'
               }`}>
                 {m.text}
               </div>
               <span className="text-[9px] text-slate-600 dark:text-slate-500 font-bold mt-1 uppercase tracking-tighter">
                 {timeText}
               </span>
            </div>
          );
        })}
      </div>

      <form 
        onSubmit={handleSend}
        className="p-4 bg-slate-50 dark:bg-[#0A1628] border-t border-slate-200 dark:border-white/5 flex flex-row items-center gap-3 pb-8"
      >
        <div className="flex-1 relative">
          <input
            className="w-full h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl px-4 pr-10 text-[14px] text-slate-900 dark:text-white outline-none focus:border-[#00C4D8]/50 transition-all placeholder:text-slate-600 dark:text-slate-500"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <button 
          type="submit"
          disabled={!text.trim()}
          className="w-12 h-12 rounded-2xl bg-[#00A3B8] dark:bg-[#00C4D8] text-white dark:text-[#0A1628] flex items-center justify-center shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}
