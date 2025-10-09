'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertTriangle } from 'lucide-react';

interface DeleteTagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tagName: string;
  isLoading: boolean;
}

export function DeleteTagDialog({
  open,
  onOpenChange,
  onConfirm,
  tagName,
  isLoading,
}: DeleteTagDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Delete Tag
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm you want to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The tag <strong>&quot;{tagName}&quot;</strong> will be permanently deleted. This tag will no
              longer be available when logging new events.
            </AlertDescription>
          </Alert>

          <p className="text-sm text-muted-foreground">
            Note: This will not affect events that already have this tag assigned.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete Tag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
