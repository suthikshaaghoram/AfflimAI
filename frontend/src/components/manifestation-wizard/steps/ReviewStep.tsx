import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/FormSection";
import { StepProps } from "../types";
import { Sparkles, Wand2, Star, CheckCircle2 } from "lucide-react";

export function ReviewStep({ formData, onNext }: StepProps) {
    // onNext here acts as the "Submit" handler

    const ReviewItem = ({ label, value }: { label: string; value: string }) => (
        <div className="mb-4">
            <h4 className="text-sm font-semibold text-muted-foreground">{label}</h4>
            <p className="text-base text-foreground font-medium mt-1">{value || "—"}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <FormSection
                title="Review Your Journey"
                description="Ready to align with the cosmos? 🌌"
                icon={<CheckCircle2 className="w-6 h-6" />}
                accentColor="emerald"
            >
                <div className="grid sm:grid-cols-2 gap-6">
                    <ReviewItem label="Name" value={formData.preferred_name} />
                    <ReviewItem label="Birth Place" value={formData.birth_place} />
                    <ReviewItem label="Birth Date" value={formData.birth_date} />
                    <ReviewItem label="Birth Time" value={formData.birth_time} />
                    <ReviewItem label="Nakshatra" value={formData.nakshatra} />
                    <ReviewItem label="Lagna" value={formData.lagna} />
                </div>

                <div className="mt-6 border-t pt-6">
                    <ReviewItem label="Manifestation Focus" value={formData.manifestation_focus} />
                </div>

                <div className="mt-4 border-t pt-4 grid sm:grid-cols-2 gap-6">
                    <ReviewItem label="Strengths" value={formData.strengths} />
                    <ReviewItem label="Legacy" value={formData.legacy} />
                </div>

                <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">Generation Mode</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                            {formData.generation_mode || "Deep"}
                        </span>
                    </div>
                </div>

            </FormSection>

            {/* Submit Button Area */}
            <div className="pt-4 relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-full h-20 bg-gradient-to-r from-sunrise-pink/20 via-sunrise-gold/20 to-sage/20 blur-2xl rounded-full" />
                </div>
                <Button
                    onClick={onNext}
                    variant="default"
                    size="lg"
                    className="relative w-full h-16 text-lg font-semibold gradient-button shadow-button hover:shadow-glow transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] rounded-2xl group"
                >
                    <Wand2 className="w-6 h-6 mr-3 group-hover:animate-wave" />
                    Generate My Manifestation
                    <Sparkles className="w-5 h-5 ml-3 animate-twinkle" />
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-5 flex items-center justify-center gap-2">
                    <Star className="w-4 h-4 text-sunrise-gold" />
                    Your personalized manifestation awaits
                    <Star className="w-4 h-4 text-sunrise-gold" />
                </p>
            </div>
        </div>
    );
}
