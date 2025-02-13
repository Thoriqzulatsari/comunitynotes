import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus } from "lucide-react";
import { useState, useRef } from "react";

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
  accept?: string;
}

export function MediaUpload({
  onFileSelect,
  accept = "image/*,video/*",
}: MediaUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      onFileSelect(null);
      setPreview(null);
    }
  };

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileSelect(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="media">Media</Label>
        <Input
          id="media"
          type="file"
          accept={accept}
          ref={inputRef}
          onChange={handleFileSelect}
          className="cursor-pointer"
        />
      </div>

      {preview && (
        <div className="relative">
          {preview.startsWith("data:image") ? (
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg aspect-[4/3] object-cover"
            />
          ) : (
            <video
              src={preview}
              controls
              className="w-full rounded-lg aspect-[4/3] object-cover"
            />
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            className="absolute top-2 right-2"
          >
            Clear
          </Button>
        </div>
      )}

      {!preview && (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
        </div>
      )}
    </div>
  );
}
