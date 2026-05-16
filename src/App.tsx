import React from "react";
import { Route, Switch, useLocation } from "wouter";
import { Search, Inbox, MessageCircle, User } from "lucide-react";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { LoadingScreen } from "./components/LoadingScreen";
import { AuthPage } from "./pages/AuthPage";
import { SearchPage } from "./pages/SearchPage";
import { RequestsPage } from "./pages/RequestsPage";
import { ChatsPage } from "./pages/ChatsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { EditProfilePage } from "./pages/EditProfilePage";
import { PrivacySettingsPage } from "./pages/PrivacySettingsPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { ChatRoomPage } from "./pages/ChatRoomPage";
import { EmailSettingsPage } from "./pages/EmailSettingsPage";
import { PhoneSettingsPage } from "./pages/PhoneSettingsPage";

function AppContent() {
  const { user, loading, profileReady } = useAuth();
  const [location, setLocation] = useLocation();

  if (loading || !profileReady) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 dark:bg-[#0A1628] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
      <main className="flex-1 overflow-hidden relative">
        <Switch>
          <Route path="/" component={SearchPage} />
          <Route path="/requests" component={RequestsPage} />
          <Route path="/chats" component={ChatsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route path="/edit-profile" component={EditProfilePage} />
          <Route path="/privacy-settings" component={PrivacySettingsPage} />
          <Route path="/email-settings" component={EmailSettingsPage} />
          <Route path="/phone-settings" component={PhoneSettingsPage} />
          <Route path="/profile/:uid" component={UserProfilePage} />
          <Route path="/chat/:chatId" component={ChatRoomPage} />
          <Route>
             <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-900 dark:text-white">
                <p className="text-slate-600 dark:text-slate-400">Page not found</p>
                <button onClick={() => setLocation("/")} className="text-[#00A3B8] dark:text-[#00C4D8] font-bold">Go Home</button>
             </div>
          </Route>
        </Switch>
      </main>

      {/* Tab Bar - Only show on main tabs */}
      {["/", "/requests", "/chats", "/settings"].includes(location) && (
        <nav className="h-20 bg-slate-50 dark:bg-[#0A1628]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/5 flex items-center justify-around px-2 sticky bottom-0 z-50">
          <TabLink icon={Search} label="Search" active={location === "/"} onClick={() => setLocation("/")} />
          <TabLink icon={Inbox} label="Requests" active={location === "/requests"} onClick={() => setLocation("/requests")} />
          <TabLink icon={MessageCircle} label="Messages" active={location === "/chats"} onClick={() => setLocation("/chats")} />
          <TabLink icon={User} label="Profile" active={location === "/settings"} onClick={() => setLocation("/settings")} />
        </nav>
      )}
    </div>
  );
}

function TabLink({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center gap-1 transition-all flex-1 py-1 ${active ? 'text-[#00A3B8] dark:text-[#00C4D8]' : 'text-slate-600 dark:text-slate-500'}`}
    >
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10' : ''}`}>
        <Icon size={20} strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-widest ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
