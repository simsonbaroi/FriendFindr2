import React, { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, UserPlus, Clock, MoreVertical, Shield, Briefcase, Hash, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";
import { getRequestStatus, sendRequest, cancelRequest, approveRequest, rejectRequest } from "../services/requestService";
import { chatIdFor } from "../services/chatService";
import { Avatar } from "../components/Avatar";
import { PrimaryButton } from "../components/PrimaryButton";
import { useLocation } from "wouter";

export function UserProfilePage({ params }: { params: { uid: string } }) {
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [direction, setDirection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!currentUser || !params.uid) return;
      try {
        const [p, s] = await Promise.all([
          getUserProfile(params.uid),
          getRequestStatus(currentUser.uid, params.uid)
        ]);
        setProfile(p);
        setStatus(s.status);
        setDirection(s.direction);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.uid, currentUser]);

  const handleConnect = async () => {
    if (!currentUser || !profile) return;
    setActionLoading(true);
    try {
      await sendRequest(currentUser.uid, profile.uid);
      setStatus("pending");
      setDirection("sent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!currentUser || !profile) return;
    setActionLoading(true);
    try {
      await cancelRequest(currentUser.uid, profile.uid);
      setStatus(null);
      setDirection(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center h-full bg-slate-50 dark:bg-[#0A1628]">
          <div className="w-6 h-6 border-2 border-[#00C4D8] border-t-transparent rounded-full animate-spin" />
       </div>
    );
  }

  if (!profile) return <div className="p-8 text-center text-slate-600 dark:text-slate-500 bg-slate-50 dark:bg-[#0A1628] h-full">User not found</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <div className="h-44 bg-slate-50 dark:bg-[#0A1628] relative">
         <div style={{ position: 'absolute', bottom: '-20%', left: '0%', width: '100%', height: '100%', backgroundColor: '#00C4D8', filter: 'blur(100px)', opacity: 0.1 }} />
         <button onClick={() => setLocation("/")} className="absolute top-8 left-6 w-10 h-10 bg-white dark:bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 dark:text-white active:scale-90 border border-slate-200 dark:border-white/5">
           <ArrowLeft size={20} />
         </button>
         <button onClick={() => console.log('options')} className="absolute top-8 right-6 w-10 h-10 bg-white dark:bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 dark:text-white active:scale-90 border border-slate-200 dark:border-white/5">
           <MoreVertical size={20} />
         </button>
      </div>

      <div className="px-6 -mt-14 flex flex-col gap-6 relative z-10 pb-32">
        <div className="flex flex-col items-center">
          <div className="p-1 rounded-[38px] bg-slate-50 dark:bg-[#0A1628] shadow-2xl">
            <Avatar uri={profile.photoURL} name={profile.displayName} size={110} />
          </div>
          <div className="mt-4 text-center">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{profile.displayName}</h2>
             <p className="text-slate-600 dark:text-slate-400 font-medium">@{profile.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
           <div className="bg-white dark:bg-white/5 p-4 rounded-[28px] border border-slate-200 dark:border-white/5 flex flex-col items-center">
              <span className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">24</span>
              <span className="text-[9px] text-[#00A3B8] dark:text-[#00C4D8] uppercase font-bold tracking-widest mt-1">Mutuals</span>
           </div>
           <div className="bg-white dark:bg-white/5 p-4 rounded-[28px] border border-slate-200 dark:border-white/5 flex flex-col items-center">
              <span className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">128</span>
              <span className="text-[9px] text-[#00A3B8] dark:text-[#00C4D8] uppercase font-bold tracking-widest mt-1">Connections</span>
           </div>
           <div className="bg-white dark:bg-white/5 p-4 rounded-[28px] border border-slate-200 dark:border-white/5 flex flex-col items-center">
              <Shield size={18} className="text-[#00A3B8] dark:text-[#00C4D8] mb-1" />
              <span className="text-[9px] text-slate-600 dark:text-slate-500 uppercase font-bold tracking-widest mt-1">Secured</span>
           </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-slate-200 dark:border-white/5 flex flex-col gap-5">
           {profile.profession && (
             <div className="flex flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 flex items-center justify-center text-[#00A3B8] dark:text-[#00C4D8]">
                   <Briefcase size={16} />
                </div>
                <span className="text-[15px] font-bold text-slate-900 dark:text-white">{profile.profession}</span>
             </div>
           )}
           <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
             {profile.bio || "No bio available yet. This friendly user is still setting up their profile."}
           </p>

           {profile.country && (
             <div className="flex flex-row items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-500 dark:text-slate-400">
                   <Globe size={16} />
                </div>
                <span className="text-[14px] font-medium text-slate-300">{profile.country}</span>
             </div>
           )}

           {profile.tags && profile.tags.length > 0 && (
             <div className="flex flex-row gap-2 flex-wrap mt-2">
               {profile.tags.map((t: string) => (
                 <div key={t} className="flex flex-row items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <Hash size={10} className="text-[#00A3B8] dark:text-[#00C4D8]" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t}</span>
                 </div>
               ))}
             </div>
           )}
        </div>

        <div className="fixed bottom-10 left-6 right-6">
          {status === "approved" ? (
             <button 
               onClick={() => setLocation(`/chat/${chatIdFor(currentUser!.uid, profile.uid)}`)}
               className="w-full h-14 bg-[#00A3B8] dark:bg-[#00C4D8] rounded-2xl flex items-center justify-center gap-3 text-white dark:text-[#0A1628] font-bold shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20 active:scale-95 transition-all"
             >
               <MessageCircle size={20} />
               <span>Send Message</span>
             </button>
          ) : status === "pending" ? (
            direction === "sent" ? (
              <div className="flex flex-col gap-3">
                <div className="flex flex-row items-center justify-center h-14 bg-white dark:bg-white/5 rounded-2xl gap-3 text-slate-600 dark:text-slate-500 dark:text-slate-400 font-bold border border-slate-200 dark:border-white/5">
                  <Clock size={18} />
                  <span className="text-[15px]">Request Pending</span>
                </div>
                <button onClick={handleCancel} className="text-[11px] font-bold text-red-400 uppercase tracking-widest text-center py-2 active:opacity-50 transition-all">
                   Cancel Request
                </button>
              </div>
            ) : (
              <div className="flex flex-row gap-3">
                <button 
                  onClick={() => approveRequest(profile.uid, currentUser!.uid).then(() => setStatus("approved"))}
                  className="flex-1 h-14 bg-[#34D399] text-white dark:text-[#0A1628] rounded-2xl font-bold active:scale-95 transition-all shadow-lg shadow-[#34D399]/20"
                >
                  Accept
                </button>
                <button 
                  onClick={() => rejectRequest(profile.uid, currentUser!.uid).then(() => setStatus("rejected"))}
                  className="flex-1 h-14 bg-white dark:bg-white/5 text-slate-600 dark:text-slate-500 dark:text-slate-400 rounded-2xl font-bold active:scale-95 transition-all border border-slate-200 dark:border-white/5"
                >
                  Ignore
                </button>
              </div>
            )
          ) : profile.allowRequests !== false ? (
            <button 
              onClick={handleConnect}
              disabled={actionLoading}
              className="w-full h-14 bg-[#00A3B8] dark:bg-[#00C4D8] rounded-2xl flex items-center justify-center gap-3 text-white dark:text-[#0A1628] font-bold shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {actionLoading ? (
                 <div className="w-5 h-5 border-2 border-white dark:border-[#0A1628] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
              ) : (
                 <>
                   <UserPlus size={20} />
                   <span>Connect with Friend</span>
                 </>
              )}
            </button>
          ) : (
            <div className="w-full h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-600 dark:text-slate-500 font-bold border border-slate-200 dark:border-white/5">
               <Shield size={18} />
               <span>Not accepting requests</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
