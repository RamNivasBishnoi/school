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
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'demo' | 'custom'>('demo');

  // Custom login state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge'>('Teacher');
  const [selectedId, setSelectedId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Demo user quick login action
  const handleQuickDemoLogin = (
    demoRole: 'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge',
    demoName: string,
    demoEmail: string,
    assocId?: string
  ) => {
    const user: UserAccount = {
      id: `USR-${Date.now()}`,
      name: demoName,
      email: demoEmail,
      role: demoRole,
      associatedId: assocId,
      isActive: true
    };
    onLogin(user);
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white text-center relative">
          <div className="w-12 h-12 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black font-display tracking-tight">स्कूल ERP लॉगिन पोर्टल</h2>
          <p className="text-xs text-indigo-100 mt-1">
            अपने अधिकृत रोल (Role) या डेमो अकाउंट से लॉग इन करें
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 p-1.5 gap-1">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> ⚡ 1-क्लिक डेमो लॉगिन (Demo Login)
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" /> 👤 कस्टम अकाउंट (Custom Login)
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500 font-medium">
                लाइव टेस्टिंग हेतु नीचे दिए गए किसी भी डेमो रोल पर क्लिक करके तुरंत लॉग इन करें:
              </p>

              {/* Demo Buttons List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Admin */}
                <button
                  onClick={() => handleQuickDemoLogin('Admin', 'राजेश शर्मा (प्रधानाचार्य)', 'admin@school.com')}
                  className="p-3 bg-zinc-50 hover:bg-indigo-50 dark:bg-zinc-800/50 dark:hover:bg-indigo-950/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left transition-all hover:border-indigo-300 group cursor-pointer flex items-center gap-3"
                >
                  <div className="p-2.5 bg-indigo-500 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-zinc-900 dark:text-white">👑 Admin (प्रधानाचार्य)</span>
                    <span className="text-[10px] text-zinc-400 block">admin@school.com</span>
                  </div>
                </button>

                {/* Teacher */}
                <button
                  onClick={() => handleQuickDemoLogin('Teacher', teachers[0]?.name || 'सुरेश कुमार', 'suresh@school.com', teachers[0]?.id || 'T100')}
                  className="p-3 bg-zinc-50 hover:bg-emerald-50 dark:bg-zinc-800/50 dark:hover:bg-emerald-950/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left transition-all hover:border-emerald-300 group cursor-pointer flex items-center gap-3"
                >
                  <div className="p-2.5 bg-emerald-500 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-zinc-900 dark:text-white">👩‍🏫 Teacher (शिक्षक)</span>
                    <span className="text-[10px] text-zinc-400 block">{teachers[0]?.name || 'सुरेश कुमार'} (10A)</span>
                  </div>
                </button>

                {/* Student */}
                <button
                  onClick={() => handleQuickDemoLogin('Student', students[0]?.name || 'आरव शर्मा', 'aarav@school.com', students[0]?.id || 'S1001')}
                  className="p-3 bg-zinc-50 hover:bg-blue-50 dark:bg-zinc-800/50 dark:hover:bg-blue-950/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left transition-all hover:border-blue-300 group cursor-pointer flex items-center gap-3"
                >
                  <div className="p-2.5 bg-blue-500 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-zinc-900 dark:text-white">🎓 Student (छात्र)</span>
                    <span className="text-[10px] text-zinc-400 block">{students[0]?.name || 'आरव शर्मा'} (10A)</span>
                  </div>
                </button>

                {/* Manager */}
                <button
                  onClick={() => handleQuickDemoLogin('Manager', 'महेन्द्र सिंह (कोषाध्यक्ष)', 'manager@school.com')}
                  className="p-3 bg-zinc-50 hover:bg-amber-50 dark:bg-zinc-800/50 dark:hover:bg-amber-950/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left transition-all hover:border-amber-300 group cursor-pointer flex items-center gap-3"
                >
                  <div className="p-2.5 bg-amber-500 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-zinc-900 dark:text-white">💼 Manager (मैनेजर)</span>
                    <span className="text-[10px] text-zinc-400 block">manager@school.com</span>
                  </div>
                </button>

                {/* Exam In-charge */}
                <button
                  onClick={() => handleQuickDemoLogin('Exam In-charge', 'विकास यादव (परीक्षा प्रभारी)', 'exam@school.com')}
                  className="p-3 bg-zinc-50 hover:bg-purple-50 dark:bg-zinc-800/50 dark:hover:bg-purple-950/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-left transition-all hover:border-purple-300 group cursor-pointer flex items-center gap-3 sm:col-span-2"
                >
                  <div className="p-2.5 bg-purple-500 text-white rounded-xl group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-black text-zinc-900 dark:text-white">📝 Exam Controller (परीक्षा प्रभारी)</span>
                    <span className="text-[10px] text-zinc-400 block">exam@school.com</span>
                  </div>
                </button>

              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-xl text-xs font-bold">
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  आपका नाम (Full Name) *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="उदा. अमित शर्मा"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  ईमेल आईडी (Email ID) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    placeholder="amit@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  रोल चुनें (Select Role) *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Admin">👑 Admin (प्रधानाचार्य)</option>
                  <option value="Teacher">👩‍🏫 Teacher (शिक्षक)</option>
                  <option value="Student">🎓 Student (छात्र)</option>
                  <option value="Manager">💼 Manager (प्रबंधक/कोषाध्यक्ष)</option>
                  <option value="Exam In-charge">📝 Exam In-charge (परीक्षा प्रभारी)</option>
                </select>
              </div>

              {role === 'Teacher' && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    संबद्ध शिक्षक प्रोफाइल (Assigned Teacher Account)
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
                    संबद्ध छात्र प्रोफाइल (Assigned Student Profile)
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
                  पासवर्ड (Password) - वैकल्पिक
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
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <LogIn className="w-4 h-4" /> लॉग इन करें (Login)
              </button>
            </form>
          )}

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
                {isLoggingInGoogle ? 'गूगल से लॉगिन हो रहा...' : 'गूगल खाते से लॉगिन करें (Sign in with Google)'}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
