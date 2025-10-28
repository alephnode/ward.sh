import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const imagesDirectory = join(process.cwd(), 'public', 'slideshow-images');
    const files = await readdir(imagesDirectory);
    
    // Filter for image files (webp, jpg, jpeg, png)
    const imageFiles = files.filter(file => 
      /\.(webp|jpg|jpeg|png)$/i.test(file)
    );
    
    return NextResponse.json({ images: imageFiles });
  } catch (error) {
    console.error('Error reading images directory:', error);
    return NextResponse.json(
      { error: 'Failed to read images directory' },
      { status: 500 }
    );
  }
}
