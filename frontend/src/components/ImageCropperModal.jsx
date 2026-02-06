import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImage } from "../utils/cropImage";

export default function ImageCropperModal({ imageSrc, onClose, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedArea) => {
    setCroppedAreaPixels(croppedArea);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedImage(imageSrc, croppedAreaPixels);
    onCropComplete(blob);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-4">
      <div className="card glass w-full max-w-lg p-4">
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-slate-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <button
            onClick={handleSave}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Save crop
          </button>
          <button
            onClick={onClose}
            className="rounded-2xl border border-white/60 bg-white/70 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

