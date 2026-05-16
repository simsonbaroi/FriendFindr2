import React from "react";
import { useColors } from "../hooks/useColors";

interface InputFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  multiline?: boolean;
  icon?: React.ReactNode;
}

export function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  error,
  type = "text",
  multiline,
  icon,
}: InputFieldProps & { type?: string }) {
  const colors = useColors();

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-70">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 min-h-[100px] text-[15px] text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00A3B8]/30 dark:border-[#00C4D8]/30 ${
              error ? "border-red-500" : ""
            } ${icon ? "pl-11" : ""}`}
          />
        ) : (
          <input
            type={secureTextEntry ? "password" : type}
            value={value}
            onChange={(e) => onChangeText(e.target.value)}
            placeholder={placeholder}
            className={`w-full h-12 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 text-[15px] text-slate-900 dark:text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#00A3B8]/30 dark:border-[#00C4D8]/30 ${
              error ? "border-red-400" : ""
            } ${icon ? "pl-11" : ""}`}
          />
        )}
      </div>
      {error && (
        <span className="text-[11px] text-red-400 font-bold uppercase tracking-wider pl-1 mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
