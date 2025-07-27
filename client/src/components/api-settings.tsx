import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings, CheckCircle, XCircle, Loader } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiSettingsProps {
  apiUrl: string;
  onApiUrlChange: (url: string) => void;
}

export default function ApiSettings({ apiUrl, onApiUrlChange }: ApiSettingsProps) {
  const [testUrl, setTestUrl] = useState(apiUrl);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testConnection = async () => {
    if (!testUrl.trim()) {
      toast({
        title: "Chyba",
        description: "Zadejte prosím API URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${testUrl}/health`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsConnected(true);
        toast({
          title: "Připojení úspěšné",
          description: `Backend je dostupný. Model načten: ${data.model_loaded ? 'Ano' : 'Ne'}`,
        });
      } else {
        setIsConnected(false);
        toast({
          title: "Připojení selhalo",
          description: "Backend neodpovídá nebo není dostupný",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Chyba připojení",
        description: "Nepodařilo se připojit k backendu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiUrl = () => {
    onApiUrlChange(testUrl);
    toast({
      title: "API URL uloženo",
      description: "Nové API URL bylo nastaveno",
    });
  };

  return (
    <Card className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center mr-3">
          <Settings className="h-4 w-4 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-[#111827]">API Nastavení</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-[#111827] mb-2">
            RunPod API URL
          </Label>
          <Input
            type="url"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="https://your-pod-id-8000.proxy.runpod.net"
            className="w-full"
            data-testid="input-api-url"
          />
          <p className="text-xs text-[#6B7280] mt-1">
            Zadejte URL vašeho RunPod backendu
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
            data-testid="button-test-connection"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Testování...
              </>
            ) : (
              <>
                {isConnected === true && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
                {isConnected === false && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                Test připojení
              </>
            )}
          </Button>

          <Button
            onClick={saveApiUrl}
            disabled={!testUrl.trim() || isLoading}
            className="flex-1 bg-[#6C63FF] hover:bg-[#5B54E6]"
            data-testid="button-save-url"
          >
            Uložit URL
          </Button>
        </div>

        {isConnected !== null && (
          <div className={`p-3 rounded-lg text-sm ${
            isConnected 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {isConnected 
              ? '✅ Backend je připojen a funkční' 
              : '❌ Backend není dostupný - zkontrolujte URL a stav RunPod'
            }
          </div>
        )}
      </div>
    </Card>
  );
}