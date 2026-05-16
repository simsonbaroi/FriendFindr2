import React from "react";
import { ChevronRight, Briefcase } from "lucide-react";
import { useColors } from "../hooks/useColors";
import { Avatar } from "./Avatar";
import { UserProfile } from "../context/AuthContext";

interface UserCardProps {
  user: UserProfile;
  onPress: () => void;
  rightElement?: React.ReactNode;
}

export const UserCard = React.memo(function UserCard({ user, onPress, rightElement }: UserCardProps) {
  return (
    <button
      className="flex flex-row items-center p-4 rounded-[24px] border border-slate-200 dark:border-white/5 transition-all text-left w-full gap-4 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 active:scale-[0.98]"
      onClick={onPress}
    >
      <Avatar uri={user.photoURL} name={user.displayName} size={54} />
      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
        <span className="text-[15px] font-bold text-slate-900 dark:text-white truncate">
          {user.displayName}
        </span>
        <span className="text-[12px] text-slate-600 dark:text-slate-400 font-medium truncate">
          @{user.username}
        </span>
        {!!user.profession && (
          <div 
            className="flex flex-row items-center self-start px-2 py-0.5 rounded-lg mt-1 gap-1.5 bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10"
          >
            <Briefcase size={10} className="text-[#00A3B8] dark:text-[#00C4D8]" />
            <span className="text-[10px] font-bold truncate text-[#00A3B8] dark:text-[#00C4D8] uppercase tracking-wider">
              {user.profession}
            </span>
          </div>
        )}
      </div>
      {rightElement ?? <ChevronRight size={16} className="text-slate-600" />}
    </button>
  );
});
