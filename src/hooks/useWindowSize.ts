import { useState, useEffect } from 'react';

interface IWindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isDesktop: boolean;
}

const MOBILE_BREAKPOINT = 767;

export const useWindowSize = (): IWindowSize => {
  const [windowSize, setWindowSize] = useState<IWindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isMobile: typeof window !== 'undefined' ? window.innerWidth <= MOBILE_BREAKPOINT : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth > MOBILE_BREAKPOINT : true,
  }));

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= MOBILE_BREAKPOINT,
        isDesktop: window.innerWidth > MOBILE_BREAKPOINT,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};