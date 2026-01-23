import { Volume2, Heart, Smile } from "lucide-react";

interface VoiceStyleSelectorProps {
    value: "calm" | "balanced" | "uplifting";
    onChange: (style: "calm" | "balanced" | "uplifting") => void;
    disabled?: boolean;
}

export function VoiceStyleSelector({
    value,
    onChange,
    disabled = false
}: VoiceStyleSelectorProps) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
                Voice Expression
            </label>
            <div className="grid grid-cols-3 gap-3">
                {/* Calm Mode */}
                <button
                    type="button"
                    onClick={() => onChange("calm")}
                    disabled={disabled}
                    className={`
            p-3 rounded-xl border-2 transition-all text-center
            ${value === "calm"
                            ? "border-sage bg-sage/10 shadow-soft"
                            : "border-border/30 hover:border-border/60"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
          `}
                >
                    <Heart
                        className={`w-5 h-5 mx-auto mb-1 ${value === "calm" ? "text-sage-deep" : "text-muted-foreground"
                            }`}
                    />
                    <div className={`text-xs font-medium ${value === "calm" ? "text-sage-deep" : "text-foreground"
                        }`}>
                        Calm
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Meditative
                    </div>
                    {value === "calm" && (
                        <div className="mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-sage-deep mx-auto animate-pulse" />
                        </div>
                    )}
                </button>

                {/* Balanced Mode */}
                <button
                    type="button"
                    onClick={() => onChange("balanced")}
                    disabled={disabled}
                    className={`
            p-3 rounded-xl border-2 transition-all text-center
            ${value === "balanced"
                            ? "border-sky-blue bg-sky-blue/10 shadow-soft"
                            : "border-border/30 hover:border-border/60"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
          `}
                >
                    <Volume2
                        className={`w-5 h-5 mx-auto mb-1 ${value === "balanced" ? "text-sky-blue" : "text-muted-foreground"
                            }`}
                    />
                    <div className={`text-xs font-medium ${value === "balanced" ? "text-sky-blue" : "text-foreground"
                        }`}>
                        Balanced
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Natural
                    </div>
                    {value === "balanced" && (
                        <div className="mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-sky-blue mx-auto animate-pulse" />
                        </div>
                    )}
                </button>

                {/* Uplifting Mode */}
                <button
                    type="button"
                    onClick={() => onChange("uplifting")}
                    disabled={disabled}
                    className={`
            p-3 rounded-xl border-2 transition-all text-center
            ${value === "uplifting"
                            ? "border-sunrise-gold bg-sunrise-gold/10 shadow-soft"
                            : "border-border/30 hover:border-border/60"
                        }
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-[1.02]"}
          `}
                >
                    <Smile
                        className={`w-5 h-5 mx-auto mb-1 ${value === "uplifting" ? "text-sunrise-gold" : "text-muted-foreground"
                            }`}
                    />
                    <div className={`text-xs font-medium ${value === "uplifting" ? "text-sunrise-gold" : "text-foreground"
                        }`}>
                        Uplifting
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Motivational
                    </div>
                    {value === "uplifting" && (
                        <div className="mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-sunrise-gold mx-auto animate-pulse" />
                        </div>
                    )}
                </button>
            </div>

            {/* Helper text based on selection */}
            <p className="text-xs text-muted-foreground/80 italic">
                {value === "calm" && "🧘 Soothing and meditative for deep relaxation"}
                {value === "balanced" && "🎙️ Natural human narration, perfect for first-time listeners"}
                {value === "uplifting" && "✨ Motivational energy for confidence and abundance"}
            </p>
        </div>
    );
}
