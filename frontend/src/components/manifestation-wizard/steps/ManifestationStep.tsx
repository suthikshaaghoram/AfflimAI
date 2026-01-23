import { FormField } from "@/components/FormField";
import { FormSection } from "@/components/FormSection";
import { Sparkles } from "lucide-react";
import { StepProps } from "../types";

export function ManifestationStep({ formData, updateField }: StepProps) {
    return (
        <FormSection
            title="Manifestation Focus"
            description="The heart of your affirmation ✨"
            icon={<Sparkles className="w-6 h-6" />}
            accentColor="blue"
        >
            <FormField
                label="One Thing to Manifest"
                name="manifestation_focus"
                type="textarea"
                placeholder="What is the one beautiful thing you want to bring into your life right now? Dream big!"
                helperText="Be specific and heartfelt — the universe loves clarity"
                rows={4}
                value={formData.manifestation_focus}
                onChange={updateField("manifestation_focus")}
            />
        </FormSection>
    );
}
