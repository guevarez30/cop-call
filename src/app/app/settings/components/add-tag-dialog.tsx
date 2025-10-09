'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, Check, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getContrastColor, parseTagName, lightenColor } from '@/components/tag-badge';
import { Tag } from '@/lib/types';
import { TagHelpDrawer } from './tag-help-drawer';

interface AddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagAdded: () => void;
}

export function AddTagDialog({ open, onOpenChange, onTagAdded }: AddTagDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default blue
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingTags, setExistingTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);

  // Fetch existing tags when dialog opens
  useEffect(() => {
    if (open) {
      fetchExistingTags();
    }
  }, [open]);

  const fetchExistingTags = async () => {
    setLoadingTags(true);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) return;

      const response = await fetch('/api/tags/list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setExistingTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Get unique colors with associated tag names
  const getColorPalette = () => {
    const colorMap = new Map<string, string[]>();

    existingTags.forEach((tag) => {
      const existing = colorMap.get(tag.color) || [];
      colorMap.set(tag.color, [...existing, tag.name]);
    });

    return Array.from(colorMap.entries()).map(([color, tagNames]) => ({
      color,
      tagNames,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError('You must be logged in');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          color,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create tag');
        setLoading(false);
        return;
      }

      toast.success(`Tag "${name}" created successfully`);
      setName('');
      setColor('#3B82F6'); // Reset to default
      setDescription('');
      setLoading(false);
      onOpenChange(false);
      onTagAdded();
    } catch (err: any) {
      console.error('Error creating tag:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!loading) {
      setName('');
      setColor('#3B82F6');
      setDescription('');
      setError(null);
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Tag</DialogTitle>
          <DialogDescription className="text-base">
            Create a new event tag for your department. Use matching colors for related tags (e.g., all traffic tags in blue).
          </DialogDescription>
          <button
            type="button"
            onClick={() => setHelpDrawerOpen(true)}
            className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit mt-1"
          >
            <HelpCircle className="h-4 w-4" />
            What is a tag?
          </button>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                type="text"
                placeholder="e.g., DUI"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-11"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-color">Color</Label>

              {/* Color palette from existing tags */}
              {!loadingTags && existingTags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Click a color to match existing tags:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getColorPalette().map(({ color: paletteColor, tagNames }) => (
                      <button
                        key={paletteColor}
                        type="button"
                        onClick={() => setColor(paletteColor)}
                        disabled={loading}
                        className="relative group"
                        title={`Used by: ${tagNames.join(', ')}`}
                      >
                        <div
                          className="h-10 w-10 rounded-md border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: paletteColor,
                            borderColor: color === paletteColor ? '#000' : 'transparent',
                          }}
                        >
                          {color === paletteColor && (
                            <div className="flex items-center justify-center h-full">
                              <Check className="h-5 w-5" style={{ color: getContrastColor(paletteColor) }} />
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded border shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                          {tagNames.join(', ')}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 items-center">
                <Input
                  id="tag-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={loading}
                  className="h-11 w-20 cursor-pointer"
                />
                <div className="flex-1 flex items-center">
                  {(() => {
                    const displayName = name || 'Tag Preview';
                    const parsed = parseTagName(displayName);
                    const textColor = getContrastColor(color);

                    if (parsed.isGrouped) {
                      // Two-tone display: lighter background for group, solid for label
                      const lighterColor = lightenColor(color, 0.6);
                      const lighterTextColor = getContrastColor(lighterColor);

                      return (
                        <div className="inline-flex rounded-md overflow-hidden font-medium border">
                          <span
                            className="text-sm px-2 py-1 border-r border-black/10"
                            style={{ backgroundColor: lighterColor, color: lighterTextColor }}
                          >
                            {parsed.group}
                          </span>
                          <span
                            className="text-sm px-2 py-1"
                            style={{ backgroundColor: color, color: textColor }}
                          >
                            {parsed.label}
                          </span>
                        </div>
                      );
                    } else {
                      // Solid color for single word
                      return (
                        <div
                          className="inline-flex rounded-md font-medium text-sm px-2 py-1 border"
                          style={{ backgroundColor: color, color: textColor }}
                        >
                          {parsed.label}
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-description">Description (Optional)</Label>
              <Textarea
                id="tag-description"
                placeholder="Brief description of what this tag represents (e.g., Adult Arrest, Traffic Stop)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                className="min-h-[80px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Help officers understand what this tag is used for
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
              className="h-11 w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()} className="h-11 w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Tag
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      <TagHelpDrawer open={helpDrawerOpen} onOpenChange={setHelpDrawerOpen} />
    </Dialog>
  );
}
