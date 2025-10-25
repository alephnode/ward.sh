'use client';

import { useRouter, usePathname } from 'next/navigation';
import { MouseEvent, useState } from 'react';
import { useTransition } from './TransitionProvider';

interface TransitionLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function TransitionLink({ href, className, style, children }: TransitionLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { startTransition, setShowLoading } = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Don't navigate if we're already on this page
    if (pathname === href || isNavigating) return;

    setIsNavigating(true);

    // Signal to TransitionProvider to hide content BEFORE navigation
    startTransition();

    // Create overlay for smooth transition
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'var(--background, #000)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease-in-out';
    overlay.style.zIndex = '9999';
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);

    // Trigger fade to dark
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
    });

    // Navigate after fade completes
    setTimeout(() => {
      router.push(href);

      // Show loading indicator after overlay fade-in completes
      // (overlay takes 300ms to fade in, then 300ms before we show loading)
      setTimeout(() => {
        setShowLoading(true);
      }, 300);

      // Wait for loading indicator to display and fade out
      // Loading shows at ~600ms, displays for 2 seconds, then fades out (300ms)
      // Total: 600 + 2000 + 300 = 2900ms before overlay can fade out
      setTimeout(() => {
        overlay.style.opacity = '0';
        // Remove overlay after fade-out completes
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          setIsNavigating(false);
        }, 300);
      }, 2600);
    }, 300);
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
