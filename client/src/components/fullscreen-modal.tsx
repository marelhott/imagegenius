import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  onClose: () => void;
}

export default function FullscreenModal({ isOpen, imageUrl, onClose }: FullscreenModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      data-testid="fullscreen-modal"
    >
      <div className="relative max-w-full max-h-full">
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute -top-12 right-0 text-white hover:text-gray-300 hover:bg-transparent"
          data-testid="button-close-modal"
        >
          <X className="h-6 w-6" />
        </Button>
        <img
          src={imageUrl}
          alt="Fullscreen náhled"
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
