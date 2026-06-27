import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw, X, Download } from "lucide-react";
import { useState } from "react";

interface ImageLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  imageAlt: string;
}

export default function ImageLightbox({ isOpen, onOpenChange, imageUrl, imageAlt }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) handleReset();
    }}>
      <DialogContent className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[50vw] p-0 overflow-hidden bg-black/95 border-none text-white flex flex-col items-center justify-center rounded-3xl group">
        
        {/* Floating Top Bar Controls */}
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-white/80 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 select-none">
            Pratinjau Foto Full-Size Buket 📸
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 shadow-lg"
              onClick={handleZoomIn}
              title="Perbesar"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 shadow-lg"
              onClick={handleZoomOut}
              title="Perkecil"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/10 shadow-lg"
              onClick={handleRotate}
              title="Putar Foto"
            >
              <RotateCw className="h-4 w-4" />
            </Button>
            {scale !== 1 || rotation !== 0 ? (
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full text-xs h-9 bg-black/50 hover:bg-black/80 text-white border border-white/10 px-3 font-semibold shadow-lg"
                onClick={handleReset}
              >
                Reset
              </Button>
            ) : null}
            <Button
              size="icon"
              variant="destructive"
              className="h-9 w-9 rounded-full shadow-lg"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Display Frame */}
        <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center overflow-hidden p-6 bg-radial-gradient">
          <div 
            className="transition-transform duration-200 ease-out max-w-full max-h-full flex items-center justify-center"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              className="max-w-[85vw] max-h-[70vh] rounded-2xl object-contain shadow-2xl border border-white/5"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Floating Bottom Bar Info */}
        <div className="w-full bg-black/60 p-4 border-t border-white/10 backdrop-blur-md flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="text-center md:text-left select-none">
            <h4 className="font-bold text-sm text-white">{imageAlt || "Katalog Buket Indah"}</h4>
            <p className="text-[11px] text-white/50 mt-0.5">Gunakan tombol kontrol di kanan atas untuk memutar atau memperbesar detail buket.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="rounded-full border-white/20 hover:bg-white/10 text-white font-semibold text-xs h-9"
            onClick={() => {
              const link = document.createElement("a");
              link.href = imageUrl;
              link.download = `buket_${imageAlt.toLowerCase().replace(/\s+/g, "_")}.png`;
              link.target = "_blank";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            <Download className="mr-2 h-3.5 w-3.5" /> Unduh Gambar
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
