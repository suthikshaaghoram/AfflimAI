import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Pause, Download, Volume2, Music, Sparkles } from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export function AudioPlayer({ audioUrl, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = (clickX / width) * 100;
    const newTime = (newProgress / 100) * audio.duration;

    audio.currentTime = newTime;
    setProgress(newProgress);
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSpeedChange = (speed: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedMenu(false);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "my-affirmation.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn("relative mt-6 gradient-audio rounded-2xl p-6 text-primary-foreground overflow-hidden", className)}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Decorative background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 right-4">
          <Sparkles className="w-8 h-8 animate-twinkle" />
        </div>
        <div className="absolute bottom-4 left-6">
          <Music className="w-6 h-6 animate-float" />
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <Volume2 className="w-5 h-5 opacity-80" />
          <span className="font-display text-lg font-medium">Your Manifestation Audio</span>
        </div>

        {/* Waveform-like progress bar */}
        <div
          className="relative h-3 bg-primary-foreground/20 rounded-full cursor-pointer mb-4 group overflow-hidden"
          onClick={handleProgressClick}
        >
          <div
            className="absolute h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)"
            }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            style={{ left: `calc(${progress}% - 10px)` }}
          >
            <div className="w-2 h-2 rounded-full bg-sage-deep" />
          </div>
        </div>

        {/* Time display */}
        <div className="flex justify-between text-sm opacity-80 mb-5 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlayPause}
            className="w-16 h-16 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7" />
            ) : (
              <Play className="w-7 h-7 ml-1" />
            )}
          </Button>

          {/* Speed Control */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="text-primary-foreground hover:bg-primary-foreground/20 rounded-xl h-10 px-3 min-w-[3rem]"
            >
              <span className="font-medium text-sm">{playbackRate}x</span>
            </Button>

            {showSpeedMenu && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-popover/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-lg p-1 flex flex-col gap-1 min-w-[4rem] z-50">
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-lg hover:bg-accent/50 transition-colors text-left",
                      playbackRate === speed ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="lg"
            onClick={handleDownload}
            className="text-primary-foreground hover:bg-primary-foreground/20 rounded-xl"
          >
            <Download className="w-5 h-5 mr-2" />
            Download MP3
          </Button>
        </div>
      </div>
    </div>
  );
}
