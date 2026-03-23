import { useEffect, useState } from 'react';

const ScrollToTopButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (typeof window === 'undefined') return;
      setVisible(window.scrollY > window.innerHeight);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={handleClick}
      aria-label="Subir arriba"
      className="fixed right-4 bottom-6 z-50 p-3 rounded-full bg-white/90 dark:bg-slate-700 shadow-lg hover:scale-105 transform-gpu transition-all"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 dark:text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 6l-6 6h12L10 6z" />
      </svg>
    </button>
  );
};

export default ScrollToTopButton;
