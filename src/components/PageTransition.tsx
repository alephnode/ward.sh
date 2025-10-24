'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import styles from './PageTransition.module.css';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // Trigger fade in on mount or path change
    setIsTransitioning(false);
    const timer = setTimeout(() => {
      setIsTransitioning(true);
    }, 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className={`${styles.transition} ${isTransitioning ? styles.fadeIn : ''}`}>
      {children}
    </div>
  );
}
