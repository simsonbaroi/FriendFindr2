import React, { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "wouter";
import { InputField } from "../components/InputField";
import { updateEmail } from "firebase/auth";

export function EmailSettingsPage() {
  const { user, profile } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (!user) return;
    if (!email.trim() || email === user.email) return;

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await updateEmail(user, email.trim());
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setError("This operation is sensitive and requires recent authentication. Please log in again before retrying this request.");
      } else {
        setError(err.message || "Failed to update email.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#0A1628]">
      <header className="flex flex-row items-center justify-center p-6 relative">
        <button 
          onClick={() => setLocation("/settings")} 
          className="absolute left-6 w-10 h-10 bg-white dark:bg-white/5 backdrop-blur-md rounded-xl flex items-center justify-center text-slate-900 dark:text-white active:scale-90 border border-slate-200 dark:border-white/5 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Email Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex flex-col items-center justify-center mb-8 mt-4">
          <div className="w-20 h-20 rounded-full bg-[#00A3B8]/10 dark:bg-[#00C4D8]/10 flex items-center justify-center mb-4">
            <Mail size={32} className="text-[#00A3B8] dark:text-[#00C4D8]" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-center px-4 leading-relaxed">
            Update the email address associated with your FriendFindr account.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <InputField 
            icon={<Mail size={20} />}
            placeholder="Email Address" 
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {error ? <p className="text-red-500 text-sm px-2 text-center">{error}</p> : null}
          {success ? <p className="text-[#34D399] text-sm px-2 text-center">Email successfully updated!</p> : null}

          <button 
            disabled={loading || email === user?.email || !email.trim()}
            onClick={handleUpdate}
            className="w-full h-14 bg-[#00A3B8] dark:bg-[#00C4D8] rounded-2xl flex items-center justify-center gap-3 text-white dark:text-[#0A1628] font-bold shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20 active:scale-95 transition-all disabled:opacity-50 mt-4"
          >
            {loading ? (
               <div className="w-5 h-5 border-2 border-white dark:border-[#0A1628] border-t-transparent dark:border-t-transparent rounded-full animate-spin" />
            ) : (
               <span>Update Email</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
