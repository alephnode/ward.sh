'use client';

import { useEffect, useState } from 'react';

interface LoadingTerminalProps {
  isVisible: boolean;
  shouldFadeOut: boolean;
}

export default function LoadingTerminal({ isVisible, shouldFadeOut }: LoadingTerminalProps) {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);

  const fullText = 'loading...';

  // Typing animation
  useEffect(() => {
    if (!isVisible) {
      setDisplayText('');
      setIsTypingComplete(false);
      return;
    }

    // Type out the text over ~400ms
    const typingSpeed = 400 / fullText.length;
    let currentIndex = 0;

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTypingComplete(true);
        clearInterval(typeInterval);
      }
    }, typingSpeed);

    return () => clearInterval(typeInterval);
  }, [isVisible]);

  // Blinking cursor
  useEffect(() => {
    if (!isVisible) return;

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530); // Blink every 530ms for natural feel

    return () => clearInterval(cursorInterval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: shouldFadeOut ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
        zIndex: 10000,
        pointerEvents: 'none',
        fontSize: '1.25rem',
        fontFamily: 'monospace',
        color: 'var(--foreground, #fff)',
        textAlign: 'center',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ display: 'inline-block' }}>
        {`> ${displayText}`}
        <span style={{ visibility: showCursor ? 'visible' : 'hidden' }}>█</span>
      </span>
    </div>
  );
}
