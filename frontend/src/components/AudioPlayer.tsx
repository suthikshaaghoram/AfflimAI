import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Play, Pause, Download, Volume2, Music, Sparkles, Upload, RotateCcw } from "lucide-react";
import { getBackgroundTracks, uploadBackgroundTrack, BackgroundTrack } from "@/lib/api";
import { toast } from "sonner";

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
  onBgTrackIdChange,
  isBgEnabled,
  onBgEnabledChange,
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

  // Background Audio Data
  const [backgroundTracks, setBackgroundTracks] = useState<BackgroundTrack[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // --- Initialization ---

  // Fetch Background Tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const tracks = await getBackgroundTracks();
        setBackgroundTracks(tracks);
        if (!selectedBgTrackId) {
          const defaultTrack = tracks.find(t => t.is_default);
          if (defaultTrack) {
            onBgTrackIdChange(defaultTrack.id);
          }
        }
      } catch (error) {
        console.error("Failed to load background tracks", error);
        toast.error("Could not load background music");
      }
    };
    fetchTracks();
  }, []);

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

  // --- Localization removed for brevity, keeping existing ---

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
        // Reset current time logic? Loop usually handles this, maybe keep it running if we want seamless resume? 
        // Better to pause to save resources.
        // bgElementRef.current.currentTime = 0; // Don't reset time so it resumes naturally
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
      // bgElementRef.current.pause(); // Let fadeOut handle it if we want smooth stop, or instant?
      // For main pause, usually instant or quick fade.
      // Let's pause background immediately to sync with voice
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File size must be less than 10MB"); return; }

    setIsUploading(true);
    try {
      const newTrack = await uploadBackgroundTrack(file);
      setBackgroundTracks(prev => [...prev, newTrack]);
      onBgTrackIdChange(newTrack.id);
      toast.success("Background track uploaded!");

      if (isBgEnabled && isPlaying && bgElementRef.current) {
        bgElementRef.current.src = newTrack.url;
        bgElementRef.current.play();
      }
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Failed to upload track");
    } finally { setIsUploading(false); }
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
    <div className={cn("relative mt-6 rounded-3xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-md shadow-xl transition-all duration-300",
      className,
      isFinalized && "border-sunrise-gold/30 shadow-sunrise-gold/10"
    )}>
      {/* Main Audio Player Section */}
      <div className="p-6 md:p-8 bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-indigo-900/40">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <span className="font-display text-lg font-medium text-white block">
              {isFinalized ? "Personalized Manifestation" : "Manifestation Audio"}
            </span>
            <span className="text-sm text-indigo-200/70">
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

      {/* Background Audio Settings Section */}
      <div className={cn("px-6 py-5 bg-black/20 border-t border-white/5", isFinalized && "opacity-50 pointer-events-none")}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-white">
            <Music className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium">Background Music</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn("text-xs font-medium transition-colors", isBgEnabled ? "text-purple-300" : "text-gray-500")}>
              {isBgEnabled ? "On" : "Off"}
            </span>
            <Switch
              checked={isBgEnabled}
              onCheckedChange={onBgEnabledChange}
              disabled={isFinalized}
              className="data-[state=checked]:bg-sunrise-orange"
            />
          </div>
        </div>

        <div className={cn("space-y-5 transition-all duration-300", isBgEnabled ? "opacity-100" : "opacity-40 pointer-events-none")}>
          {/* Track Selector & Upload */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedBgTrackId} onValueChange={onBgTrackIdChange} disabled={isFinalized}>
                <SelectTrigger className="w-full text-xs h-9 bg-white/5 border-white/10 text-white focus:ring-purple-500/50">
                  <SelectValue placeholder="Select music" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {backgroundTracks.map(track => (
                    <SelectItem key={track.id} value={track.id} className="text-xs py-2 focus:bg-white/10 focus:text-white">
                      {track.display_name} {track.is_default && "(Recommended)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <input type="file" id="bg-upload" accept=".mp3,.wav" className="hidden" onChange={handleFileUpload} disabled={isUploading || isFinalized} />
              <Label
                htmlFor="bg-upload"
                className={cn(
                  "h-9 px-3 flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white cursor-pointer transition-colors",
                  isUploading && "opacity-50 cursor-wait",
                  isFinalized && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUploading ? <RotateCcw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                Upload
              </Label>
            </div>
          </div>

          {/* Volume Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400">Intensity</span>
              <span className="text-xs text-purple-300 font-medium">{bgVolume}%</span>
            </div>
            <Slider
              defaultValue={[20]}
              value={[bgVolume]}
              max={100}
              step={1}
              onValueChange={(vals) => onBgVolumeChange(vals[0])}
              disabled={isFinalized}
              className="py-2"
            />
          </div>

          <p className="text-[10px] text-gray-600 italic text-center">
            {isFinalized ? "Audio is finalized. Regenerate to change settings." : "Background music is optional and does not affect the generated manifestation content"}
          </p>
        </div>
      </div>
    </div>
  );
}
