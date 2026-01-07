import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Linkedin, PenLine, Sparkles, Heart } from "lucide-react";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";

export default function StartPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen gradient-hero relative overflow-hidden">
            <FloatingElements />
            <Header />

            <main className="relative container max-w-3xl mx-auto px-4 py-8 md:py-12 z-10 flex flex-col items-center justify-center min-h-[80vh]">
                <div className="text-center mb-12 animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-sunrise-gold/30 mb-6 shadow-soft">
                        <Sparkles className="w-4 h-4 text-sunrise-orange animate-twinkle" />
                        <span className="text-sm font-medium text-foreground">Begin Your Journey</span>
                    </div>

                    <h1 className="font-display text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        Welcome to <span className="text-gradient">AfflimAI</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10">
                        How would you like to create your manifestation profile today?
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl mx-auto">
                        {/* LinkedIn Option */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <Button
                                variant="outline"
                                className="w-full h-auto py-8 px-6 flex flex-col items-center gap-4 bg-background/50 hover:bg-background/80 border-blue-500/20 hover:border-blue-500/50 rounded-3xl transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => navigate('/onboarding/linkedin')}
                            >
                                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Linkedin className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold mb-2">From Social Media Profiles</h3>
                                    <p className="text-sm text-muted-foreground text-balance">
                                        Connect LinkedIn (PDF), GitHub, or Portfolio. We'll extract your achievements and goals automatically.
                                    </p>
                                </div>
                            </Button>
                        </div>

                        {/* Manual Option */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-sunrise-orange/20 to-lotus-pink/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <Button
                                variant="outline"
                                className="w-full h-auto py-8 px-6 flex flex-col items-center gap-4 bg-background/50 hover:bg-background/80 border-sunrise-orange/20 hover:border-sunrise-orange/50 rounded-3xl transition-all duration-300 hover:scale-[1.02]"
                                onClick={() => navigate('/onboarding/manual')}
                            >
                                <div className="w-16 h-16 rounded-full bg-sunrise-orange/10 flex items-center justify-center mb-2">
                                    <PenLine className="w-8 h-8 text-sunrise-orange" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold mb-2">Enter Manually</h3>
                                    <p className="text-sm text-muted-foreground text-balance">
                                        Fill in your details step-by-step. Perfect for a deeply personal touch.
                                    </p>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
