import { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'border-l-[#00d4ff] bg-[rgba(0,212,255,0.1)] text-[#00d4ff]',
    error: 'border-l-[#ff006e] bg-[rgba(255,0,110,0.1)] text-[#ff006e]',
    warning: 'border-l-[#ffc107] bg-[rgba(255,193,7,0.1)] text-[#ffc107]',
    info: 'border-l-[#7b2cbf] bg-[rgba(123,44,191,0.1)] text-[#7b2cbf]',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`min-w-[300px] max-w-[500px] bg-[#1a2332] border border-[#2d3748] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-[slideInRight_0.3s_ease-out] backdrop-blur-sm border-l-4 ${typeStyles[type]}`}>
      <div className="flex items-center gap-4 p-6">
        <span className={`text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${
          type === 'success' ? 'bg-[rgba(0,212,255,0.2)]' :
          type === 'error' ? 'bg-[rgba(255,0,110,0.2)]' :
          type === 'warning' ? 'bg-[rgba(255,193,7,0.2)]' :
          'bg-[rgba(123,44,191,0.2)]'
        }`}>
          {icons[type]}
        </span>
        <span className="flex-1 text-white font-medium">{message}</span>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-[#a0aec0] text-2xl cursor-pointer p-0 w-6 h-6 flex items-center justify-center rounded transition-all hover:bg-[rgba(255,255,255,0.1)] hover:text-white flex-shrink-0"
          aria-label="Close"
        >
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;
