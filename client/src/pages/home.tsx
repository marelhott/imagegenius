import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wand2 } from "lucide-react";
import ImageUpload from "@/components/image-upload";
import SettingsPanel from "@/components/settings-panel";
import FullscreenModal from "@/components/fullscreen-modal";
import ApiSettings from "@/components/api-settings";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Výchozí API URL - pro lokální testování používá místní server, pro produkci RunPod
const DEFAULT_API_URL = window.location.hostname === 'localhost' || window.location.hostname.includes('replit') 
  ? 'http://localhost:5000/api' // Lokální fallback
  : "https://yox7ni5yqmlheu-8000.proxy.runpod.net"; // RunPod endpoint

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
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [settings, setSettings] = useState<GenerationSettings>({
    model: "stable-diffusion-xl-base-1.0",
    sampler: "Euler",
    cfgScale: 7.5,
    steps: 20,
    denoiseStrength: 0.75,
  });

  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (data: { image: File; settings: GenerationSettings }) => {
      const formData = new FormData();
      formData.append('image', data.image);
      formData.append('cfg_scale', data.settings.cfgScale.toString());
      formData.append('steps', data.settings.steps.toString());
      formData.append('strength', data.settings.denoiseStrength.toString());
      formData.append('prompt', ''); // Můžete přidat prompt pole později
      formData.append('negative_prompt', '');
      
      const response = await fetch(`${apiUrl}/img2img`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Získej blob obrázku
      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      return { outputUrl: imageUrl };
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
        description: "Nepodařilo se vygenerovat obrázek. Zkontrolujte připojení k backendu.",
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
          <h1 className="text-3xl font-bold text-[#111827] mb-3">AI Image Generator</h1>
          <p className="text-sm text-[#6B7280] font-medium">
            Img2Img • Powered by Stable Diffusion
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Input Image Box */}
            <Card className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center mr-3">
                  <span className="text-white text-sm">📤</span>
                </div>
                <h3 className="text-lg font-semibold text-[#111827]">Vstupní obrázek</h3>
              </div>
              <div className="h-[300px]">
                <ImageUpload onImageUpload={handleImageUpload} />
              </div>
              <p className="text-sm text-[#6B7280] mt-3">
                Podporované formáty: PNG, JPG, JPEG, WebP
              </p>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!inputImage || generateMutation.isPending}
              className="w-full bg-[#6C63FF] hover:bg-[#5B54E6] text-white text-lg font-semibold py-4 h-[56px] rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[#6C63FF]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-generate"
            >
              <Wand2 className="mr-3 h-5 w-5" />
              {generateMutation.isPending ? "Generování..." : "Generovat obrázek"}
            </Button>

            {/* Settings Panel */}
            <SettingsPanel settings={settings} onSettingsChange={setSettings} />

            {/* API Settings Panel */}
            <ApiSettings apiUrl={apiUrl} onApiUrlChange={setApiUrl} />
          </div>

          {/* Right Column - Output */}
          <div>
            <Card className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm h-[600px] flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center mr-3">
                  <span className="text-white text-sm">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-[#111827]">Vygenerovaný obrázek</h3>
              </div>
              
              <div 
                className="flex-1 border-2 border-dashed border-[#E5E7EB] rounded-xl flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
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
                    <p className="text-[#111827] font-medium mb-2">Zatím žádný obrázek</p>
                    <p className="text-sm text-[#6B7280]">
                      Nahrajte vstupní obrázek a klikněte na "Generovat<br />
                      obrázek" pro vytvoření nového obrázku
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

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
