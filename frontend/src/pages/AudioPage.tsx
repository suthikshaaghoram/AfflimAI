import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { VoiceStyleSelector } from "@/components/VoiceStyleSelector";
import { Loader } from "@/components/Loader";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { generateAudio, AudioRequest, getSupportedLanguages, SupportedLanguage, finalizeAudio, FinalizeAudioRequest } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, Volume2, Globe, Sparkles, Wand2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

    // --- State ---
    const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
    const [audioFilename, setAudioFilename] = useState<string>(""); // Captured from generation
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState<"male" | "female" | null>(null);
    const [selectedAudioLanguage, setSelectedAudioLanguage] = useState<string>("en");
    const [supportedLanguages, setSupportedLanguages] = useState<Record<string, SupportedLanguage>>({});
    const [voiceStyle, setVoiceStyle] = useState<"calm" | "balanced" | "uplifting">("calm");

    // --- Audio Player Controlled State ---
    const [voiceVolume, setVoiceVolume] = useState(100);
    const [bgVolume, setBgVolume] = useState(20);
    const [selectedBgTrackId, setSelectedBgTrackId] = useState<string>("default-meditation");
    const [isBgEnabled, setIsBgEnabled] = useState(true);

    // --- Finalization State ---
    const [isFinalizing, setIsFinalizing] = useState(false);
    const [finalAudioUrl, setFinalAudioUrl] = useState<string | null>(null);
    const [isFinalized, setIsFinalized] = useState(false);

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
        setVoiceAudioUrl(prev => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setAudioFilename("");
        setSelectedVoice(null);
        // Reset finalization
        setIsFinalized(false);
        if (finalAudioUrl) URL.revokeObjectURL(finalAudioUrl);
        setFinalAudioUrl(null);

    }, [selectedAudioLanguage]);

    // Cleanup audio URL on unmount
    useEffect(() => {
        return () => {
            if (voiceAudioUrl) URL.revokeObjectURL(voiceAudioUrl);
            if (finalAudioUrl) URL.revokeObjectURL(finalAudioUrl);
        };
    }, [voiceAudioUrl, finalAudioUrl]);

    const handleGenerateAudio = async (gender: "male" | "female") => {
        if (isGeneratingAudio) return;

        setSelectedVoice(gender);
        setIsGeneratingAudio(true);
        // Reset finalization if generating new voice
        setIsFinalized(false);
        setFinalAudioUrl(null);

        try {
            const textToSpeak = state.translations[selectedAudioLanguage] || state.manifestation;

            const request: AudioRequest = {
                text: textToSpeak,
                gender,
                language: selectedAudioLanguage,
                voice_style: voiceStyle,
                username: state.username
            };

            const response = await generateAudio(request);
            setVoiceAudioUrl(response.audio_url);
            setAudioFilename(response.filename || `manifestation_${Date.now()}.mp3`); // Fallback if no filename
            toast.success(`✨ Audio generated in ${voiceStyle} style!`);
        } catch (error) {
            console.error("Error generating audio:", error);
            toast.error(error instanceof Error ? error.message : "Failed to generate audio");
            setSelectedVoice(null);
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleFinalizeAudio = async () => {
        if (!audioFilename) {
            toast.error("No voice audio generated yet");
            return;
        }

        setIsFinalizing(true);
        try {
            const request: FinalizeAudioRequest = {
                voice_filename: audioFilename,
                background_track_id: isBgEnabled ? selectedBgTrackId : "none",
                bg_volume: isBgEnabled ? bgVolume : 0,
                voice_volume: voiceVolume,
                username: state.username || "user"
            };

            const response = await finalizeAudio(request);
            setFinalAudioUrl(response.audio_url);
            setIsFinalized(true);
            toast.success("Your personalized audio is ready! ✨");
        } catch (error) {
            console.error("Finalization error:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to create final audio";
            toast.error(`Finalization failed: ${errorMessage}`);
        } finally {
            setIsFinalizing(false);
        }
    };

    // Get available languages
    const getAvailableLanguages = () => {
        const available: Array<{ code: string; info: SupportedLanguage }> = [];
        if (state?.translationStatus) {
            Object.entries(state.translationStatus).forEach(([code, status]) => {
                if (code !== "en" && status === "ready" && supportedLanguages[code]) {
                    available.push({ code, info: supportedLanguages[code] });
                }
            });
        }
        return available;
    };

    if (!state?.manifestation) return null;

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
                        <span className="text-gradient">
                            {isFinalized ? "Your Personalized Audio" : "Listen to Your Manifestation"}
                        </span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        {isFinalized
                            ? "Download your permanent manifestation track below"
                            : "Choose language and voice for your audio"
                        }
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Audio Section */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-transparent to-sky-blue/10 rounded-3xl" />
                        <div className="relative gradient-card rounded-3xl shadow-card p-8 md:p-10 border border-sage/20">
                            {/* Hidden checks if finalized? Replaced content? 
                                Design choice: Keep standard player visible but locked if finalized?
                                Or just show the FINAL player?
                                The AudioPlayer component handles both states.
                                If finalized, we pass finalAudioUrl to it.
                            */}

                            {!isFinalized && (
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setVoiceAudioUrl(null);
                                            setAudioFilename("");
                                            setFinalAudioUrl(null);
                                        }}
                                        className="text-muted-foreground hover:text-foreground hover:bg-sage/10"
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Change Voice
                                    </Button>
                                </div>
                            )}

                            {/* Language Selection (Hide if finalized or keep for regeneration?) */}
                            {!isFinalized && (
                                <div className="space-y-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-sunrise-orange" />
                                        <p className="text-sm font-medium text-foreground">Select audio language:</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
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
                                </div>
                            )}

                            {isGeneratingAudio ? (
                                <Loader message="Creating your audio..." className="py-8" />
                            ) : (voiceAudioUrl || finalAudioUrl) ? (
                                <div className="space-y-6">
                                    <AudioPlayer
                                        audioUrl={finalAudioUrl || voiceAudioUrl || ""}
                                        voiceVolume={voiceVolume}
                                        onVoiceVolumeChange={setVoiceVolume}
                                        bgVolume={bgVolume}
                                        onBgVolumeChange={setBgVolume}
                                        selectedBgTrackId={selectedBgTrackId}
                                        onBgTrackIdChange={setSelectedBgTrackId}
                                        isBgEnabled={isBgEnabled}
                                        onBgEnabledChange={setIsBgEnabled}
                                        isFinalized={isFinalized}
                                    />

                                    {/* Finalize Button Section */}
                                    {!isFinalized && (
                                        <div className="flex justify-center pt-2">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        size="lg"
                                                        className="gradient-button shadow-gold-glow rounded-xl px-8 py-6 h-auto text-lg hover:scale-105 transition-all w-full md:w-auto"
                                                        disabled={isFinalizing}
                                                    >
                                                        {isFinalizing ? (
                                                            <>
                                                                <Loader className="mr-2 w-5 h-5" />
                                                                Creating...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Wand2 className="w-5 h-5 mr-3" />
                                                                ✨ Finalize My Manifestation Audio
                                                            </>
                                                        )}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-white/20">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Finalize Audio?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently merge your manifestation voice with the selected background music using your chosen intensity.
                                                            <br /><br />
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={handleFinalizeAudio}
                                                            className="gradient-button rounded-xl"
                                                        >
                                                            Finalize & Create Audio
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    )}

                                    {isFinalized && (
                                        <div className="text-center animate-fade-up">
                                            <p className="text-sage-deep font-medium mb-4">
                                                Your audio is ready! Download it using the player above.
                                            </p>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsFinalized(false);
                                                    setFinalAudioUrl(null);
                                                }}
                                                className="text-muted-foreground hover:text-foreground"
                                            >
                                                Create New Version
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-5">
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

            {/* Global Loader for Finalization if needed covering screen? 
                No, button has loading state. But prompt said "Show loading state: Creating your personalized manifestation audio…" 
                The button shows it, and we can add a global overlay if we want to be stricter.
                Let's stick to button loader for better UX or replace the card content with Loader.
            */}
            {isFinalizing && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                    <Loader message="Creating your personalized manifestation audio..." />
                </div>
            )}
        </div>
    );
}
