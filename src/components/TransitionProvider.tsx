'use client';

import { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // When pathname changes, hide content immediately
    setIsTransitioning(false);
    setDisplayContent(false);
    
    // Wait for content to render, then fade in
    // This delay ensures the new content is mounted before we show it
    const timer = setTimeout(() => {
      setDisplayContent(true);
    }, 150);
    
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
          transition: 'opacity 0.5s ease-in-out',
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

