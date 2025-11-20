import { useState, useEffect } from 'react';

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-[#00d4ff] to-[#7b2cbf] text-white border-none rounded-full text-2xl font-black cursor-pointer z-[999] shadow-[0_4px_15px_rgba(0,212,255,0.4)] transition-all flex items-center justify-center animate-[fadeIn_0.3s_ease] hover:-translate-y-1 hover:scale-110 hover:shadow-[0_8px_25px_rgba(0,212,255,0.6)] hover:bg-gradient-to-r hover:from-[#7b2cbf] hover:to-[#00d4ff] active:-translate-y-0.5 active:scale-105"
          aria-label="Scroll to top"
        >
          ↑
        </button>
      )}
    </>
  );
}

export default ScrollToTop;
