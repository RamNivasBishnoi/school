import React, { useState } from 'react';
import { UserAccount, Teacher, Student, UserPasswordMap } from '../types';
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Briefcase,
  FileCheck2,
  LogIn,
  KeyRound,
  School,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  User as UserIcon,
  Hash
} from 'lucide-react';

interface LoginModalProps {
  teachers: Teacher[];
  students: Student[];
  userPasswords?: UserPasswordMap;
  onUpdatePasswords?: (newPasswords: UserPasswordMap) => void;
  onLogin: (user: UserAccount) => void;
  onGoogleLogin?: () => void;
  isLoggingInGoogle?: boolean;
}

export default function LoginModal({
  teachers,
  students,
  userPasswords = {},
  onUpdatePasswords,
  onLogin,
  onGoogleLogin,
  isLoggingInGoogle
}: LoginModalProps) {
  // Role and Inputs
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge'>('Admin');
  const [usernameOrRoll, setUsernameOrRoll] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');

  // Password Recovery Mode
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [recoveryRole, setRecoveryRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge'>('Admin');
  const [recoveryUsername, setRecoveryUsername] = useState('admin');
  const [recoveryPin, setRecoveryPin] = useState('1234');
  const [recoveredPassMessage, setRecoveredPassMessage] = useState<{ title: string; body: string; type: 'success' | 'alert' } | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');

  // Auto update placeholder/defaults when role changes
  const handleRoleChange = (newRole: 'Admin' | 'Teacher' | 'Student' | 'Manager' | 'Exam In-charge') => {
    setRole(newRole);
    setLoginError('');
    if (newRole === 'Admin') {
      setUsernameOrRoll('admin');
      setPassword(userPasswords['admin'] || 'admin');
    } else if (newRole === 'Teacher') {
      setUsernameOrRoll('suresh');
      setPassword(userPasswords['suresh'] || userPasswords['teacher'] || 'teacher123');
    } else if (newRole === 'Student') {
      setUsernameOrRoll('01');
      setPassword(userPasswords['01'] || userPasswords['student'] || 'student123');
    } else if (newRole === 'Manager') {
      setUsernameOrRoll('manager');
      setPassword(userPasswords['manager'] || 'manager123');
    } else if (newRole === 'Exam In-charge') {
      setUsernameOrRoll('exam');
      setPassword(userPasswords['exam'] || 'exam123');
    }
  };

  // Get effective password for key
  const getExpectedPassword = (key: string, r: string): string => {
    const cleanKey = key.trim().toLowerCase();

    // 1. Check custom saved passwords in userPasswords dictionary
    if (userPasswords && userPasswords[cleanKey]) {
      return userPasswords[cleanKey];
    }
    if (userPasswords && userPasswords[r.toLowerCase()]) {
      return userPasswords[r.toLowerCase()];
    }

    // 2. Check localStorage fallback
    try {
      const stored = localStorage.getItem('SCHOOL_ERP_USER_PASSWORDS');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[cleanKey]) return parsed[cleanKey];
        if (parsed[r.toLowerCase()]) return parsed[r.toLowerCase()];
      }
    } catch (e) {
      // ignore
    }

    // 3. System Defaults
    if (r === 'Admin') return 'admin'; // admin default password
    if (r === 'Teacher') return 'teacher123';
    if (r === 'Student') return 'student123';
    if (r === 'Manager') return 'manager123';
    if (r === 'Exam In-charge') return 'exam123';

    return 'admin';
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = usernameOrRoll.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanInput) {
      setLoginError(role === 'Student' ? 'कृपया अपना रोल नंबर दर्ज करें।' : 'कृपया अपना यूजरनेम दर्ज करें।');
      return;
    }
    if (!cleanPass) {
      setLoginError('कृपया पासवर्ड दर्ज करें।');
      return;
    }

    const expectedPass = getExpectedPassword(cleanInput, role);

    // Validate Password match
    if (cleanPass !== expectedPass) {
      setLoginError(`अमान्य पासवर्ड! दर्ज किया गया पासवर्ड सही नहीं है। (${role === 'Admin' ? 'डिफ़ॉल्ट एडमिन पासवर्ड: admin' : 'कृपया सही पासवर्ड दर्ज करें'})`);
      return;
    }

    // Determine User Account details
    let name = cleanInput.toUpperCase();
    let email = `${cleanInput}@school.com`;
    let assocId: string | undefined = undefined;

    if (role === 'Admin') {
      name = 'राजेश शर्मा (प्रधानाचार्य)';
      email = 'admin@school.com';
    } else if (role === 'Teacher') {
      const teach = teachers.find(t => t.name.toLowerCase().includes(cleanInput) || t.id.toLowerCase() === cleanInput) || teachers[0];
      name = teach ? teach.name : 'सुरेश कुमार (शिक्षक)';
      email = teach ? teach.email : 'suresh@school.com';
      assocId = teach?.id || 'T100';
    } else if (role === 'Student') {
      const stud = students.find(s => s.rollNo === cleanInput || s.name.toLowerCase().includes(cleanInput)) || students[0];
      name = stud ? `${stud.name} (कक्षा ${stud.className})` : `छात्र (रोल नं. ${cleanInput})`;
      email = `student.${cleanInput}@school.com`;
      assocId = stud?.id || 'S1001';
    } else if (role === 'Manager') {
      name = 'महेन्द्र सिंह (कोषाध्यक्ष)';
      email = 'manager@school.com';
    } else if (role === 'Exam In-charge') {
      name = 'विकास यादव (परीक्षा प्रभारी)';
      email = 'exam@school.com';
    }

    const user: UserAccount = {
      id: `USR-${Date.now()}`,
      name,
      email,
      role,
      associatedId: assocId,
      isActive: true
    };

    onLogin(user);
  };

  // Password Recovery Action
  const handleRecoverPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveredPassMessage(null);

    const cleanInput = recoveryUsername.trim().toLowerCase();
    if (!cleanInput) {
      setRecoveredPassMessage({
        title: 'अधूरा विवरण',
        body: recoveryRole === 'Student' ? 'कृपया अपना रोल नंबर दर्ज करें।' : 'कृपया यूजरनेम दर्ज करें।',
        type: 'alert'
      });
      return;
    }

    // Verify recovery PIN or allow instant recovery for valid user
    if (recoveryPin.trim() !== '1234' && recoveryPin.trim() !== 'admin' && recoveryPin.trim() !== '0000') {
      setRecoveredPassMessage({
        title: 'गलत रिकवरी पिन (Security Key Invalid)',
        body: 'सुरक्षा पिन अमान्य है। डिफ़ॉल्ट रिकवरी पिन 1234 दर्ज करें।',
        type: 'alert'
      });
      return;
    }

    const activePass = getExpectedPassword(cleanInput, recoveryRole);

    if (newResetPassword.trim()) {
      // Reset password to new value!
      const updatedMap = { ...userPasswords, [cleanInput]: newResetPassword.trim() };
      if (onUpdatePasswords) {
        onUpdatePasswords(updatedMap);
      }
      try {
        localStorage.setItem('SCHOOL_ERP_USER_PASSWORDS', JSON.stringify(updatedMap));
      } catch (e) {
        // ignore
      }

      setRecoveredPassMessage({
        title: 'पासवर्ड सफलतापूर्वक रीसेट हुआ (Done) ✔',
        body: `यूजर '${cleanInput}' हेतु नया पासवर्ड '${newResetPassword.trim()}' सहेज दिया गया है!`,
        type: 'success'
      });

      // Set input on main login
      setRole(recoveryRole);
      setUsernameOrRoll(cleanInput);
      setPassword(newResetPassword.trim());
      setTimeout(() => {
        setIsForgotMode(false);
      }, 1800);
    } else {
      // Show active password
      setRecoveredPassMessage({
        title: 'पासवर्ड रिकवर हो गया (Done) ✔',
        body: `यूजर '${cleanInput}' (${recoveryRole}) का वर्तमान सक्रीय पासवर्ड है: '${activePass}'`,
        type: 'success'
      });

      setRole(recoveryRole);
      setUsernameOrRoll(cleanInput);
      setPassword(activePass);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-zinc-950/90 backdrop-blur-md overflow-hidden select-none">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        
        {/* Fixed Non-scroll Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-6 text-white text-center relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="w-12 h-12 mx-auto mb-2 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-md">
            <School className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black font-display tracking-tight">स्कूल ERP मोबाइल लॉगिन Portal</h1>
          <p className="text-[11px] text-indigo-100 mt-0.5 font-medium">
            डिजिटल स्कूल प्रबंधन व सुरक्षित क्लाउड सिस्टम
          </p>
        </div>

        {/* Content Container */}
        <div className="p-5 space-y-4 overflow-y-auto">
          
          {!isForgotMode ? (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-2xl text-xs font-bold flex items-center gap-2 border border-red-200 dark:border-red-900/40">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-black text-zinc-700 dark:text-zinc-300 mb-1.5">
                  भूमिका (Role) चुनें *
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'Admin', label: '👑 Admin' },
                    { id: 'Teacher', label: '👩‍🏫 Teacher' },
                    { id: 'Student', label: '🎓 Student' },
                    { id: 'Manager', label: '💼 Manager' },
                    { id: 'Exam In-charge', label: '📝 Exam' }
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => handleRoleChange(r.id as any)}
                      className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                        role === r.id
                          ? 'bg-indigo-600 text-white border-indigo-600 font-black shadow-md'
                          : 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100'
                      }`}
                    >
                      <span className="block text-[11px] truncate">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Input 1: Username OR Roll Number */}
              <div>
                <label className="block text-xs font-black text-zinc-700 dark:text-zinc-300 mb-1">
                  {role === 'Student' ? 'रोल नंबर (Roll Number) *' : 'यूजरनेम (Username) *'}
                </label>
                <div className="relative">
                  {role === 'Student' ? (
                    <Hash className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  ) : (
                    <UserIcon className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  )}
                  <input
                    type="text"
                    required
                    placeholder={
                      role === 'Student'
                        ? 'उदा. 01 या 1001'
                        : role === 'Admin'
                        ? 'उदा. admin'
                        : role === 'Teacher'
                        ? 'उदा. suresh या teacher'
                        : 'उदा. manager, exam'
                    }
                    value={usernameOrRoll}
                    onChange={(e) => setUsernameOrRoll(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Input 2: Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-black text-zinc-700 dark:text-zinc-300">
                    पासवर्ड (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotMode(true)}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-black hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <HelpCircle className="w-3 h-3" /> फॉरगेट पासवर्ड?
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="password"
                    required
                    placeholder="पासवर्ड दर्ज करें"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 text-zinc-900 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  💡 डिफ़ॉल्ट पासवर्ड: एडमिन → <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 font-bold">admin</code> | शिक्षक → <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 font-bold">teacher123</code> | छात्र → <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-indigo-600 font-bold">student123</code>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" /> लॉगिन करें (Sign In)
              </button>
            </form>
          ) : (
            /* Forgot Password / Recovery Mode */
            <form onSubmit={handleRecoverPassword} className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white">पासवर्ड रिकवरी (Password Recovery)</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-xs text-zinc-500 hover:text-zinc-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> वापिस लॉगिन पर जाएं
                </button>
              </div>

              {recoveredPassMessage && (
                <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2 border ${
                  recoveredPassMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200'
                    : 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 border-red-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black">{recoveredPassMessage.title}</span>
                    <p className="font-normal text-[11px] mt-0.5">{recoveredPassMessage.body}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  भूमिका (Role)
                </label>
                <select
                  value={recoveryRole}
                  onChange={(e) => setRecoveryRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                >
                  <option value="Admin">👑 Admin (प्रधानाचार्य)</option>
                  <option value="Teacher">👩‍🏫 Teacher (शिक्षक)</option>
                  <option value="Student">🎓 Student (छात्र)</option>
                  <option value="Manager">💼 Manager (कोषाध्यक्ष)</option>
                  <option value="Exam In-charge">📝 Exam In-charge (परीक्षा प्रभारी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  {recoveryRole === 'Student' ? 'रोल नंबर दर्ज करें' : 'यूजरनेम दर्ज करें'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={recoveryRole === 'Student' ? 'उदा. 01, 1001' : 'उदा. admin, suresh'}
                  value={recoveryUsername}
                  onChange={(e) => setRecoveryUsername(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  सुरक्षा कोड / मास्टर पिन (Default: 1234)
                </label>
                <input
                  type="password"
                  placeholder="1234"
                  value={recoveryPin}
                  onChange={(e) => setRecoveryPin(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  नया पासवर्ड सेट करें (ऐच्छिक - New Password)
                </label>
                <input
                  type="text"
                  placeholder="नया पासवर्ड दर्ज करें (खाली छोड़ें यदि केवल देखना है)"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <RotateCcw className="w-4 h-4" /> पासवर्ड रिकवर / रीसेट करें
              </button>
            </form>
          )}

          {/* Google Auth Option */}
          {onGoogleLogin && !isForgotMode && (
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
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
                {isLoggingInGoogle ? 'गूगल से लॉगिन हो रहा...' : 'गूगल खाते से त्वरित लॉगिन (Google Sign In)'}
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
