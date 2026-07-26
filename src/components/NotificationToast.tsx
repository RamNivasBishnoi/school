import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function NotificationToast({ toasts, onDismiss }: NotificationToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      bg: 'bg-emerald-900/95 border-emerald-500 text-white',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />,
      badge: 'सफलतापूर्वक पूर्ण (Done)'
    },
    alert: {
      bg: 'bg-red-900/95 border-red-500 text-white',
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
      badge: 'त्रुटि (Error)'
    },
    warning: {
      bg: 'bg-amber-900/95 border-amber-500 text-white',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      badge: 'सावधानी (Warning)'
    },
    info: {
      bg: 'bg-indigo-900/95 border-indigo-500 text-white',
      icon: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
      badge: 'सूचना (Info)'
    }
  }[toast.type || 'info'];

  return (
    <div className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all duration-300 animate-slide-in-right ${config.bg}`}>
      {config.icon}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/90">
            {config.badge}
          </span>
        </div>
        <h4 className="text-xs font-black font-display text-white leading-tight">{toast.title}</h4>
        <p className="text-[11px] text-zinc-200 mt-1 leading-normal">{toast.body}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-white/60 hover:text-white rounded-lg transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
