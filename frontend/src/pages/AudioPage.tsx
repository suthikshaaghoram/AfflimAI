import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { VoiceStyleSelector } from "@/components/VoiceStyleSelector";
import { Loader } from "@/components/Loader";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { generateAudio, AudioRequest, getSupportedLanguages, SupportedLanguage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, Volume2, Globe, Sparkles } from "lucide-react";
import { toast } from "sonner";

type TranslationStatus = "idle" | "loading" | "ready" | "error";

interface LocationState {
    manifestation: string;
    username?: string;
    translations: Record<string, string>;
    translationStatus: Record<string, TranslationStatus>;
}

export default function AudioPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<"male" | "female" | null>(null);
    const [selectedAudioLanguage, setSelectedAudioLanguage] = useState<string>("en");
    const [supportedLanguages, setSupportedLanguages] = useState<Record<string, SupportedLanguage>>({});
    const [voiceStyle, setVoiceStyle] = useState<"calm" | "balanced" | "uplifting">("calm");

    // Redirect if no manifestation data
    useEffect(() => {
        if (!state?.manifestation) {
            toast.error("No manifestation data found");
            navigate("/");
        }
    }, [state, navigate]);

    // Fetch supported languages
    useEffect(() => {
        const fetchLanguages = async () => {
            try {
                const response = await getSupportedLanguages();
                setSupportedLanguages(response.languages);
            } catch (error) {
                console.error("Error fetching supported languages:", error);
            }
        };
        fetchLanguages();
    }, []);

    // Clear audio when language selection changes
    useEffect(() => {
        setAudioUrl(prev => {
            if (prev) {
                URL.revokeObjectURL(prev);
            }
            return null;
        });
        setSelectedVoice(null);
    }, [selectedAudioLanguage]);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
        };
    }, [audioUrl]);

    const handleGenerateAudio = async (gender: "male" | "female") => {
        if (isGeneratingAudio) {
            return;
        }

        setSelectedVoice(gender);
        setIsGeneratingAudio(true);

        try {
            const textToSpeak = state.translations[selectedAudioLanguage] || state.manifestation;

            const request: AudioRequest = {
                text: textToSpeak,
                gender,
                language: selectedAudioLanguage,
                voice_style: voiceStyle,  // Pass voice style
            };

            const response = await generateAudio(request);
            setAudioUrl(response.audio_url);
            toast.success(`✨ Audio generated in ${voiceStyle} style!`);
        } catch (error) {
            console.error("Error generating audio:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate audio");
            setSelectedVoice(null);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    // Get available languages (English + successfully translated languages)
    const getAvailableLanguages = () => {
        const available: Array<{ code: string; info: SupportedLanguage }> = [];

        // Add non-English languages that are ready
        if (state?.translationStatus) {
            Object.entries(state.translationStatus).forEach(([code, status]) => {
                if (code !== "en" && status === "ready" && supportedLanguages[code]) {
                    available.push({ code, info: supportedLanguages[code] });
                }
            });
        }

        return available;
    };

    if (!state?.manifestation) {
        return null;
    }

    const availableLanguages = getAvailableLanguages();

    return (
        <div className="min-h-screen gradient-hero relative overflow-hidden">
            <FloatingElements />
            <Header />

            <main className="relative container max-w-3xl mx-auto px-4 py-8 md:py-12 z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-sage/30 mb-6 shadow-soft">
                        <Volume2 className="w-4 h-4 text-sage-deep animate-twinkle" />
                        <span className="text-sm font-medium text-foreground">Audio Generation</span>
                        <Sparkles className="w-4 h-4 text-sunrise-gold animate-pulse-soft" />
                    </div>

                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-gradient">Listen to Your Manifestation</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Choose language and voice for your audio
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Audio Section */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-transparent to-sky-blue/10 rounded-3xl" />
                        <div className="relative gradient-card rounded-3xl shadow-card p-8 md:p-10 border border-sage/20">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sage to-sage-deep flex items-center justify-center">
                                    <Volume2 className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-semibold text-foreground">
                                        Audio Settings
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Select language and voice preference
                                    </p>
                                </div>
                            </div>

                            {/* Language Selection for Audio */}
                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-sunrise-orange" />
                                    <p className="text-sm font-medium text-foreground">Select audio language:</p>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {/* English is always available */}
                                    <Button
                                        variant={selectedAudioLanguage === "en" ? "default" : "secondary"}
                                        size="sm"
                                        onClick={() => setSelectedAudioLanguage("en")}
                                        className={cn(
                                            "rounded-xl transition-all duration-300",
                                            selectedAudioLanguage === "en"
                                                ? "gradient-button shadow-button"
                                                : "bg-card hover:bg-sage/20 border border-sage/30"
                                        )}
                                    >
                                        English
                                    </Button>

                                    {/* Only show languages that have been successfully translated */}
                                    {availableLanguages.map(({ code, info }) => (
                                        <Button
                                            key={code}
                                            variant={selectedAudioLanguage === code ? "default" : "secondary"}
                                            size="sm"
                                            onClick={() => setSelectedAudioLanguage(code)}
                                            className={cn(
                                                "rounded-xl transition-all duration-300",
                                                selectedAudioLanguage === code
                                                    ? "gradient-button shadow-button"
                                                    : "bg-card hover:bg-lotus-pink/20 border border-lotus-pink/30"
                                            )}
                                        >
                                            {info.name} ({info.native_name})
                                        </Button>
                                    ))}
                                </div>

                                {availableLanguages.length === 0 && (
                                    <p className="text-sm text-muted-foreground italic">
                                        Only English is available. Go back to translation page to add more languages.
                                    </p>
                                )}
                            </div>

                            {isGeneratingAudio ? (
                                <Loader message="Creating your audio..." className="py-8" />
                            ) : audioUrl ? (
                                <AudioPlayer audioUrl={audioUrl} />
                            ) : (
                                <div className="space-y-5">
                                    {/* Voice Style Selector - NEW */}
                                    <div className="mb-6">
                                        <VoiceStyleSelector
                                            value={voiceStyle}
                                            onChange={setVoiceStyle}
                                            disabled={isGeneratingAudio}
                                        />
                                    </div>

                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-sunrise-gold" />
                                        Choose your preferred voice:
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <Button
                                            variant={selectedVoice === "male" ? "default" : "secondary"}
                                            size="lg"
                                            onClick={() => handleGenerateAudio("male")}
                                            className={cn(
                                                "flex-1 h-14 rounded-xl transition-all duration-300 hover:scale-105",
                                                selectedVoice === "male"
                                                    ? "gradient-audio shadow-button"
                                                    : "bg-card hover:bg-sage/20 border border-sage/30"
                                            )}
                                        >
                                            <Volume2 className="w-5 h-5 mr-2" />
                                            Male Voice
                                        </Button>
                                        <Button
                                            variant={selectedVoice === "female" ? "default" : "secondary"}
                                            size="lg"
                                            onClick={() => handleGenerateAudio("female")}
                                            className={cn(
                                                "flex-1 h-14 rounded-xl transition-all duration-300 hover:scale-105",
                                                selectedVoice === "female"
                                                    ? "gradient-audio shadow-button"
                                                    : "bg-card hover:bg-lotus-pink/20 border border-lotus-pink/30"
                                            )}
                                        >
                                            <Volume2 className="w-5 h-5 mr-2" />
                                            Female Voice
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/translate", { state: { manifestation: state.manifestation, username: state.username } })}
                            className="rounded-xl border-2 hover:scale-105 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Translation
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
