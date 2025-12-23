import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormSection } from "@/components/FormSection";
import { FormField } from "@/components/FormField";
import { ManifestationRequest } from "@/lib/api";
import { User, Star, Heart, Target, Sparkles, Wand2 } from "lucide-react";

interface ManifestationFormProps {
  onSubmit: (data: ManifestationRequest) => void;
  isLoading: boolean;
}

const initialFormState: ManifestationRequest = {
  preferred_name: "",
  birth_date: "",
  birth_time: "",
  birth_place: "",
  nakshatra: "",
  lagna: "",
  strengths: "",
  areas_of_improvement: "",
  greatest_achievement: "",
  recent_achievement: "",
  next_year_goals: "",
  life_goals: "",
  legacy: "",
  manifestation_focus: "",
};

export function ManifestationForm({ onSubmit, isLoading }: ManifestationFormProps) {
  const [formData, setFormData] = useState<ManifestationRequest>(initialFormState);

  const updateField = (field: keyof ManifestationRequest) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.preferred_name && formData.manifestation_focus;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Details */}
      <FormSection
        title="Personal Details"
        description="Tell us about yourself ✦"
        icon={<User className="w-6 h-6" />}
        accentColor="orange"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            label="Preferred Name"
            name="preferred_name"
            placeholder="How would you like to be addressed?"
            required
            value={formData.preferred_name}
            onChange={updateField("preferred_name")}
          />
          <FormField
            label="Birth Place"
            name="birth_place"
            placeholder="City, Country"
            value={formData.birth_place}
            onChange={updateField("birth_place")}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            label="Birth Date"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={updateField("birth_date")}
          />
          <FormField
            label="Birth Time"
            name="birth_time"
            type="time"
            helperText="Approximate time is fine"
            value={formData.birth_time}
            onChange={updateField("birth_time")}
          />
        </div>
      </FormSection>

      {/* Vedic Astrology */}
      <FormSection
        title="Vedic Astrology Context"
        description="Optional cosmic alignment for deeper personalization ⭐"
        icon={<Star className="w-6 h-6" />}
        accentColor="gold"
      >
        <div className="grid sm:grid-cols-2 gap-5">
          <FormField
            label="Nakshatra with Pada"
            name="nakshatra"
            placeholder="e.g., Rohini 3rd Pada"
            helperText="Your birth star and quarter"
            value={formData.nakshatra}
            onChange={updateField("nakshatra")}
          />
          <FormField
            label="Lagna / Ascendant"
            name="lagna"
            placeholder="e.g., Taurus, Vrishabha"
            helperText="Your rising sign"
            value={formData.lagna}
            onChange={updateField("lagna")}
          />
        </div>
      </FormSection>

      {/* Personal Profile */}
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

      {/* Goals & Vision */}
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

      {/* Manifestation Focus */}
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
          required
          rows={4}
          value={formData.manifestation_focus}
          onChange={updateField("manifestation_focus")}
        />
      </FormSection>

      {/* Submit Button */}
      <div className="pt-8 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-20 bg-gradient-to-r from-sunrise-pink/20 via-sunrise-gold/20 to-sage/20 blur-2xl rounded-full" />
        </div>
        <Button
          type="submit"
          variant="default"
          size="lg"
          disabled={!isFormValid || isLoading}
          className="relative w-full h-16 text-lg font-semibold gradient-button shadow-button hover:shadow-glow transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] rounded-2xl group"
        >
          <Wand2 className="w-6 h-6 mr-3 group-hover:animate-wave" />
          {isLoading ? "Creating Magic..." : "Generate My Manifestation"}
          <Sparkles className="w-5 h-5 ml-3 animate-twinkle" />
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-5 flex items-center justify-center gap-2">
          <Star className="w-4 h-4 text-sunrise-gold" />
          Your personalized 500-word manifestation awaits
          <Star className="w-4 h-4 text-sunrise-gold" />
        </p>
      </div>
    </form>
  );
}
