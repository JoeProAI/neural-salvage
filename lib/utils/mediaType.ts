/**
 * Media Type Detection Utilities
 * Detect file types from URLs and metadata
 */

export type MediaType = 'image' | 'video' | 'audio' | 'pdf' | 'unknown';

export interface MediaInfo {
  type: MediaType;
  extension: string;
  mimeType: string;
  isStreamable: boolean;
}

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'];
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'];
const PDF_EXTENSIONS = ['.pdf'];

const MIME_TO_TYPE: Record<string, MediaType> = {
  // Images
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  // Videos
  'video/mp4': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/webm': 'video',
  // Audio
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/wav': 'audio',
  'audio/ogg': 'audio',
  'audio/m4a': 'audio',
  'audio/aac': 'audio',
  'audio/x-m4a': 'audio',
  // PDF
  'application/pdf': 'pdf',
};

/**
 * Detect media type from URL
 */
export function detectMediaType(url: string): MediaType {
  const lowerUrl = url.toLowerCase();
  
  if (IMAGE_EXTENSIONS.some(ext => lowerUrl.endsWith(ext))) {
    return 'image';
  }
  if (VIDEO_EXTENSIONS.some(ext => lowerUrl.endsWith(ext))) {
    return 'video';
  }
  if (AUDIO_EXTENSIONS.some(ext => lowerUrl.endsWith(ext))) {
    return 'audio';
  }
  if (PDF_EXTENSIONS.some(ext => lowerUrl.endsWith(ext))) {
    return 'pdf';
  }
  
  return 'unknown';
}

/**
 * Detect media type from MIME type
 */
export function detectMediaTypeFromMime(mimeType: string): MediaType {
  return MIME_TO_TYPE[mimeType.toLowerCase()] || 'unknown';
}

/**
 * Get full media info
 */
export function getMediaInfo(url: string, mimeType?: string): MediaInfo {
  let type: MediaType = 'unknown';
  
  // Try MIME type first
  if (mimeType) {
    type = detectMediaTypeFromMime(mimeType);
  }
  
  // Fall back to URL extension
  if (type === 'unknown') {
    type = detectMediaType(url);
  }
  
  const extension = url.split('.').pop()?.toLowerCase() || '';
  
  return {
    type,
    extension,
    mimeType: mimeType || getMimeType(extension),
    isStreamable: type === 'audio' || type === 'video',
  };
}

/**
 * Get MIME type from extension
 */
export function getMimeType(extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  
  const mimeMap: Record<string, string> = {
    // Images
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    // Videos
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    webm: 'video/webm',
    // Audio
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    m4a: 'audio/m4a',
    aac: 'audio/aac',
    // PDF
    pdf: 'application/pdf',
  };
  
  return mimeMap[ext] || 'application/octet-stream';
}

/**
 * Check if media type is supported
 */
export function isMediaSupported(type: MediaType): boolean {
  return ['image', 'video', 'audio', 'pdf'].includes(type);
}

/**
 * Get media type icon/emoji
 */
export function getMediaIcon(type: MediaType): string {
  const icons = {
    image: '🖼️',
    video: '🎬',
    audio: '🎵',
    pdf: '📄',
    unknown: '📎',
  };
  return icons[type];
}

/**
 * Get media type label
 */
export function getMediaLabel(type: MediaType): string {
  const labels = {
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    pdf: 'Document',
    unknown: 'File',
  };
  return labels[type];
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
