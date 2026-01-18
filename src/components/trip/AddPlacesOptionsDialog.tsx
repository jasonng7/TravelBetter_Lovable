import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface AddPlacesOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  destination: string;
  dayNumber: number;
}

export function AddPlacesOptionsDialog({
  open,
  onOpenChange,
  destination,
  dayNumber,
}: AddPlacesOptionsDialogProps) {
  const navigate = useNavigate();

  const handleGenerateWithAI = () => {
    onOpenChange(false);
    // Navigate to create page with destination pre-filled
    navigate(`/create?destination=${encodeURIComponent(destination)}`);
  };

  const handleAddManually = () => {
    onOpenChange(false);
    toast.info('Manual place search coming soon!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Places to Day {dayNumber}</DialogTitle>
          <DialogDescription>
            Choose how you'd like to add places to your itinerary
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left"
            onClick={handleGenerateWithAI}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="font-medium">Generate with AI</p>
                <p className="text-sm text-muted-foreground">
                  Get personalized place suggestions for {destination}
                </p>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4 text-left"
            onClick={handleAddManually}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Add Manually</p>
                <p className="text-sm text-muted-foreground">
                  Search and browse places to add
                </p>
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
