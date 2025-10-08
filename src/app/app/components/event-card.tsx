import { Event } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDuration, getEventDuration } from '@/lib/mock-data';
import { Clock, FileText, User } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  showOfficer?: boolean;
}

export function EventCard({ event, onClick, showOfficer = false }: EventCardProps) {
  const duration = getEventDuration(event);
  const durationText = formatDuration(duration);
  const startTime = new Date(event.start_time).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  // Truncate notes to first 100 characters for preview
  const notesPreview =
    event.notes.length > 100 ? `${event.notes.substring(0, 100)}...` : event.notes;

  return (
    <Card
      className="transition-all hover:shadow-md hover:border-primary/50 cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-6">
        {/* Header: Time and Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{startTime}</span>
            <span>•</span>
            <span>{durationText}</span>
          </div>
          <Badge
            variant={event.status === 'draft' ? 'secondary' : 'default'}
            className="text-xs"
          >
            {event.status === 'draft' ? 'Draft' : 'Submitted'}
          </Badge>
        </div>

        {/* Officer Name (for admin view) */}
        {showOfficer && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{event.officer_name}</span>
          </div>
        )}

        {/* Tags */}
        {event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {event.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Notes Preview */}
        {event.notes && (
          <div className="flex items-start gap-2 text-sm">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground line-clamp-2">{notesPreview}</p>
          </div>
        )}

        {/* Involved Parties */}
        {event.involved_parties && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Involved:</span> {event.involved_parties}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
