import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { Loader } from "@/components/Loader";
import { generateAudio, AudioRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Copy, Download, Volume2, RefreshCw, Check, Sparkles, Sun, Heart, Star } from "lucide-react";
import { toast } from "sonner";

interface ManifestationResultProps {
  manifestation: string;
  onStartNew: () => void;
  className?: string;
}

export function ManifestationResult({ manifestation, onStartNew, className }: ManifestationResultProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<"male" | "female" | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAudio = async (gender: "male" | "female") => {
    setSelectedVoice(gender);
    setIsGeneratingAudio(true);

    try {
      const request: AudioRequest = {
        text: manifestation,
        gender,
      };

      const response = await generateAudio(request);
      setAudioUrl(response.audio_url);
      toast.success("✨ Audio generated successfully!");
    } catch (error) {
      console.error("Error generating audio:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate audio");
      setSelectedVoice(null);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(manifestation);
      setCopied(true);
      toast.success("✨ Manifestation copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy text");
    }
  };

  const handleDownloadText = () => {
    const blob = new Blob([manifestation], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-manifestation.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("✨ Manifestation downloaded!");
  };

  return (
    <div className={cn("space-y-8 animate-fade-up", className)}>
      {/* Success Header */}
      <div className="text-center relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 bg-gradient-to-r from-sunrise-gold/30 via-sunrise-pink/30 to-lotus-pink/30 blur-3xl rounded-full animate-pulse-soft" />
        </div>
        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full gradient-button shadow-glow mb-6 animate-bounce-gentle">
          <Sun className="w-10 h-10 text-primary-foreground animate-wave" style={{ animationDuration: "3s" }} />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-sunrise-gold animate-sparkle" />
          <Heart className="absolute -bottom-1 -left-1 w-5 h-5 text-lotus-pink animate-pulse-soft" fill="currentColor" />
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-3">
          Your Manifestation is Ready!
        </h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-sunrise-gold" />
          Read aloud daily or listen to the audio version
          <Star className="w-4 h-4 text-sunrise-gold" />
        </p>
      </div>

      {/* Manifestation Text */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-sunrise-pink/10 via-transparent to-sage/10 rounded-3xl" />
        <div className="relative gradient-card rounded-3xl shadow-card p-8 md:p-10 border border-sunrise-gold/20">
          {/* Decorative corner */}
          <div className="absolute top-4 right-4">
            <Sparkles className="w-6 h-6 text-sunrise-gold/40 animate-twinkle" />
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap text-balance text-lg">
              {manifestation}
            </p>
          </div>

          {/* Text Actions */}
          <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-border/30">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleCopyText}
              className="flex-1 sm:flex-none bg-sunrise-gold/10 hover:bg-sunrise-gold/20 border border-sunrise-gold/30 text-foreground rounded-xl transition-all duration-300 hover:scale-105"
            >
              {copied ? (
                <Check className="w-5 h-5 mr-2 text-sage-deep" />
              ) : (
                <Copy className="w-5 h-5 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Text"}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={handleDownloadText}
              className="flex-1 sm:flex-none bg-lotus-pink/10 hover:bg-lotus-pink/20 border border-lotus-pink/30 text-foreground rounded-xl transition-all duration-300 hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Text
            </Button>
          </div>
        </div>
      </div>

      {/* Audio Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-transparent to-sky-blue/10 rounded-3xl" />
        <div className="relative gradient-card rounded-3xl shadow-card p-8 md:p-10 border border-sage/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-foreground">
                Listen to Your Manifestation
              </h3>
              <p className="text-sm text-muted-foreground">
                Soothing Tamil-accent voice for daily practice
              </p>
            </div>
          </div>

          {isGeneratingAudio ? (
            <Loader message="Creating your audio..." className="py-8" />
          ) : audioUrl ? (
            <AudioPlayer audioUrl={audioUrl} />
          ) : (
            <div className="space-y-5 mt-6">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sunrise-gold" />
                Choose your preferred voice:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant={selectedVoice === "male" ? "default" : "secondary"}
                  size="lg"
                  onClick={() => handleGenerateAudio("male")}
                  className={cn(
                    "flex-1 h-14 rounded-xl transition-all duration-300 hover:scale-105",
                    selectedVoice === "male"
                      ? "gradient-audio shadow-button"
                      : "bg-card hover:bg-sage/20 border border-sage/30"
                  )}
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Male Voice
                </Button>
                <Button
                  variant={selectedVoice === "female" ? "default" : "secondary"}
                  size="lg"
                  onClick={() => handleGenerateAudio("female")}
                  className={cn(
                    "flex-1 h-14 rounded-xl transition-all duration-300 hover:scale-105",
                    selectedVoice === "female"
                      ? "gradient-audio shadow-button"
                      : "bg-card hover:bg-lotus-pink/20 border border-lotus-pink/30"
                  )}
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  Female Voice
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Start New */}
      <div className="text-center pt-6">
        <Button
          variant="ghost"
          size="lg"
          onClick={onStartNew}
          className="text-muted-foreground hover:text-foreground group"
        >
          <RefreshCw className="w-5 h-5 mr-2 group-hover:animate-[spin_1s_ease-in-out]" />
          Create Another Manifestation
        </Button>
      </div>
    </div>
  );
}
