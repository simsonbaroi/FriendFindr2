import React, { useState, useEffect } from "react";
import { MessageSquare, ChevronRight, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { subscribeToChats, Chat } from "../services/chatService";
import { getUserProfile } from "../services/userService";
import { Avatar } from "../components/Avatar";
import { useLocation } from "wouter";

export function ChatsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToChats(user.uid, async (chatList) => {
      setChats(chatList);
      
      const newUids = chatList
        .flatMap(c => c.participants)
        .filter(uid => uid !== user.uid && !profiles[uid]);
      
      if (newUids.length > 0) {
        const newProfiles = { ...profiles };
        await Promise.all(newUids.map(async uid => {
          const p = await getUserProfile(uid);
          if (p) newProfiles[uid] = p;
        }));
        setProfiles(newProfiles);
      }
      setLoading(false);
    });
    return unsub;
  }, [user]);

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0A1628]">
          <div className="w-6 h-6 border-2 border-[#00C4D8] border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <header className="px-6 pt-10 pb-6 border-b border-slate-200 dark:border-white/5 flex flex-row items-center justify-between">
        <h1 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Messages</h1>
        {chats.length > 0 && (
          <div className="text-[12px] font-bold text-[#00A3B8] dark:text-[#00C4D8] bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 px-2.5 py-1 rounded-full">
            {chats.reduce((acc, c) => acc + (c.unreadCount?.[user!.uid] || 0), 0)} unread
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        {chats.length > 0 ? (
          <div className="flex flex-col">
            {chats.map(chat => {
              const otherUid = chat.participants.find(u => u !== user!.uid);
              const p = otherUid ? profiles[otherUid] : null;
              
              const unreadCount = chat.unreadCount?.[user!.uid] || 0;
              const hasUnread = unreadCount > 0;
              const timeText = chat.lastMessageAt?.seconds
                ? new Date(chat.lastMessageAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <button 
                  key={chat.id} 
                  onClick={() => setLocation(`/chat/${chat.id}`)}
                  className="flex flex-row items-center gap-4 px-6 py-4 bg-white dark:bg-white/5 border-b border-slate-200 dark:border-white/5 active:bg-slate-100 dark:active:bg-white/10 transition-colors text-left relative overflow-hidden"
                >
                  <div className="relative">
                    <Avatar uri={p?.photoURL} name={p?.displayName || "User"} size={54} />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <div className="flex flex-row justify-between items-center">
                      <span className={`font-bold truncate ${hasUnread ? 'text-[#00A3B8] dark:text-[#00C4D8]' : 'text-slate-900 dark:text-white'}`}>
                        {p?.displayName || "Loading..."}
                      </span>
                      <span className={`text-[10px] font-bold uppercase ${hasUnread ? 'text-[#00A3B8] dark:text-[#00C4D8]' : 'text-slate-600 dark:text-slate-500'}`}>
                        {timeText}
                      </span>
                    </div>
                    <p className={`text-[13px] truncate pr-4 ${!chat.lastMessage ? 'text-[#00A3B8] dark:text-[#00C4D8] font-medium italic' : hasUnread ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                      {chat.lastMessage || "Tap to start chatting"}
                    </p>
                  </div>
                  {hasUnread ? (
                    <div className="w-5 h-5 rounded-full bg-[#00A3B8] dark:bg-[#00C4D8] text-white dark:text-[#0A1628] flex items-center justify-center text-[10px] font-bold shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20">
                      {unreadCount}
                    </div>
                  ) : (
                    <ChevronRight size={14} className="text-slate-600 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 px-10 text-center">
            <div className="w-16 h-16 rounded-[22px] bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 flex items-center justify-center mb-6">
               <MessageSquare size={28} className="text-[#00A3B8] dark:text-[#00C4D8]" />
            </div>
            <p className="text-[18px] font-bold text-slate-900 dark:text-white mb-2">No messages yet</p>
            <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-8 max-w-[240px] leading-relaxed">
              Once you and another user both accept each other's connection requests, you'll be able to chat here.
            </p>

            <button 
               onClick={() => setLocation("/")}
               className="h-10 px-6 bg-[#00A3B8] dark:bg-[#00C4D8] rounded-full text-white dark:text-[#0A1628] font-bold text-[13px] active:scale-95 transition-all shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20"
            >
               Find people to connect with
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
