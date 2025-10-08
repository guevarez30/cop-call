'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MOCK_EVENT_TAGS } from '@/lib/mock-data';
import { Event } from '@/lib/types';
import { X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventFormProps {
  open: boolean;
  onCancel: () => void;
  onSave: (event: Partial<Event>, status: 'draft' | 'submitted') => void;
  editEvent?: Event | null;
}

export function EventForm({ open, onCancel, onSave, editEvent }: EventFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(editEvent?.tags || []);
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

  // Filter tags based on search
  const filteredTags = MOCK_EVENT_TAGS.filter((tag) =>
    tag.toLowerCase().includes(tagSearch.toLowerCase())
  ).filter((tag) => !selectedTags.includes(tag)); // Don't show already selected tags

  const addTag = (tag: string) => {
    setSelectedTags((prev) => [...prev, tag]);
    setTagSearch(''); // Clear search after adding
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    const eventData: Partial<Event> = {
      start_time: new Date(startTime).toISOString(),
      end_time: endTime ? new Date(endTime).toISOString() : null,
      tags: selectedTags,
      notes,
      involved_parties: involvedParties || null,
      status,
    };

    onSave(eventData, status);

    // Reset form
    setSelectedTags([]);
    setTagSearch('');
    setNotes('');
    setInvolvedParties('');
    setStartTime(new Date().toISOString().slice(0, 16));
    setEndTime('');
    setPhotos([]);

    onCancel();
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
                  <div
                    key={tag}
                    className="flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground rounded-md text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-primary/80 rounded-sm p-0.5"
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
                placeholder="Search tags..."
                value={tagSearch}
                onChange={(e) => setTagSearch(e.target.value)}
                className="h-10"
              />

              {/* Filtered Tag Results */}
              {tagSearch && (
                <div className="max-h-48 overflow-y-auto border rounded-md">
                  {filteredTags.length > 0 ? (
                    <div className="p-1">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="w-full text-left px-3 py-2 hover:bg-accent rounded-sm text-sm transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      No tags found
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
              disabled={selectedTags.length === 0 || !notes.trim()}
            >
              Submit Event
            </Button>
            <Button
              onClick={() => handleSave('draft')}
              variant="outline"
              className="flex-1 h-10"
            >
              Save as Draft
            </Button>
            <Button
              onClick={onCancel}
              variant="ghost"
              className="sm:w-auto h-10"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
