import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Copy, Download, RefreshCw, Check, Sparkles, Sun, Heart, Star, Languages, Volume2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface ManifestationResultProps {
  manifestation: string;
  onStartNew: () => void;
  username?: string;
  className?: string;
  generationMode?: string;
  wordCount?: number;
}

export function ManifestationResult({
  manifestation,
  onStartNew,
  username,
  className,
  generationMode = "deep",
  wordCount
}: ManifestationResultProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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

  const handleGoToTranslation = () => {
    navigate("/translate", {
      state: {
        manifestation,
        username
      }
    });
  };

  const handleGoToAudio = () => {
    navigate("/audio", {
      state: {
        manifestation,
        username,
        translations: { en: manifestation },
        translationStatus: { en: "ready" }
      }
    });
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

        {/* Mode Badge */}
        {generationMode && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${generationMode === "quick"
                ? "bg-sunrise-gold/20 text-sunrise-gold border border-sunrise-gold/30"
                : "bg-lotus-pink/20 text-lotus-pink border border-lotus-pink/30"
              }`}>
              {generationMode === "quick" ? "⚡ Quick Mode" : "🧘 Deep Mode"}
            </div>
            {wordCount && (
              <span className="text-xs text-muted-foreground">
                {wordCount} words • ~{generationMode === "quick" ? "2" : "4"} min audio
              </span>
            )}
          </div>
        )}
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

      {/* Navigation Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Translation Card */}
        <div className="relative group cursor-pointer" onClick={handleGoToTranslation}>
          <div className="absolute inset-0 bg-gradient-to-br from-lotus-pink/20 via-transparent to-sunrise-orange/20 rounded-3xl transition-all duration-300 group-hover:scale-105" />
          <div className="relative gradient-card rounded-3xl shadow-card p-8 border border-lotus-pink/20 transition-all duration-300 group-hover:border-lotus-pink/40 group-hover:shadow-glow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lotus-pink to-sunrise-pink flex items-center justify-center">
                <Languages className="w-6 h-6 text-primary-foreground" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Translate to Your Language
            </h3>
            <p className="text-sm text-muted-foreground">
              Experience your manifestation in Tamil or Hindi
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-lotus-pink hover:text-lotus-pink/80 hover:bg-lotus-pink/10 p-0"
            >
              Get Started →
            </Button>
          </div>
        </div>

        {/* Audio Card */}
        <div className="relative group cursor-pointer" onClick={handleGoToAudio}>
          <div className="absolute inset-0 bg-gradient-to-br from-sage/20 via-transparent to-sky-blue/20 rounded-3xl transition-all duration-300 group-hover:scale-105" />
          <div className="relative gradient-card rounded-3xl shadow-card p-8 border border-sage/20 transition-all duration-300 group-hover:border-sage/40 group-hover:shadow-glow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Listen to Your Manifestation
            </h3>
            <p className="text-sm text-muted-foreground">
              Generate audio in your preferred language and voice
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-4 text-sage-deep hover:text-sage-deep/80 hover:bg-sage/10 p-0"
            >
              Generate Audio →
            </Button>
          </div>
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
