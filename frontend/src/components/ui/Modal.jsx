import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({ isOpen, onClose, title, description, children, className }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative z-10 w-full max-w-3xl rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col',
          className
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            {title && <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>}
            {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
