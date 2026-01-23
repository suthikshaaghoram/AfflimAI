import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Edit3, Check, RefreshCw, Sparkles, AlertCircle, FileText } from "lucide-react";

interface ManifestationReviewProps {
    manifestation: string;
    onConfirm: (editedText: string) => void;
    onRegenerate: () => void;
    className?: string;
}

export function ManifestationReview({
    manifestation,
    onConfirm,
    onRegenerate,
    className
}: ManifestationReviewProps) {
    const [editedText, setEditedText] = useState(manifestation);
    const [isEditing, setIsEditing] = useState(false);

    const wordCount = editedText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const charCount = editedText.length;

    const handleConfirm = () => {
        onConfirm(editedText);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        setIsEditing(false);
    };

    return (
        <div className={cn("space-y-6 animate-fade-up", className)}>
            {/* Header */}
            <div className="text-center relative">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-48 h-48 bg-gradient-to-r from-sunrise-gold/30 via-sunrise-pink/30 to-lotus-pink/30 blur-3xl rounded-full animate-pulse-soft" />
                </div>
                <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-sunrise-gold to-sunrise-orange shadow-glow mb-4">
                    <FileText className="w-8 h-8 text-primary-foreground" />
                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-sunrise-gold animate-sparkle" />
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-gradient mb-2">
                    Review Your Manifestation
                </h2>
                <p className="text-muted-foreground">
                    Take a moment to review and edit if needed before finalizing
                </p>
            </div>

            {/* Info Alert */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-sky-blue/10 border border-sky-blue/30">
                <AlertCircle className="w-5 h-5 text-sky-blue mt-0.5 flex-shrink-0" />
                <div className="text-sm text-foreground/80">
                    <p className="font-medium mb-1">Review your personalized passage</p>
                    <p className="text-muted-foreground">
                        This is your AI-generated manifestation. You can edit it to make it more personal, or proceed as-is if it resonates with you.
                    </p>
                </div>
            </div>

            {/* Manifestation Text Area */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sunrise-pink/10 via-transparent to-sage/10 rounded-3xl" />
                <div className="relative gradient-card rounded-3xl shadow-card p-6 md:p-8 border border-sunrise-gold/20">
                    {/* Decorative corner */}
                    <div className="absolute top-4 right-4">
                        <Sparkles className="w-6 h-6 text-sunrise-gold/40 animate-twinkle" />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-foreground flex items-center gap-2">
                                <FileText className="w-4 h-4 text-sunrise-gold" />
                                Your Manifestation Passage
                            </label>
                            {!isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleEdit}
                                    className="text-sunrise-orange hover:text-sunrise-orange hover:bg-sunrise-orange/10"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            )}
                        </div>

                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            disabled={!isEditing}
                            className={cn(
                                "w-full min-h-[400px] p-6 rounded-2xl",
                                "font-body text-lg leading-relaxed",
                                "bg-card/50 border-2 transition-all duration-300",
                                "focus:outline-none focus:ring-2 focus:ring-sunrise-gold/50",
                                isEditing
                                    ? "border-sunrise-gold/50 bg-card text-foreground"
                                    : "border-border/30 text-foreground/90 cursor-default"
                            )}
                            placeholder="Your manifestation will appear here..."
                        />

                        {/* Character and Word Count */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/30">
                            <div className="flex gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">{wordCount}</span> words
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="font-medium text-foreground">{charCount}</span> characters
                                </span>
                            </div>
                            {isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleSaveEdit}
                                    className="text-sage-deep hover:text-sage-deep hover:bg-sage/10"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={onRegenerate}
                    className="flex-1 h-14 rounded-xl bg-card hover:bg-muted border border-border/30 text-foreground transition-all duration-300 hover:scale-105"
                >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Regenerate
                </Button>

                <Button
                    variant="default"
                    size="lg"
                    onClick={handleConfirm}
                    disabled={!editedText.trim()}
                    className="flex-1 sm:flex-[2] h-14 rounded-xl gradient-button shadow-button hover:shadow-glow transition-all duration-500 hover:scale-105 active:scale-95 group"
                >
                    <Check className="w-5 h-5 mr-2 group-hover:animate-bounce-gentle" />
                    This Looks Perfect!
                    <Sparkles className="w-5 h-5 ml-2 animate-twinkle" />
                </Button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-sunrise-gold" />
                Once confirmed, you can generate audio and download your manifestation
            </p>
        </div>
    );
}
