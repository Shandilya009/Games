function LoadingSpinner({ size = 'medium', text = 'Loading...' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-6">
      <div className={`${sizeClasses[size]} relative inline-block`}>
        <div className="absolute inset-0 w-full h-full border-3 border-transparent border-t-[#00d4ff] rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-full h-full border-3 border-transparent border-t-[#7b2cbf] rounded-full animate-spin" style={{ animationDelay: '0.2s', transform: 'scale(0.8)' }}></div>
        <div className="absolute inset-0 w-full h-full border-3 border-transparent border-t-[#ff006e] rounded-full animate-spin" style={{ animationDelay: '0.4s', transform: 'scale(0.6)' }}></div>
      </div>
      {text && <p className="text-[#a0aec0] text-base font-medium m-0">{text}</p>}
    </div>
  );
}

export default LoadingSpinner;
