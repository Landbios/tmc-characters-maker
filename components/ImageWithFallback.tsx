'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { ImageOff } from 'lucide-react';

/**
 * Domains that block external hotlinking and need to go through our proxy.
 * The proxy adds the correct Referer/Origin headers so the CDN accepts the request.
 */
const PROXIED_HOSTNAMES = ['pbs.twimg.com', 'ton.twimg.com'];

function maybeProxySrc(src: string): string {
  try {
    const url = new URL(src);
    if (PROXIED_HOSTNAMES.includes(url.hostname)) {
      return `/api/proxy-image?url=${encodeURIComponent(src)}`;
    }
  } catch {
    // Not a valid URL — fall through
  }
  return src;
}

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

  const resolvedSrc = typeof src === 'string' ? maybeProxySrc(src) : src;

  return (
    <Image
      {...props}
      key={typeof resolvedSrc === 'string' ? resolvedSrc : undefined}
      src={resolvedSrc}
      alt={alt}
      onError={() => setError(true)}
    />
  );
}
