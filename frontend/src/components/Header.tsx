import { Sparkles, Sun } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/70 backdrop-blur-xl">
      <div className="container flex h-18 items-center justify-between max-w-4xl mx-auto px-4 py-3">
        <a href="/" className="flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl gradient-button shadow-button group-hover:shadow-glow transition-all duration-500 group-hover:scale-105">
            <Sun className="w-6 h-6 text-primary-foreground animate-wave" style={{ animationDuration: "3s" }} />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-sunrise-gold animate-twinkle" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl font-bold text-gradient">
              AffirmAI
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
              Manifest Your Dreams
            </span>
          </div>
        </a>
        
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/30">
          <div className="w-2 h-2 rounded-full bg-sage-deep animate-pulse" />
          <p className="text-sm text-muted-foreground font-medium">
            Your Journey Starts Here
          </p>
        </div>
      </div>
    </header>
  );
}
