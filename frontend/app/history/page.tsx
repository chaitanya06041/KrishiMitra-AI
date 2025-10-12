'use client'
import { useEffect, useState } from "react";
import { Calendar, Trash2, AlertCircle, ChevronDown, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner"
import Navbar from "@/components/Navbar/Navbar";

// --- NEW IMPORTS ---
import { useSelector, useDispatch } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import { selectUserProfile } from "@/store/features/userSlice";
// --------------------

// --- INTERFACE MATCHES SUPABASE TABLE ---
interface PredictionHistory {
  history_id: string;
  user_id: string;
  disease: string;
  recommendation: string;
  image_url: string;
  created_at: string; // Supabase timestamp is a string
}
// ----------------------------------------

const History = () => {
  // --- NEW: Supabase client and user from Redux ---
  const supabase = createClient();
  const user = useSelector(selectUserProfile)
  // -------------------------------------------------

  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true); // To show loading state
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- UPDATED: Fetch data from Supabase on component mount ---
  useEffect(() => {
    const fetchHistory = async () => {
      // Don't fetch if the user isn't loaded yet
      if (!user) {
        setIsLoading(false);
        return;
      }
      console.log("user: ", user);
      

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('history')
          .select('*')
          .eq('user_id', user.user_id)
          .order('created_at', { ascending: false }); // Show newest first

        if (error) throw error;
        console.log("data: ", data);
        
        setHistory(data || []);

      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Failed to load your prediction history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user, supabase]); // Re-fetch if user changes
  // -------------------------------------------------------------

  // --- UPDATED: Delete a single item from Supabase ---
  const handleDelete = async (historyId: string) => {
    // Optimistic UI update for a better user experience
    const originalHistory = [...history];
    const updatedHistory = history.filter((item) => item.history_id !== historyId);
    setHistory(updatedHistory);

    try {
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('history_id', historyId);

      if (error) throw error;
      
      toast.success("Prediction removed from history");

    } catch (error) {
      console.error("Error deleting history item:", error);
      toast.error("Failed to remove prediction. Please try again.");
      setHistory(originalHistory); // Revert state on failure
    }
  };
  // -------------------------------------------------------

  // --- UPDATED: Clear all items for the user from Supabase ---
  const handleClearAll = async () => {
    if (!user) return; // Should not happen if button is visible, but good practice

    try {
        const { error } = await supabase
            .from('history')
            .delete()
            .eq('user_id', user.user_id);

        if (error) throw error;
        
        setHistory([]); // Clear state on success
        toast.success("All prediction history has been cleared");

    } catch (error) {
        console.error("Error clearing history:", error);
        toast.error("Failed to clear history. Please try again.");
    }
  };
  // -----------------------------------------------------------

  // Now accepts a string (ISO 8601 format from Supabase)
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-IN", { // Changed to en-IN based on your location
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-3 text-4xl font-bold text-foreground">Prediction History</h1>
              <p style={{color: '#527A61'}}>
                View all your crop disease predictions
              </p>
            </div>
            {history.length > 0 && !isLoading && (
              <Button
                variant="destructive"
                onClick={handleClearAll}
                className="shadow-soft"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : history.length === 0 ? (
            <Card className="p-12 text-center shadow-medium">
              <AlertCircle
                className="mx-auto mb-4 h-16 w-16 text-muted-foreground"
                style={{ color: "hsl(142, 20%, 40%)" }}
              />
              <h2 className="mb-2 text-2xl font-semibold text-foreground">
                No Predictions Yet
              </h2>
              <p style={{color: '#527A61'}}>
                Your disease predictions will appear here once you start using the prediction tool
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                // --- UPDATED JSX with new property names ---
                <Card key={item.history_id} className="overflow-hidden shadow-medium">
                  <div className="flex items-start gap-4 p-4">
                    <img
                      src={item.image_url}
                      alt="Crop"
                      onClick={() => setPreviewImage(item.image_url)}
                      className="h-24 w-24 cursor-pointer rounded-lg object-cover shadow-soft transition-transform hover:scale-105"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.disease}</h3>
                          <p className="text-sm" style={{color: '#527A61'}}>
                            <Calendar className="mr-1 inline h-3 w-3" />
                            {formatDate(item.created_at)}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.history_id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === item.history_id ? null : item.history_id)}
                          className="flex w-full items-center justify-between p-2 text-left hover:bg-green-50/50 cursor-pointer"
                        >
                          <span className="text-sm font-medium">
                            {expandedId === item.history_id ? "Hide" : "Show"} Recommendations
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedId === item.history_id ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                        
                        {expandedId === item.history_id && (
                          <div className="mt-2 animate-accordion-down rounded-lg border border-border bg-green-50/50 p-4">
                            <p className="text-sm leading-relaxed text-green-700">
                              {item.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
                // ---------------------------------------------
              ))}
            </div>
          )}
        </div>

        <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
          <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
            <DialogDescription className="sr-only">
              A larger preview of the selected crop image.
            </DialogDescription>

            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewImage(null)}
                className="absolute -right-12 top-0 h-10 w-10 rounded-full bg-background/80 text-foreground backdrop-blur-sm hover:bg-background"
              >
                <X className="h-5 w-5" />
              </Button>
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-h-[85vh] w-full rounded-lg object-contain shadow-lg"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default History;