import { FormField } from "@/components/FormField";
import { FormSection } from "@/components/FormSection";
import { Target } from "lucide-react";
import { StepProps } from "../types";

export function DreamsVisionStep({ formData, updateField }: StepProps) {
    return (
        <FormSection
            title="Dreams & Vision"
            description="Define your beautiful future 🎯"
            icon={<Target className="w-6 h-6" />}
            accentColor="sage"
        >
            <FormField
                label="Next Year Goals"
                name="next_year_goals"
                type="textarea"
                placeholder="What exciting achievements await you in the coming year?"
                value={formData.next_year_goals}
                onChange={updateField("next_year_goals")}
            />
            <FormField
                label="Life Goals with Timeline"
                name="life_goals"
                type="textarea"
                placeholder="What are your major life dreams and by when will you achieve them?"
                rows={4}
                value={formData.life_goals}
                onChange={updateField("life_goals")}
            />
            <FormField
                label="Your Legacy"
                name="legacy"
                type="textarea"
                placeholder="How do you want to be remembered? What impact will you leave?"
                value={formData.legacy}
                onChange={updateField("legacy")}
            />
        </FormSection>
    );
}
