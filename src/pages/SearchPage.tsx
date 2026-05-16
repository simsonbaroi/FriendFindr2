import React, { useState } from "react";
import { Search, Info, Settings, UserPlus, Briefcase, AtSign, Globe, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { searchUsers } from "../services/userService";
import { UserCard } from "../components/UserCard";
import { useLocation } from "wouter";

export function SearchPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || !user) return;
    setLoading(true);
    setSearched(true);
    try {
      const found = await searchUsers(query, user.uid, country);
      setResults(found);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628] overflow-y-auto">
      <header className="px-6 pt-10 pb-4 flex flex-row items-center justify-between">
        <div>
           <h1 className="text-[17px] font-bold text-[#00A3B8] dark:text-[#00C4D8] tracking-tight">FriendFindr</h1>
           <p className="text-[12px] text-slate-600 dark:text-slate-400 font-medium">Find people</p>
        </div>
        <button onClick={() => setLocation("/settings")} className="w-9 h-9 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400">
           <Settings size={18} />
        </button>
      </header>

      <div className="px-6 py-2 flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
            <input
              className="w-full h-12 bg-white dark:bg-white/5 rounded-2xl pl-11 pr-4 text-[14px] text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/5 focus:border-[#00A3B8]/30 dark:border-[#00C4D8]/30 transition-all placeholder:text-slate-600 dark:text-slate-500"
              placeholder="Name, username, profession, tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="relative">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-500" />
            <input
              className="w-full h-12 bg-white dark:bg-white/5 rounded-2xl pl-11 pr-4 text-[14px] text-slate-900 dark:text-white outline-none border border-slate-200 dark:border-white/5 focus:border-[#00A3B8]/30 dark:border-[#00C4D8]/30 transition-all placeholder:text-slate-600 dark:text-slate-500"
              placeholder="Filter by country (optional)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center pt-24 gap-4">
            <div className="w-6 h-6 border-2 border-[#00C4D8] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 pb-24">
            {results.length > 0 ? (
              <>
                <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest pl-1 mt-2">
                  Results ({results.length})
                </p>
                {results.map((profile) => (
                  <UserCard
                    key={profile.uid}
                    user={profile}
                    onPress={() => setLocation(`/profile/${profile.uid}`)}
                  />
                ))}
              </>
            ) : searched ? (
              <div className="flex flex-col items-center justify-center py-20 px-10 text-center">
                 <div className="w-16 h-16 rounded-[22px] bg-white dark:bg-white/5 flex items-center justify-center mb-6">
                    <Search size={24} className="text-slate-600" />
                 </div>
                 <p className="text-[16px] font-bold text-slate-900 dark:text-white mb-2">No results found</p>
                 <p className="text-[13px] text-slate-600 dark:text-slate-500 dark:text-slate-400 leading-relaxed">We couldn't find anyone matching your search. Try different keywords.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-2 text-center">
                 <div className="w-16 h-16 rounded-[22px] bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 flex items-center justify-center mb-6">
                    <UserPlus size={28} className="text-[#00A3B8] dark:text-[#00C4D8]" />
                 </div>
                 <p className="text-[17px] font-bold text-slate-900 dark:text-white mb-1.5">Search for people</p>
                 <p className="text-[13px] text-slate-600 dark:text-slate-500 dark:text-slate-400 mb-8 max-w-[240px] leading-relaxed">
                   Find and reconnect with people by name, username, profession, or shared interests. Your contact info stays private.
                 </p>
                 
                 <div className="w-full bg-white dark:bg-white/5 rounded-3xl p-5 border border-slate-200 dark:border-white/5 flex flex-col gap-4 text-left">
                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest pl-1">Search tips</p>
                    <div className="flex flex-col gap-3">
                       <Tip icon={AtSign} text="Try their @username" />
                       <Tip icon={Briefcase} text="Search by profession" />
                       <Tip icon={Globe} text="Use a shared interest or tag" />
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Tip({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex flex-row items-center gap-3">
       <div className="text-[#00A3B8] dark:text-[#00C4D8]">
          <Icon size={14} />
       </div>
       <span className="text-[13px] text-slate-600 dark:text-slate-500 dark:text-slate-400 font-medium">{text}</span>
    </div>
  );
}
