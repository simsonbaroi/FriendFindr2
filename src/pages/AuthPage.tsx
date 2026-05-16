import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useColors } from "../hooks/useColors";
import { InputField } from "../components/InputField";
import { PrimaryButton } from "../components/PrimaryButton";
import { Shield, Mail, Lock, User, Tag } from "lucide-react";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const colors = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, displayName, username);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setError = (msg: string) => {
    setErrors({ general: msg });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A1628] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#0A1628] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-2xl">
        <div className="bg-slate-900 dark:bg-[#0A1628] px-6 py-12 text-center relative overflow-hidden">
          {/* Blobs for Atmosphere */}
          <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#00C4D8', filter: 'blur(60px)', opacity: 0.15 }} />
          <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#0096B4', filter: 'blur(60px)', opacity: 0.1 }} />

          <div style={{ width: '64px', height: '64px', borderRadius: '18px', backgroundColor: '#00C4D8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 16px rgba(0, 196, 216, 0.3)' }}>
            <span style={{ fontSize: 32, fontWeight: 'bold', color: '#FFFFFF' }}>F</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 'bold', color: 'white', letterSpacing: '-0.5px' }}>FriendFindr</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: '6px', fontWeight: '500' }}>Find people. Protect your privacy.</p>
        </div>

        <div className="px-8 pt-8 pb-10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">{isLogin ? "Welcome back" : "Create account"}</h2>
          <p className="text-[13px] text-slate-600 dark:text-slate-400 mb-8">{isLogin ? "Sign in to your account" : "Join FriendFindr today"}</p>

          <div className="space-y-5">
            {!isLogin && (
              <>
                <InputField 
                    label="Display Name" 
                    placeholder="Your full name" 
                    value={displayName} 
                    onChangeText={setDisplayName} 
                    icon={<User size={16} className="text-slate-600 dark:text-slate-500" />}
                />
                <InputField 
                    label="Username" 
                    placeholder="e.g. john_doe" 
                    value={username} 
                    onChangeText={(t) => setUsername(t.toLowerCase())} 
                    icon={<Tag size={16} className="text-slate-600 dark:text-slate-500" />}
                />
              </>
            )}
            <InputField 
                label="Email" 
                placeholder="you@example.com" 
                value={email} 
                onChangeText={setEmail} 
                icon={<Mail size={16} className="text-slate-600 dark:text-slate-500" />}
                type="email"
            />
            <InputField 
                label="Password" 
                placeholder="Your password" 
                value={password} 
                onChangeText={setPassword} 
                icon={<Lock size={16} className="text-slate-600 dark:text-slate-500" />}
                secureTextEntry
            />
          </div>

          {errors.general && (
            <p className="text-red-400 text-[11px] mt-4 font-bold uppercase tracking-wider">{errors.general}</p>
          )}

          <PrimaryButton 
            label={isLogin ? "Sign In" : "Create Account"} 
            onPress={handleSubmit} 
            loading={loading} 
            className="w-full mt-10 h-14 bg-[#00A3B8] dark:bg-[#00C4D8] text-white dark:text-[#0A1628] font-bold rounded-2xl shadow-lg shadow-[#00A3B8]/20 dark:shadow-[#00C4D8]/20"
          />

          <div className="flex items-center justify-center gap-2 mt-8 text-slate-600 dark:text-slate-500">
            <Shield size={12} />
            <span className="text-[11px] font-bold uppercase tracking-wider">Secure connection</span>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col items-center gap-3">
            <span className="text-[13px] text-slate-600 dark:text-slate-500">{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-[14px] font-bold text-[#00A3B8] dark:text-[#00C4D8] hover:opacity-80 transition-opacity"
            >
                {isLogin ? "Create one" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
