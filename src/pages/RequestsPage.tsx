import React, { useState, useEffect } from "react";
import { Clock, Check, X, Inbox, UserX } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getIncomingRequests, approveRequest, rejectRequest, ContactRequest } from "../services/requestService";
import { getUserProfile } from "../services/userService";
import { UserCard } from "../components/UserCard";
import { useLocation } from "wouter";

export function RequestsPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const list = activeTab === "incoming" 
          ? await getIncomingRequests(user.uid)
          : await getSentRequests(user.uid);
        
        setRequests(list);
        
        const profileMap: Record<string, any> = {};
        await Promise.all(list.map(async (r) => {
          const targetUid = activeTab === "incoming" ? r.fromUid : r.toUid;
          const p = await getUserProfile(targetUid);
          if (p) profileMap[targetUid] = p;
        }));
        setProfiles(profileMap);
      } catch (err) {
        console.error("Failed to load requests:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, activeTab]);

  const handleAction = async (requestId: string, fromUid: string, approved: boolean) => {
    if (!user) return;
    try {
      if (approved) {
        await approveRequest(fromUid, user.uid);
      } else {
        await rejectRequest(fromUid, user.uid);
      }
      setRequests(prev => prev.filter(r => r.fromUid !== fromUid));
    } catch (err) {
      console.error("Action failed:", err);
    }
  };

  if (loading) {
     return (
        <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0A1628]">
           <div className="w-6 h-6 border-2 border-[#00C4D8] border-t-transparent rounded-full animate-spin" />
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <header className="px-6 pt-10 pb-4">
        <h1 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">Requests</h1>
      </header>

      <div className="mx-6 p-1 bg-white dark:bg-white/5 rounded-xl flex flex-row gap-1">
         <button 
           onClick={() => setActiveTab("incoming")}
           className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "incoming" ? 'bg-[#1E2D48] text-[#00A3B8] dark:text-[#00C4D8]' : 'text-slate-600 dark:text-slate-500'}`}
         >
           Incoming
         </button>
         <button 
           onClick={() => setActiveTab("sent")}
           className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${activeTab === "sent" ? 'bg-[#1E2D48] text-[#00A3B8] dark:text-[#00C4D8]' : 'text-slate-600 dark:text-slate-500'}`}
         >
           Sent
         </button>
      </div>

      <div className="px-6 py-6 flex flex-col gap-4 pb-24">
        {requests.length > 0 ? (
          requests.map(req => {
            const targetUid = activeTab === "incoming" ? req.fromUid : req.toUid;
            const p = profiles[targetUid];
            if (!p) return null;
            return (
              <UserCard
                key={req.id}
                user={p}
                onPress={() => setLocation(`/profile/${p.uid}`)}
                rightElement={
                  activeTab === "incoming" ? (
                    <div className="flex flex-row gap-2">
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleAction(req.id, req.fromUid, true); }}
                         className="w-9 h-9 rounded-xl bg-[#00A3B8] dark:bg-[#00C4D8] text-white dark:text-[#0A1628] flex items-center justify-center shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20 active:scale-95 transition-all"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                         onClick={(e) => { e.stopPropagation(); handleAction(req.id, req.fromUid, false); }}
                         className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 flex items-center justify-center active:scale-95 transition-all"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-row items-center gap-3">
                       <div className="flex flex-row items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                          <Clock size={14} className="text-[#00A3B8] dark:text-[#00C4D8]" />
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">Pending</span>
                       </div>
                    </div>
                  )
                }
              />
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
            <div className="w-16 h-16 rounded-[22px] bg-white dark:bg-white/5 flex items-center justify-center mb-6">
               <Inbox size={28} className="text-slate-600 dark:text-slate-500" />
            </div>
            <p className="text-[17px] font-bold text-slate-900 dark:text-white mb-2">No {activeTab} requests</p>
            <p className="text-[14px] text-slate-600 dark:text-slate-400 mb-8 max-w-[240px] leading-relaxed">
               {activeTab === "incoming" 
                 ? "When someone wants to connect with you, it'll appear here."
                 : "People you've reached out to will show up here until they respond."}
            </p>

            <button 
               onClick={() => setLocation("/")}
               className="h-10 px-8 bg-[#00A3B8] dark:bg-[#00C4D8] rounded-full text-white dark:text-[#0A1628] font-bold text-[13px] active:scale-95 transition-all shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20"
            >
               Search for people
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
