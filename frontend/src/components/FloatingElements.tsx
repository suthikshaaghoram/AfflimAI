import { Sparkles, Star, Heart, Sun, Moon, Flower2 } from "lucide-react";

export function FloatingElements() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Large gradient orbs */}
      <div 
        className="absolute top-10 left-[10%] w-72 h-72 rounded-full bg-sunrise-pink/30 blur-3xl animate-float"
      />
      <div 
        className="absolute top-32 right-[15%] w-96 h-96 rounded-full bg-sunrise-gold/25 blur-3xl animate-float-slow" 
        style={{ animationDelay: "2s" }}
      />
      <div 
        className="absolute bottom-20 left-[20%] w-80 h-80 rounded-full bg-sage/25 blur-3xl animate-float" 
        style={{ animationDelay: "4s" }}
      />
      <div 
        className="absolute top-1/2 right-[5%] w-64 h-64 rounded-full bg-lotus-pink/20 blur-3xl animate-float-slow" 
        style={{ animationDelay: "1s" }}
      />
      <div 
        className="absolute bottom-40 right-[25%] w-72 h-72 rounded-full bg-sky-blue/20 blur-3xl animate-float" 
        style={{ animationDelay: "3s" }}
      />

      {/* Floating icons */}
      <div className="absolute top-[15%] left-[8%] animate-float" style={{ animationDelay: "0.5s" }}>
        <Sparkles className="w-6 h-6 text-sunrise-orange/40" />
      </div>
      <div className="absolute top-[25%] right-[12%] animate-float-slow" style={{ animationDelay: "1.5s" }}>
        <Star className="w-5 h-5 text-sunrise-gold/50 animate-twinkle" />
      </div>
      <div className="absolute top-[45%] left-[5%] animate-float" style={{ animationDelay: "2.5s" }}>
        <Heart className="w-4 h-4 text-lotus-pink/40 animate-pulse-soft" />
      </div>
      <div className="absolute top-[60%] right-[8%] animate-float-slow" style={{ animationDelay: "3.5s" }}>
        <Sun className="w-7 h-7 text-sunrise-gold/35 animate-wave" />
      </div>
      <div className="absolute bottom-[25%] left-[12%] animate-float" style={{ animationDelay: "0s" }}>
        <Flower2 className="w-5 h-5 text-lotus-pink/45" />
      </div>
      <div className="absolute bottom-[35%] right-[18%] animate-float-slow" style={{ animationDelay: "2s" }}>
        <Moon className="w-4 h-4 text-sky-blue/40" />
      </div>
      <div className="absolute top-[70%] left-[25%] animate-twinkle" style={{ animationDelay: "1s" }}>
        <Star className="w-3 h-3 text-sunrise-orange/30" />
      </div>
      <div className="absolute top-[35%] left-[18%] animate-twinkle" style={{ animationDelay: "4s" }}>
        <Sparkles className="w-4 h-4 text-sage-deep/30" />
      </div>

      {/* Decorative dots */}
      <div className="absolute top-[20%] left-[30%] w-2 h-2 rounded-full bg-sunrise-orange/30 animate-pulse-soft" />
      <div className="absolute top-[50%] right-[25%] w-3 h-3 rounded-full bg-lotus-pink/25 animate-pulse-soft" style={{ animationDelay: "1s" }} />
      <div className="absolute bottom-[30%] left-[35%] w-2 h-2 rounded-full bg-sage/35 animate-pulse-soft" style={{ animationDelay: "2s" }} />
    </div>
  );
}
