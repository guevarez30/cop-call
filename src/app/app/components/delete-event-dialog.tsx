import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { EventStatus } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';

interface DeleteEventDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventStatus: EventStatus;
  isAdmin: boolean;
  deleting?: boolean;
}

export function DeleteEventDialog({
  open,
  onClose,
  onConfirm,
  eventStatus,
  isAdmin,
  deleting = false,
}: DeleteEventDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isSubmitted = eventStatus === 'submitted';
  const canDelete = confirmText.toLowerCase() === 'delete';

  // Reset confirmation text when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setConfirmText('');
    }
  }, [open]);

  const handleConfirm = () => {
    if (canDelete) {
      onConfirm();
      setConfirmText('');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSubmitted && isAdmin ? 'Delete Submitted Event?' : 'Delete Draft?'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              {isSubmitted && isAdmin ? (
                <>
                  <span className="font-semibold text-destructive">Warning: This action is permanent.</span>
                  <br />
                  <br />
                  You are about to delete a submitted event. This action cannot be undone.
                </>
              ) : (
                <>
                  You are about to delete this event. This action cannot be undone.
                  <br />
                  <br />
                  <span className="font-medium">If you want to keep this draft for later, click Cancel and leave it unsubmitted.</span>
                </>
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Type <span className="font-mono font-bold">delete</span> to confirm:
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type delete"
                className="font-mono"
                disabled={deleting}
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={deleting || !canDelete}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
