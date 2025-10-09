'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tag as TagIcon, Plus, MoreVertical, Loader2, Pencil, Trash2, HelpCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { AddTagDialog } from './add-tag-dialog';
import { EditTagDialog } from './edit-tag-dialog';
import { DeleteTagDialog } from './delete-tag-dialog';
import { TagHelpDrawer } from './tag-help-drawer';
import { TagBadge } from '@/components/tag-badge';
import { Tag } from '@/lib/types';

export function TagList() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  const fetchTags = async () => {
    setLoading(true);
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
        setTags(data.tags || []);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (tag: Tag) => {
    setSelectedTag(tag);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTag) return;

    setDeletingTagId(selectedTag.id);
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(`/api/tags/${selectedTag.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        toast.success('Tag deleted successfully');
        setDeleteDialogOpen(false);
        setSelectedTag(null);
        fetchTags();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDeletingTagId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <TagIcon className="h-5 w-5" />
                <CardTitle className="text-xl">Event Tags</CardTitle>
              </div>
              <button
                type="button"
                onClick={() => setHelpDrawerOpen(true)}
                className="flex items-center gap-1.5 text-sm text-primary hover:underline w-fit"
              >
                <HelpCircle className="h-4 w-4" />
                What is a tag?
              </button>
            </div>
            <Button
              size="default"
              className="h-11 w-full sm:w-auto"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </div>
          <CardDescription className="text-base">
            Manage event tags available to officers when logging activities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TagIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-base">No tags created yet</p>
              <p className="text-sm mt-1">Create tags to help officers categorize events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-2 min-w-0">
                    <TagBadge tag={tag} size="md" />
                    {tag.description && (
                      <p className="text-sm text-muted-foreground">{tag.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-11 w-11">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit Tag
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(tag)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Tag
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddTagDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onTagAdded={fetchTags}
      />

      <EditTagDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTagUpdated={fetchTags}
        tag={selectedTag}
      />

      {selectedTag && (
        <DeleteTagDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          tagName={selectedTag.name}
          isLoading={deletingTagId === selectedTag.id}
        />
      )}

      <TagHelpDrawer open={helpDrawerOpen} onOpenChange={setHelpDrawerOpen} />
    </>
  );
}
