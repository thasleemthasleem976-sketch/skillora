import React, { useRef, useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Loader2,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export default function VideoPlayer({
  src,
  courseId,
  lessonId,
  initialTimestamp = 0,
  title = 'Lesson Video',
  onEnded,
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [resumeNotice, setResumeNotice] = useState(null);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Resolve video stream URL (if relative path, prepend backend base URL)
  const resolvedSrc = src?.startsWith('http')
    ? src
    : src?.startsWith('/api')
    ? `http://localhost:5000${src}`
    : src;

  // Initial resume seek
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsBuffering(false);

      if (initialTimestamp > 5 && initialTimestamp < video.duration - 5) {
        video.currentTime = initialTimestamp;
        setCurrentTime(initialTimestamp);
        setResumeNotice(`Resumed from ${formatTime(initialTimestamp)}`);
        setTimeout(() => setResumeNotice(null), 4000);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [src, initialTimestamp]);

  // Periodic video progress sync to backend every 5 seconds
  useEffect(() => {
    if (!courseId || !lessonId) return;

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (video && !video.paused && video.currentTime > 0) {
        try {
          await api.put('/enrollments/video-progress', {
            courseId,
            lessonId,
            currentTime: video.currentTime,
            duration: video.duration,
          });
        } catch (err) {
          // silent fail
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [courseId, lessonId]);

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Seek
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Volume
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    const video = videoRef.current;
    if (video) {
      video.volume = val;
      video.muted = val === 0;
      setVolume(val);
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Speed
  const handleSpeedChange = (speed) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackRate(speed);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group select-none"
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={resolvedSrc}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>
      )}

      {/* Resume Notice Toast (Glass Pill) */}
      {resumeNotice && (
        <div className="absolute top-4 left-4 bg-white/30 border border-white text-gray-900 px-3.5 py-2 rounded-2xl text-xs font-bold backdrop-blur-xl flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.25)] animate-fade-in z-20">
          <Clock className="w-3.5 h-3.5 text-black" />
          <span>{resumeNotice}</span>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/90 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {/* Top bar: title */}
        <div className="flex items-center justify-between text-white text-sm font-semibold pointer-events-auto">
          <span className="truncate drop-shadow">{title}</span>
          <span className="text-[11px] font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
            {playbackRate}x
          </span>
        </div>

        {/* Center play icon overlay (when paused) */}
        {!isPlaying && (
          <div className="flex items-center justify-center pointer-events-auto">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/85 hover:bg-white text-black backdrop-blur-xl flex items-center justify-center hover:scale-110 transition-all shadow-[0_12px_40px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,1)]"
            >
              <Play className="w-7 h-7 ml-1 fill-black" />
            </button>
          </div>
        )}

        {/* Bottom controls with Frosted Dark Glass */}
        <div className="space-y-2 pointer-events-auto bg-black/60 backdrop-blur-2xl border border-white/15 rounded-2xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Progress / Seek bar */}
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                  }
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                title="Rewind 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
                  }
                }}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
                title="Forward 10s"
              >
                <FastForward className="w-4 h-4" />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Timestamp */}
              <span className="text-xs font-mono text-slate-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed choices */}
              {[1, 1.25, 1.5, 2].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedChange(speed)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-all ${
                    playbackRate === speed
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-1"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
