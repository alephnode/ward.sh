'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent, useState } from 'react';

interface TransitionLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function TransitionLink({ href, className, style, children }: TransitionLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    if (isNavigating) return;
    setIsNavigating(true);

    // Create overlay for smooth transition
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'var(--background, #000)';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.4s ease-in-out';
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
      
      // Keep the overlay dark for longer to allow new content to render
      // This works with TransitionProvider's 150ms delay
      setTimeout(() => {
        overlay.style.opacity = '0';
        // Remove overlay after fade-out completes
        setTimeout(() => {
          if (document.body.contains(overlay)) {
            document.body.removeChild(overlay);
          }
          setIsNavigating(false);
        }, 500);
      }, 200);
    }, 400);
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
