import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/AudioPlayer";
import { BackgroundMusicCard } from "@/components/BackgroundMusicCard";
import { VoiceStyleSelector } from "@/components/VoiceStyleSelector";
import { Loader } from "@/components/Loader";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { generateAudio, AudioRequest, getSupportedLanguages, SupportedLanguage, finalizeAudio, FinalizeAudioRequest, getBackgroundTracks, uploadBackgroundTrack, BackgroundTrack } from "@/lib/api";
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

    // --- Audio Player & BG State ---
    const [voiceVolume, setVoiceVolume] = useState(100);
    const [bgVolume, setBgVolume] = useState(20);
    const [selectedBgTrackId, setSelectedBgTrackId] = useState<string>("default-meditation");
    const [isBgEnabled, setIsBgEnabled] = useState(true);
    const [backgroundTracks, setBackgroundTracks] = useState<BackgroundTrack[]>([]);
    const [isUploadingBg, setIsUploadingBg] = useState(false);

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

    // Fetch supported languages & Background Tracks
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const [langRes, tracksRes] = await Promise.all([
                    getSupportedLanguages(),
                    getBackgroundTracks()
                ]);
                setSupportedLanguages(langRes.languages);
                setBackgroundTracks(tracksRes);

                // Set default track
                if (!selectedBgTrackId) {
                    const defaultTrack = tracksRes.find(t => t.is_default);
                    if (defaultTrack) setSelectedBgTrackId(defaultTrack.id);
                }
            } catch (error) {
                console.error("Error fetching resources:", error);
            }
        };
        fetchResources();
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
            setAudioFilename(response.filename || `manifestation_${Date.now()}.mp3`);
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

    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { toast.error("File size must be less than 10MB"); return; }

        setIsUploadingBg(true);
        try {
            const newTrack = await uploadBackgroundTrack(file);
            setBackgroundTracks(prev => [...prev, newTrack]);
            setSelectedBgTrackId(newTrack.id);
            toast.success("Background track uploaded!");
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Failed to upload track");
        } finally { setIsUploadingBg(false); }
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

            <main className="relative container max-w-6xl mx-auto px-4 py-8 md:py-12 z-10">
                {/* Header */}
                <div className="text-center mb-10 animate-fade-up">
                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
                        Listen to Your Manifestation
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Choose language and voice for your audio
                    </p>
                </div>

                <div className="grid md:grid-cols-12 gap-8 items-start">
                    {/* LEFT COLUMN: Settings (Col Span 4) */}
                    <div className="md:col-span-5 lg:col-span-4 space-y-6 animate-fade-up">
                        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl p-6 border border-green-200/50 shadow-sm relative overflow-hidden">
                            {/* Decorative background for card */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-200/30 rounded-full blur-2xl -mr-6 -mt-6"></div>

                            <h2 className="font-display text-xl font-semibold mb-6 text-foreground relative z-10">
                                Audio Settings
                            </h2>

                            {/* Language Selector */}
                            <div className="space-y-4 mb-8 relative z-10">
                                <label className="text-sm font-medium text-muted-foreground">Select audio language</label>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-between h-12 rounded-xl border-green-200 bg-white/80 hover:bg-white transition-all",
                                            selectedAudioLanguage === "en" && "ring-2 ring-green-400 border-transparent shadow-sm"
                                        )}
                                        onClick={() => setSelectedAudioLanguage("en")}
                                    >
                                        <span className="flex items-center gap-2">🇬🇧 English</span>
                                        {selectedAudioLanguage === "en" && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                    </Button>

                                    {availableLanguages.map(({ code, info }) => (
                                        <Button
                                            key={code}
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-between h-12 rounded-xl border-green-200 bg-white/80 hover:bg-white transition-all",
                                                selectedAudioLanguage === code && "ring-2 ring-green-400 border-transparent shadow-sm"
                                            )}
                                            onClick={() => setSelectedAudioLanguage(code)}
                                        >
                                            <span className="flex items-center gap-2">🌐 {info.name}</span>
                                            {selectedAudioLanguage === code && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Voice Selector */}
                            <div className="space-y-4 relative z-10">
                                <label className="text-sm font-medium text-muted-foreground">Voice Selection</label>

                                {/* Style Selector - Using existing component but styled simpler if needed */}
                                <div className="mb-4">
                                    <VoiceStyleSelector
                                        value={voiceStyle}
                                        onChange={setVoiceStyle}
                                        disabled={isGeneratingAudio}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div
                                        onClick={() => handleGenerateAudio("male")}
                                        className={cn(
                                            "cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col items-center gap-2 text-center bg-white/60 hover:bg-white hover:scale-105",
                                            selectedVoice === "male"
                                                ? "border-orange-300 bg-orange-50 shadow-md transform scale-105"
                                                : "border-transparent hover:border-orange-200"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", selectedVoice === "male" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500")}>
                                            <Volume2 className="w-5 h-5" />
                                        </div>
                                        <span className={cn("text-xs font-medium", selectedVoice === "male" ? "text-orange-800" : "text-gray-600")}>Male</span>
                                    </div>

                                    <div
                                        onClick={() => handleGenerateAudio("female")}
                                        className={cn(
                                            "cursor-pointer rounded-2xl p-4 border-2 transition-all duration-300 flex flex-col items-center gap-2 text-center bg-white/60 hover:bg-white hover:scale-105",
                                            selectedVoice === "female"
                                                ? "border-pink-300 bg-pink-50 shadow-md transform scale-105"
                                                : "border-transparent hover:border-pink-200"
                                        )}
                                    >
                                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", selectedVoice === "female" ? "bg-pink-100 text-pink-600" : "bg-gray-100 text-gray-500")}>
                                            <Volume2 className="w-5 h-5" />
                                        </div>
                                        <span className={cn("text-xs font-medium", selectedVoice === "female" ? "text-pink-800" : "text-gray-600")}>Female</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Player (Col Span 8) */}
                    <div className="md:col-span-7 lg:col-span-8 space-y-6 animate-fade-up" style={{ animationDelay: "100ms" }}>

                        {/* Audio Player Card */}
                        <div className="relative">
                            {isGeneratingAudio ? (
                                <div className="h-64 rounded-3xl bg-gradient-to-br from-mystic-dark via-mystic-violet to-mystic-dark border-white/10 border backdrop-blur-md flex items-center justify-center shadow-lg overflow-hidden">
                                    <div className="text-white/90">
                                        <Loader message="Creating your audio..." />
                                    </div>
                                </div>
                            ) : (voiceAudioUrl || finalAudioUrl) ? (
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
                                    backgroundTracks={backgroundTracks}
                                    isFinalized={isFinalized}
                                    className="mt-0"
                                />
                            ) : (
                                // Placeholder State
                                <div className="h-64 rounded-3xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-indigo-50/10 flex items-center justify-center mb-4">
                                        <Volume2 className="w-8 h-8 text-indigo-300/50" />
                                    </div>
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">Ready to Genereate</h3>
                                    <p className="text-sm text-muted-foreground/60 max-w-xs">
                                        Select a language and voice style from the left to generate your manifestation audio.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Background Music Card */}
                        {(voiceAudioUrl || finalAudioUrl) && (
                            <BackgroundMusicCard
                                tracks={backgroundTracks}
                                selectedTrackId={selectedBgTrackId}
                                onTrackChange={setSelectedBgTrackId}
                                volume={bgVolume}
                                onVolumeChange={setBgVolume}
                                isEnabled={isBgEnabled}
                                onEnabledChange={setIsBgEnabled}
                                onUpload={handleBgUpload}
                                isUploading={isUploadingBg}
                                disabled={isFinalized}
                            />
                        )}

                        {/* Finalize Button Area */}
                        {(voiceAudioUrl && !isFinalized) && (
                            <div className="flex justify-center pt-4">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="lg"
                                            className="gradient-button shadow-gold-glow rounded-xl px-12 py-6 h-auto text-lg hover:scale-105 transition-all w-full"
                                            disabled={isFinalizing}
                                        >
                                            {isFinalizing ? (
                                                <>
                                                    <Loader className="mr-2 w-5 h-5" />
                                                    Finalizing Magic...
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
                </div>
            </main>
        </div>
    );
}
