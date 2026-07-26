import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';

import {
  Student,
  Teacher,
  AppState,
  Homework,
  AccountTransaction,
  LeaveRequest,
  AppNotification,
  UserPreferences,
  SyncLog,
  UserAccount
} from './types';

import { generateDemoData } from './demoData';
import { saveSecureState, loadSecureState } from './utils/crypto';
import { syncStateToSheets, uploadFileToDrive } from './utils/sync';
import { subscribeToFirestoreState, saveStateToFirestore } from './utils/firestoreSync';

// Subcomponents
import Analytics from './components/Analytics';
import AdminPanel from './components/AdminPanel';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import ManagerPanel from './components/ManagerPanel';
import ExamPanel from './components/ExamPanel';
import LoginModal from './components/LoginModal';
import PdfExportModal from './components/PdfExportModal';
import NotificationToast, { ToastMessage } from './components/NotificationToast';

// Icons
import {
  School,
  LayoutDashboard,
  ShieldAlert,
  GraduationCap,
  Users,
  Bus,
  FileText,
  CalendarDays,
  Settings,
  Bell,
  Sun,
  Moon,
  RefreshCw,
  CloudLightning,
  CheckCircle,
  HelpCircle,
  LogOut,
  ChevronDown,
  LogIn,
  Globe,
  Radio,
  Download,
  Sparkles
} from 'lucide-react';

// Initialize Firebase client
import firebaseConfig from '../firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

export default function App() {
  // 1. Core ERP App State
  const [state, setState] = useState<AppState | null>(null);

  // 2. Logged-in User Session State
  const [loggedInUser, setLoggedInUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('LOGGED_IN_USER');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // 3. Authentication & Google Sync State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(true);

  // 4. Navigation & Views State
  const [currentModule, setCurrentModule] = useState<'dashboard' | 'core-erp'>('dashboard');

  // 5. Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    { id: 'N1', title: 'ERP क्लाउड लाइव सक्रिय 🟢', body: 'फायरबेस और लोकल एन्क्रिप्शन द्वारा रियल-टाइम डेटा सिंक चालू है।', type: 'success', time: 'अभी-अभी', read: false },
    { id: 'N2', title: 'गूगल क्लाउड सिंक समर्थित', body: 'अपने Google खाते से लॉग इन कर रियल-टाइम शीट सिंक सक्रिय करें।', type: 'info', time: '5 मिनट पहले', read: false },
  ]);
  const [activeToasts, setActiveToasts] = useState<ToastMessage[]>([]);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // 6. Personalization preferences
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    primaryColor: 'indigo',
    language: 'hi'
  });
  const [showPreferencesPanel, setShowPreferencesPanel] = useState(false);

  // Dropdowns
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  // 7. Offline tracking listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification('इंटरनेट उपलब्ध 🌐', 'आपका सिस्टम ऑनलाइन मोड में आ चुका है। आप गूगल सिंक का उपयोग कर सकते हैं।', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      addNotification('ऑफ़लाइन मोड सक्रिय 🔌', 'आपका इंटरनेट संपर्क टूट गया है। डेटा स्थानीय स्तर पर सुरक्षित और एन्क्रिप्टेड सहेजा जा रहा है।', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 8. Load Initial ERP State & Subscribe to Firestore Live Sync
  useEffect(() => {
    const cachedState = loadSecureState<AppState>('SCHOOL_ERP_APP_STATE');
    if (cachedState) {
      setState(cachedState);
    } else {
      const freshDemo = generateDemoData();
      setState(freshDemo);
      saveSecureState('SCHOOL_ERP_APP_STATE', freshDemo);
    }

    // Subscribe to Firestore for real-time changes across devices
    const unsubscribeFirestore = subscribeToFirestoreState(
      (remoteState) => {
        if (remoteState) {
          setState(remoteState);
          saveSecureState('SCHOOL_ERP_APP_STATE', remoteState);
          setIsFirestoreConnected(true);
        }
      },
      () => {
        setIsFirestoreConnected(false);
      }
    );

    // Load preferences
    const cachedPrefs = localStorage.getItem('SCHOOL_ERP_PREFERENCES');
    if (cachedPrefs) {
      const parsed = JSON.parse(cachedPrefs);
      setPreferences(parsed);
      applyTheme(parsed.theme);
    } else {
      applyTheme('light');
    }

    // Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
        setAccessToken(null);
      }
    });

    return () => {
      unsubscribeFirestore();
      unsubscribeAuth();
    };
  }, []);

  // Show login modal if no user logged in initially
  useEffect(() => {
    if (!loggedInUser) {
      setShowLoginModal(true);
    }
  }, [loggedInUser]);

  // Handle Login
  const handleUserLogin = (user: UserAccount) => {
    setLoggedInUser(user);
    localStorage.setItem('LOGGED_IN_USER', JSON.stringify(user));
    setShowLoginModal(false);

    // Synchronize AppState user profile role
    if (state) {
      updateState({
        userProfile: {
          role: user.role,
          selectedId: user.associatedId
        }
      });
    }

    addNotification(
      'लॉगिन सफल 🔓',
      `स्वागत है ${user.name}! आप ${user.role} के रूप में लॉग इन हो चुके हैं।`,
      'success'
    );
  };

  const handleUserLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('LOGGED_IN_USER');
    setShowLoginModal(true);
    addNotification('लॉग आउट सम्पन्न', 'आप सफलतापूर्वक लॉग आउट हो चुके हैं।', 'info');
  };

  // Save State securely locally AND sync to Firestore
  const updateState = (updates: Partial<AppState>) => {
    if (!state) return;
    const newState = { ...state, ...updates };
    setState(newState);
    saveSecureState('SCHOOL_ERP_APP_STATE', newState);
    saveStateToFirestore(newState);
  };

  // Helper to trigger new Toast notifications
  const addNotification = (title: string, body: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
    const notifId = `N-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif: AppNotification = {
      id: notifId,
      title,
      body,
      type,
      time: 'अभी-अभी',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Show instant popup toast banner
    const toast: ToastMessage = {
      id: notifId,
      title,
      body,
      type
    };
    setActiveToasts(prev => [toast, ...prev].slice(0, 3));
  };

  // Apply visual theme class to root html element
  const applyTheme = (theme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleToggleTheme = () => {
    const nextTheme = preferences.theme === 'light' ? 'dark' : 'light';
    const nextPrefs = { ...preferences, theme: nextTheme };
    setPreferences(nextPrefs);
    localStorage.setItem('SCHOOL_ERP_PREFERENCES', JSON.stringify(nextPrefs));
    applyTheme(nextTheme);
    addNotification('थीम परिवर्तित', `${nextTheme === 'dark' ? 'डार्क थीम' : 'लाइट थीम'} सक्रिय की गई।`, 'info');
  };

  const handleColorChange = (color: string) => {
    const nextPrefs = { ...preferences, primaryColor: color };
    setPreferences(nextPrefs);
    localStorage.setItem('SCHOOL_ERP_PREFERENCES', JSON.stringify(nextPrefs));
    addNotification('कलर थीम बदली', `प्राइमरी रंग बदलकर ${color} किया गया।`, 'success');
  };

  // PDF Export Modal State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfTitle, setPdfTitle] = useState('विद्यालय दस्तावेज व रिपोर्ट');

  // 8. Google OAuth sign-in flow
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setAccessToken(credential.accessToken);
      }
      if (result.user) {
        const googleUser: UserAccount = {
          id: `U-G-${result.user.uid}`,
          name: result.user.displayName || 'गूगल उपयोगकर्ता',
          email: result.user.email || 'user@google.com',
          role: 'Admin',
          isActive: true
        };
        handleUserLogin(googleUser);
      }
    } catch (err: any) {
      console.error('Google Sign-in popup closed or restricted:', err);
      addNotification(
        'गूगल ऑथेंटिकेशन सूचना',
        'गूगल पॉपअप बंद हुआ या ब्राउज़र सुरक्षा द्वारा सीमित था। आप सीधे ईमेल/पासवर्ड द्वारा लॉग इन कर सकते हैं।',
        'warning'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await auth.signOut();
    setCurrentUser(null);
    setAccessToken(null);
    addNotification('गूगल डिस्कनेक्टेड', 'आप गूगल क्लाउड सिंक से लॉग आउट हो चुके हैं।', 'info');
  };

  // 9. Synchronize State to Google Sheets
  const handleSyncToSheets = async () => {
    if (!accessToken || !state) return;
    setIsSyncing(true);
    try {
      const result = await syncStateToSheets(accessToken, state);
      if (result.success) {
        const log: SyncLog = {
          timestamp: result.timestamp,
          status: 'Success',
          message: `सफलतापूर्वक सिंक किया गया। शीट URL: ${result.url}`
        };
        setSyncLogs(prev => [log, ...prev]);
        addNotification(
          'रियल-टाइम सिंक पूर्ण ✔',
          `१०० छात्रों और १५ शिक्षकों का डेटा गूगल शीट्स 'School_Management_ERP_Sync' में अपडेट कर दिया गया है।`,
          'success'
        );
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      const log: SyncLog = {
        timestamp: new Date().toLocaleTimeString('hi-IN'),
        status: 'Failed',
        message: err.message || 'सिंक के दौरान एरर'
      };
      setSyncLogs(prev => [log, ...prev]);
      addNotification('सिंक त्रुटि ❌', 'गूगल शीट्स के साथ सिंक करने में रुकावट आई। इंटरनेट चेक करें।', 'alert');
    } finally {
      setIsSyncing(false);
    }
  };

  // 10. Backup PDF report to Google Drive
  const handleBackupToDrive = async () => {
    if (!accessToken || !state) return;
    addNotification('बैकअप प्रारंभ...', 'स्कूल प्रोग्रेस रिपोर्ट पीडीएफ तैयार कर गूगल ड्राइव पर अपलोड की जा रही है।', 'info');
    try {
      const docContent = `
========================================
राजकीय आदर्श उच्च माध्यमिक विद्यालय - ERP प्रगति रिपोर्ट
========================================
सत्र: २०२६ | निर्माण समय: ${new Date().toLocaleString('hi-IN')}
कुल छात्र संख्या: ${state.students.length}
कुल शिक्षक संख्या: ${state.teachers.length}
परीक्षा परिणाम घोषित: ${state.isResultsDeclared ? "हाँ (Declared)" : "लंबित (Pending)"}

वित्तीय स्थिति (Financial summary):
- कुल संचित आय: ₹${state.transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0).toLocaleString('hi-IN')}
- कुल विद्यालय व्यय: ₹${state.transactions.filter(t => t.type === 'Expense' || t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0).toLocaleString('hi-IN')}
      `;

      const uploadResult = await uploadFileToDrive(accessToken, 'School_ERP_Progress_Report.txt', docContent);
      if (uploadResult.success) {
        addNotification(
          'ड्राइव बैकअप पूर्ण 📁',
          `प्रगति रिपोर्ट फ़ाइल सफलतापूर्वक गूगल ड्राइव में अपलोड कर दी गई है।`,
          'success'
        );
      }
    } catch (err) {
      addNotification('बैकअप त्रुटि', 'गूगल ड्राइव पर रिपोर्ट अपलोड करने में समस्या आई।', 'alert');
    }
  };

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400">स्कूल ERP डेटा सुरक्षित लोड हो रहा है, कृपया प्रतीक्षा करें...</p>
        </div>
      </div>
    );
  }

  // Active Profile details mapped to pre-defined tester IDs
  const activeRole = state.userProfile.role;
  const isDemoTeacher = activeRole === 'Teacher';
  const isDemoStudent = activeRole === 'Student';

  // Extract selected teacher/student context
  const selectedTeacher = state.teachers.find(t => t.id === (state.userProfile.selectedId || 'T100')) || state.teachers[0];
  const selectedStudent = state.students.find(s => s.id === (state.userProfile.selectedId || 'S1001')) || state.students[0];

  // Map primary theme color safely
  const colorMap: { [key: string]: { text: string, bg: string, border: string, btn: string } } = {
    indigo: { text: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500', btn: 'bg-indigo-500 hover:bg-indigo-600' },
    emerald: { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500', btn: 'bg-emerald-500 hover:bg-emerald-600' },
    rose: { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500', btn: 'bg-rose-500 hover:bg-rose-600' },
    amber: { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500', btn: 'bg-amber-500 hover:bg-amber-600' },
    slate: { text: 'text-zinc-700 dark:text-zinc-300', bg: 'bg-zinc-700', border: 'border-zinc-700', btn: 'bg-zinc-700 hover:bg-zinc-800' }
  };

  const activeColor = colorMap[preferences.primaryColor] || colorMap.indigo;

  // Render locked screen when logged out
  if (!loggedInUser) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 flex items-center justify-center p-4">
        {state && (
          <LoginModal
            teachers={state.teachers}
            students={state.students}
            userPasswords={state.userPasswords}
            onUpdatePasswords={(newMap) => updateState({ userPasswords: newMap })}
            onLogin={handleUserLogin}
            onGoogleLogin={handleGoogleLogin}
            isLoggingInGoogle={isLoggingIn}
          />
        )}
        <NotificationToast
          toasts={activeToasts}
          onDismiss={(id) => setActiveToasts(prev => prev.filter(t => t.id !== id))}
        />
      </div>
    );
  }

  return (
    <div className={`h-screen w-screen max-h-screen overflow-hidden flex flex-col md:flex-row bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 ${preferences.theme === 'dark' ? 'dark' : ''}`}>
      <NotificationToast
        toasts={activeToasts}
        onDismiss={(id) => setActiveToasts(prev => prev.filter(t => t.id !== id))}
      />
      
      {/* 🧭 Left Sidebar */}
      <aside className="w-full md:w-64 h-auto md:h-full overflow-y-auto bg-white dark:bg-zinc-900 border-r border-zinc-100 dark:border-zinc-800 p-5 flex flex-col justify-between shrink-0 transition-colors duration-200">
        <div className="space-y-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl text-white ${activeColor.bg}`}>
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-black font-display tracking-tight text-zinc-900 dark:text-white leading-none">
                {state.schoolName}
              </h1>
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">स्कूल ERP / सिंक बोर्ड</span>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>छात्र संख्या (Students):</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{state.students.length}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>शिक्षक (Teachers):</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200">{state.teachers.length}</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500">
              <span>नेट बैलेंस (Accounts):</span>
              <span className="font-bold text-emerald-500">₹{state.transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) - state.transactions.filter(t => t.type === 'Expense' || t.type === 'Salary').reduce((sum, t) => sum + t.amount, 0)}</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1">
            <button
              onClick={() => { setCurrentModule('dashboard'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-all ${
                currentModule === 'dashboard'
                  ? `bg-zinc-50 dark:bg-zinc-850 ${activeColor.text}`
                  : 'text-zinc-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" /> डैशबोर्ड विश्लेषण (Analytics)
            </button>
            <button
              onClick={() => { setCurrentModule('core-erp'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-xl transition-all ${
                currentModule === 'core-erp'
                  ? `bg-zinc-50 dark:bg-zinc-850 ${activeColor.text}`
                  : 'text-zinc-500 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
              }`}
            >
              <GraduationCap className="w-4.5 h-4.5" /> भूमिका संचालित ERP (Core ERP)
            </button>
          </nav>
        </div>

        {/* Sync panel at Sidebar Bottom */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">शीट्स कनेक्शन</span>
            <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </div>

          {currentUser ? (
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                👤 {currentUser.displayName?.split(' ')[0]}
              </div>
              <button
                onClick={handleSyncToSheets}
                disabled={isSyncing || !isOnline}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'सिंक हो रहा है...' : 'गूगल शीट सिंक करें'}
              </button>
              <button
                onClick={handleBackupToDrive}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                💾 ड्राइव पीडीएफ बैकअप
              </button>
              <button
                onClick={handleGoogleLogout}
                className="w-full py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3 h-3" /> डिस्कनेक्ट करें
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn || !isOnline}
                className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'कनेक्ट हो रहा...' : '🔑 Google Sheets कनेक्ट'}
              </button>
              <p className="text-[9px] text-zinc-400 leading-normal text-center">
                * वास्तविक गूगल शीट में १ क्लिक रियल-टाइम सिंक हेतु गूगल ऑथेंटिकेशन का उपयोग करें।
              </p>
            </div>
          )}

          {/* Sync History Logs */}
          {syncLogs.length > 0 && (
            <div className="p-2 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-100 dark:border-zinc-800/50 space-y-1">
              <span className="text-[8px] text-zinc-400 block font-bold uppercase">सिंक लॉग (Sync History)</span>
              {syncLogs.slice(0, 2).map((log, lIdx) => (
                <div key={lIdx} className="text-[9px] text-zinc-500 flex justify-between gap-1">
                  <span className="truncate">{log.message}</span>
                  <span className="shrink-0 text-zinc-400">{log.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* 🧭 Right Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* 🧭 Top Navigation Header */}
        <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-800 px-6 flex items-center justify-between shrink-0 transition-colors duration-200">
          
          {/* Active Mode Banner & Logged-in User Badge */}
          <div className="flex items-center gap-3">
            {loggedInUser ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                    👤 {loggedInUser.name} ({loggedInUser.role})
                  </span>
                </div>
                <button
                  onClick={handleUserLogout}
                  className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  title="लॉग आउट / स्विच यूजर"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">स्विच यूजर</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>लॉग इन करें</span>
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                className="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer border border-zinc-200 dark:border-zinc-700"
              >
                <span className="text-[11px]">रोल देखें</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleSwitcher && (
                <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl py-2 z-50 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="block px-4 py-1 text-[10px] text-zinc-400 font-bold uppercase">त्वरित डेमो स्विच</span>
                  <button
                    onClick={() => {
                      const u: UserAccount = { id: 'U1', name: 'राजेश शर्मा (प्रधानाचार्य)', email: 'admin@school.com', role: 'Admin', isActive: true };
                      handleUserLogin(u);
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold"
                  >
                    👑 Admin (प्रधानाचार्य)
                  </button>
                  <button
                    onClick={() => {
                      const u: UserAccount = { id: 'U2', name: 'सुरेश कुमार', email: 'suresh@school.com', role: 'Teacher', associatedId: 'T100', isActive: true };
                      handleUserLogin(u);
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold"
                  >
                    👩‍🏫 Teacher (सुरेश कुमार - 10A)
                  </button>
                  <button
                    onClick={() => {
                      const u: UserAccount = { id: 'U3', name: 'आरव शर्मा', email: 'aarav@school.com', role: 'Student', associatedId: 'S1001', isActive: true };
                      handleUserLogin(u);
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold"
                  >
                    🎓 Student (आरव शर्मा - 10A)
                  </button>
                  <button
                    onClick={() => {
                      const u: UserAccount = { id: 'U4', name: 'महेन्द्र सिंह', email: 'manager@school.com', role: 'Manager', isActive: true };
                      handleUserLogin(u);
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold"
                  >
                    💼 Manager (कोषाध्यक्ष)
                  </button>
                  <button
                    onClick={() => {
                      const u: UserAccount = { id: 'U5', name: 'विकास यादव', email: 'exam@school.com', role: 'Exam In-charge', isActive: true };
                      handleUserLogin(u);
                      setShowRoleSwitcher(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-850 font-bold"
                  >
                    📝 Exam In-charge (परीक्षा प्रभारी)
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Top Bar Actions */}
          <div className="flex items-center gap-3">
            
            {/* Quick PDF Export Trigger */}
            <button
              onClick={() => {
                setPdfTitle(`${currentModule === 'dashboard' ? 'विद्यालय समग्र एनालिटिक्स' : activeRole + ' पोर्टल रिपोर्ट'}`);
                setShowPdfModal(true);
              }}
              className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
              title="PDF रिपोर्ट एक्सपोर्ट करें"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF रिपोर्ट</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={handleToggleTheme}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {preferences.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Customizer Settings panel trigger */}
            <button
              onClick={() => setShowPreferencesPanel(!showPreferencesPanel)}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer"
              title="Personalize Color Theme"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-xl transition-colors cursor-pointer relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>

              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-xl py-3 z-50 text-xs">
                  <div className="flex justify-between items-center px-4 pb-2 border-b border-zinc-50 dark:border-zinc-800">
                    <span className="font-bold text-zinc-900 dark:text-white">रीयल-टाइम नोटिफिकेशन (Inbox)</span>
                    <button
                      onClick={() => {
                        setNotifications(notifications.map(n => ({ ...n, read: true })));
                      }}
                      className="text-[10px] text-indigo-500 font-bold"
                    >
                      सभी पढ़ें
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800">
                    {notifications.map((n) => (
                      <div key={n.id} className={`p-3 space-y-1 ${n.read ? 'opacity-70' : 'bg-indigo-50/10 dark:bg-zinc-800/10'}`}>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-zinc-900 dark:text-white block">{n.title}</span>
                          <span className="text-[9px] text-zinc-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-snug">{n.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Encrypted Secure Storage Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-100/50 dark:border-emerald-900/10">
              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>🔒 Encrypted Sandbox</span>
            </div>
          </div>
        </header>

        {/* Customization preferences slide-in drawer */}
        {showPreferencesPanel && (
          <div className="bg-indigo-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-5 flex flex-wrap items-center justify-between gap-4 text-xs transition-all">
            <div className="space-y-1">
              <span className="font-bold text-zinc-900 dark:text-white">पसंदीदा रंग थीम चुनें (Select Accent Color Theme)</span>
              <p className="text-[10px] text-zinc-400">यह सेटिंग पूरे ERP डैशबोर्ड के प्राथमिक रंगों को कस्टमाइज़ कर देगी।</p>
            </div>
            <div className="flex items-center gap-2">
              {['indigo', 'emerald', 'rose', 'amber', 'slate'].map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
                    preferences.primaryColor === color ? 'border-zinc-900 dark:border-white' : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor:
                      color === 'indigo'
                        ? 'oklch(0.585 0.233 277.117)'
                        : color === 'emerald'
                        ? 'oklch(0.79 0.17 155.6)'
                        : color === 'rose'
                        ? 'oklch(0.627 0.265 303.9)'
                        : color === 'amber'
                        ? 'oklch(0.769 0.188 70.08)'
                        : 'oklch(0.446 0.03 256.802)'
                  }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>
        )}

        {/* 🧭 Main Body viewport area */}
        <main id="erp-main-content" className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6">
          
          {/* 1. View: Dashboard analytics */}
          {currentModule === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <div>
                  <h2 className="text-lg font-black font-display text-zinc-900 dark:text-white">
                    विद्यालय समग्र विश्लेषण (School Analytics Dashboard)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    स्कूल के वित्तीय, शैक्षणिक, और उपस्थिति रिकॉर्ड्स का रियल-टाइम विजुअल विश्लेषण
                  </p>
                </div>
              </div>

              <Analytics
                students={state.students}
                teachers={state.teachers}
                transactions={state.transactions}
                isResultsDeclared={state.isResultsDeclared}
              />
            </div>
          )}

          {/* 2. View: Role-specific ERP */}
          {currentModule === 'core-erp' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-2">
                <div>
                  <h2 className="text-lg font-black font-display text-zinc-900 dark:text-white">
                    {activeRole === 'Admin' && '👑 एडमिनिस्ट्रेटर डैशबोर्ड (Administrator Portal)'}
                    {activeRole === 'Teacher' && '👩‍🏫 शिक्षक नियंत्रण बोर्ड (Teachers Portal)'}
                    {activeRole === 'Student' && '🎓 छात्र दैनिक डायरी (Students Portal)'}
                    {activeRole === 'Manager' && '💼 विद्यालय प्रबंधन बोर्ड (Managers Accounting)'}
                    {activeRole === 'Exam In-charge' && '📝 परीक्षा प्रबंधन केंद्र (Exam In-charge)'}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    आपके रोल के अनुसार आवश्यक सभी मॉड्यूल नीचे एकीकृत किए गए हैं।
                  </p>
                </div>
              </div>

              {activeRole === 'Admin' && (
                <AdminPanel
                  students={state.students}
                  teachers={state.teachers}
                  busRoutes={state.busRoutes}
                  timetable={state.timetable}
                  userPasswords={state.userPasswords}
                  onUpdatePasswords={(newMap) => updateState({ userPasswords: newMap })}
                  onUpdateState={updateState}
                  onAddNotification={addNotification}
                  onSwitchUser={handleUserLogin}
                />
              )}

              {activeRole === 'Teacher' && (
                <TeacherPanel
                  teacher={selectedTeacher}
                  students={state.students}
                  homework={state.homework}
                  leaves={state.leaves}
                  onUpdateState={updateState}
                  onAddNotification={addNotification}
                />
              )}

              {activeRole === 'Student' && (
                <StudentPanel
                  student={selectedStudent}
                  homework={state.homework}
                  busRoutes={state.busRoutes}
                  timetable={state.timetable}
                  leaves={state.leaves}
                  isResultsDeclared={state.isResultsDeclared}
                  onUpdateState={updateState}
                  onAddNotification={addNotification}
                />
              )}

              {activeRole === 'Manager' && (
                <ManagerPanel
                  students={state.students}
                  teachers={state.teachers}
                  transactions={state.transactions}
                  leaves={state.leaves}
                  onUpdateState={updateState}
                  onAddNotification={addNotification}
                />
              )}

              {activeRole === 'Exam In-charge' && (
                <ExamPanel
                  students={state.students}
                  teachers={state.teachers}
                  isResultsDeclared={state.isResultsDeclared}
                  onUpdateState={updateState}
                  onAddNotification={addNotification}
                />
              )}
            </div>
          )}

        </main>

        {/* 📱 Mobile Bottom Bar Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex justify-around items-center z-40">
          <button
            onClick={() => setCurrentModule('dashboard')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              currentModule === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>एनालिटिक्स</span>
          </button>
          <button
            onClick={() => setCurrentModule('core-erp')}
            className={`flex flex-col items-center gap-1 text-[10px] font-bold ${
              currentModule === 'core-erp' ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-500'
            }`}
          >
            <School className="w-5 h-5" />
            <span>ERP मॉड्यूल</span>
          </button>
          <button
            onClick={() => {
              setPdfTitle('विद्यालय दस्तावेज');
              setShowPdfModal(true);
            }}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-purple-600 dark:text-purple-400"
          >
            <Download className="w-5 h-5" />
            <span>PDF डाउनलोड</span>
          </button>
          <button
            onClick={handleUserLogout}
            className="flex flex-col items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-red-500"
          >
            <LogOut className="w-5 h-5" />
            <span>लॉग आउट</span>
          </button>
        </nav>
      </div>

      {/* 📄 PDF Export Customization Modal */}
      <PdfExportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        title={pdfTitle}
        elementIdToExport="erp-main-content"
        defaultFilename={`School_ERP_Report_${new Date().toISOString().slice(0,10)}`}
      />

      {/* 🔐 Login Modal Popup (For changing credentials while logged in) */}
      {showLoginModal && state && (
        <LoginModal
          teachers={state.teachers}
          students={state.students}
          onLogin={(u) => {
            handleUserLogin(u);
            setShowLoginModal(false);
          }}
          onGoogleLogin={handleGoogleLogin}
          isLoggingInGoogle={isLoggingIn}
        />
      )}
    </div>
  );
}
