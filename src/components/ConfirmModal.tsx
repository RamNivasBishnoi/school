import React from 'react';
import { AlertTriangle, CheckCircle2, Trash2, Save, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'save' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'हाँ, पुष्टि करें',
  cancelText = 'रद्द करें',
  type = 'save',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const iconMap = {
    danger: <Trash2 className="w-8 h-8 text-red-500 animate-pulse" />,
    save: <Save className="w-8 h-8 text-emerald-500" />,
    info: <HelpCircle className="w-8 h-8 text-indigo-500" />
  };

  const btnMap = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    save: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          {iconMap[type]}
        </div>
        
        <div>
          <h3 className="text-base font-black font-display text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-xl text-xs cursor-pointer transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-bold rounded-xl text-xs cursor-pointer shadow-md transition-colors ${btnMap[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
