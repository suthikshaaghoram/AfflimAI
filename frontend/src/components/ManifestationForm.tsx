import { useState } from "react";
import { ManifestationRequest } from "@/lib/api";
import { FormStep } from "./manifestation-wizard/types";
import { PersonalDetailsStep } from "./manifestation-wizard/steps/PersonalDetailsStep";
import { VedicAstrologyStep } from "./manifestation-wizard/steps/VedicAstrologyStep";
import { PersonalProfileStep } from "./manifestation-wizard/steps/PersonalProfileStep";
import { DreamsVisionStep } from "./manifestation-wizard/steps/DreamsVisionStep";
import { ManifestationStep } from "./manifestation-wizard/steps/ManifestationStep";
import { GenerationLengthStep } from "./manifestation-wizard/steps/GenerationLengthStep";
import { ReviewStep } from "./manifestation-wizard/steps/ReviewStep";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ManifestationFormProps {
  onSubmit: (data: ManifestationRequest) => void;
  isLoading: boolean;
  initialData?: Partial<ManifestationRequest>;
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
  generation_mode: "deep",
};

export function ManifestationForm({ onSubmit, isLoading, initialData }: ManifestationFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(FormStep.PERSONAL_DETAILS);
  const [formData, setFormData] = useState<ManifestationRequest>({
    ...initialFormState,
    ...initialData
  });

  const updateField = (field: keyof ManifestationRequest) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const totalSteps = Object.keys(FormStep).length / 2; // Enum has numeric keys too
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep === FormStep.REVIEW) {
      onSubmit(formData);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > FormStep.PERSONAL_DETAILS) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Validation Logic per step
  const isStepValid = () => {
    switch (currentStep) {
      case FormStep.PERSONAL_DETAILS:
        return !!formData.preferred_name && !!formData.birth_date && !!formData.birth_place;
      case FormStep.VEDIC_ASTROLOGY:
        // Optional step technically, but better if filled. Let's make it optional as per Prompt "Automatic... Error Handling: Allow manual fallback"
        // Let's say it updates if they fill it. Can they skip? "Optional cosmic alignment" -> Yes.
        return true;
      case FormStep.PERSONAL_PROFILE:
        // Optional? Prompt didn't specify required fields. But usually preferred_name is key.
        return true;
      case FormStep.DREAMS_VISION:
        return true;
      case FormStep.MANIFESTATION_FOCUS:
        return !!formData.manifestation_focus; // This is crucial
      case FormStep.GENERATION_LENGTH:
        return true;
      default:
        return true;
    }
  };

  const renderStep = () => {
    const props = { formData, updateField, setFormData };

    switch (currentStep) {
      case FormStep.PERSONAL_DETAILS:
        return <PersonalDetailsStep {...props} />;
      case FormStep.VEDIC_ASTROLOGY:
        return <VedicAstrologyStep {...props} />;
      case FormStep.PERSONAL_PROFILE:
        return <PersonalProfileStep {...props} />;
      case FormStep.DREAMS_VISION:
        return <DreamsVisionStep {...props} />;
      case FormStep.MANIFESTATION_FOCUS:
        return <ManifestationStep {...props} />;
      case FormStep.GENERATION_LENGTH:
        return <GenerationLengthStep {...props} />;
      case FormStep.REVIEW:
        // Special case: onNext triggers submit
        return <ReviewStep {...props} onNext={handleNext} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium mb-2 text-muted-foreground">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep !== FormStep.REVIEW && (
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className={`flex items-center gap-2 ${currentStep === 0 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!isStepValid() || isLoading}
            className="flex items-center gap-2"
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
