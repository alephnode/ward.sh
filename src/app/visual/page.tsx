'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from '../section.module.css';
import galleryStyles from './gallery.module.css';
import Navbar from '@/components/Navbar';

// Get all image filenames
const imageFiles = [
  '01.webp', '02.webp', '03.webp', '05.webp', '05a.webp',
  '06.webp', '08.webp', '10.webp', '12.webp', '13.webp',
  '14a.webp', '15a.webp', '17a.webp', '19a.webp', '20a.webp',
  '22a.webp', '24a.webp', '27a.webp', '28a.webp', '33a.webp'
];

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function Visual() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);

  // Shuffle images on mount
  useEffect(() => {
    setShuffledImages(shuffleArray(imageFiles));
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [selectedImage]);

  return (
    <main className={styles.section}>
      <header className={styles.header}>
        <Navbar activePage="visual" />
      </header>
      <div className={styles.container}>
        <div className={galleryStyles.galleryContainer}>
          <div className={galleryStyles.gallery}>
            {shuffledImages.map((image, index) => (
              <div
                key={`${image}-${index}`}
                className={galleryStyles.imageWrapper}
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={`/slideshow-images/${image}`}
                  alt={`Film photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className={galleryStyles.thumbnail}
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className={galleryStyles.modal}
          onClick={() => setSelectedImage(null)}
        >
          <button
            className={galleryStyles.closeButton}
            onClick={() => setSelectedImage(null)}
            aria-label="Close modal"
          >
            ×
          </button>
          <div
            className={galleryStyles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`/slideshow-images/${selectedImage}`}
              alt="Film photo full size"
              width={1920}
              height={1920}
              className={galleryStyles.modalImage}
              quality={95}
              priority
            />
          </div>
        </div>
      )}
    </main>
  );
}
