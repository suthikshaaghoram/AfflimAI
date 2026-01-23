import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Play, Pause, Download, Volume2 } from "lucide-react";
import { BackgroundTrack } from "@/lib/api";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;

  // Controlled State for Voice Audio
  voiceVolume?: number; // 0-100
  onVoiceVolumeChange?: (volume: number) => void;

  // Controlled State for Background Audio
  bgVolume: number;
  onBgVolumeChange: (volume: number) => void;
  selectedBgTrackId: string;
  onBgTrackIdChange: (id: string) => void;
  isBgEnabled: boolean;
  onBgEnabledChange: (enabled: boolean) => void;

  // New Prop: Tracks passed from parent
  backgroundTracks: BackgroundTrack[];

  isFinalized?: boolean; // If true, disables mixing controls
}

export function AudioPlayer({
  audioUrl,
  className,
  voiceVolume = 100,
  onVoiceVolumeChange,
  bgVolume,
  onBgVolumeChange,
  selectedBgTrackId,
  isBgEnabled,
  backgroundTracks,
  isFinalized = false
}: AudioPlayerProps) {
  // --- Refs for Web Audio API ---
  const audioContextRef = useRef<AudioContext | null>(null);

  // Voice Nodes
  const voiceElementRef = useRef<HTMLAudioElement | null>(null);
  const voiceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const voiceGainRef = useRef<GainNode | null>(null);

  // Background Nodes
  const bgElementRef = useRef<HTMLAudioElement | null>(null);
  const bgNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bgGainRef = useRef<GainNode | null>(null);

  // --- Local State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [voiceCurrentTime, setVoiceCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // --- Initialization ---

  // Initialize Audio Context and Nodes
  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContextClass();
    audioContextRef.current = ctx;

    // --- Voice Setup ---
    const voiceAudio = new Audio(audioUrl);
    voiceAudio.crossOrigin = "anonymous";
    voiceElementRef.current = voiceAudio;

    const voiceNode = ctx.createMediaElementSource(voiceAudio);
    voiceNodeRef.current = voiceNode;

    const voiceGain = ctx.createGain();
    voiceGain.gain.value = voiceVolume / 100; // Apply initial voice volume
    voiceGainRef.current = voiceGain;

    voiceNode.connect(voiceGain).connect(ctx.destination);

    // --- Background Setup ---
    const bgAudio = new Audio();
    bgAudio.crossOrigin = "anonymous";
    bgAudio.loop = true;
    bgElementRef.current = bgAudio;

    const bgNode = ctx.createMediaElementSource(bgAudio);
    bgNodeRef.current = bgNode;

    const bgGain = ctx.createGain();
    bgGain.gain.value = 0.2; // Note: Will be updated by useEffect
    bgGainRef.current = bgGain;

    bgNode.connect(bgGain).connect(ctx.destination);

    // --- Listener Logic (Same as before) ---
    const handleVoiceTimeUpdate = () => {
      setVoiceCurrentTime(voiceAudio.currentTime);
      setVoiceProgress((voiceAudio.currentTime / voiceAudio.duration) * 100);
    };

    const handleVoiceMetadata = () => {
      setVoiceDuration(voiceAudio.duration);
    };

    const handleVoiceEnded = () => {
      setIsPlaying(false);
      setVoiceProgress(0);
      setVoiceCurrentTime(0);

      if (bgElementRef.current && !bgElementRef.current.paused) {
        fadeOutBackground();
      }
    };

    voiceAudio.addEventListener("timeupdate", handleVoiceTimeUpdate);
    voiceAudio.addEventListener("loadedmetadata", handleVoiceMetadata);
    voiceAudio.addEventListener("ended", handleVoiceEnded);

    return () => {
      ctx.close();
      voiceAudio.removeEventListener("timeupdate", handleVoiceTimeUpdate);
      voiceAudio.removeEventListener("loadedmetadata", handleVoiceMetadata);
      voiceAudio.removeEventListener("ended", handleVoiceEnded);
    };
  }, [audioUrl]);

  const bgFadeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Loop for background track changing...
  useEffect(() => {
    if (!bgElementRef.current || !selectedBgTrackId) return;

    const track = backgroundTracks.find(t => t.id === selectedBgTrackId);
    if (track) {
      const wasPlaying = !bgElementRef.current.paused; // Check actual audio state
      bgElementRef.current.src = track.url;
      // If we were playing background, resume with new track
      // Or if system is playing and bg is enabled
      if ((wasPlaying || (isPlaying && isBgEnabled))) {
        bgElementRef.current.play().catch(e => console.error("Bg play error", e));
      }
    }
  }, [selectedBgTrackId, backgroundTracks]);

  // Reactive Background Toggle
  useEffect(() => {
    if (!bgElementRef.current) return;

    if (isPlaying) {
      if (isBgEnabled) {
        // Enable: Play and Fade In
        if (bgFadeTimeoutRef.current) clearTimeout(bgFadeTimeoutRef.current);
        bgElementRef.current.play().then(() => {
          if (bgGainRef.current && audioContextRef.current) {
            const currTime = audioContextRef.current.currentTime;
            bgGainRef.current.gain.cancelScheduledValues(currTime);
            // Fade in
            bgGainRef.current.gain.setValueAtTime(bgGainRef.current.gain.value, currTime);
            const maxVol = 0.4;
            const target = (bgVolume / 100) * maxVol;
            bgGainRef.current.gain.linearRampToValueAtTime(target, currTime + 0.5);
          }
        }).catch(e => console.error("Bg play error", e));
      } else {
        // Disable: Fade Out
        fadeOutBackground();
      }
    }
  }, [isBgEnabled]);

  // Update Voice Volume
  useEffect(() => {
    if (voiceGainRef.current) {
      const normalized = voiceVolume / 100;
      voiceGainRef.current.gain.setTargetAtTime(normalized, audioContextRef.current?.currentTime || 0, 0.1);
    }
  }, [voiceVolume]);

  // Update Background Volume
  useEffect(() => {
    if (bgGainRef.current) {
      const maxVol = 0.4;
      const normalized = bgVolume / 100;
      bgGainRef.current.gain.setTargetAtTime(normalized * maxVol, audioContextRef.current?.currentTime || 0, 0.1);
    }
  }, [bgVolume]);

  const fadeOutBackground = () => {
    if (!bgGainRef.current || !audioContextRef.current) return;

    if (bgFadeTimeoutRef.current) clearTimeout(bgFadeTimeoutRef.current);

    const currTime = audioContextRef.current.currentTime;
    bgGainRef.current.gain.cancelScheduledValues(currTime);
    bgGainRef.current.gain.setValueAtTime(bgGainRef.current.gain.value, currTime);
    bgGainRef.current.gain.linearRampToValueAtTime(0, currTime + 1.5);

    bgFadeTimeoutRef.current = setTimeout(() => {
      if (bgElementRef.current) {
        bgElementRef.current.pause();
      }
    }, 1500);
  };

  const togglePlayPause = async () => {
    if (!audioContextRef.current || !voiceElementRef.current || !bgElementRef.current) return;

    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      voiceElementRef.current.pause();
      bgElementRef.current.pause();
      if (bgFadeTimeoutRef.current) clearTimeout(bgFadeTimeoutRef.current);

      setIsPlaying(false);
    } else {
      voiceElementRef.current.play();
      if (isBgEnabled) {
        bgElementRef.current.play().then(() => {
          if (bgGainRef.current && audioContextRef.current) {
            const currTime = audioContextRef.current.currentTime;
            bgGainRef.current.gain.setValueAtTime(0, currTime);
            const maxVol = 0.4;
            const target = (bgVolume / 100) * maxVol;
            bgGainRef.current.gain.linearRampToValueAtTime(target, currTime + 1);
          }
        }).catch(e => console.error("Bg play failed", e));
      }
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!voiceElementRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = (clickX / width) * 100;
    const newTime = (newProgress / 100) * voiceElementRef.current.duration;

    voiceElementRef.current.currentTime = newTime;
    setVoiceProgress(newProgress);
    setVoiceCurrentTime(newTime);
  };

  const handleSpeedChange = (speed: number) => {
    if (!voiceElementRef.current) return;
    voiceElementRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "manifestation.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all duration-300",
      className,
      isFinalized && "border-sunrise-gold/30 shadow-sunrise-gold/10"
    )}>
      {/* Main Audio Player Section */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-mystic-dark via-mystic-violet to-mystic-dark text-white">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <span className="font-display text-lg font-medium text-white block">
              {isFinalized ? "Personalized Manifestation" : "Manifestation Audio"}
            </span>
            <span className="text-sm text-indigo-200/80">
              {isFinalized ? "Ready for deep absorption" : "Listen, absorb, and manifest"}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div
          className="relative h-2 bg-white/10 rounded-full cursor-pointer mb-2 group py-2"
          onClick={handleProgressClick}
        >
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-100 ease-linear"
              style={{ width: `${voiceProgress}%` }}
            />
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none"
            style={{ left: `calc(${voiceProgress}% - 8px)` }}
          />
        </div>

        <div className="flex justify-between text-xs text-indigo-200/60 mb-6 font-medium tracking-wide">
          <span>{formatTime(voiceCurrentTime)}</span>
          <span>{formatTime(voiceDuration)}</span>
        </div>

        {/* Primary Controls Row */}
        <div className="flex items-center justify-center gap-6 mb-4">
          {/* Speed */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl h-9 px-3"
            >
              <span className="font-medium text-xs">{playbackRate}x</span>
            </Button>
            {showSpeedMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1 flex flex-col gap-1 min-w-[4rem] z-50">
                {[0.75, 1, 1.25, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={cn(
                      "px-3 py-2 text-xs rounded-lg hover:bg-white/10 transition-colors text-left",
                      playbackRate === speed ? "bg-white/20 text-white font-medium" : "text-gray-400"
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Play/Pause */}
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-white text-indigo-900 hover:bg-indigo-100 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl h-9 px-3"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* Voice Volume Control - NEW */}
        {!isFinalized && onVoiceVolumeChange && (
          <div className="w-full max-w-xs mx-auto flex items-center gap-3 px-4 py-2 rounded-xl bg-black/20 border border-white/5">
            <Volume2 className="w-3 h-3 text-indigo-200" />
            <Slider
              defaultValue={[100]}
              value={[voiceVolume]}
              max={100}
              step={1}
              onValueChange={(vals) => onVoiceVolumeChange(vals[0])}
              className="py-1 cursor-pointer"
            />
            <span className="text-[10px] text-indigo-200 w-6 text-right">{voiceVolume}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
