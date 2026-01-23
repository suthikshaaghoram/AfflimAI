import { cn } from "@/lib/utils";
import { Sparkles, Heart, Star } from "lucide-react";

interface LoaderProps {
  message?: string;
  className?: string;
}

export function Loader({ message = "Generating your manifestation...", className }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16", className)}>
      {/* Animated mandala-like circles */}
      <div className="relative w-40 h-40 mb-8">
        {/* Outer rings */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-sunrise-gold/40 animate-[spin_20s_linear_infinite]" />
        <div className="absolute inset-3 rounded-full border-2 border-dotted border-lotus-pink/40 animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute inset-6 rounded-full border-2 border-dashed border-sage/40 animate-[spin_10s_linear_infinite]" />
        
        {/* Gradient orbs */}
        <div className="absolute inset-0 rounded-full bg-sunrise-pink/30 animate-breathe blur-xl" />
        <div 
          className="absolute inset-6 rounded-full bg-sunrise-gold/40 animate-breathe blur-lg" 
          style={{ animationDelay: "0.5s" }} 
        />
        <div 
          className="absolute inset-12 rounded-full bg-lotus-pink/50 animate-breathe blur-md" 
          style={{ animationDelay: "1s" }} 
        />
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <Heart className="w-10 h-10 text-sunrise-orange animate-pulse-soft" fill="currentColor" />
            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-sunrise-gold animate-sparkle" />
            <Star className="absolute -bottom-1 -left-2 w-4 h-4 text-lotus-pink animate-twinkle" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Orbiting elements */}
        <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Star className="w-4 h-4 text-sunrise-gold" fill="currentColor" />
          </div>
        </div>
        <div className="absolute inset-0 animate-[spin_12s_linear_infinite_reverse]">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <Sparkles className="w-3 h-3 text-lotus-pink" />
          </div>
        </div>
      </div>

      {/* Message */}
      <p className="font-display text-2xl text-foreground text-center animate-pulse-soft text-gradient">
        {message}
      </p>
      <p className="mt-3 text-sm text-muted-foreground text-center max-w-xs">
        ✨ Take a deep breath and visualize your dreams becoming reality ✨
      </p>

      {/* Progress dots */}
      <div className="flex gap-2 mt-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-gradient-to-r from-sunrise-orange to-lotus-pink animate-bounce-gentle"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
