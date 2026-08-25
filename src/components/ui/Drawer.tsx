import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  width?: string;
}

export const Drawer = ({ open, onClose, title, children, width = 'max-w-md' }: DrawerProps) => {
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
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy-950/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full ${width} bg-white shadow-elevated animate-slide-in-right overflow-y-auto scrollbar-thin`}>
        {title && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
            <h2 className="text-lg font-bold text-navy-900">{title}</h2>
            <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-navy-700 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500" aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
};
