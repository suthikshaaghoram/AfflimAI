import { Clock, Zap } from "lucide-react";

interface GenerationModeSelectorProps {
    value: "quick" | "deep";
    onChange: (mode: "quick" | "deep") => void;
    disabled?: boolean;
}

export function GenerationModeSelector({
    value,
    onChange,
    disabled = false
}: GenerationModeSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                Manifestation Depth
            </label>
            <div className="grid grid-cols-2 gap-3">
                {/* Quick Mode */}
                <button
                    type="button"
                    onClick={() => onChange("quick")}
                    disabled={disabled}
                    className={`
            relative p-4 rounded-xl border-2 transition-all
            ${value === "quick"
                            ? "border-sunrise-gold bg-sunrise-gold/10 shadow-soft"
                            : "border-border/30 hover:border-border/60"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
          `}
                >
                    <div className="flex items-start gap-3">
                        <Zap
                            className={`w-5 h-5 flex-shrink-0 ${value === "quick" ? "text-sunrise-gold" : "text-muted-foreground"
                                }`}
                        />
                        <div className="text-left">
                            <div className={`font-semibold ${value === "quick" ? "text-sunrise-gold" : "text-foreground"
                                }`}>
                                Quick
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                ~2 min audio<br />
                                Short & focused
                            </div>
                        </div>
                    </div>
                    {value === "quick" && (
                        <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-sunrise-gold animate-pulse" />
                        </div>
                    )}
                </button>

                {/* Deep Mode */}
                <button
                    type="button"
                    onClick={() => onChange("deep")}
                    disabled={disabled}
                    className={`
            relative p-4 rounded-xl border-2 transition-all
            ${value === "deep"
                            ? "border-lotus-pink bg-lotus-pink/10 shadow-soft"
                            : "border-border/30 hover:border-border/60"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
          `}
                >
                    <div className="flex items-start gap-3">
                        <Clock
                            className={`w-5 h-5 flex-shrink-0 ${value === "deep" ? "text-lotus-pink" : "text-muted-foreground"
                                }`}
                        />
                        <div className="text-left">
                            <div className={`font-semibold ${value === "deep" ? "text-lotus-pink" : "text-foreground"
                                }`}>
                                Deep
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                ~4 min audio<br />
                                Immersive & meditative
                            </div>
                        </div>
                    </div>
                    {value === "deep" && (
                        <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-lotus-pink animate-pulse" />
                        </div>
                    )}
                </button>
            </div>

            {/* Helper text */}
            <p className="text-xs text-muted-foreground/80 italic">
                {value === "quick"
                    ? "Perfect for daily affirmations and quick motivation"
                    : "Ideal for meditation and deep emotional grounding"
                }
            </p>
        </div>
    );
}
