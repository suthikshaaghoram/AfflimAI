import { FormSection } from "@/components/FormSection";
import { GenerationModeSelector } from "@/components/GenerationModeSelector";
import { Wand2 } from "lucide-react";
import { StepProps } from "../types";

export function GenerationLengthStep({ formData, setFormData }: StepProps) {
    // Wrapper to match signature expected by selector
    const handleModeChange = (mode: "quick" | "deep") => {
        setFormData(prev => ({ ...prev, generation_mode: mode }));
    };

    return (
        <FormSection
            title="Generation Length"
            description="Choose your manifestation depth 🎚️"
            icon={<Wand2 className="w-6 h-6" />}
            accentColor="purple"
        >
            <GenerationModeSelector
                value={formData.generation_mode || "deep"}
                onChange={handleModeChange}
                disabled={false}
            />
        </FormSection>
    );
}
