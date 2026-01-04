import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { translateManifestation, getSupportedLanguages, SupportedLanguage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Globe, Languages, RefreshCw, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type TranslationStatus = "idle" | "loading" | "ready" | "error";

interface LocationState {
    manifestation: string;
    username?: string;
}

export default function TranslationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    const [supportedLanguages, setSupportedLanguages] = useState<Record<string, SupportedLanguage>>({});
    const [translationStatus, setTranslationStatus] = useState<Record<string, TranslationStatus>>({
        en: "ready",
        ta: "idle",
        hi: "idle"
    });
    const [translations, setTranslations] = useState<Record<string, string>>({
        en: state?.manifestation || ""
    });

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

    const handleTranslate = async (languageCode: string) => {
        if (!languageCode || !state?.manifestation) return;

        if (translationStatus[languageCode] === "loading") {
            return;
        }

        if (translationStatus[languageCode] === "ready") {
            return;
        }

        setTranslationStatus(prev => ({ ...prev, [languageCode]: "loading" }));

        try {
            const response = await translateManifestation({
                text: state.manifestation,
                target_language: languageCode,
                username: state.username || "anonymous",
            });

            setTranslations(prev => ({
                ...prev,
                [languageCode]: response.translated_text
            }));

            setTranslationStatus(prev => ({ ...prev, [languageCode]: "ready" }));

            toast.success(`✨ Translated to ${response.language}!`);
        } catch (error) {
            console.error("Error translating:", error);
            toast.error(error instanceof Error ? error.message : "Failed to translate");
            setTranslationStatus(prev => ({ ...prev, [languageCode]: "error" }));
        }
    };

    const handleProceedToAudio = () => {
        navigate("/audio", {
            state: {
                manifestation: state.manifestation,
                username: state.username,
                translations,
                translationStatus
            }
        });
    };

    if (!state?.manifestation) {
        return null;
    }

    return (
        <div className="min-h-screen gradient-hero relative overflow-hidden">
            <FloatingElements />
            <Header />

            <main className="relative container max-w-3xl mx-auto px-4 py-8 md:py-12 z-10">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-lotus-pink/30 mb-6 shadow-soft">
                        <Languages className="w-4 h-4 text-lotus-pink animate-twinkle" />
                        <span className="text-sm font-medium text-foreground">Translation</span>
                        <Sparkles className="w-4 h-4 text-sunrise-gold animate-pulse-soft" />
                    </div>

                    <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-gradient">Translate to Your Language</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Experience your manifestation in Tamil or Hindi
                    </p>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Original Manifestation */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-sunrise-pink/10 via-transparent to-sage/10 rounded-3xl" />
                        <div className="relative gradient-card rounded-3xl shadow-card p-8 md:p-10 border border-sunrise-gold/20">
                            <h3 className="font-display text-xl font-semibold text-foreground mb-4">
                                Your Manifestation
                            </h3>
                            <div className="prose prose-lg max-w-none">
                                <p className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap text-balance text-lg">
                                    {state.manifestation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Translation Section */}
                    {Object.keys(supportedLanguages).length > 0 && (
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-lotus-pink/10 via-transparent to-sunrise-orange/10 rounded-3xl" />
                            <div className="relative gradient-card rounded-3xl shadow-card p-8 md:p-10 border border-lotus-pink/20">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lotus-pink to-sunrise-pink flex items-center justify-center">
                                        <Languages className="w-5 h-5 text-primary-foreground" />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-xl font-semibold text-foreground">
                                            Choose Your Language
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Translate to Tamil or Hindi
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-sunrise-orange" />
                                        Select a language to translate:
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        {Object.entries(supportedLanguages).map(([code, info]) => {
                                            const status = translationStatus[code];
                                            const isLoading = status === "loading";
                                            const isReady = status === "ready";

                                            return (
                                                <Button
                                                    key={code}
                                                    variant={isReady ? "default" : "secondary"}
                                                    size="lg"
                                                    onClick={() => handleTranslate(code)}
                                                    disabled={isLoading}
                                                    className={cn(
                                                        "flex-1 h-14 rounded-xl transition-all duration-300 hover:scale-105",
                                                        isReady
                                                            ? "gradient-button shadow-button"
                                                            : "bg-card hover:bg-lotus-pink/20 border border-lotus-pink/30"
                                                    )}
                                                >
                                                    {isLoading ? (
                                                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                                    ) : isReady ? (
                                                        <Check className="w-5 h-5 mr-2" />
                                                    ) : (
                                                        <Languages className="w-5 h-5 mr-2" />
                                                    )}
                                                    {isLoading ? "Translating..." : isReady ? `${info.name} ✓` : `${info.name} (${info.native_name})`}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    {/* Translated Text Display */}
                                    {Object.entries(supportedLanguages).map(([code, info]) => {
                                        const isReady = translationStatus[code] === "ready";
                                        const translatedText = translations[code];

                                        if (!isReady || !translatedText) return null;

                                        return (
                                            <div key={code} className="mt-6 p-6 bg-card/50 rounded-2xl border border-border/30 animate-fade-up">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <Globe className="w-5 h-5 text-sunrise-orange" />
                                                    <h4 className="font-display text-lg font-semibold text-foreground">
                                                        {info.name} Translation
                                                    </h4>
                                                </div>
                                                <div className="prose prose-lg max-w-none">
                                                    <p className="font-body text-foreground/90 leading-relaxed whitespace-pre-wrap text-balance text-lg">
                                                        {translatedText}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => navigate("/", { state: { returnToResult: true, manifestation: state.manifestation, username: state.username } })}
                            className="flex-1 rounded-xl border-2 hover:scale-105 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Result
                        </Button>
                        <Button
                            variant="default"
                            size="lg"
                            onClick={handleProceedToAudio}
                            className="flex-1 gradient-button shadow-button rounded-xl hover:scale-105 transition-all"
                        >
                            Generate Audio
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
