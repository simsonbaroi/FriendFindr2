import React from "react";

export function LoadingScreen() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-[#0A1628] relative">
      <div className="w-16 h-16 rounded-2xl bg-[#00A3B8] dark:bg-[#00C4D8] flex items-center justify-center shadow-lg shadow-[#00A3B8]/30 dark:shadow-[#00C4D8]/30">
        <span className="text-[32px] font-bold text-white dark:text-[#0A1628]">F</span>
      </div>
      <span className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight mt-1">FriendFindr</span>
      
      <div className="absolute bottom-20">
         <div className="w-6 h-6 border-2 border-slate-200 dark:border-[#00C4D8]/30 border-t-[#00A3B8] dark:border-t-[#00C4D8] rounded-full animate-spin" />
      </div>
    </div>
  );
}
