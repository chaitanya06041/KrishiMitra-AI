'use client'
import { useEffect, useState } from "react";
import { Calendar, Trash2, AlertCircle, ChevronDown, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner"
import Navbar from "@/components/Navbar/Navbar";

interface PredictionHistory {
  id: string;
  disease: string;
  recommendations: string;
  imageUrl: string;
  timestamp: number;
}

const History = () => {
  const [history, setHistory] = useState<PredictionHistory[]>([
    {
        id: "1",
      disease: "Sample: Late Blight (Phytophthora infestans)",
      recommendations:
        "This is a sample recommendation. Late blight is a serious fungal disease. To manage it, remove and destroy infected plants, apply fungicides, ensure good air circulation, and avoid overhead watering.",
      imageUrl:
        "https://www.gardeningknowhow.com/wp-content/uploads/2021/06/tomato-late-blight.jpg",
      timestamp: Date.now(),
    }
  ]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const { toast } = useToast();

  useEffect(() => {
    const savedHistory = localStorage.getItem("predictionHistory");
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleDelete = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("predictionHistory", JSON.stringify(updatedHistory));
    toast.success("Prediction removed from history");
  };

  const handleClearAll = () => {
    setHistory([]);
    localStorage.removeItem("predictionHistory");
    toast.success("All prediction history has been cleared");
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
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
            {history.length > 0 && (
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

          {history.length === 0 ? (
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
                <Card key={item.id} className="overflow-hidden shadow-medium">
                  <div className="flex items-start gap-4 p-4">
                    <img
                      src={item.imageUrl}
                      alt="Crop"
                      onClick={() => setPreviewImage(item.imageUrl)}
                      className="h-24 w-24 cursor-pointer rounded-lg object-cover shadow-soft transition-transform hover:scale-105"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{item.disease}</h3>
                          <p className="text-sm" style={{color: '#527A61'}}>
                            <Calendar className="mr-1 inline h-3 w-3" />
                            {formatDate(item.timestamp)}
                          </p>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          className="hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          className="flex w-full items-center justify-between p-2 text-left hover:bg-green-50/50 cursor-pointer"
                        >
                          <span className="text-sm font-medium">
                            {expandedId === item.id ? "Hide" : "Show"} Recommendations
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              expandedId === item.id ? "rotate-180" : ""
                            }`}
                          />
                        </Button>
                        
                        {expandedId === item.id && (
                          <div className="mt-2 animate-accordion-down rounded-lg border border-border bg-green-50/50 p-4">
                            <p className="text-sm leading-relaxed text-green-700">
                              {item.recommendations}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
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