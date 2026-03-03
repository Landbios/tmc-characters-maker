'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

export default function ImageWithFallback({ 
  src, 
  alt,
  ...props 
}: ImageProps) {
  const [error, setError] = useState(false);

  React.useEffect(() => {
    setError(false);
  }, [src]);

  // Validate URL format
  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // If src is empty, invalid URL, or error occurred
  if (error || !src || (typeof src === 'string' && !isValidUrl(src))) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gray-100/50 text-gray-400 ${props.className}`}>
        <ImageOff className="w-8 h-8 opacity-50" />
      </div>
    );
  }

  return (
    <Image
      {...props}
      key={typeof src === 'string' ? src : undefined}
      src={src}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
