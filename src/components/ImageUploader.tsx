import { useState } from "react";
import { Upload } from "lucide-react";

interface ImageUploaderProps {
  onImageUrl: (url: string) => void;
}

export default function ImageUploader({ onImageUrl }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Convert to base64 data URL for now (client-side only)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        onImageUrl(dataUrl);
        setUploading(false);
      };
      reader.onerror = () => {
        setError("Failed to read image");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Upload failed");
      setUploading(false);
    }
  };

  return (
    <div className="border border-primary/30 p-3 space-y-2 bg-black/30">
      <div className="text-xs font-mono text-primary mb-2">Image Upload</div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
          id="image-upload-input"
        />
        <div className="flex items-center gap-2 border border-primary px-3 py-2 font-mono text-sm hover:bg-primary hover:text-black transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Choose Image"}
        </div>
        <span className="text-xs text-muted-foreground font-mono">Max 5MB, PNG/JPG/GIF</span>
      </label>
      {error && <div className="text-xs text-accent font-mono">⚠ {error}</div>}
      <div className="text-xs text-muted-foreground font-mono">
        Image will be inserted as markdown: ![alt](base64...)
      </div>
    </div>
  );
}
