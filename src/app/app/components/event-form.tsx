'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Event, Tag } from '@/lib/types';
import { X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { TagBadge } from '@/components/tag-badge';

interface EventFormData {
  start_time: string;
  end_time: string | null;
  tag_ids: string[];
  notes: string;
  involved_parties: string | null;
  status: 'draft' | 'submitted';
}

interface EventFormProps {
  open: boolean;
  onCancel: () => void;
  onSave: (event: EventFormData, status: 'draft' | 'submitted') => Promise<void>;
  editEvent?: Event | null;
}

export function EventForm({ open, onCancel, onSave, editEvent }: EventFormProps) {
  const [selectedTags, setSelectedTags] = useState<Tag[]>(editEvent?.tags || []);
  const [tagSearch, setTagSearch] = useState('');
  const [notes, setNotes] = useState(editEvent?.notes || '');
  const [involvedParties, setInvolvedParties] = useState(editEvent?.involved_parties || '');
  const [startTime, setStartTime] = useState(
    editEvent?.start_time
      ? new Date(editEvent.start_time).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    editEvent?.end_time
      ? new Date(editEvent.end_time).toISOString().slice(0, 16)
      : ''
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch tags from API
  useEffect(() => {
    const fetchTags = async () => {
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
          setAvailableTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      } finally {
        setLoadingTags(false);
      }
    };

    if (open) {
      fetchTags();
    }
  }, [open]);

  // Update form state when editEvent changes
  useEffect(() => {
    if (editEvent) {
      setSelectedTags(editEvent.tags || []);
      setNotes(editEvent.notes || '');
      setInvolvedParties(editEvent.involved_parties || '');
      setStartTime(
        editEvent.start_time
          ? new Date(editEvent.start_time).toISOString().slice(0, 16)
          : new Date().toISOString().slice(0, 16)
      );
      setEndTime(
        editEvent.end_time
          ? new Date(editEvent.end_time).toISOString().slice(0, 16)
          : ''
      );
      // Note: photos can't be pre-populated from URLs, would need special handling
    } else {
      // Reset form for new event
      setSelectedTags([]);
      setNotes('');
      setInvolvedParties('');
      setStartTime(new Date().toISOString().slice(0, 16));
      setEndTime('');
      setPhotos([]);
    }
    setTagSearch('');
  }, [editEvent]);

  // Filter tags based on search
  const filteredTags = availableTags
    .filter((tag) => tag.name.toLowerCase().includes(tagSearch.toLowerCase()))
    .filter((tag) => !selectedTags.some(st => st.id === tag.id)); // Don't show already selected tags

  const addTag = (tag: Tag) => {
    setSelectedTags((prev) => [...prev, tag]);
    setTagSearch(''); // Clear search after adding
  };

  const removeTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((t) => t.id !== tagId));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (status: 'draft' | 'submitted') => {
    setSaving(true);
    try {
      const eventData: EventFormData = {
        start_time: new Date(startTime).toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        tag_ids: selectedTags.map(t => t.id), // Convert Tag[] to tag IDs
        notes,
        involved_parties: involvedParties || null,
        status,
      };

      await onSave(eventData, status);
      onCancel(); // This will trigger form reset via useEffect
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            {editEvent ? 'Edit Event' : 'Log New Event'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Time Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-sm font-medium">
                Start Time *
              </Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-sm font-medium">
                End Time <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-10"
                placeholder="Leave empty if still in progress"
              />
            </div>
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Event Tags</Label>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-md">
                {selectedTags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-1">
                    <TagBadge tag={tag} size="md" />
                    <button
                      type="button"
                      onClick={() => removeTag(tag.id)}
                      className="rounded-sm p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Tag Search */}
            <div className="space-y-2">
              <Input
                type="text"
                placeholder={loadingTags ? "Loading tags..." : "Search tags..."}
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-10"
                disabled={loadingTags}
              />

              {/* Filtered Tag Results */}
              {tagSearch && (
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {loadingTags ? (
                    <div className="p-3 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : availableTags.length === 0 ? (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No tags available. Ask an admin to create tags in Settings.
                    </div>
                  ) : filteredTags.length > 0 ? (
                    <div className="p-1">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm transition-colors flex items-center gap-2"
                        >
                          <TagBadge tag={tag} size="sm" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No tags found matching &quot;{tagSearch}&quot;
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedTags.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what happened..."
              className="min-h-[100px]"
            />
          </div>

          {/* Involved Parties Section */}
          <div className="space-y-2">
            <Label htmlFor="involved-parties" className="text-sm font-medium">
              Involved Parties <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="involved-parties"
              value={involvedParties}
              onChange={(e) => setInvolvedParties(e.target.value)}
              placeholder="Names, IDs, or other identifiers"
              className="h-10"
            />
          </div>

          {/* Photos Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Photos <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>

            <div>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              <label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10"
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  asChild
                >
                  <span>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Photos
                  </span>
                </Button>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={() => handleSave('submitted')}
              className="flex-1 h-10"
              disabled={selectedTags.length === 0 || !notes.trim() || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Submit Event'
              )}
            </Button>
            <Button
              onClick={() => handleSave('draft')}
              variant="outline"
              className="flex-1 h-10"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save as Draft'
              )}
            </Button>
            <Button
              onClick={onCancel}
              variant="ghost"
              className="sm:w-auto h-10"
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
