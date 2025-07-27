import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings } from "lucide-react";

interface GenerationSettings {
  model: string;
  sampler: string;
  cfgScale: number;
  steps: number;
  denoiseStrength: number;
}

interface SettingsPanelProps {
  settings: GenerationSettings;
  onSettingsChange: (settings: GenerationSettings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: SettingsPanelProps) {
  const updateSetting = <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <Card className="p-6 bg-white border border-[#E5E7EB] rounded-2xl shadow-sm">
      <div className="flex items-center mb-6">
        <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center mr-3">
          <span className="text-white text-sm">⚙️</span>
        </div>
        <h3 className="text-lg font-semibold text-[#111827]">Parametry generování</h3>
      </div>
      
      <div className="space-y-6">
        {/* Model Selection */}
        <div>
          <Label className="block text-sm font-medium text-[#111827] mb-3">Model</Label>
          <Select
            value={settings.model}
            onValueChange={(value) => updateSetting('model', value)}
          >
            <SelectTrigger 
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/25 focus:border-[#6C63FF]"
              data-testid="select-model"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stable-diffusion-xl-base-1.0">stable-diffusion-xl-base-1.0</SelectItem>
              <SelectItem value="midjourney-v6">midjourney-v6</SelectItem>
              <SelectItem value="dall-e-3">dall-e-3</SelectItem>
              <SelectItem value="kandinsky-3">kandinsky-3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sampler Selection */}
        <div>
          <Label className="block text-sm font-medium text-[#111827] mb-3">Sampler</Label>
          <Select
            value={settings.sampler}
            onValueChange={(value) => updateSetting('sampler', value)}
          >
            <SelectTrigger 
              className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[#111827] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/25 focus:border-[#6C63FF]"
              data-testid="select-sampler"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Euler">Euler</SelectItem>
              <SelectItem value="dpm-2m-karras">DPM++ 2M Karras</SelectItem>
              <SelectItem value="euler-a">Euler A</SelectItem>
              <SelectItem value="dpm-adaptive">DPM Adaptive</SelectItem>
              <SelectItem value="heun">Heun</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CFG Scale Slider */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium text-[#111827]">CFG Scale</Label>
            <span className="text-sm font-semibold text-[#6C63FF] bg-[#6C63FF]/10 px-3 py-1 rounded-full">
              {settings.cfgScale}
            </span>
          </div>
          <Slider
            value={[settings.cfgScale]}
            onValueChange={(value) => updateSetting('cfgScale', value[0])}
            max={15}
            min={0}
            step={0.5}
            className="slider-thumb"
            data-testid="slider-cfg"
          />
          <div className="flex justify-between text-xs text-[#6B7280] mt-1">
            <span>0</span>
            <span>15</span>
          </div>
        </div>

        {/* Steps Slider */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium text-[#111827]">Steps</Label>
            <span className="text-sm font-semibold text-[#6C63FF] bg-[#6C63FF]/10 px-3 py-1 rounded-full">
              {settings.steps}
            </span>
          </div>
          <Slider
            value={[settings.steps]}
            onValueChange={(value) => updateSetting('steps', value[0])}
            max={50}
            min={1}
            step={1}
            className="slider-thumb"
            data-testid="slider-steps"
          />
          <div className="flex justify-between text-xs text-[#6B7280] mt-1">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        {/* Denoise Strength Slider */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <Label className="text-sm font-medium text-[#111827]">Denoise Strength</Label>
            <span className="text-sm font-semibold text-[#6C63FF] bg-[#6C63FF]/10 px-3 py-1 rounded-full">
              {settings.denoiseStrength}
            </span>
          </div>
          <Slider
            value={[settings.denoiseStrength]}
            onValueChange={(value) => updateSetting('denoiseStrength', value[0])}
            max={1}
            min={0}
            step={0.05}
            className="slider-thumb"
            data-testid="slider-denoise"
          />
          <div className="flex justify-between text-xs text-[#6B7280] mt-1">
            <span>0</span>
            <span>1</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
