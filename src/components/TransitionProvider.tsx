'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface TransitionContextType {
  isTransitioning: boolean;
  startTransition: () => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(true);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Only trigger transition if pathname actually changed
    if (previousPathname.current === pathname) {
      return;
    }
    
    previousPathname.current = pathname;
    
    // Hide content briefly to allow new content to render
    setIsTransitioning(false);
    setDisplayContent(false);
    
    // Show content after a brief delay
    // This works in coordination with TransitionLink's overlay timing
    const timer = setTimeout(() => {
      setDisplayContent(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  const startTransition = () => {
    setIsTransitioning(true);
  };

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
      <div 
        style={{
          opacity: displayContent ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out',
          willChange: 'opacity',
        }}
      >
        {children}
      </div>
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  const context = useContext(TransitionContext);
  if (!context) {
    throw new Error('useTransition must be used within TransitionProvider');
  }
  return context;
}

