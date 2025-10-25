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

    // When transitioning, the content should already be hidden by TransitionLink
    // before the URL changes. When we detect the pathname change, show the new content.
    // The overlay will fade out, revealing the new content.
    if (isTransitioning) {
      // Show content immediately since TransitionLink's overlay is still covering the screen
      setDisplayContent(true);
    }
  }, [pathname, isTransitioning]);

  const startTransition = () => {
    // Hide content before navigation happens
    setDisplayContent(false);
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

