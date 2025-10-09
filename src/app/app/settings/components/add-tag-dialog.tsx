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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createClient } from '@/lib/supabase/client';
import { Loader2, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';
import { getContrastColor } from '@/components/tag-badge';
import { Tag } from '@/lib/types';

interface AddTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTagAdded: () => void;
}

export function AddTagDialog({ open, onOpenChange, onTagAdded }: AddTagDialogProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6'); // Default blue
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ name: name.trim(), color }),
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
            Create a new event tag for your department. Tags help officers categorize events.
          </DialogDescription>
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
                placeholder="e.g., priority::high or Traffic Stop"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="h-11"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Tip: Use <code className="px-1 py-0.5 bg-muted rounded">group::label</code> format for organized tags (e.g., priority::low, status::active)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tag-color">Color</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="tag-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={loading}
                  className="h-11 w-20 cursor-pointer"
                />
                <div
                  className="flex-1 h-11 rounded-md border px-3 py-2 flex items-center gap-2"
                  style={{ backgroundColor: color }}
                >
                  <span className="text-sm font-medium" style={{ color: getContrastColor(color) }}>
                    {name || 'Tag Preview'}
                  </span>
                </div>
              </div>
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
    </Dialog>
  );
}
