import React, { useState } from "react";
import { ArrowLeft, Save, Briefcase, FileText, Globe, Hash, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/userService";
import { InputField } from "../components/InputField";
import { useLocation } from "wouter";

export function EditProfilePage() {
  const { profile, user } = useAuth();
  const [, setLocation] = useLocation();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [profession, setProfession] = useState(profile?.profession || "");
  const [country, setCountry] = useState(profile?.country || "");
  const [tags, setTags] = useState(profile?.tags?.join(", ") || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tagsArray = tags.split(",").map(t => t.trim()).filter(t => t.length > 0);
      await updateUserProfile(user.uid, { 
        displayName, 
        bio, 
        profession, 
        country, 
        tags: tagsArray 
      });
      setLocation("/settings");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <header className="px-6 pt-10 pb-6 flex flex-row items-center gap-4">
        <button onClick={() => setLocation("/settings")} className="p-2 -ml-2 text-slate-900 dark:text-white/40 active:text-slate-900 dark:text-white transition-colors">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight">Edit Profile</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-24 flex flex-col gap-6">
        <div className="flex flex-col gap-5">
           <InputField 
              label="Display Name" 
              value={displayName} 
              onChangeText={setDisplayName} 
              placeholder="Your full name" 
              icon={<User size={18} />}
           />
           <InputField 
              label="Bio" 
              value={bio} 
              onChangeText={setBio} 
              placeholder="Tell people about yourself" 
              multiline
              icon={<FileText size={18} />}
           />
           <InputField 
              label="Country" 
              value={country} 
              onChangeText={setCountry} 
              placeholder="e.g. United States" 
              icon={<Globe size={18} />}
           />
           <InputField 
              label="Profession" 
              value={profession} 
              onChangeText={setProfession} 
              placeholder="e.g. Software Engineer" 
              icon={<Briefcase size={18} />}
           />
           <InputField 
              label="Interests / Tags (comma-separated)" 
              value={tags} 
              onChangeText={setTags} 
              placeholder="e.g. design, travel, music" 
              icon={<Hash size={18} />}
           />
        </div>

        <button 
          onClick={handleSave} 
          disabled={loading}
          className="w-full h-14 bg-[#00A3B8] dark:bg-[#00C4D8] rounded-2xl flex items-center justify-center gap-3 text-white dark:text-[#0A1628] font-bold shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white dark:border-[#0A1628] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
          ) : (
             <span>Save Changes</span>
          )}
        </button>
      </div>
    </div>
  );
}
