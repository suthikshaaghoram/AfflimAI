import { useState } from "react";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { ManifestationForm } from "@/components/ManifestationForm";
import { ManifestationResult } from "@/components/ManifestationResult";
import { Loader } from "@/components/Loader";
import { generateManifestation, ManifestationRequest } from "@/lib/api";
import { toast } from "sonner";
import { Sparkles, Star, Heart } from "lucide-react";

type AppState = "form" | "loading" | "result";

export default function Index() {
  const [appState, setAppState] = useState<AppState>("form");
  const [manifestation, setManifestation] = useState<string>("");

  const handleSubmit = async (data: ManifestationRequest) => {
    setAppState("loading");

    try {
      const response = await generateManifestation(data);
      setManifestation(response.manifestation);
      setAppState("result");
      toast.success("✨ Your manifestation has been created!");
    } catch (error) {
      console.error("Error generating manifestation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate manifestation. Please try again."
      );
      setAppState("form");
    }
  };

  const handleStartNew = () => {
    setManifestation("");
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

            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {[
                { icon: Star, text: "Vedic Astrology" },
                { icon: Heart, text: "Personal Touch" },
                { icon: Sparkles, text: "Tamil Audio" },
              ].map(({ icon: Icon, text }) => (
                <div 
                  key={text}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/60 border border-border/30 shadow-soft"
                >
                  <Icon className="w-4 h-4 text-sunrise-gold" />
                  <span className="text-sm font-medium text-foreground">{text}</span>
                </div>
              ))}
            </div>
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

            {appState === "result" && (
              <ManifestationResult
                manifestation={manifestation}
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
