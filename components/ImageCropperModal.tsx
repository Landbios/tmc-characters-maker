'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  aspectRatio: number;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  imageSrc,
  aspectRatio,
  onCropComplete,
  onCancel,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((z: number) => {
    setZoom(z);
  }, []);

  const onCropAreaComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          borderBottom: '1px solid var(--border, #333)',
          backgroundColor: 'var(--surface, #111)',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.7rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #aaa)',
          }}
        >
          Recortar Imagen
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onCancel}
            disabled={processing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #aaa)',
              background: 'none',
              border: '1px solid var(--border, #333)',
              padding: '0.35rem 0.75rem',
              cursor: 'pointer',
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger, #e53e3e)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger, #e53e3e)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border, #333)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted, #aaa)';
            }}
          >
            <X size={12} /> Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={processing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.65rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#fff',
              backgroundColor: '#0353a4',
              border: 'none',
              padding: '0.35rem 0.75rem',
              cursor: processing ? 'not-allowed' : 'pointer',
              opacity: processing ? 0.6 : 1,
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => {
              if (!processing) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#023e7d';
            }}
            onMouseLeave={(e) => {
              if (!processing) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#0353a4';
            }}
          >
            <Check size={12} /> {processing ? 'Procesando…' : 'Confirmar'}
          </button>
        </div>
      </div>

      {/* Crop area */}
      <div style={{ position: 'relative', flex: 1 }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropAreaComplete}
          style={{
            containerStyle: { backgroundColor: '#000' },
            cropAreaStyle: {
              border: '2px solid rgba(3, 83, 164, 0.8)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
            },
          }}
        />
      </div>

      {/* Zoom controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          padding: '0.6rem 1.25rem',
          borderTop: '1px solid var(--border, #333)',
          backgroundColor: 'var(--surface, #111)',
          flexShrink: 0,
        }}
      >
        <ZoomOut size={14} style={{ color: 'var(--text-muted, #aaa)' }} />
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          style={{
            width: '200px',
            accentColor: '#0353a4',
            cursor: 'pointer',
          }}
        />
        <ZoomIn size={14} style={{ color: 'var(--text-muted, #aaa)' }} />
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.6rem',
            color: 'var(--text-muted, #aaa)',
            minWidth: '2.5rem',
            textAlign: 'center',
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
      </div>
    </div>
  );
}
