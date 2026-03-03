'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit2, Image as ImageIcon, Type, Minus } from 'lucide-react';
import { Section } from '@/types/character';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SortableSectionProps {
  section: Section;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Section>) => void;
}

export function SortableSection({ section, onRemove, onUpdate }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = () => {
    switch (section.type as string) {
      case 'stats': return <Type size={16} />;
      case 'blaze': return <ImageIcon size={16} />;
      case 'battlefront': return <Type size={16} />;
      case 'clan': return <Type size={16} />;
      case 'separator': return <Minus size={16} />;
      case 'custom_text': return <Type size={16} />;
      case 'custom_image': return <ImageIcon size={16} />;
      default: return <Type size={16} />;
    }
  };

  const getLabel = () => {
    switch (section.type as string) {
      case 'stats': return 'Core: Statistics';
      case 'blaze': return 'Core: Blaze & Elements';
      case 'battlefront': return 'Core: Battlefront';
      case 'clan': return 'Core: Battlefront (Legacy)';
      case 'separator': return 'Separator';
      case 'custom_text': return 'Custom Text';
      case 'custom_image': return 'Custom Image';
      default: return 'Section';
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white/60 border border-white/80 rounded-lg p-3 shadow-sm mb-2 group">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-ethereal-text/40 hover:text-ethereal-text">
          <GripVertical size={18} />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-ethereal-text/80">
          {getIcon()}
          <span>{getLabel()}</span>
        </div>
        <div className="ml-auto flex gap-1">
          {!section.isCore && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => onRemove(section.id)}>
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      {/* Inline Editor for Custom Fields */}
      {section.type === 'custom_text' && (
        <div className="mt-3 space-y-2 pl-8">
          <Input 
            placeholder="Title (optional)" 
            value={section.title || ''} 
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="h-8 text-xs"
          />
          <Textarea 
            placeholder="Content" 
            value={section.content || ''} 
            onChange={(e) => onUpdate(section.id, { content: e.target.value })}
            className="min-h-[60px] text-xs"
          />
        </div>
      )}

      {(section.type === 'custom_image' || section.type === 'separator') && (
        <div className="mt-3 pl-8">
          <Label className="text-xs mb-1 block">Image/GIF URL</Label>
          <Input 
            placeholder="https://..." 
            value={section.imageUrl || ''} 
            onChange={(e) => onUpdate(section.id, { imageUrl: e.target.value })}
            className="h-8 text-xs"
          />
        </div>
      )}
    </div>
  );
}
