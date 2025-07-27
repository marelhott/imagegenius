import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import ImageUpload from "@/components/image-upload";
import SettingsPanel from "@/components/settings-panel";
import FullscreenModal from "@/components/fullscreen-modal";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GenerationSettings {
  model: string;
  sampler: string;
  cfgScale: number;
  steps: number;
  denoiseStrength: number;
}

export default function Home() {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    model: "stable-diffusion-xl",
    sampler: "dpm-2m-karras",
    cfgScale: 7.5,
    steps: 20,
    denoiseStrength: 0.75,
  });

  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: { image: File; settings: GenerationSettings }) => {
      const formData = new FormData();
      formData.append('image', data.image);
      formData.append('settings', JSON.stringify(data.settings));
      
      const response = await apiRequest('POST', '/api/generate', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setOutputImage(data.outputUrl);
      toast({
        title: "Generování dokončeno",
        description: "Váš obrázek byl úspěšně vygenerován.",
      });
    },
    onError: (error) => {
      toast({
        title: "Chyba při generování",
        description: "Nepodařilo se vygenerovat obrázek. Zkuste to prosím znovu.",
        variant: "destructive",
      });
      console.error('Generation error:', error);
    },
  });

  const handleGenerate = () => {
    if (!inputImage) {
      toast({
        title: "Chybí vstupní obrázek",
        description: "Prosím nahrajte obrázek před generováním.",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({ image: inputImage, settings });
  };

  const handleImageUpload = (file: File) => {
    setInputImage(file);
    setOutputImage(null); // Reset output when new image is uploaded
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] font-inter">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#111827] mb-3">AI Image Forge</h1>
          <p className="text-lg text-[#6B7280] font-medium">
            Jednoduchý nástroj pro převod obrázků pomocí AI
          </p>
        </header>

        {/* Image Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Image Box */}
          <Card className="p-6 h-[480px] flex flex-col bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111827]">Vstupní obrázek</h3>
            </div>
            <ImageUpload onImageUpload={handleImageUpload} />
          </Card>

          {/* Output Image Box */}
          <Card className="p-6 h-[480px] flex flex-col bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#111827]">Vygenerovaný obrázek</h3>
            </div>
            
            <div 
              className="flex-1 border border-[#E5E7EB] rounded-xl flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => outputImage && setIsFullscreen(true)}
              data-testid="output-container"
            >
              {generateMutation.isPending ? (
                <div className="text-center" data-testid="loading-state">
                  <div className="w-16 h-16 bg-[#6C63FF]/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Wand2 className="h-8 w-8 text-[#6C63FF] animate-spin" />
                  </div>
                  <p className="text-[#111827] font-medium mb-2">Generování...</p>
                  <div className="w-32 h-2 bg-gray-200 rounded-full mx-auto">
                    <div className="h-2 bg-[#6C63FF] rounded-full animate-pulse w-[45%]"></div>
                  </div>
                </div>
              ) : outputImage ? (
                <div className="w-full h-full rounded-xl overflow-hidden" data-testid="output-result">
                  <img 
                    src={outputImage} 
                    alt="Vygenerovaný obrázek" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ) : (
                <div className="text-center" data-testid="output-placeholder">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wand2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-[#6B7280]">Výsledek se zobrazí zde</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Generate Button */}
        <div className="text-center mb-12">
          <Button
            onClick={handleGenerate}
            disabled={!inputImage || generateMutation.isPending}
            className="bg-[#6C63FF] hover:bg-[#5B54E6] text-white text-xl font-semibold px-16 py-4 h-[60px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="button-generate"
          >
            <Wand2 className="mr-3 h-6 w-6" />
            {generateMutation.isPending ? "Generování..." : "Generovat"}
          </Button>
        </div>

        {/* Settings Panel */}
        <SettingsPanel settings={settings} onSettingsChange={setSettings} />

        {/* Fullscreen Modal */}
        <FullscreenModal
          isOpen={isFullscreen}
          imageUrl={outputImage}
          onClose={() => setIsFullscreen(false)}
        />
      </div>
    </div>
  );
}
