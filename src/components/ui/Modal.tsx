import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal = ({ open, onClose, title, children, size = 'md', footer }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative z-10 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-elevated animate-scale-in`}>
        {title && (
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-navy-900">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="max-h-[calc(90vh-8rem)] overflow-y-auto scrollbar-thin px-6 py-5">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
