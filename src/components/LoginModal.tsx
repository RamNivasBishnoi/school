import React, { useState } from 'react';
import { UserAccount, Teacher, Student } from '../types';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Briefcase,
  FileCheck2,
  Lock,
  Mail,
  User as UserIcon,
  LogIn,
  KeyRound,
  School,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface LoginModalProps {
  teachers: Teacher[];
  students: Student[];
  onLogin: (user: UserAccount) => void;
  onGoogleLogin?: () => void;
  isLoggingInGoogle?: boolean;
}

export default function LoginModal({
  teachers,
  students,
  onLogin,
  onGoogleLogin,
  isLoggingInGoogle
}: LoginModalProps) {
  // Custom login state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge'>('Admin');
  const [selectedId, setSelectedId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setLoginError('कृपया अपना नाम और ईमेल आईडी दर्ज करें।');
      return;
    }

    const user: UserAccount = {
      id: `USR-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      associatedId: selectedId || (role === 'Teacher' ? teachers[0]?.id : role === 'Student' ? students[0]?.id : undefined),
      isActive: true
    };
    onLogin(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        
        {/* Mobile App Screen Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-16 h-16 mx-auto mb-3 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg">
            <School className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight">स्कूल ERP मोबाइल ऐप</h1>
          <p className="text-xs text-indigo-100 mt-1 font-medium">
            डिजिटल स्कूल प्रबंधन व लाइव क्लाउड पोर्टल
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[11px] font-bold text-emerald-200 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>फायरबेस रियल-टाइम क्लाउड एक्टिव</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 space-y-5">
          
          <form onSubmit={handleCustomSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                अपनी भूमिका (Role) चुनें *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Admin', label: '👑 Admin', desc: 'प्रधानाचार्य' },
                  { id: 'Teacher', label: '👩‍🏫 Teacher', desc: 'शिक्षक' },
                  { id: 'Student', label: '🎓 Student', desc: 'छात्र' },
                  { id: 'Manager', label: '💼 Manager', desc: 'कोषाध्यक्ष' },
                  { id: 'Exam In-charge', label: '📝 Exam', desc: 'परीक्षा प्रभारी' }
                ].map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      role === r.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100'
                    }`}
                  >
                    <span className="block text-xs font-black">{r.label}</span>
                    <span className="text-[10px] opacity-75">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Details */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                उपयोगकर्ता नाम (Full Name) *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  required
                  placeholder="अपना पूरा नाम दर्ज करें"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                ईमेल आईडी (Email Address) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="user@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {role === 'Teacher' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  शिक्षक प्रोफाइल लिंक (Teacher Profile)
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.subject} - Class {t.classNameAssigned})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {role === 'Student' && (
              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  छात्र प्रोफाइल लिंक (Student Profile)
                </label>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {students.slice(0, 20).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Roll {s.rollNo} - Class {s.className})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                पासवर्ड (Password)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
            >
              <LogIn className="w-4 h-4" /> ऐप में प्रवेश करें (Sign In)
            </button>
          </form>

          {/* Google Auth option */}
          {onGoogleLogin && (
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <button
                type="button"
                onClick={onGoogleLogin}
                disabled={isLoggingInGoogle}
                className="w-full py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                {isLoggingInGoogle ? 'गूगल से लॉगिन हो रहा...' : 'गूगल खाते से लॉगिन करें (Google Sign In)'}
              </button>
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-[11px] text-zinc-400 font-medium">
              💡 एडमिन अकाउंट से लॉगिन करके आप 1-क्लिक डेमो एक्सप्लोरर का उपयोग कर सकते हैं।
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
