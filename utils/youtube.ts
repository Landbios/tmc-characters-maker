const YOUTUBE_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

const ALLOWED_YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtu.be',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
]);

/**
 * Strictly extracts a valid 11-character YouTube video ID from standard YouTube URLs:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://music.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Bare 11-character video ID
 * Returns null for any invalid or non-YouTube URL.
 */
export function extractYouTubeId(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  if (YOUTUBE_ID_RE.test(trimmed)) {
    return trimmed;
  }

  let parsed: URL;
  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsed = new URL(withProtocol);
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  if (!ALLOWED_YOUTUBE_HOSTS.has(host)) {
    return null;
  }

  let candidate: string | null = null;

  if (host === 'youtu.be' || host === 'www.youtu.be') {
    candidate = parsed.pathname.split('/').filter(Boolean)[0] || null;
  } else {
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments[0] === 'watch' || segments.length === 0) {
      candidate = parsed.searchParams.get('v');
    } else if (segments[0] === 'embed' || segments[0] === 'shorts' || segments[0] === 'live') {
      candidate = segments[1] || null;
    } else {
      candidate = parsed.searchParams.get('v');
    }
  }

  if (!candidate || !YOUTUBE_ID_RE.test(candidate)) {
    return null;
  }

  return candidate;
}

export function getYouTubeEmbedUrl(
  videoId: string,
  options: { autoplay?: boolean; loop?: boolean } = {}
): string {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  });
  if (options.autoplay) {
    params.set('autoplay', '1');
  }
  if (options.loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getYouTubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
