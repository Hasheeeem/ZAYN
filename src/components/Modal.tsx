import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  preventClose?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  preventClose = false,
  initialFocus
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !preventClose) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, preventClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-2xl';
      case 'lg':
        return 'max-w-4xl';
      case 'xl':
        return 'max-w-7xl';
      case 'full':
        return 'max-w-full m-4';
      default:
        return 'max-w-2xl';
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-xl shadow-2xl w-full ${getSizeClass()} overflow-hidden animate-modalSlideIn`}
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 id="modal-title" className="text-xl font-light">{title}</h2>
          {!preventClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Close modal"
              type="button"
            >
              <X size={24} />
            </button>
          )}
        </div>
        
        <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;