import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/navigation/BottomNav';
import { TripCard } from '@/components/trip/TripCard';
import { sampleTrips } from '@/data/sampleTrips';
import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Plus, Plane, Trash2, X, Loader2 } from 'lucide-react';
import { useSavedTrips } from '@/hooks/useSavedTrips';
import { useUserTrips, UserTrip } from '@/hooks/useUserTrips';
import { useBatchDeleteTrips } from '@/hooks/useTripMutations';
import { cn } from '@/lib/utils';

// Convert UserTrip from DB to Trip format for TripCard
function mapUserTripToTrip(userTrip: UserTrip): Trip {
  return {
    id: userTrip.id,
    title: userTrip.title,
    destination: userTrip.destination,
    country: userTrip.country,
    duration: userTrip.duration,
    coverImage: userTrip.cover_image || 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=800',
    author: {
      id: 'current-user',
      name: 'You',
      username: 'you',
      avatar: '',
    },
    remixCount: 0,
    viewCount: 0,
    createdAt: userTrip.created_at,
    itinerary: [],
    tags: [],
  };
}

export default function TripsPage() {
  const navigate = useNavigate();
  const { data: savedTripIds = [], isLoading: isSavedLoading } = useSavedTrips();
  const { data: userTrips = [], isLoading: isUserTripsLoading } = useUserTrips();
  const batchDelete = useBatchDeleteTrips();
  const [activeTab, setActiveTab] = useState('created');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedTripIds, setSelectedTripIds] = useState<Set<string>>(new Set());

  // Created trips from database
  const createdTrips = userTrips.filter(t => !sampleTrips.some(st => st.id === t.id)).map(mapUserTripToTrip);
  
  // Remixed trips: user trips that have a remixed_from_id (would need to extend UserTrip type)
  // For now, show sample remixed trips as placeholder
  const remixedTrips = sampleTrips.filter(t => t.remixedFrom);
  
  // Saved trips from database
  const savedTrips = sampleTrips.filter(t => savedTripIds.includes(t.id));
  
  const isLoading = isSavedLoading || isUserTripsLoading;

  const toggleSelection = (tripId: string) => {
    setSelectedTripIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        newSet.add(tripId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedTripIds.size === 0) return;
    
    await batchDelete.mutateAsync(Array.from(selectedTripIds));
    setSelectedTripIds(new Set());
    setIsSelectionMode(false);
  };

  const cancelSelection = () => {
    setSelectedTripIds(new Set());
    setIsSelectionMode(false);
  };

  const EmptyState = ({ message, cta }: { message: string; cta?: string }) => (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      <Plane className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <p className="text-muted-foreground">{message}</p>
      {cta && (
        <Button 
          variant="link" 
          className="mt-2 text-primary"
          onClick={() => navigate('/create')}
        >
          {cta}
        </Button>
      )}
    </Card>
  );

  const renderTripCard = (trip: Trip, showActions: boolean = false) => {
    const isSelected = selectedTripIds.has(trip.id);
    
    return (
      <div key={trip.id} className="relative">
        {isSelectionMode && (
          <div 
            className="absolute left-3 top-3 z-10"
            onClick={(e) => {
              e.stopPropagation();
              toggleSelection(trip.id);
            }}
          >
            <Checkbox 
              checked={isSelected}
              className={cn(
                "h-6 w-6 bg-white shadow-md border-2",
                isSelected && "bg-primary border-primary"
              )}
            />
          </div>
        )}
        <div className={cn(
          "transition-all",
          isSelectionMode && isSelected && "ring-2 ring-primary rounded-xl"
        )}>
          <TripCard 
            trip={trip} 
            onClick={() => {
              if (isSelectionMode) {
                toggleSelection(trip.id);
              } else {
                navigate(`/trip/${trip.id}`);
              }
            }}
            showActions={showActions && !isSelectionMode}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between border-b px-4 py-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Trips</h1>
        </div>
        <div className="flex items-center gap-2">
          {isSelectionMode ? (
            <>
              <span className="text-sm text-muted-foreground">
                {selectedTripIds.size} selected
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={cancelSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {createdTrips.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsSelectionMode(true)}
                >
                  Select
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full" 
                onClick={() => navigate('/create')}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b px-4">
          <TabsList className="w-full justify-start gap-4 bg-transparent h-12">
            <TabsTrigger 
              value="created" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0"
            >
              Created
            </TabsTrigger>
            <TabsTrigger 
              value="remixed"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0"
            >
              Remixed
            </TabsTrigger>
            <TabsTrigger 
              value="saved"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-0"
            >
              Saved
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="created" className="p-4">
          {createdTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {createdTrips.map((trip) => renderTripCard(trip, true))}
            </div>
          ) : (
            <EmptyState 
              message="You haven't created any trips yet" 
              cta="Create your first trip"
            />
          )}
        </TabsContent>

        <TabsContent value="remixed" className="p-4">
          {remixedTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {remixedTrips.map((trip) => renderTripCard(trip, true))}
            </div>
          ) : (
            <EmptyState 
              message="You haven't remixed any trips yet" 
              cta="Explore trips to remix"
            />
          )}
        </TabsContent>

        <TabsContent value="saved" className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : savedTrips.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {savedTrips.map((trip) => renderTripCard(trip, false))}
            </div>
          ) : (
            <EmptyState 
              message="No saved trips yet" 
              cta="Explore trips to save"
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Floating Delete Button */}
      {isSelectionMode && selectedTripIds.size > 0 && (
        <div className="fixed bottom-24 left-4 right-4 z-50">
          <Button 
            variant="destructive" 
            className="w-full gap-2 rounded-xl py-6"
            onClick={handleBatchDelete}
            disabled={batchDelete.isPending}
          >
            {batchDelete.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            Delete {selectedTripIds.size} Trip{selectedTripIds.size > 1 ? 's' : ''}
          </Button>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}