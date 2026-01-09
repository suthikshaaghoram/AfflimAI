import { FormField } from "@/components/FormField";
import { FormSection } from "@/components/FormSection";
import { Heart } from "lucide-react";
import { StepProps } from "../types";

export function PersonalProfileStep({ formData, updateField }: StepProps) {
    return (
        <FormSection
            title="Personal Profile"
            description="Celebrate your journey and growth 💖"
            icon={<Heart className="w-6 h-6" />}
            accentColor="pink"
        >
            <FormField
                label="Your Strengths"
                name="strengths"
                type="textarea"
                placeholder="What are your core strengths and talents that make you shine?"
                value={formData.strengths}
                onChange={updateField("strengths")}
            />
            <FormField
                label="Areas of Growth"
                name="areas_of_improvement"
                type="textarea"
                placeholder="What aspects of yourself are you nurturing and developing?"
                value={formData.areas_of_improvement}
                onChange={updateField("areas_of_improvement")}
            />
            <FormField
                label="Greatest Achievement in Life"
                name="greatest_achievement"
                type="textarea"
                placeholder="What accomplishment fills your heart with pride?"
                value={formData.greatest_achievement}
                onChange={updateField("greatest_achievement")}
            />
            <FormField
                label="Recent Win"
                name="recent_achievement"
                type="textarea"
                placeholder="What did you accomplish recently that made you proud?"
                value={formData.recent_achievement}
                onChange={updateField("recent_achievement")}
            />
        </FormSection>
    );
}
