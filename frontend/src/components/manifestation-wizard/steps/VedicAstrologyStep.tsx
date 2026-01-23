import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/FormField";
import { FormSection } from "@/components/FormSection";
import { getVedicContext } from "@/lib/api";
import { Star, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { StepProps } from "../types";

export function VedicAstrologyStep({ formData, updateField, setFormData }: StepProps) {
    const [isAstroLoading, setIsAstroLoading] = useState(false);
    const [astroError, setAstroError] = useState<string | null>(null);
    // We can derive "isAutoFilled" from whether data exists, but for the "Lock" UX, 
    // we might want a local state. However, if user navigates away and back, local state resets.
    // Better to rely on data presence + maybe a check if we just fetched it?
    // Let's use a simple heuristic: if birth details are there, and nakshatra/lagna are populated, treat as 'filled'.
    // But user needs to be able to edit. 
    // Let's use a local state initialized by checking if fields are filled.
    const [isLocked, setIsLocked] = useState(!!(formData.nakshatra && formData.lagna));

    // Effect to trigger fetch if data is missing or if we want to auto-refresh
    // We only auto-fetch if fields are EMPTY and birth details are PRESENT.
    useEffect(() => {
        const { birth_date, birth_time, birth_place, nakshatra, lagna } = formData;

        const hasBirthDetails = birth_date && birth_time && birth_place && birth_place.length > 2;
        const isMissingVedic = !nakshatra || !lagna;

        if (hasBirthDetails && isMissingVedic && !isAstroLoading && !astroError) {
            fetchVedicContext();
        }
    }, [formData.birth_date, formData.birth_time, formData.birth_place]);
    // ^ removed nakshatra/lagna from dependence to avoid loops, only run if they are empty initially (checked inside)

    const fetchVedicContext = async () => {
        setIsAstroLoading(true);
        setAstroError(null);

        try {
            const response = await getVedicContext({
                birthDate: formData.birth_date,
                birthTime: formData.birth_time,
                birthPlace: formData.birth_place
            });

            if (response.nakshatra && response.rasi) {
                setFormData(prev => ({
                    ...prev,
                    nakshatra: response.nakshatra,
                    lagna: response.rasi // Mapping Rasi to the field previously used for Lagna/Rasi
                }));
                setIsLocked(true);
                toast.success("✨ Cosmic energies aligned!", { id: "astro-success" });
            }
        } catch (error) {
            console.error("Vedic Context Error:", error);
            setAstroError("Could not auto-calculate. Please select manually.");
        } finally {
            setIsAstroLoading(false);
        }
    };

    const handleManualReset = () => {
        setIsLocked(false);
        setFormData(prev => ({ ...prev, nakshatra: "", lagna: "" }));
    };

    return (
        <FormSection
            title="Vedic Astrology Context"
            description="Optional cosmic alignment for deeper personalization ⭐"
            icon={<Star className="w-6 h-6" />}
            accentColor="gold"
        >
            <div className="relative min-h-[200px]">
                {isAstroLoading && (
                    <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg border border-sunrise-gold/20 animate-in fade-in">
                        <Loader2 className="w-6 h-6 text-sunrise-gold animate-spin mb-2" />
                        <p className="text-sm font-medium text-sunrise-gold animate-pulse">Aligning cosmic energies...</p>
                    </div>
                )}

                <div className="grid sm:grid-cols-2 gap-5">
                    <div className="relative">
                        <FormField
                            label="Nakshatra"
                            name="nakshatra"
                            type={isLocked ? "text" : "select"}
                            placeholder="Select your birth star"
                            helperText={isLocked ? "✨ Auto-calculated from birth details" : "Your birth star"}
                            value={formData.nakshatra}
                            onChange={updateField("nakshatra")}
                            disabled={isLocked || isAstroLoading}
                            className={isLocked ? "bg-sunrise-gold/5 border-sunrise-gold/30 text-foreground font-medium" : ""}
                            options={[
                                "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashirsha", "Ardra",
                                "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
                                "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
                                "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta",
                                "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
                            ]}
                        />
                        {isLocked && (
                            <div className="absolute top-0 right-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                    onClick={handleManualReset}
                                    title="Edit manually"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <FormField
                            label="Rasi (Moon Sign)"
                            name="lagna"
                            type={isLocked ? "text" : "select"}
                            placeholder="Select your rasi"
                            helperText={isLocked ? "✨ Auto-calculated from birth details" : "Your moon sign (rasi)"}
                            value={formData.lagna}
                            onChange={updateField("lagna")}
                            disabled={isLocked || isAstroLoading}
                            className={isLocked ? "bg-sunrise-gold/5 border-sunrise-gold/30 text-foreground font-medium" : ""}
                            options={[
                                "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", "Cancer (Karka)",
                                "Leo (Simha)", "Virgo (Kanya)", "Libra (Tula)", "Scorpio (Vrishchika)",
                                "Sagittarius (Dhanu)", "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
                            ]}
                        />
                    </div>
                </div>

                {astroError && (
                    <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {astroError}
                    </p>
                )}
            </div>
        </FormSection>
    );
}
