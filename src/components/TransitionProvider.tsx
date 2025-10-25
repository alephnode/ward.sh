'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import LoadingTerminal from './LoadingTerminal';

interface TransitionContextType {
  isTransitioning: boolean;
  startTransition: () => void;
  setShowLoading: (show: boolean) => void;
}

const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayContent, setDisplayContent] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [shouldFadeOutLoading, setShouldFadeOutLoading] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  // Track when loading starts
  useEffect(() => {
    if (showLoading && !loadingStartTime) {
      setLoadingStartTime(Date.now());
      setShouldFadeOutLoading(false);
    }
  }, [showLoading, loadingStartTime]);

  // Check if 2 seconds have passed and fade out loading when content is ready
  useEffect(() => {
    if (!showLoading || !loadingStartTime) return;

    const timer = setInterval(() => {
      const elapsedTime = Date.now() - loadingStartTime;
      if (elapsedTime >= 2000) {
        setShouldFadeOutLoading(true);
        clearInterval(timer);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [showLoading, loadingStartTime]);

  // Hide loading when fade-out completes
  useEffect(() => {
    if (!shouldFadeOutLoading) return;

    const timer = setTimeout(() => {
      setShowLoading(false);
      setLoadingStartTime(null);
      setShouldFadeOutLoading(false);
    }, 300); // Wait for fade-out transition to complete

    return () => clearTimeout(timer);
  }, [shouldFadeOutLoading]);

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
    <TransitionContext.Provider value={{ isTransitioning, startTransition, setShowLoading }}>
      <LoadingTerminal isVisible={showLoading} shouldFadeOut={shouldFadeOutLoading} />
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

