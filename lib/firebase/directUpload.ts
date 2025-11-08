/**
 * Direct client-side uploads to Firebase Storage
 * Bypasses Vercel API limits - supports files up to 5GB
 */

import { storage } from './config';
import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number; // 0-100
  state: 'running' | 'paused' | 'success' | 'error' | 'canceled';
}

export interface DirectUploadOptions {
  userId: string;
  file: File;
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (url: string, metadata: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Upload file directly to Firebase Storage from client
 * Supports large files with progress tracking and resumable uploads
 */
export async function uploadFileDirectly({
  userId,
  file,
  onProgress,
  onComplete,
  onError,
}: DirectUploadOptions): Promise<{ url: string; path: string; metadata: any }> {
  
  return new Promise((resolve, reject) => {
    try {
      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `users/${userId}/uploads/${timestamp}_${sanitizedFilename}`;

      // Create storage reference
      const storageRef = ref(storage, storagePath);

      // Create upload task with resumable upload
      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          userId,
          originalFilename: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });

      // Track upload progress
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          
          if (onProgress) {
            onProgress({
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              progress,
              state: snapshot.state as any,
            });
          }

          console.log(`[DIRECT UPLOAD] Progress: ${progress.toFixed(1)}% (${formatBytes(snapshot.bytesTransferred)} / ${formatBytes(snapshot.totalBytes)})`);
        },
        (error) => {
          console.error('[DIRECT UPLOAD] Upload failed:', error);
          if (onError) {
            onError(error);
          }
          reject(error);
        },
        async () => {
          // Upload completed successfully
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            
            const metadata = {
              name: file.name,
              size: file.size,
              type: file.type,
              path: storagePath,
              uploadedAt: new Date().toISOString(),
            };

            console.log('[DIRECT UPLOAD] Upload complete!', downloadURL);

            if (onComplete) {
              onComplete(downloadURL, metadata);
            }

            resolve({
              url: downloadURL,
              path: storagePath,
              metadata,
            });
          } catch (error: any) {
            console.error('[DIRECT UPLOAD] Error getting download URL:', error);
            reject(error);
          }
        }
      );
    } catch (error: any) {
      console.error('[DIRECT UPLOAD] Setup error:', error);
      if (onError) {
        onError(error);
      }
      reject(error);
    }
  });
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate file before upload
 */
export function validateFileForUpload(file: File, maxSizeMB: number = 500): { valid: boolean; error?: string } {
  const maxSize = maxSizeMB * 1024 * 1024;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  // Check file type
  const allowedTypes = [
    // Images
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    // Videos
    'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
    // Audio
    'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/flac', 'audio/x-m4a',
    // Documents
    'application/pdf',
  ];

  if (!allowedTypes.some(type => file.type === type || file.type.startsWith(type.split('/')[0] + '/'))) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported`,
    };
  }

  return { valid: true };
}

/**
 * Determine media type from MIME type
 */
export function getMediaType(mimeType: string): 'image' | 'video' | 'audio' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'document';
}
