import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { ManifestationForm } from "@/components/ManifestationForm";
import { ManifestationReview } from "@/components/ManifestationReview";
import { ManifestationResult } from "@/components/ManifestationResult";
import { Loader } from "@/components/Loader";
import { generateManifestation, ManifestationRequest } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Star, Heart } from "lucide-react";

type AppState = "form" | "loading" | "review" | "result";


export default function Index() {
  const location = useLocation();
  const [appState, setAppState] = useState<AppState>("form");
  const [manifestation, setManifestation] = useState<string>("");
  const [editableManifestation, setEditableManifestation] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [generationMode, setGenerationMode] = useState<"quick" | "deep">("deep");
  const [wordCount, setWordCount] = useState<number>(0);

  // Handle navigation back from translation page
  useEffect(() => {
    const state = location.state as any;
    if (state?.returnToResult && state?.manifestation) {
      setEditableManifestation(state.manifestation);
      setManifestation(state.manifestation);
      if (state.username) {
        setUsername(state.username);
      }
      setAppState("result");
    }
  }, [location.state]);

  const handleSubmit = async (data: ManifestationRequest) => {
    setAppState("loading");
    setUsername(data.preferred_name); // Save username for translation

    try {
      const response = await generateManifestation(data);
      const generatedText = response.data.manifestation_text;
      const mode = response.data.generation_mode;
      const count = response.data.word_count;

      setManifestation(generatedText);
      setEditableManifestation(generatedText);
      setGenerationMode(mode as "quick" | "deep");
      setWordCount(count);
      setAppState("review");
      toast.success(`✨ Your ${mode} manifestation has been created!`);
    } catch (error) {
      console.error("Error generating manifestation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate manifestation. Please try again."
      );
      setAppState("form");
    }
  };

  const handleConfirmManifestation = (editedText: string) => {
    setEditableManifestation(editedText);
    setAppState("result");
    toast.success("✨ Manifestation finalized!");
  };

  const handleRegenerate = () => {
    setManifestation("");
    setEditableManifestation("");
    setAppState("form");
  };

  const handleStartNew = () => {
    setManifestation("");
    setEditableManifestation("");
    setAppState("form");
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      <FloatingElements />
      <Header />

      <main className="relative container max-w-3xl mx-auto px-4 py-8 md:py-12 z-10">
        {/* Hero Section - Only show on form state */}
        {appState === "form" && (
          <div className="text-center mb-12 animate-fade-up">
            {/* Decorative badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-sunrise-gold/30 mb-6 shadow-soft">
              <Sparkles className="w-4 h-4 text-sunrise-orange animate-twinkle" />
              <span className="text-sm font-medium text-foreground">AI-Powered Manifestation</span>
              <Heart className="w-4 h-4 text-lotus-pink animate-pulse-soft" fill="currentColor" />
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Manifest Your</span>
              <br />
              <span className="text-gradient animate-gradient bg-[length:200%_200%]">
                Beautiful Dreams
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed">
              Create personalized affirmations that speak to your soul,
              powered by AI and infused with <span className="text-sunrise-orange font-medium">positive energy</span> ✨
            </p>
          </div>
        )}

        {/* Main Content Card */}
        <div className="relative">
          {/* Glow effect behind card */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-sunrise-pink/20 via-sunrise-gold/20 to-sage/20 blur-3xl rounded-full" />
          </div>

          <div className="gradient-card rounded-3xl shadow-card border border-border/30 p-6 md:p-10 backdrop-blur-sm">
            {appState === "form" && (
              <ManifestationForm
                onSubmit={handleSubmit}
                isLoading={false}
              />
            )}

            {appState === "loading" && (
              <Loader message="Crafting your personalized manifestation..." />
            )}

            {appState === "review" && (
              <ManifestationReview
                manifestation={manifestation}
                onConfirm={handleConfirmManifestation}
                onRegenerate={handleRegenerate}
              />
            )}

            {appState === "result" && (
              <ManifestationResult
                manifestation={editableManifestation}
                username={username}
                generationMode={generationMode}
                wordCount={wordCount}
                onStartNew={handleStartNew}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-lotus-pink animate-pulse-soft" fill="currentColor" />
            <span>and positive intentions</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground/60">
            ✨ AffirmAI — Your Journey to Manifestation ✨
          </p>
        </footer>
      </main>
    </div>
  );
}
