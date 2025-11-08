'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UploadProgress } from '@/types';
import { uploadFileDirectly, validateFileForUpload, getMediaType } from '@/lib/firebase/directUpload';

interface MediaUploaderProps {
  onUploadComplete?: () => void;
  onClose?: () => void;
}

export function MediaUploader({ onUploadComplete, onClose }: MediaUploaderProps) {
  const { user } = useAuth();
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    setUploads((prev) => [...prev, ...newUploads]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov', '.avi', '.webm'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
      'application/pdf': ['.pdf'],
    },
    maxSize: 500 * 1024 * 1024, // 500MB - Direct Firebase upload (no Vercel limit)
  });

  const handleUpload = async () => {
    if (!user || uploads.length === 0) return;

    setUploading(true);

    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      
      if (upload.status === 'completed') continue;

      try {
        // Validate file
        const validation = validateFileForUpload(upload.file, 500);
        if (!validation.valid) {
          throw new Error(validation.error);
        }

        // Update status to uploading
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i ? { ...u, status: 'uploading', progress: 0 } : u
          )
        );

        // Upload directly to Firebase Storage with real-time progress
        const result = await uploadFileDirectly({
          userId: user.id,
          file: upload.file,
          onProgress: (progress) => {
            setUploads((prev) =>
              prev.map((u, idx) =>
                idx === i ? { ...u, progress: Math.round(progress.progress) } : u
              )
            );
          },
        });

        console.log('[UPLOAD] Direct upload complete:', result);

        // Save metadata to Firestore via API
        const response = await fetch('/api/upload/metadata', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            filename: upload.file.name,
            url: result.url,
            path: result.path,
            size: upload.file.size,
            type: getMediaType(upload.file.type),
            mimeType: upload.file.type,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save metadata');
        }

        const data = await response.json();

        // Update to completed
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? {
                  ...u,
                  status: 'completed',
                  progress: 100,
                  assetId: data.asset.id,
                }
              : u
          )
        );
      } catch (error: any) {
        console.error('Upload error:', error);
        setUploads((prev) =>
          prev.map((u, idx) =>
            idx === i
              ? {
                  ...u,
                  status: 'error',
                  error: error.message || 'Upload failed',
                }
              : u
          )
        );
      }
    }

    setUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete();
    }
  };

  const removeUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
  };

  const retryUpload = (index: number) => {
    setUploads((prev) =>
      prev.map((u, i) =>
        i === index ? { ...u, status: 'pending', progress: 0, error: undefined } : u
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-neon-cyan bg-neon-cyan/10'
            : 'border-salvage-glow hover:border-neon-cyan/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-6xl mb-4">
          {isDragActive ? '⬇️' : '📤'}
        </div>
        <p className="text-white mb-2 text-lg">
          {isDragActive
            ? 'Drop files here...'
            : 'Drag & drop files here, or click to select'}
        </p>
        <p className="text-sm text-gray-400">
          Supports images, videos, audio, and documents (max 500MB)
        </p>
        <p className="text-xs text-data-cyan/70 mt-1">
          ⚡ Direct upload - No size restrictions!
        </p>
      </div>

      {/* Upload Queue */}
      {uploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold">
              Upload Queue ({uploads.length} files)
            </h3>
            <Button
              variant="neon"
              onClick={handleUpload}
              disabled={uploading || uploads.every((u) => u.status === 'completed')}
            >
              {uploading ? 'Uploading...' : 'Upload All'}
            </Button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploads.map((upload, index) => (
              <div
                key={index}
                className="metal-card p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate">{upload.file.name}</p>
                    <p className="text-xs text-gray-400">
                      {(upload.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {upload.status === 'completed' && (
                      <span className="text-neon-green">✓</span>
                    )}
                    {upload.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(index)}
                      >
                        Retry
                      </Button>
                    )}
                    {upload.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeUpload(index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {(upload.status === 'uploading' || upload.status === 'processing') && (
                  <div className="w-full bg-salvage-rust rounded-full h-2">
                    <div
                      className="bg-neon-cyan h-2 rounded-full transition-all"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Status */}
                <div className="mt-2">
                  {upload.status === 'pending' && (
                    <p className="text-xs text-gray-400">Ready to upload</p>
                  )}
                  {upload.status === 'uploading' && (
                    <p className="text-xs text-neon-cyan">
                      Uploading... {upload.progress}%
                    </p>
                  )}
                  {upload.status === 'processing' && (
                    <p className="text-xs text-neon-cyan">Processing...</p>
                  )}
                  {upload.status === 'completed' && (
                    <p className="text-xs text-neon-green">Upload complete!</p>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-red-500">{upload.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {onClose && (
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </div>
  );
}