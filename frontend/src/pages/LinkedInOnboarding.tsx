import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { FloatingElements } from "@/components/FloatingElements";
import { ingestProfile, summarizeProfile } from "@/lib/api";
import { Loader } from "@/components/Loader";
import { toast } from "sonner";
import { Upload, FileText, ArrowRight, ShieldCheck, Github, Globe, Linkedin, Link as LinkIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingSocial() {
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<"idle" | "ingesting" | "summarizing">("idle");

    const [file, setFile] = useState<File | null>(null);
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile);
            } else {
                toast.error("Please upload a PDF file.");
            }
        }
    };

    const handleProcess = async () => {
        if (!file && !linkedinUrl && !githubUrl && !portfolioUrl) {
            toast.error("Please provide at least one source (PDF, LinkedIn, GitHub, or Portfolio).");
            return;
        }

        try {
            setIsProcessing(true);

            // Step 1: Ingest (Aggregate all)
            setProcessingStep("ingesting");
            const ingestResponse = await ingestProfile({
                file: file || undefined,
                linkedin_url: linkedinUrl || undefined,
                github_url: githubUrl || undefined,
                portfolio_url: portfolioUrl || undefined
            });

            // Step 2: Summarize
            setProcessingStep("summarizing");
            const summaryResponse = await summarizeProfile(ingestResponse.raw_profile_text);

            // Step 3: Redirect
            toast.success("Profile aggregated successfully!");
            navigate('/profile-summary', {
                state: {
                    initialData: summaryResponse.manifestation_data,
                    fromSocial: true
                }
            });

        } catch (error) {
            console.error(error);
            toast.error(error instanceof Error ? error.message : "Failed to process profile.");
            setIsProcessing(false);
            setProcessingStep("idle");
        }
    };

    return (
        <div className="min-h-screen gradient-hero relative overflow-hidden">
            <FloatingElements />
            <Header />

            <main className="relative container max-w-2xl mx-auto px-4 py-8 md:py-12 z-10">
                {isProcessing ? (
                    <Loader
                        message={
                            processingStep === "ingesting"
                                ? "Aggregating your digital footprint..."
                                : "Analyzing your career & skills..."
                        }
                    />
                ) : (
                    <div className="gradient-card rounded-3xl shadow-card border border-border/30 p-8 text-center animate-fade-up">
                        <h1 className="font-display text-3xl font-bold mb-4">Build Your Professional DNA</h1>
                        <p className="text-muted-foreground mb-8 text-balance">
                            We combine insights from multiple sources to create a highly accurate manifestation profile.
                            Add as many as you like.
                        </p>

                        <div className="space-y-8 text-left">

                            {/* LinkedIn Section */}
                            <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                                <div className="flex items-center gap-2 mb-2">
                                    <Linkedin className="w-5 h-5 text-blue-600" />
                                    <h3 className="font-semibold">LinkedIn Profile</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="linkedin-url" className="text-xs text-muted-foreground">Profile URL (Optional)</Label>
                                    <Input
                                        id="linkedin-url"
                                        placeholder="https://linkedin.com/in/..."
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        className="bg-background/50"
                                    />
                                </div>

                                <div className={`border-2 border-dashed rounded-xl p-4 transition-colors text-center ${file ? 'border-green-500/50 bg-green-500/5' : 'border-input hover:border-blue-500/30'}`}>
                                    <input type="file" id="pdf-upload" className="hidden" accept=".pdf" onChange={handleFileChange} />
                                    <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Upload className="w-4 h-4" />
                                            {file ? file.name : "Upload Profile PDF (Recommended)"}
                                        </div>
                                        {!file && <span className="text-xs text-muted-foreground">Export from LinkedIn Profile -&gt; More -&gt; Save to PDF</span>}
                                    </label>
                                </div>
                            </div>

                            {/* GitHub Section */}
                            <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                                <div className="flex items-center gap-2">
                                    <Github className="w-5 h-5 text-foreground" />
                                    <h3 className="font-semibold">GitHub Profile</h3>
                                </div>
                                <Input
                                    placeholder="https://github.com/username"
                                    value={githubUrl}
                                    onChange={(e) => setGithubUrl(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>

                            {/* Portfolio Section */}
                            <div className="space-y-4 p-4 rounded-xl bg-secondary/30 border border-border/40">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-5 h-5 text-green-600" />
                                    <h3 className="font-semibold">Portfolio / Website</h3>
                                </div>
                                <Input
                                    placeholder="https://yourname.com"
                                    value={portfolioUrl}
                                    onChange={(e) => setPortfolioUrl(e.target.value)}
                                    className="bg-background/50"
                                />
                            </div>

                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg gradient-button shadow-button"
                                disabled={!file && !linkedinUrl && !githubUrl && !portfolioUrl}
                                onClick={handleProcess}
                            >
                                Generate Combined Summary
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => navigate('/onboarding/manual')}
                            >
                                Skip to Manual Entry
                            </Button>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground/70">
                            <ShieldCheck className="w-3 h-3" />
                            <span>We value your privacy. Your data is never stored externally.</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
