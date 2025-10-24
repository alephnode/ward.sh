'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

interface TransitionLinkProps {
  href: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function TransitionLink({ href, className, style, children }: TransitionLinkProps) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Fade out
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.4s ease-in-out';

    // Navigate after fade out
    setTimeout(() => {
      router.push(href);
      // Reset for fade in
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 50);
    }, 400);
  };

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
}
