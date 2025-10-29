'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { FixedSizeGrid as Grid } from 'react-window';
import styles from '../section.module.css';
import galleryStyles from './gallery.module.css';
import Navbar from '@/components/Navbar';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Virtualized grid item component
interface GridItemProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    images: string[];
    onImageClick: (image: string) => void;
    columnsPerRow: number;
  };
}

function GridItem({ columnIndex, rowIndex, style, data }: GridItemProps) {
  const { images, onImageClick, columnsPerRow } = data;
  const imageIndex = rowIndex * columnsPerRow + columnIndex;
  const image = images[imageIndex];

  if (!image) {
    return <div style={style} />;
  }

  return (
    <div style={style} className={galleryStyles.gridItemContainer}>
      <div
        className={galleryStyles.imageWrapper}
        onClick={() => onImageClick(image)}
      >
        <Image
          src={`/slideshow-images/${image}`}
          alt={`Film photo ${imageIndex + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={galleryStyles.thumbnail}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAKAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
      </div>
    </div>
  );
}

export default function Visual() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const [renderStartTime, setRenderStartTime] = useState<number | null>(null);

  // Fetch and shuffle images on mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images');
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        setShuffledImages(shuffleArray(data.images));
        setRenderStartTime(performance.now());
      } catch (error) {
        console.error('Error fetching images:', error);
        // Fallback to empty array if API fails
        setShuffledImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Calculate responsive grid dimensions
  const gridConfig = useMemo(() => {
    if (containerWidth === 0) return { columnsPerRow: 1, itemSize: 250, gap: 16 };
    
    // Responsive breakpoints matching your CSS
    if (containerWidth <= 640) {
      return { columnsPerRow: 1, itemSize: containerWidth - 32, gap: 12 };
    } else if (containerWidth <= 900) {
      return { columnsPerRow: 2, itemSize: (containerWidth - 48) / 2, gap: 16 };
    } else if (containerWidth <= 1200) {
      return { columnsPerRow: 3, itemSize: (containerWidth - 64) / 3, gap: 16 };
    } else if (containerWidth <= 1400) {
      return { columnsPerRow: 4, itemSize: (containerWidth - 80) / 4, gap: 20 };
    } else {
      return { columnsPerRow: 4, itemSize: 320, gap: 20 };
    }
  }, [containerWidth]);

  const totalRows = Math.ceil(shuffledImages.length / gridConfig.columnsPerRow);
  
  // Only use virtualization if we have enough images to benefit from it
  const shouldUseVirtualization = shuffledImages.length > 12;

  // Handle container resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(`.${galleryStyles.galleryContainer}`);
      if (container) {
        setContainerWidth(container.clientWidth);
        // Set height to viewport height minus header space
        const viewportHeight = window.innerHeight;
        const headerHeight = 120; // Approximate header height
        setContainerHeight(Math.max(400, viewportHeight - headerHeight));
      }
    };

    handleResize(); // Initial measurement
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageClick = useCallback((image: string) => {
    setSelectedImage(image);
  }, []);

  // Log performance metrics
  useEffect(() => {
    if (renderStartTime && !isLoading) {
      const renderTime = performance.now() - renderStartTime;
      console.log(`Gallery rendered in ${renderTime.toFixed(2)}ms`);
      console.log(`Using ${shouldUseVirtualization ? 'virtualized' : 'standard'} rendering for ${shuffledImages.length} images`);
    }
  }, [isLoading, renderStartTime, shouldUseVirtualization, shuffledImages.length]);

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
          {isLoading ? (
            <div className={galleryStyles.loadingContainer}>
              <p>Loading images...</p>
            </div>
          ) : shouldUseVirtualization ? (
            <div className={galleryStyles.virtualizedGallery}>
              <Grid
                columnCount={gridConfig.columnsPerRow}
                columnWidth={gridConfig.itemSize}
                height={containerHeight}
                rowCount={totalRows}
                rowHeight={gridConfig.itemSize}
                width={containerWidth || 800}
                itemData={{
                  images: shuffledImages,
                  onImageClick: handleImageClick,
                  columnsPerRow: gridConfig.columnsPerRow,
                }}
                style={{
                  gap: `${gridConfig.gap}px`,
                }}
              >
                {GridItem}
              </Grid>
            </div>
          ) : (
            <div className={galleryStyles.gallery}>
              {shuffledImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={galleryStyles.imageWrapper}
                  onClick={() => handleImageClick(image)}
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
          )}
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
