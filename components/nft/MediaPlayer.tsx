'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Download, Maximize2 } from 'lucide-react';

interface MediaPlayerProps {
  src: string;
  type: 'audio' | 'video';
  poster?: string;
  title?: string;
  showDownload?: boolean;
}

export function MediaPlayer({ src, type, poster, title, showDownload = false }: MediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mediaRef = useRef<HTMLAudioElement | HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const updateTime = () => setCurrentTime(media.currentTime);
    const updateDuration = () => setDuration(media.duration);
    const handleEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', updateTime);
    media.addEventListener('loadedmetadata', updateDuration);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', updateTime);
      media.removeEventListener('loadedmetadata', updateDuration);
      media.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const time = parseFloat(e.target.value);
    media.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const vol = parseFloat(e.target.value);
    media.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isMuted) {
      media.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = title || 'nft-media';
    link.click();
  };

  return (
    <div 
      ref={containerRef}
      className="bg-void-black/80 border-2 border-data-cyan/30 rounded-lg overflow-hidden"
    >
      {/* Media Element */}
      <div className="relative bg-void-black">
        {type === 'audio' ? (
          <div className="relative aspect-video bg-gradient-to-br from-quantum-blue/20 via-data-cyan/10 to-terminal-green/20 flex items-center justify-center">
            <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} />
            
            {/* Audio Visualizer Effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex gap-2 items-end h-32">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 bg-data-cyan rounded-full transition-all ${
                      isPlaying ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Play Button Overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-void-black/40 hover:bg-void-black/60 transition-colors group"
            >
              {isPlaying ? (
                <Pause className="w-20 h-20 text-data-cyan group-hover:scale-110 transition-transform" />
              ) : (
                <Play className="w-20 h-20 text-data-cyan group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={src}
              poster={poster}
              className="w-full aspect-video bg-void-black"
              onClick={togglePlay}
            />
            
            {/* Video Play Button Overlay */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-void-black/40 hover:bg-void-black/60 transition-colors group"
              >
                <Play className="w-20 h-20 text-data-cyan group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        {/* Title */}
        {title && (
          <div className="font-space-mono font-bold text-data-cyan text-sm truncate">
            {title}
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-1">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-2 bg-ash-gray/20 rounded-lg appearance-none cursor-pointer 
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                     [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-data-cyan [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-data-cyan 
                     [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgb(111, 205, 221) 0%, rgb(111, 205, 221) ${
                (currentTime / duration) * 100 || 0
              }%, rgba(255,255,255,0.2) ${(currentTime / duration) * 100 || 0}%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-ash-gray font-rajdhani">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-10 h-10 flex items-center justify-center bg-data-cyan/20 hover:bg-data-cyan/30 
                     border-2 border-data-cyan rounded-full transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-data-cyan" />
            ) : (
              <Play className="w-5 h-5 text-data-cyan ml-0.5" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1">
            <button onClick={toggleMute} className="text-data-cyan hover:text-data-cyan/80">
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-ash-gray/20 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 
                       [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full 
                       [&::-webkit-slider-thumb]:bg-data-cyan
                       [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 
                       [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-data-cyan 
                       [&::-moz-range-thumb]:border-0"
            />
          </div>

          {/* Fullscreen (Video Only) */}
          {type === 'video' && (
            <button
              onClick={toggleFullscreen}
              className="text-data-cyan hover:text-data-cyan/80 transition-colors"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
          )}

          {/* Download */}
          {showDownload && (
            <button
              onClick={handleDownload}
              className="text-terminal-green hover:text-terminal-green/80 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
