'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { TagBadge } from '@/components/tag-badge';
import { Tag } from '@/lib/types';

interface TagHelpDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TagHelpDrawer({ open, onOpenChange }: TagHelpDrawerProps) {
  // Example tags for demonstration
  const simpleTagExamples: Tag[] = [
    {
      id: '1',
      name: 'COM',
      color: '#3B82F6',
      description: 'Complaint',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
    {
      id: '2',
      name: 'DUI',
      color: '#EF4444',
      description: 'Driving Under the Influence',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
    {
      id: '3',
      name: 'FSR',
      color: '#10B981',
      description: 'Field Service Report',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
  ];

  const groupedTagExamples: Tag[] = [
    {
      id: '4',
      name: 'traffic::accident',
      color: '#F59E0B',
      description: 'Traffic accident',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
    {
      id: '5',
      name: 'traffic::stop',
      color: '#F59E0B',
      description: 'Traffic stop',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
    {
      id: '6',
      name: 'traffic::violation',
      color: '#F59E0B',
      description: 'Traffic violation',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
    {
      id: '7',
      name: 'arrest::adult',
      color: '#8B5CF6',
      description: 'Adult arrest',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
    {
      id: '8',
      name: 'arrest::juvenile',
      color: '#8B5CF6',
      description: 'Juvenile arrest',
      created_at: '',
      updated_at: '',
      organization_id: '',
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">About Event Tags</SheetTitle>
          <SheetDescription className="text-base">
            Learn how to organize and use tags effectively
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* What are tags */}
          <section>
            <h3 className="text-lg font-semibold mb-2">What are tags?</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tags help officers quickly categorize and identify events. They provide a standardized
              way to label activities like traffic stops, arrests, complaints, and other incidents.
              Tags make it easier to search, filter, and report on events.
            </p>
          </section>

          {/* Simple Tags */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Simple Tags</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Simple tags use short codes or abbreviations that officers can quickly recognize and apply.
              These work well for unique event types that don't need grouping.
            </p>
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase">Examples</p>
              {simpleTagExamples.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3">
                  <TagBadge tag={tag} size="md" />
                  <span className="text-sm text-muted-foreground">— {tag.description}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Grouped Tags */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Grouped Tags</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              For related tags, use the <code className="px-1.5 py-0.5 bg-muted rounded text-xs">group::label</code> format.
              This creates a visual hierarchy where the group appears in a lighter shade and the label
              is emphasized. Group related tags together and use the same color for better organization.
            </p>
            <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground uppercase">Examples</p>
              {groupedTagExamples.map((tag) => (
                <div key={tag.id} className="flex items-center gap-3">
                  <TagBadge tag={tag} size="md" />
                  <span className="text-sm text-muted-foreground">— {tag.description}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Color Coordination */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Color Coordination</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use matching colors for related tags to create visual groupings. For example, use the
              same color for all traffic-related tags, another color for all arrest tags, etc. This
              makes it easier to scan and identify event categories at a glance.
            </p>
          </section>

          {/* Best Practices */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Keep tag names short and memorable</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Use consistent naming conventions across your department</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Group related tags with the same color and group prefix</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Add clear descriptions to help officers understand what each tag represents</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Review and standardize tags periodically to avoid duplicates</span>
              </li>
            </ul>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
