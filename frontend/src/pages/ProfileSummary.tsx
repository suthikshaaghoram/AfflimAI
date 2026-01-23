import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { ArrowRight, Star, TrendingUp, Trophy, Target, Flag, Heart } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function ProfileSummary() {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location.state?.initialData;

    useEffect(() => {
        if (!data) {
            toast.error("No profile data found. Please upload your profile first.");
            navigate("/start");
        }
    }, [data, navigate]);

    if (!data) return null;

    const sections = [
        {
            label: "Key Strengths",
            content: data.strengths,
            icon: Star,
            color: "text-yellow-500",
            bg: "bg-yellow-500/10"
        },
        {
            label: "Areas for Growth",
            content: data.areas_of_improvement,
            icon: TrendingUp,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: "Greatest Achievement",
            content: data.greatest_achievement,
            icon: Trophy,
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        },
        {
            label: "Recent Milestone",
            content: data.recent_achievement,
            icon: Flag,
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            label: "Next Year Goals",
            content: data.next_year_goals,
            icon: Target,
            color: "text-red-500",
            bg: "bg-red-500/10"
        },
        {
            label: "Life Vision",
            content: data.life_goals,
            icon: Heart,
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        }
    ];

    const handleContinue = () => {
        navigate('/onboarding/manual', {
            state: {
                initialData: data,
                fromSocial: true
            }
        });
    };

    return (
        <div className="min-h-screen gradient-hero relative overflow-hidden">
            <FloatingElements />
            <Header />

            <main className="relative container max-w-4xl mx-auto px-4 py-8 md:py-12 z-10">
                <div className="text-center mb-10 animate-fade-up">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/60 border border-sunrise-gold/30 mb-6 shadow-soft">
                        <span className="text-sm font-medium text-foreground">AI Profile Analysis</span>
                    </div>
                    <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                        Here's What We Learned About You
                    </h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
                        We've distilled your professional journey into these core pillars.
                        Review your profile below before we customize your manifestation.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12 animate-fade-up" style={{ animationDelay: "0.1s" }}>
                    {sections.map((section, idx) => (
                        <div key={idx} className="gradient-card p-6 rounded-2xl border border-border/40 hover:border-border/60 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl ${section.bg} shrink-0`}>
                                    <section.icon className={`w-6 h-6 ${section.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">{section.label}</h3>
                                    <p className="text-muted-foreground text-sm leading-relaxed">
                                        {section.content || "Not identified from profile."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Legacy - Full Width */}
                    <div className="md:col-span-2 gradient-card p-6 rounded-2xl border border-border/40 hover:border-border/60 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-orange-500/10 shrink-0">
                                <Trophy className="w-6 h-6 text-orange-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Your Legacy</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {data.legacy || "Building a lasting impact."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={() => navigate('/start')}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        Start Over
                    </Button>
                    <Button
                        size="lg"
                        onClick={handleContinue}
                        className="h-12 px-8 text-lg gradient-button shadow-button"
                    >
                        Continue to Manifestation
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </main>
        </div>
    );
}
