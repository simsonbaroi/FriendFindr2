import React, { useState } from "react";
import { ArrowLeft, Shield, Search, UserPlus, Info } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/userService";
import { useLocation } from "wouter";

export function PrivacySettingsPage() {
  const { profile, user } = useAuth();
  const [, setLocation] = useLocation();
  const [searchVisible, setSearchVisible] = useState(profile?.searchVisible ?? true);
  const [allowRequests, setAllowRequests] = useState(profile?.allowRequests ?? true);
  const [loading, setLoading] = useState(false);

  const toggleSearch = async () => {
    if (!user) return;
    const newVal = !searchVisible;
    setSearchVisible(newVal);
    try {
      await updateUserProfile(user.uid, { searchVisible: newVal });
    } catch (err) {
      setSearchVisible(!newVal);
      console.error(err);
    }
  };

  const toggleRequests = async () => {
    if (!user) return;
    const newVal = !allowRequests;
    setAllowRequests(newVal);
    try {
      await updateUserProfile(user.uid, { allowRequests: newVal });
    } catch (err) {
      setAllowRequests(!newVal);
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <header className="px-6 pt-10 pb-6 flex flex-row items-center gap-4">
        <button onClick={() => setLocation("/settings")} className="p-2 -ml-2 text-slate-900 dark:text-white/60 active:text-slate-900 dark:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">Privacy Settings</h1>
      </header>

      <div className="px-6 flex flex-col gap-6">
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[24px] p-5 flex flex-row gap-4 items-start shadow-xl">
           <div className="w-10 h-10 rounded-xl bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 flex items-center justify-center text-[#00A3B8] dark:text-[#00C4D8] shrink-0">
              <Shield size={20} />
           </div>
           <div className="flex flex-col gap-1">
              <p className="text-[14px] font-bold text-slate-900 dark:text-white">Always protected</p>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                Your email and phone number are NEVER shared with other users.
              </p>
           </div>
        </div>

        <div className="flex flex-col gap-3">
           <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest pl-1">Discovery</p>
           
           <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[28px] overflow-hidden">
              <div className="flex flex-row items-center justify-between p-5 border-b border-slate-200 dark:border-white/5">
                 <div className="flex flex-row items-center gap-4">
                    <div className="text-[#00A3B8] dark:text-[#00C4D8] opacity-60">
                       <Search size={18} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-slate-900 dark:text-white">Appear in Search</span>
                       <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">Let others find you by name or username</span>
                    </div>
                 </div>
                 <Toggle active={searchVisible} onToggle={toggleSearch} />
              </div>

              <div className="flex flex-row items-center justify-between p-5">
                 <div className="flex flex-row items-center gap-4">
                    <div className="text-[#00A3B8] dark:text-[#00C4D8] opacity-60">
                       <UserPlus size={18} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[14px] font-bold text-slate-900 dark:text-white">Allow Connection Requests</span>
                       <span className="text-[11px] text-slate-600 dark:text-slate-500 font-medium">Others can send you a request to connect</span>
                    </div>
                 </div>
                 <Toggle active={allowRequests} onToggle={toggleRequests} />
              </div>
           </div>
        </div>

        <div className="mt-4 flex flex-row gap-3 px-2">
           <Info size={14} className="text-slate-600 dark:text-slate-500 shrink-0 mt-0.5" />
           <p className="text-[12px] text-slate-600 dark:text-slate-500 leading-relaxed font-medium">
             Even when visible, only your name, username, bio, and profession are shown. Private contact details are always hidden.
           </p>
        </div>
      </div>
    </div>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={`w-11 h-6 rounded-full transition-all relative flex items-center px-1 ${active ? 'bg-[#00A3B8] dark:bg-[#00C4D8]' : 'bg-slate-300 dark:bg-slate-700'}`}
    >
       <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}
