'use client';

import React, { useState } from 'react';
import { Play, Square, Music, ExternalLink, X } from 'lucide-react';
import { MusicDisplayMode } from '@/types/character';
import {
  extractYouTubeId,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getYouTubeWatchUrl,
} from '@/utils/youtube';

interface MusicBlockPlayerProps {
  url?: string;
  title?: string;
  subtitle?: string;
  displayMode?: MusicDisplayMode;
  cardBg?: string;
  compact?: boolean;
}

export function MusicBlockPlayer({
  url,
  title,
  subtitle,
  displayMode = 'ambient',
  cardBg,
  compact = false,
}: MusicBlockPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = extractYouTubeId(url);
  const displayTitle = title?.trim() || 'Música Ambiental';

  if (!videoId) {
    return (
      <div
        className={`w-full ${compact ? 'my-2' : 'max-w-2xl'} rounded-xl px-4 py-3 border border-current/20 flex items-center gap-3 opacity-65 text-left`}
        style={cardBg ? { backgroundColor: cardBg } : undefined}
      >
        <Music size={16} className="shrink-0 opacity-70" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-mono uppercase tracking-wider truncate">{displayTitle}</div>
          <div className="text-xs opacity-70">Enlace de YouTube no configurado o no válido.</div>
        </div>
      </div>
    );
  }

  const watchUrl = getYouTubeWatchUrl(videoId);

  if (displayMode === 'video') {
    const thumbUrl = getYouTubeThumbnailUrl(videoId);
    const embedUrl = getYouTubeEmbedUrl(videoId, { autoplay: true, loop: false });

    return (
      <div
        className={`w-full ${compact ? 'my-3' : 'max-w-2xl'} rounded-xl overflow-hidden border border-white/30 shadow-sm text-left`}
        style={cardBg ? { backgroundColor: cardBg } : undefined}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-current/15">
          <div className="flex items-center gap-2.5 min-w-0">
            <Music size={14} className="shrink-0 opacity-75" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-heading)' }}>
                {displayTitle}
              </div>
              {subtitle && <div className="text-[11px] opacity-65 truncate">{subtitle}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isPlaying && (
              <button
                type="button"
                onClick={() => setIsPlaying(false)}
                title="Detener reproductor"
                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono uppercase tracking-wider border border-current/25 hover:border-current/60 transition-colors cursor-pointer"
              >
                <X size={12} />
                <span>Cerrar</span>
              </button>
            )}
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir en YouTube"
              className="opacity-65 hover:opacity-100 transition-opacity p-1"
            >
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <div className="relative aspect-video w-full bg-black/80">
          {isPlaying ? (
            <div className="rt-music-iframe-wrap absolute inset-0">
              <iframe
                src={embedUrl}
                title={displayTitle}
                className="w-full h-full border-0"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="group absolute inset-0 w-full h-full flex flex-col items-center justify-center cursor-pointer border-0 p-0 bg-transparent"
              aria-label={`Reproducir ${displayTitle}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbUrl}
                alt={displayTitle}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-[1.02] transition-all duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />
              <span className="relative z-10 w-14 h-14 rounded-full bg-black/70 border border-white/50 text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#0353a4] transition-all">
                <Play size={22} className="ml-0.5" fill="currentColor" />
              </span>
              <span className="relative z-10 mt-2.5 px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-mono uppercase tracking-[0.2em]">
                Clic para reproducir
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Compact Ambient Bar mode (default)
  const audioEmbedUrl = getYouTubeEmbedUrl(videoId, { autoplay: true, loop: true });

  return (
    <div
      className={`w-full ${compact ? 'my-2.5' : 'max-w-2xl'} rounded-xl px-4 py-3 border border-white/30 transition-all text-left`}
      style={cardBg ? { backgroundColor: cardBg } : { backgroundColor: 'rgba(15, 23, 42, 0.06)' }}
    >
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-pressed={isPlaying}
          aria-label={isPlaying ? `Detener ${displayTitle}` : `Reproducir ${displayTitle}`}
          className="w-10 h-10 rounded-full border border-current/35 flex items-center justify-center shrink-0 hover:scale-105 transition-transform cursor-pointer"
          style={{
            backgroundColor: isPlaying ? '#0353a4' : 'transparent',
            color: isPlaying ? '#ffffff' : 'inherit',
            borderColor: isPlaying ? '#0353a4' : undefined,
          }}
        >
          {isPlaying ? (
            <Square size={14} fill="currentColor" />
          ) : (
            <Play size={15} className="ml-0.5" fill="currentColor" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] opacity-60">
              {isPlaying ? 'Reproduciendo ambiente' : 'Música Ambiental'}
            </span>
            {isPlaying && (
              <span className="inline-flex items-end gap-[2px] h-3 opacity-80" aria-hidden="true">
                <span className="rt-eq-bar" style={{ animationDelay: '0ms' }} />
                <span className="rt-eq-bar" style={{ animationDelay: '220ms' }} />
                <span className="rt-eq-bar" style={{ animationDelay: '440ms' }} />
              </span>
            )}
          </div>
          <div className="text-sm font-medium truncate" style={{ fontFamily: 'var(--font-heading)' }}>
            {displayTitle}
          </div>
          {subtitle && <div className="text-xs opacity-65 truncate">{subtitle}</div>}
        </div>

        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir pista en YouTube"
          className="opacity-60 hover:opacity-100 transition-opacity p-1.5 shrink-0"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Compact visible mini-player drawer mounted ONLY while playing.
          YouTube requires a visible player (>= 200px) and standard youtube.com/embed
          with strict-origin-when-cross-origin so audio plays reliably without throttling. */}
      {isPlaying && (
        <div className="rt-music-iframe-wrap mt-3 pt-3 border-t border-current/15 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-[220px] aspect-video rounded-lg overflow-hidden bg-black/80 shrink-0 border border-white/20">
            <iframe
              src={audioEmbedUrl}
              title={`Audio ambiental: ${displayTitle}`}
              className="w-full h-full border-0"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
          </div>
          <div className="text-[11px] opacity-65 leading-relaxed">
            Usa los controles del reproductor para ajustar el volumen o pausar. Si YouTube bloquea la reproducción en tu red, ábrelo con el botón externo.
          </div>
        </div>
      )}
    </div>
  );
}
