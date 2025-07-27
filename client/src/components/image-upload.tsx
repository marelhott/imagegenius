import { useRef, useState } from "react";
import { CloudUpload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
        data-testid="input-file"
      />
      
      {preview ? (
        <div className="relative w-full h-full rounded-xl overflow-hidden" data-testid="image-preview">
          <img
            src={preview}
            alt="Náhled"
            className="w-full h-full object-cover"
          />
          <Button
            onClick={clearImage}
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            data-testid="button-clear-image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
            dragActive 
              ? 'border-[#6C63FF] bg-[#6C63FF]/5' 
              : 'border-[#E5E7EB] bg-gray-50 hover:bg-gray-100'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          data-testid="dropzone"
        >
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors ${
              dragActive ? 'bg-[#6C63FF]/20' : 'bg-[#6C63FF]/10'
            }`}>
              <CloudUpload className="h-8 w-8 text-[#6C63FF]" />
            </div>
            <p className="text-[#111827] font-medium mb-2">
              Přetáhněte obrázek nebo klikněte pro nahrání
            </p>
            <p className="text-sm text-[#6B7280]">
              PNG, JPG, WEBP do 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
