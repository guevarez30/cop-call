import { Event } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration, getEventDuration } from '@/lib/mock-data';
import { Clock, FileText, User, Calendar, Users, Pencil, Trash2 } from 'lucide-react';
import { TagBadge } from '@/components/tag-badge';

interface EventDetailDialogProps {
  event: Event | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: (event: Event) => void;
  showOfficer?: boolean;
  isAdmin?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function EventDetailDialog({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
  showOfficer = false,
  isAdmin = false,
  canEdit = false,
  canDelete = false,
}: EventDetailDialogProps) {
  if (!event) return null;

  const isDraft = event.status === 'draft';
  const showEditButton = canEdit && isDraft && onEdit;
  const showDeleteButton = canDelete && onDelete;

  const duration = getEventDuration(event);
  const durationText = formatDuration(duration);
  const startTime = new Date(event.start_time).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
  const endTime = event.end_time
    ? new Date(event.end_time).toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : 'In progress';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Event Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div>
            <Badge variant={event.status === 'draft' ? 'secondary' : 'default'}>
              {event.status === 'draft' ? 'Draft' : 'Submitted'}
            </Badge>
          </div>

          {/* Officer Name (for admin view) */}
          {showOfficer && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Officer</p>
                <p className="text-base font-medium">{event.officer_name}</p>
              </div>
            </div>
          )}

          {/* Time Information */}
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
              <p className="text-base">{startTime}</p>
              {event.end_time && (
                <p className="text-sm text-muted-foreground">Ended: {endTime}</p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duration</p>
              <p className="text-base">{durationText}</p>
            </div>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Event Tags</p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="md" />
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {event.notes && (
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                <p className="text-base whitespace-pre-wrap">{event.notes}</p>
              </div>
            </div>
          )}

          {/* Involved Parties */}
          {event.involved_parties && (
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Involved Parties</p>
                <p className="text-base">{event.involved_parties}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p>Created: {new Date(event.created_at).toLocaleString()}</p>
            <p>Last updated: {new Date(event.updated_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {(showEditButton || showDeleteButton) && (
          <DialogFooter className="gap-2 sm:gap-0">
            {showDeleteButton && (
              <Button
                variant="destructive"
                onClick={() => onDelete(event)}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
            {showEditButton && (
              <Button
                onClick={() => {
                  onEdit(event);
                  onClose();
                }}
                className="gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit Draft
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
