"use client";
import { useState, useEffect } from "react";
import { Upload, Loader2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner"
import Navbar from "@/components/Navbar/Navbar";
import { useAxios } from "@/hooks/use-Axios";

interface PredictionResponse {
  prediction: string;
  recommendation: string;
}

const DiseasePrediction = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<{
    disease: string;
    recommendations: string;
  } | null>(null);

  const {
    data: predictionData,
    error: predictionError,
    loaded: predictionLoaded,
    callAPI: callPredictionAPI,
  } = useAxios<PredictionResponse>();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload an image smaller than 5MB.",
        })
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredict = async () => {
    if (!selectedImage) return;

    setError(null);
    setIsLoading(true);

    const URL = process.env.NEXT_PUBLIC_DISEASE_PREDICTION_URL;
    try{
      if(!URL) {
        toast.error("Disease Prediction API is not defined");
        setIsLoading(false);
        return;
      } 
      if (!imageFile) {
        toast.error("No image file selected");
        setIsLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await callPredictionAPI(URL, "POST", formData, {
        "Content-Type": "multipart/form-data",
      });

      // useAxios hook sets data, error, and loaded state. We can react to it.
      // This part of the logic will be handled by a useEffect hook watching predictionData and predictionError.

    }
    catch(err) {
      toast.error("Something went wrong");
      setError("An unexpected error occurred during prediction.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscardImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the label's default file-picker behavior
    e.preventDefault();
    e.stopPropagation();

    setSelectedImage(null);
    setImageFile(null);
    setPrediction(null);
    setError(null);
    (document.getElementById('image-upload') as HTMLInputElement).value = '';
  };

  useEffect(() => {
    if (predictionLoaded) {
      setIsLoading(false);
      if (predictionData) {
        setPrediction({
          disease: predictionData.prediction,
          recommendations: predictionData.recommendation,
        });
        toast.success("Prediction Complete");
      } else if (predictionError) {
        setError(predictionError);
        toast.error("Prediction Failed", { description: predictionError });
      }
    }
  }, [predictionLoaded, predictionData, predictionError]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-4xl font-bold text-foreground" style={{color: '#093419'}}>Crop Disease Prediction</h1>
            <p className="text-muted-foreground" style={{color: '#527A61'}}>Upload an image of your crop to detect diseases and get recommendations</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6 shadow-medium">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Upload Image</h2>
              
              <div className="space-y-4">
                <label
                  htmlFor="image-upload"
                  className="group relative flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 transition-all hover:border-primary hover:bg-muted/50"
                >
                  {selectedImage ? (
                    <>
                      <img
                        src={selectedImage}
                        alt="Uploaded crop"
                        className="h-full w-full rounded-lg object-cover"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 rounded-full bg-background/70 hover:bg-background/90"
                        onClick={handleDiscardImage}
                        title="Discard image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground transition-colors group-hover:text-green-700" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>

                <Button
                  onClick={handlePredict}
                  disabled={!selectedImage || isLoading}
                  className="w-full bg-green-500 shadow-soft transition-all hover:bg-green-600 cursor-pointer"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Predict Disease"
                  )}
                </Button>
              </div>
            </Card>

            <Card className="p-6 shadow-medium">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Results</h2>
              
              {isLoading === false && prediction ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="rounded-lg bg-blue-50/50 p-4 border">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-1 h-5 w-5 text-primary" />
                      <div>
                        <h3 className="font-semibold text-foreground">Detected Disease</h3>
                        {prediction.disease === "No disease detected" ? <p className="mt-1 text-lg font-bold text-green-600">{prediction.disease}</p> :
                        <p className="mt-1 text-lg font-bold text-red-600">{prediction.disease}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-blue-50/25 p-4">
                    <h3 className="mb-2 font-semibold text-foreground">Recommendations</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {prediction.recommendations}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="mt-4 text-sm text-muted-foreground">Analyzing your image...</p>
                    </>
                  ) : error ? (
                    <div className="text-center text-destructive">
                      <AlertCircle className="mx-auto h-8 w-8" />
                      <p className="mt-4 font-semibold">Prediction Failed</p>
                      <p className="mt-2 text-sm">{error}</p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground">
                      Upload an image and click predict to see results
                    </p>
                  )}
                </div>

              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DiseasePrediction;