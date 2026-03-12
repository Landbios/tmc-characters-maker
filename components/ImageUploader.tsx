import React, { useState, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { UploadCloud, Link as LinkIcon, Loader2, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ImageCropperModal from './ImageCropperModal';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  bucketName?: string;
  maxSizeMB?: number;
  /** If set, enables crop modal after file selection with this aspect ratio (e.g. 16/9, 1, 3/4) */
  aspectRatio?: number;
}

export default function ImageUploader({
  label,
  value,
  onChange,
  placeholder = 'https://...',
  bucketName = 'character-images',
  maxSizeMB = 5,
  aspectRatio,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Crop modal state
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingFileExt, setPendingFileExt] = useState<string>('jpg');

  const uploadBlob = async (blob: Blob, fileExt: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Debes iniciar sesión para subir imágenes.');
      }

      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: false,
          contentType: blob.type || 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast.success('Imagen subida correctamente.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido al subir';
      toast.error(`Error al subir imagen: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`La imagen es muy pesada. El tamaño máximo permitido es de ${maxSizeMB}MB.`);
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un formato de imagen válido (JPG, PNG, GIF, WebP).');
      return;
    }

    const fileExt = file.name.split('.').pop() || 'jpg';

    // If aspectRatio is set, open cropper
    if (aspectRatio) {
      const reader = new FileReader();
      reader.onload = () => {
        setCropSrc(reader.result as string);
        setPendingFileExt(fileExt);
      };
      reader.readAsDataURL(file);
      return;
    }

    // No cropper – upload directly (original behavior)
    await uploadBlob(file, fileExt);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setCropSrc(null);
    await uploadBlob(croppedBlob, pendingFileExt);
  };

  const handleCropCancel = () => {
    setCropSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            style={{
              display: 'block',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}
          >
            {label}
          </label>
          
          {/* Mode Toggle Button */}
          <button
            onClick={() => setMode(mode === 'upload' ? 'url' : 'upload')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.55rem',
              color: 'var(--accent)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
            }}
          >
            {mode === 'upload' ? <><LinkIcon size={10} /> Usar Enlace Web</> : <><UploadCloud size={10} /> Subir Archivo</>}
          </button>
        </div>

        {mode === 'upload' ? (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--surface-alt)',
                border: '1px dashed var(--border)',
                color: uploading ? 'var(--text-muted)' : 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                padding: '0.45rem 0.75rem',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.2s',
                height: '2.1rem',
              }}
              onMouseEnter={e => !uploading && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glow)')}
              onMouseLeave={e => !uploading && ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)')}
            >
              {uploading ? (
                <><Loader2 size={13} className="animate-spin" /> Subiendo archivo…</>
              ) : (
                <><UploadCloud size={14} /> Haz clic para seleccionar imagen</>
              )}
            </button>
            
            {/* Small thumbnail preview if there's already an image */}
            {value && !uploading && (
              <div 
                style={{
                  width: '2.1rem',
                  flexShrink: 0,
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-alt)',
                  overflow: 'hidden',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Imagen actual"
              >
                <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              </div>
            )}
          </div>
        ) : (
          <input
            style={{
              width: '100%',
              backgroundColor: 'var(--surface-alt)',
              border: '1px solid var(--border-light)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              padding: '0.45rem 0.75rem',
              outline: 'none',
              transition: 'border-color 0.18s',
              height: '2.1rem',
            }}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={e => (e.currentTarget.style.borderColor = '#0353a4')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border-light)')}
          />
        )}

        {mode === 'upload' && (
          <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            *{maxSizeMB}MB max. por imagen. Archivos subidos al servidor central.
          </span>
        )}
      </div>

      {/* Crop Modal */}
      {cropSrc && aspectRatio && (
        <ImageCropperModal
          imageSrc={cropSrc}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
}
