import React from "react";
import { LogOut, User, Shield, Info, Edit2, ChevronRight, Mail, Home, ArrowLeft, Sun, Moon, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "../components/Avatar";
import { useLocation } from "wouter";

export function SettingsPage() {
  const { profile, logout, theme, toggleTheme } = useAuth();
  const [, setLocation] = useLocation();

  if (!profile) {
    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628] p-6 items-center justify-center">
         <p className="text-slate-900 dark:text-white text-center mb-6">Profile not found. You might need to sign in again to recreate your profile data.</p>
         <button onClick={logout} className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl font-bold">Sign Out</button>
      </div>
    );
  }

  const MenuSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="flex flex-col gap-2.5 mb-8">
      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-[0.15em] pl-1">{title}</p>
      <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[28px] overflow-hidden">
        {children}
      </div>
    </div>
  );

  const MenuButton = ({ icon: Icon, label, onClick, value, isLast = false, destructive = false }: any) => (
    <button 
      onClick={onClick}
      className={`flex flex-row items-center gap-4 px-5 py-4 ${!isLast ? 'border-b border-slate-200 dark:border-white/5' : ''} active:bg-slate-100 dark:active:bg-white/10 transition-colors w-full text-left`}
    >
      <div className={`w-10 h-10 rounded-xl ${destructive ? 'bg-red-500/10 text-red-400' : 'bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 text-[#00A3B8] dark:text-[#00C4D8]'} flex items-center justify-center shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-bold ${destructive ? 'text-red-400' : 'text-slate-900 dark:text-white'}`}>{label}</p>
      </div>
      {value ? (
        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider mr-2">{value}</span>
      ) : null}
      <ChevronRight size={14} className="text-slate-600" />
    </button>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <header className="px-6 pt-10 pb-6 flex flex-row items-center gap-4">
        <button onClick={() => setLocation("/")} className="p-2 -ml-2 text-slate-900 dark:text-white/40 active:text-slate-900 dark:text-white transition-colors">
           <ArrowLeft size={20} />
        </button>
        <h1 className="text-[18px] font-bold text-slate-900 dark:text-white tracking-tight text-center flex-1 pr-10">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 pb-12 pt-2">
        {/* Profile Card */}
        <button 
          onClick={() => setLocation("/edit-profile")}
          className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[32px] p-5 flex flex-row items-center gap-4 mb-8 active:scale-[0.98] transition-all"
        >
          <div className="relative">
             <Avatar uri={profile.photoURL} name={profile.displayName} size={56} />
             <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00A3B8] dark:bg-[#00C4D8] flex items-center justify-center border-4 border-slate-50 dark:border-[#0A1628]">
                <Edit2 size={10} className="text-white dark:text-[#0A1628]" />
             </div>
          </div>
          <div className="flex-1 text-left min-w-0">
            <h2 className="text-[16px] font-bold text-slate-900 dark:text-white truncate">{profile.displayName}</h2>
            <p className="text-[13px] text-slate-600 dark:text-slate-400 font-medium truncate">@{profile.username}</p>
          </div>
          <ChevronRight size={16} className="text-slate-600" />
        </button>

        <MenuSection title="Account">
          <MenuButton icon={User} label="Edit Profile" onClick={() => setLocation("/edit-profile")} />
          <MenuButton icon={Shield} label="Privacy Settings" onClick={() => setLocation("/privacy-settings")} />
          <MenuButton icon={Phone} label="Phone" onClick={() => setLocation("/phone-settings")} />
          <MenuButton icon={Mail} label="Email" onClick={() => setLocation("/email-settings")} isLast />
        </MenuSection>

        <MenuSection title="Appearance">
          <MenuButton 
            icon={theme === 'dark' ? Moon : Sun} 
            label="Dark Mode" 
            value={theme === 'dark' ? 'On' : 'Off'}
            onClick={toggleTheme} 
            isLast 
          />
        </MenuSection>

        <MenuSection title="About">
          <MenuButton icon={Info} label="FriendFindr" value="MVP v1.0" onClick={() => {}} />
          <MenuButton icon={Shield} label="Privacy Policy" onClick={() => {}} isLast />
        </MenuSection>

        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-[28px] overflow-hidden mb-8">
           <MenuButton icon={LogOut} label="Sign Out" onClick={logout} destructive isLast />
        </div>

        <div className="flex flex-col items-center justify-center gap-2 py-4">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/5 flex items-center justify-center">
               <span className="text-[14px] font-bold text-[#00A3B8] dark:text-[#00C4D8]">F</span>
            </div>
            <p className="text-[11px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-[0.2em]">Build with love</p>
        </div>
      </div>
    </div>
  );
}

